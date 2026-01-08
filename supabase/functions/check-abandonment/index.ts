import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RD_API_KEY = Deno.env.get('RD_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================
// MAPEADOR DE ETAPAS - LINGUAGEM HUMANA
// ============================================
const getStepLabel = (insuranceType: string, stepIndex: number): string => {
  const map: Record<string, string[]> = {
    "Seguro Auto": ["Dados Pessoais", "Dados do Veículo", "Endereço e Pernoite", "Perfil de Risco", "Finalização"],
    "Seguro Uber/Similares": ["Dados Pessoais", "Dados do Veículo", "Endereço e Pernoite", "Perfil de Risco", "Finalização"],
    "Seguro Residencial": ["Dados do Segurado", "Tipo de Imóvel", "Endereço", "Coberturas"],
    "Residencial (Smartphone)": ["Dados do Segurado", "Endereço do Imóvel", "Valor do Smartphone"],
    "Seguro de Vida": ["Dados Pessoais", "Perfil de Saúde", "Coberturas"],
    "Seguro Empresarial": ["Dados da Empresa", "Endereço", "Coberturas"],
    "Seguro Viagem": ["Dados da Viagem", "Viajantes", "Coberturas"],
    "Plano de Saúde": ["Dados do Titular", "Dependentes", "Preferências do Plano"]
  };

  const steps = map[insuranceType] || ["Início do Formulário", "Meio do Formulário", "Finalização"];
  return steps[stepIndex] || `Etapa ${stepIndex + 1}`;
};

// Sugestão de abordagem baseada na etapa
const getApproachSuggestion = (insuranceType: string, stepIndex: number): string => {
  const suggestions: Record<string, Record<number, string>> = {
    "Seguro Auto": {
      0: "Pergunte se teve dificuldade com os dados pessoais ou CPF.",
      1: "Pergunte se ele sabe a placa ou modelo exato do veículo.",
      2: "Pergunte se teve dúvida sobre o CEP ou tipo de garagem.",
      3: "Pergunte se ficou confuso com as perguntas sobre jovens condutores.",
    },
    "Seguro Residencial": {
      0: "Pergunte se precisa de ajuda com os dados pessoais.",
      1: "Pergunte se está em dúvida entre casa ou apartamento.",
      2: "Ofereça ajuda para preencher o endereço do imóvel.",
      3: "Explique as coberturas disponíveis de forma simples.",
    },
    "Residencial (Smartphone)": {
      0: "Pergunte se precisa de ajuda com os dados pessoais.",
      1: "Ofereça ajuda para preencher o endereço.",
      2: "Pergunte se ele tem a NF do smartphone ou precisa de ajuda para encontrar.",
    }
  };

  return suggestions[insuranceType]?.[stepIndex] || "Ofereça ajuda personalizada para continuar a cotação.";
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('=== Check Abandonment Function v2.0 (Humanizado) ===');
  console.log('Iniciando verificação de leads abandonados...');

  try {
    // Buscar leads abandonados há mais de 24h, mas criados nas últimas 72h
    const maxAge = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('Janela de processamento: entre', maxAge, 'e', cutoff);

    const { data: abandonedLeads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('is_completed', false)
      .eq('abandoned_alert_sent', false)
      .gt('created_at', maxAge)
      .lt('created_at', cutoff)
      .limit(50);

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
        
        // Obter label humanizado da etapa
        const stepLabel = getStepLabel(lead.insurance_type, lead.last_step_index || 0);
        const approachSuggestion = getApproachSuggestion(lead.insurance_type, lead.last_step_index || 0);
        
        // ============================================
        // PAYLOAD DE OURO PARA WHATSAPP
        // ============================================
        const formattedQar = `🚨 ALERTA DE ABANDONO:
• Cliente: ${lead.name}
• Ramo: ${lead.insurance_type}
• Parou em: ${stepLabel}
• Tempo parado: ${hoursAgo}h
• Contato: ${lead.phone}
• Email: ${lead.email}

💡 DICA DE ABORDAGEM:
${approachSuggestion}

📱 WhatsApp: https://wa.me/55${lead.phone.replace(/\D/g, '')}`;

        // Nota interna para o banco (mais detalhada)
        const abandonmentNote = `⚠️ LEAD ABANDONADO (${new Date().toLocaleString('pt-BR')})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente: ${lead.name}
Formulário: ${lead.insurance_type}
Parou em: ${stepLabel} (índice ${lead.last_step_index || 0})
Tempo abandonado: ${hoursAgo} horas
Contato: ${lead.email} | ${lead.phone}
Criado em: ${new Date(lead.created_at).toLocaleString('pt-BR')}

💡 Sugestão de abordagem: ${approachSuggestion}`;

        console.log(`Processando lead ${lead.id}: ${lead.name} (${lead.email})`);
        console.log(`  - Ramo: ${lead.insurance_type}`);
        console.log(`  - Etapa: ${stepLabel} (index ${lead.last_step_index || 0})`);
        console.log(`  - Horas abandonado: ${hoursAgo}`);

        // Enviar para RD Station
        let rdSuccess = false;
        
        if (RD_API_KEY) {
          const rdPayload = {
            event_type: "CONVERSION",
            event_family: "CDP",
            payload: {
              conversion_identifier: lead.insurance_type, // MESMO do formulário original
              email: lead.email,
              name: lead.name,
              mobile_phone: lead.phone,
              cf_qar_respondido: formattedQar,
              cf_lead_abandonado: "true",
              cf_abandono_etapa: stepLabel,
              cf_abandono_horas: String(hoursAgo),
            }
          };

          try {
            const rdResponse = await fetch(`https://api.rd.services/platform/conversions?api_key=${RD_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(rdPayload)
            });

            rdSuccess = rdResponse.ok;
            console.log(`  - RD Station: ${rdSuccess ? 'OK' : 'Falhou'} (${lead.insurance_type})`);
            
            if (!rdSuccess) {
              const errorText = await rdResponse.text();
              console.error(`  - RD Response:`, errorText);
            }
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
          service_name: 'abandonment-check-v2',
          status: rdSuccess ? 'success' : 'warning',
          payload: { 
            hours_ago: hoursAgo, 
            step_index: lead.last_step_index,
            step_label: stepLabel,
            insurance_type: lead.insurance_type,
            approach_suggestion: approachSuggestion,
          },
          response: { rd_sent: rdSuccess },
        });

        results.push({ 
          id: lead.id, 
          email: lead.email,
          name: lead.name,
          insurance_type: lead.insurance_type,
          step_label: stepLabel,
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
