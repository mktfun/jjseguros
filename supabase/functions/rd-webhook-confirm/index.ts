import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const webhookToken = Deno.env.get('RD_WEBHOOK_TOKEN')!;

// Separador visual limpo
const SEPARATOR = '───────────────────────';

// Extrair estágio do funil do payload RD Station
const extractFunnelStage = (payload: any): string | null => {
  // Tentar diferentes caminhos onde o RD pode enviar o estágio
  const leadData = payload.leads?.[0];
  
  if (leadData) {
    // Campo direto do lead
    if (leadData.lifecycle_stage) return leadData.lifecycle_stage;
    if (leadData.lead_stage) return leadData.lead_stage;
    
    // Custom fields
    const customFields = leadData.custom_fields || {};
    if (customFields['Etapa do funil de vendas no CRM (ultima atualizacao)']) {
      return customFields['Etapa do funil de vendas no CRM (ultima atualizacao)'];
    }
    
    // Last conversion content
    const lastConversion = leadData.last_conversion?.content;
    if (lastConversion?.funnel_stage) return lastConversion.funnel_stage;
  }
  
  // Campos diretos no payload
  if (payload.funnel_stage) return payload.funnel_stage;
  if (payload.lifecycle_stage) return payload.lifecycle_stage;
  
  return null;
};

// Extrair nome do funil do payload RD Station
const extractFunnelName = (payload: any): string | null => {
  const leadData = payload.leads?.[0];
  
  if (leadData) {
    const customFields = leadData.custom_fields || {};
    if (customFields['Funil de vendas no CRM (ultima atualizacao)']) {
      return customFields['Funil de vendas no CRM (ultima atualizacao)'];
    }
    
    const lastConversion = leadData.last_conversion?.content;
    if (lastConversion?.funnel) return lastConversion.funnel;
  }
  
  if (payload.funnel_name) return payload.funnel_name;
  
  return null;
};

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
  console.log('=== RD Webhook Confirm v2.0 (Funnel Sync) ===');
  console.log('Method:', req.method);
  console.log('Token provided:', token ? 'Yes' : 'No');

  // Validação do token
  if (!token || token !== webhookToken) {
    console.error('Token invalido ou ausente');
    
    // Registrar tentativa inválida
    await supabase.from('integration_logs').insert({
      service_name: 'rd_webhook',
      status: 'error',
      payload: { method: req.method, token_provided: !!token },
      error_message: 'Token de autenticacao invalido',
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
      console.error('Email ou ID do lead nao encontrado no payload');
      
      await supabase.from('integration_logs').insert({
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: 'Email ou ID do lead nao encontrado no payload',
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
      console.error('Lead nao encontrado no banco');
      
      await supabase.from('integration_logs').insert({
        service_name: 'rd_webhook',
        status: 'error',
        payload,
        error_message: `Lead nao encontrado: email=${email}, id=${leadId}`,
      });

      return new Response(
        JSON.stringify({ success: false, error: 'Lead not found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lead = leads[0];
    console.log('Lead encontrado:', lead.id, lead.name, lead.email);

    // ============================================
    // SINCRONIZACAO DE FUNIL
    // ============================================
    const rdFunnelStage = extractFunnelStage(payload);
    const rdFunnelName = extractFunnelName(payload);
    const previousStage = lead.funnel_stage;
    
    console.log('Funil RD:', { stage: rdFunnelStage, name: rdFunnelName, previous: previousStage });

    // Verificar se é um lead abandonado (conversion_identifier especial)
    const conversionId = payload.conversion_identifier || payload.cf_conversion_identifier;
    
    if (conversionId === 'lead_abandonado') {
      console.log('Lead abandonado detectado, registrando apenas log');
      
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'success',
        payload,
        response: { type: 'abandoned_lead_notification', confirmed_at: new Date().toISOString() },
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
      console.log('Lead parcial detectado, nao marcando como sincronizado');
      
      // Mesmo para leads parciais, atualizar o estágio do funil se veio do RD
      if (rdFunnelStage && rdFunnelStage !== previousStage) {
        const { error: stageUpdateError } = await supabase
          .from('leads')
          .update({ funnel_stage: rdFunnelStage })
          .eq('id', lead.id);
        
        if (!stageUpdateError) {
          console.log('Estagio do funil atualizado para lead parcial:', rdFunnelStage);
          
          // Log de sincronização de funil
          await supabase.from('integration_logs').insert({
            lead_id: lead.id,
            service_name: 'rd-funnel-sync',
            status: 'success',
            payload: { 
              previous_stage: previousStage, 
              new_stage: rdFunnelStage,
              funnel_name: rdFunnelName,
              source: 'rd_webhook'
            },
            response: { synced_at: new Date().toISOString() },
          });
        }
      }
      
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd_webhook',
        status: 'success',
        payload,
        response: { type: 'partial_lead', confirmed_at: new Date().toISOString() },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Partial lead - not marking as synced',
          lead_id: lead.id,
          funnel_updated: rdFunnelStage !== previousStage,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ============================================
    // LEAD COMPLETO - ATUALIZAR TUDO
    // ============================================
    const now = new Date().toISOString();
    
    const updateData: Record<string, any> = {
      rd_station_synced: true,
      rd_station_error: null,
      sync_confirmed_at: now,
    };
    
    // Atualizar estágio do funil se veio do RD e é diferente
    if (rdFunnelStage && rdFunnelStage !== previousStage) {
      updateData.funnel_stage = rdFunnelStage;
      console.log('Atualizando estagio do funil:', previousStage, '->', rdFunnelStage);
    }
    
    // Atualizar nome do funil se veio do RD
    if (rdFunnelName) {
      updateData.funnel_name = rdFunnelName;
    }

    const { error: updateError } = await supabase
      .from('leads')
      .update(updateData)
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

    // Registrar log de sincronização de funil se houve mudança
    if (rdFunnelStage && rdFunnelStage !== previousStage) {
      await supabase.from('integration_logs').insert({
        lead_id: lead.id,
        service_name: 'rd-funnel-sync',
        status: 'success',
        payload: { 
          previous_stage: previousStage, 
          new_stage: rdFunnelStage,
          funnel_name: rdFunnelName,
          source: 'rd_webhook',
          contact_email: lead.email,
          contact_phone: lead.phone,
        },
        response: { 
          synced_at: now,
          description: `Sincronizado com RD: Etapa ${rdFunnelStage}`,
        },
      });
    }

    // Registrar sucesso no log
    await supabase.from('integration_logs').insert({
      lead_id: lead.id,
      service_name: 'rd_webhook',
      status: 'success',
      payload,
      response: { 
        confirmed_at: now, 
        lead_id: lead.id,
        funnel_stage: rdFunnelStage,
        funnel_updated: rdFunnelStage !== previousStage,
      },
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead confirmed',
        lead_id: lead.id,
        confirmed_at: now,
        funnel_stage: rdFunnelStage,
        funnel_updated: rdFunnelStage !== previousStage,
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
