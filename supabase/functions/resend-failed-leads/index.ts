import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    // 1. Buscar leads com erro de webhook
    const { data: failedLeads, error: fetchError } = await supabase
      .from('leads')
      .select('id, name, email, phone, insurance_type, custom_fields, funnel_name, funnel_stage, cpf, cnpj, person_type')
      .eq('rd_station_synced', false)
      .like('rd_station_error', '%Unused Respond to Webhook%')
      .gte('created_at', '2026-01-29T00:00:00')

    if (fetchError) {
      throw new Error(`Erro ao buscar leads: ${fetchError.message}`)
    }

    console.log(`📋 Encontrados ${failedLeads?.length || 0} leads com erro`)

    // 2. Buscar configuração do webhook
    const { data: settings } = await supabase
      .from('integration_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (!settings?.webhook_url) {
      throw new Error('Webhook URL não configurada')
    }

    console.log(`🔗 Webhook: ${settings.webhook_url}`)

    const results: { id: string; name: string; success: boolean; error?: string }[] = []

    // 3. Reenviar cada lead
    for (const lead of failedLeads || []) {
      try {
        const customFields = lead.custom_fields as Record<string, unknown> || {}
        
        const webhookPayload = {
          name: lead.name,
          email: lead.email,
          personal_phone: lead.phone,
          cf_tipo_solicitacao_seguro: lead.insurance_type,
          cf_cpf: lead.cpf || customFields.cf_cpf,
          cf_cnpj: lead.cnpj || customFields.cf_cnpj,
          ...customFields,
          funnel: {
            funnel_name: lead.funnel_name,
            funnel_stage: lead.funnel_stage,
          },
          timestamp: new Date().toISOString(),
          source: 'JJ Seguros - Reenvio Automático',
          lead_id: lead.id
        }

        const webhookResponse = await fetch(settings.webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(webhookPayload)
        })

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          throw new Error(`Webhook retornou ${webhookResponse.status}: ${errorText}`)
        }

        // Atualizar lead como sincronizado
        await supabase
          .from('leads')
          .update({ 
            rd_station_synced: true, 
            rd_station_error: null 
          })
          .eq('id', lead.id)

        // Registrar log de sucesso
        await supabase.from('integration_logs').insert({
          lead_id: lead.id,
          service_name: 'webhook_resend',
          status: 'success',
          payload: webhookPayload,
          response: { success: true, reenvio: true }
        })

        results.push({ id: lead.id, name: lead.name, success: true })
        console.log(`✅ Reenviado: ${lead.name} (${lead.email})`)

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido'
        results.push({ id: lead.id, name: lead.name, success: false, error: errorMsg })
        console.error(`❌ Falha ao reenviar ${lead.name}: ${errorMsg}`)
      }
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length

    return new Response(JSON.stringify({
      success: true,
      total: failedLeads?.length || 0,
      reenviados: successCount,
      falhas: failCount,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Erro:', errorMessage)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
