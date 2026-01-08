import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RD_API_KEY = Deno.env.get('RD_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('=== Check Abandonment Function ===');
  console.log('Iniciando verificação de leads abandonados...');

  try {
    // Buscar leads abandonados há mais de 24h
    // is_completed = false, abandoned_alert_sent = false, created_at < 24h atrás
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('Cutoff de 24h:', cutoff);

    const { data: abandonedLeads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('is_completed', false)
      .eq('abandoned_alert_sent', false)
      .lt('created_at', cutoff);

    if (error) {
      console.error('Erro ao buscar leads abandonados:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Encontrados ${abandonedLeads?.length || 0} leads abandonados`);

    if (!abandonedLeads || abandonedLeads.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'Nenhum lead abandonado encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const lead of abandonedLeads) {
      try {
        // Calcular horas desde criação
        const hoursAgo = Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 3600000);
        
        // Montar QAR formatado com dados de abandono
        const formattedQar = `[ABANDONO] Passo: ${lead.last_step_index || 0} | Tempo: ${hoursAgo}h | Nota: Cliente parou na etapa ${lead.last_step_index || 0} do formulário ${lead.insurance_type} há ${hoursAgo} horas.`;

        // Nota interna para o banco
        const abandonmentNote = `⚠️ LEAD ABANDONADO
O lead ${lead.name} parou há ${hoursAgo} horas na etapa ${lead.last_step_index || 0} do formulário ${lead.insurance_type}.
Contato: ${lead.email} | ${lead.phone}
Criado em: ${new Date(lead.created_at).toLocaleString('pt-BR')}`;

        console.log(`Processando lead ${lead.id}: ${lead.name} (${lead.email})`);
        console.log(`  - Horas abandonado: ${hoursAgo}`);
        console.log(`  - Última etapa: ${lead.last_step_index || 0}`);

        // Enviar para RD Station com MESMO conversion_identifier do formulário original
        let rdSuccess = false;
        
        if (RD_API_KEY) {
          const rdPayload = {
            event_type: "CONVERSION",
            event_family: "CDP",
            payload: {
              conversion_identifier: lead.insurance_type, // Mesmo identificador do formulário
              email: lead.email,
              name: lead.name,
              mobile_phone: lead.phone,
              cf_qar_respondido: formattedQar, // Dados centralizados
            }
          };

          try {
            const rdResponse = await fetch(`https://api.rd.services/platform/conversions?api_key=${RD_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rdPayload)
            });

            rdSuccess = rdResponse.ok;
            console.log(`  - RD Station: ${rdSuccess ? 'OK' : 'Falhou'}`);
          } catch (rdError) {
            console.error(`  - Erro ao enviar para RD Station:`, rdError);
          }
        } else {
          console.log('  - RD_API_KEY não configurada, pulando envio para RD Station');
        }

        // Atualizar lead: marcar alerta enviado e adicionar nota ao qar_report
        const existingQar = lead.qar_report || '';
        const newQarReport = existingQar 
          ? `${existingQar}\n\n---\n${abandonmentNote}`
          : abandonmentNote;

        const { error: updateError } = await supabase
          .from('leads')
          .update({ 
            abandoned_alert_sent: true,
            qar_report: newQarReport,
          })
          .eq('id', lead.id);

        if (updateError) {
          console.error(`  - Erro ao atualizar lead:`, updateError);
        }

        // Registrar log
        await supabase.from('integration_logs').insert({
          lead_id: lead.id,
          service_name: 'abandonment-check',
          status: rdSuccess ? 'success' : 'warning',
          payload: { 
            hours_ago: hoursAgo, 
            step_index: lead.last_step_index,
            insurance_type: lead.insurance_type,
          },
          response: { rd_sent: rdSuccess },
        });

        results.push({ 
          id: lead.id, 
          email: lead.email, 
          hours_abandoned: hoursAgo,
          rd_sent: rdSuccess 
        });

      } catch (leadError) {
        console.error(`Erro ao processar lead ${lead.id}:`, leadError);
        results.push({ 
          id: lead.id, 
          email: lead.email, 
          error: leadError instanceof Error ? leadError.message : 'Unknown error' 
        });
      }
    }

    console.log(`Processamento concluído: ${results.length} leads`);

    return new Response(
      JSON.stringify({ 
        processed: results.length, 
        results,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Erro inesperado:', errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
