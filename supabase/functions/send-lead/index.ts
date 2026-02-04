import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RD_API_KEY = Deno.env.get('RD_API_KEY')

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Criar cliente Supabase com service_role (ignora RLS)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const body = await req.json()
    const { payload, existingLeadId } = body

    console.log('📥 Payload recebido:', JSON.stringify(payload, null, 2))
    console.log('📋 Lead existente:', existingLeadId)

    // 1. Buscar configuração de integração (com service_role, ignora RLS)
    const { data: settings, error: settingsError } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (settingsError) {
      console.error('❌ Erro ao buscar settings:', settingsError)
    }

    console.log('⚙️ Configuração encontrada:', JSON.stringify(settings))

    let sendSuccess = false
    let sendError: string | undefined
    let destination = 'unknown'

    // 2. Decidir para onde enviar
    if (settings?.mode === 'webhook' && settings?.webhook_url) {
      // ===== ENVIAR PARA WEBHOOK (n8n/Make/Zapier) =====
      destination = 'webhook'
      console.log('🔗 Enviando para Webhook:', settings.webhook_url)

      const webhookPayload = {
        ...payload.contactData,
        ...payload.customFields,
        funnel: payload.funnelData,
        timestamp: new Date().toISOString(),
        source: 'JJ Seguros - Formulário de Cotação',
        lead_id: existingLeadId || null
      }

      try {
        const webhookResponse = await fetch(settings.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookPayload)
        })

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          throw new Error(`Webhook retornou ${webhookResponse.status}: ${errorText}`)
        }

        sendSuccess = true
        console.log('✅ Webhook enviado com sucesso')
      } catch (webhookErr) {
        sendError = webhookErr instanceof Error ? webhookErr.message : 'Erro no webhook'
        console.error('❌ Erro no Webhook:', sendError)
      }

    } else {
      // ===== ENVIAR PARA RD STATION (padrão) =====
      destination = 'rd_station'
      console.log('📬 Enviando para RD Station...')

      if (!RD_API_KEY) {
        sendError = 'RD_API_KEY não configurada'
        console.error('❌', sendError)
      } else {
        try {
          const rdPayload = {
            event_type: "CONVERSION",
            event_family: "CDP",
            payload: {
              conversion_identifier: payload.customFields.cf_tipo_solicitacao_seguro || "lead_seguro",
              email: payload.contactData.email,
              name: payload.contactData.name,
              personal_phone: payload.contactData.personal_phone,
              mobile_phone: payload.contactData.personal_phone,
              city: payload.contactData.city || '',
              state: payload.contactData.state || '',
              ...payload.customFields
            }
          }

          if (payload.funnelData?.funnel_name && payload.funnelData?.funnel_stage) {
            rdPayload.payload.funnel_name = payload.funnelData.funnel_name
            rdPayload.payload.funnel_stage = payload.funnelData.funnel_stage
          }

          console.log('🚀 Payload RD Station:', JSON.stringify(rdPayload, null, 2))

          const rdResponse = await fetch(`https://api.rd.services/platform/conversions?api_key=${RD_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(rdPayload)
          })

          const responseText = await rdResponse.text()
          console.log('📬 RD Response Status:', rdResponse.status)
          console.log('📬 RD Response Body:', responseText)

          if (!rdResponse.ok) {
            throw new Error(`RD Station API Error: ${responseText}`)
          }

          sendSuccess = true
          console.log('✅ RD Station enviado com sucesso')
        } catch (rdErr) {
          sendError = rdErr instanceof Error ? rdErr.message : 'Erro no RD Station'
          console.error('❌ Erro RD Station:', sendError)
        }
      }
    }

    // 3. Salvar/Atualizar lead no Supabase
    const insuranceType = payload.customFields.cf_tipo_solicitacao_seguro
    const qarReport = payload.customFields.cf_qar_auto ||
      payload.customFields.cf_qar_residencial ||
      payload.customFields.cf_qar_vida ||
      payload.customFields.cf_qar_empresarial ||
      payload.customFields.cf_qar_viagem ||
      payload.customFields.cf_qar_saude || ''

    const leadData = {
      name: payload.contactData.name,
      email: payload.contactData.email,
      phone: payload.contactData.personal_phone,
      cpf: payload.customFields.cf_cpf || null,
      cnpj: payload.customFields.cf_cnpj || null,
      insurance_type: insuranceType,
      person_type: payload.customFields.cf_tipo_pessoa || null,
      qar_report: qarReport,
      custom_fields: payload.customFields,
      funnel_name: payload.funnelData?.funnel_name || null,
      funnel_stage: payload.funnelData?.funnel_stage || null,
      rd_station_synced: sendSuccess,
      rd_station_error: sendError || null,
      is_completed: true,
      // Campos de qualificação (shadow filter)
      is_qualified: payload.customFields.cf_is_qualified !== 'Nao',
      disqualification_reason: payload.customFields.cf_disqualification_reason || null,
    }

    let savedLeadId = existingLeadId

    if (existingLeadId) {
      // UPDATE lead existente
      const { error: updateError } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', existingLeadId)

      if (updateError) {
        console.error('❌ Erro ao atualizar lead:', updateError)
      } else {
        console.log('✅ Lead atualizado:', existingLeadId)
      }
    } else {
      // INSERT novo lead
      const { data: newLead, error: insertError } = await supabase
        .from('leads')
        .insert({
          ...leadData,
          is_completed: true,
          last_step_index: 0,
          abandoned_alert_sent: false,
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('❌ Erro ao inserir lead:', insertError)
      } else {
        savedLeadId = newLead?.id
        console.log('✅ Lead inserido:', savedLeadId)
      }
    }

    // 4. Registrar log de integração
    await supabase.from('integration_logs').insert({
      lead_id: savedLeadId || null,
      service_name: destination === 'webhook' ? 'webhook_n8n' : 'rd_station',
      status: sendSuccess ? 'success' : 'error',
      error_message: sendError || null,
      payload: payload,
      response: { destination, success: sendSuccess }
    })

    console.log(`📊 Log registrado: ${destination} - ${sendSuccess ? 'success' : 'error'}`)

    // Sucesso baseado em salvar o lead, não no webhook
    const leadSaved = savedLeadId !== null
    
    return new Response(JSON.stringify({ 
      success: leadSaved, 
      destination,
      lead_id: savedLeadId,
      integration_synced: sendSuccess,
      integration_error: sendError || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: leadSaved ? 200 : 500,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Erro crítico na Edge Function:', errorMessage)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
