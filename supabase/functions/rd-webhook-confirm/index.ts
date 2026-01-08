import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookToken = Deno.env.get('RD_WEBHOOK_TOKEN')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Extrair token da URL para validação
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  // Log inicial da requisição
  console.log('=== RD Webhook Confirm ===');
  console.log('Method:', req.method);
  console.log('Token provided:', token ? 'Yes' : 'No');

  // Validação do token
  if (!token || token !== webhookToken) {
    console.error('Token inválido ou ausente');
    
    // Registrar tentativa inválida
    await supabase.from('integration_logs').insert({
      service_name: 'rd_webhook',
      status: 'error',
      payload: { method: req.method, token_provided: !!token },
      error_message: 'Token de autenticação inválido',
    });

    // Retorna 200 para evitar retries do RD Station
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Parsear o payload do RD Station
    const payload = await req.json();
    console.log('Payload recebido:', JSON.stringify(payload, null, 2));

    // O RD Station envia o email do lead
    const email = payload.email || payload.leads?.[0]?.email;
    const leadId = payload.lead_id || payload.id;

    if (!email && !leadId) {
      console.error('Email ou ID do lead não encontrado no payload');
      
      await supabase.from('integration_logs').insert({
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: 'Email ou ID do lead não encontrado no payload',
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Missing email or lead_id' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar o lead no banco
    let leadQuery = supabase.from('leads').select('*');
    
    if (leadId) {
      leadQuery = leadQuery.eq('id', leadId);
    } else if (email) {
      leadQuery = leadQuery.eq('email', email);
    }

    const { data: leads, error: fetchError } = await leadQuery.order('created_at', { ascending: false }).limit(1);

    if (fetchError) {
      console.error('Erro ao buscar lead:', fetchError);
      
      await supabase.from('integration_logs').insert({
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: `Erro ao buscar lead: ${fetchError.message}`,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Database error' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leads || leads.length === 0) {
      console.error('Lead não encontrado no banco');
      
      await supabase.from('integration_logs').insert({
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: `Lead não encontrado: email=${email}, id=${leadId}`,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Lead not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lead = leads[0];
    console.log('Lead encontrado:', lead.id, lead.name, lead.email);

    // Validação opcional: comparar campos críticos
    const rdInsuranceType = payload.insurance_type || payload.custom_fields?.insurance_type;
    if (rdInsuranceType && rdInsuranceType !== lead.insurance_type) {
      console.warn('Divergência no tipo de seguro:', {
        banco: lead.insurance_type,
        rdStation: rdInsuranceType,
      });
      
      // Registra divergência mas não bloqueia
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'success',
        payload,
        response: { warning: 'Divergência no insurance_type', banco: lead.insurance_type, rdStation: rdInsuranceType },
      });
    }

    const now = new Date().toISOString();

    // Verificar se é um lead abandonado (conversion_identifier especial)
    const conversionId = payload.conversion_identifier || payload.cf_conversion_identifier;
    
    if (conversionId === 'lead_abandonado') {
      // Não marca rd_station_synced = true para leads abandonados
      // Apenas registra o log
      console.log('Lead abandonado detectado, registrando apenas log');
      
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'success',
        payload,
        response: { type: 'abandoned_lead_notification', confirmed_at: now },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Abandoned lead notification received',
          lead_id: lead.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o lead está completo antes de marcar como sincronizado
    if (lead.is_completed === false) {
      // Lead parcial - não marca como sincronizado
      console.log('Lead parcial detectado, não marcando como sincronizado');
      
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'success',
        payload,
        response: { type: 'partial_lead', confirmed_at: now },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Partial lead - not marking as synced',
          lead_id: lead.id,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Lead completo - segue fluxo normal
    const { error: updateError } = await supabase
      .from('leads')
      .update({
        rd_station_synced: true,
        rd_station_error: null,
        sync_confirmed_at: now,
      })
      .eq('id', lead.id);

    if (updateError) {
      console.error('Erro ao atualizar lead:', updateError);
      
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: `Erro ao atualizar lead: ${updateError.message}`,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Update failed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lead atualizado com sucesso:', lead.id);

    // Registrar sucesso no log
    await supabase.from('integration_logs').insert({
      lead_id: lead.id,
      service_name: 'rd_webhook',
      status: 'success',
      payload,
      response: { confirmed_at: now, lead_id: lead.id },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead confirmed',
        lead_id: lead.id,
        confirmed_at: now,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Erro inesperado:', errorMessage);
    
    await supabase.from('integration_logs').insert({
      service_name: 'rd_webhook',
      status: 'error',
      error_message: `Erro inesperado: ${errorMessage}`,
    });

    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
