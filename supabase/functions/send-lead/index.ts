import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Destination {
  id: string
  name: string
  type: 'rd_crm' | 'rd_marketing' | 'webhook'
  webhook_url: string | null
  is_active: boolean
}

interface DestinationResult {
  destination_id: string
  destination_name: string
  destination_type: string
  success: boolean
  error?: string
}

async function sendToDestination(
  dest: Destination,
  payload: any,
  supabaseUrl: string,
  serviceRoleKey: string,
): Promise<DestinationResult> {
  const result: DestinationResult = {
    destination_id: dest.id,
    destination_name: dest.name,
    destination_type: dest.type,
    success: false,
  }

  try {
    if (dest.type === 'webhook') {
      if (!dest.webhook_url) throw new Error('URL do webhook não configurada')

      const webhookPayload = {
        ...payload.contactData,
        ...payload.customFields,
        funnel: payload.funnelData,
        timestamp: new Date().toISOString(),
        source: 'JJ Seguros - Formulário de Cotação',
      }

      const response = await fetch(dest.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Webhook retornou ${response.status}: ${errorText}`)
      }

      result.success = true
    } else if (dest.type === 'rd_crm') {
      const response = await fetch(`${supabaseUrl}/functions/v1/rd-crm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          contactData: payload.contactData,
          customFields: payload.customFields,
          funnelData: payload.funnelData,
        }),
      })

      const crmResult = await response.json()
      if (!response.ok || !crmResult.success) {
        throw new Error(crmResult.error || `CRM HTTP ${response.status}`)
      }

      result.success = true
      console.log(`✅ RD CRM OK - Deal: ${crmResult.deal_id}`)
    } else if (dest.type === 'rd_marketing') {
      const response = await fetch(`${supabaseUrl}/functions/v1/rd-station`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({
          contactData: payload.contactData,
          customFields: payload.customFields,
          funnelData: payload.funnelData,
        }),
      })

      const rdResult = await response.json()
      if (!response.ok || rdResult.error) {
        throw new Error(rdResult.error || `RD Marketing HTTP ${response.status}`)
      }

      result.success = true
      console.log(`✅ RD Marketing OK`)
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : 'Erro desconhecido'
    console.error(`❌ Erro em "${dest.name}" (${dest.type}):`, result.error)
  }

  return result
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const body = await req.json()
    const { payload, existingLeadId } = body

    console.log('📥 Payload recebido:', JSON.stringify(payload, null, 2))
    console.log('📋 Lead existente:', existingLeadId)

    // 1. Buscar destinos ativos
    const { data: destinations, error: destError } = await supabase
      .from('integration_destinations')
      .select('*')
      .eq('is_active', true)

    if (destError) {
      console.error('❌ Erro ao buscar destinos:', destError)
    }

    const activeDestinations: Destination[] = (destinations || []) as Destination[]
    console.log(`⚙️ ${activeDestinations.length} destino(s) ativo(s):`, activeDestinations.map(d => `${d.name} (${d.type})`))

    // 2. Buscar settings para Meta CAPI etc (mantém backward compat)
    const { data: settings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('id', 1)
      .single()

    // 3. Disparar para todos os destinos em paralelo
    const destinationResults = await Promise.allSettled(
      activeDestinations.map(dest =>
        sendToDestination(dest, payload, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      )
    )

    // 4. Processar resultados e registrar logs
    const results: DestinationResult[] = destinationResults.map(r =>
      r.status === 'fulfilled' ? r.value : {
        destination_id: 'unknown',
        destination_name: 'unknown',
        destination_type: 'unknown',
        success: false,
        error: r.reason?.message || 'Promise rejected',
      }
    )

    const anySuccess = results.some(r => r.success)
    const allErrors = results.filter(r => !r.success).map(r => `${r.destination_name}: ${r.error}`).join('; ')

    // 5. Salvar/Atualizar lead no Supabase
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
      rd_station_synced: anySuccess,
      rd_station_error: allErrors || null,
      is_completed: true,
      is_qualified: payload.customFields.cf_is_qualified !== 'Nao',
      disqualification_reason: payload.customFields.cf_disqualification_reason || null,
    }

    let savedLeadId = existingLeadId

    if (existingLeadId) {
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

    // 6. Registrar logs de integração (um por destino)
    for (const result of results) {
      await supabase.from('integration_logs').insert({
        lead_id: savedLeadId || null,
        service_name: `${result.destination_type}_${result.destination_name}`.substring(0, 100),
        status: result.success ? 'success' : 'error',
        error_message: result.error || null,
        payload: payload,
        response: { destination: result.destination_name, type: result.destination_type, success: result.success },
      })
    }

    // Se não tinha destinos, logar isso
    if (activeDestinations.length === 0) {
      await supabase.from('integration_logs').insert({
        lead_id: savedLeadId || null,
        service_name: 'no_destination',
        status: 'success',
        error_message: 'Nenhum destino ativo configurado',
        payload: payload,
        response: { message: 'Lead salvo sem destino de integração' },
      })
    }

    console.log(`📊 ${results.length} log(s) registrado(s)`)

    // 7. Disparar Meta CAPI (server-side) se lead qualificado
    const isQualified = payload.customFields.cf_is_qualified !== 'Nao'
    if (isQualified) {
      console.log('📊 Disparando Meta CAPI para lead qualificado...')
      try {
        const capiResponse = await fetch(
          `${SUPABASE_URL}/functions/v1/meta-capi`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              event_name: 'CompleteRegistration',
              email: payload.contactData.email,
              phone: payload.contactData.personal_phone,
              name: payload.contactData.name,
              city: payload.contactData.city || '',
              state: payload.contactData.state || '',
              lead_id: savedLeadId,
              insurance_type: insuranceType,
              is_qualified: true,
            })
          }
        )
        const capiResult = await capiResponse.json()
        console.log('📊 Meta CAPI resultado:', capiResult)
      } catch (capiError) {
        console.error('⚠️ Meta CAPI erro (não crítico):', capiError)
      }
    } else {
      console.log('🚫 Meta CAPI: Lead desqualificado, evento não disparado')
    }

    const leadSaved = savedLeadId !== null

    return new Response(JSON.stringify({
      success: leadSaved,
      lead_id: savedLeadId,
      destinations: results,
      integration_synced: anySuccess,
      integration_error: allErrors || null,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: leadSaved ? 200 : 500,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Erro crítico na Edge Function:', errorMessage)

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
