import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RD_API_KEY = Deno.env.get('RD_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Receber os dados do Frontend
    const body = await req.json()
    const { contactData, customFields, funnelData, job_title, mobile_phone } = body

    // Log detalhado dos dados recebidos
    console.log('📧 ContactData recebido:', JSON.stringify(contactData))
    console.log('📦 CustomFields recebidos:', JSON.stringify(customFields))
    console.log('🎯 FunnelData recebido:', JSON.stringify(funnelData))
    console.log('💼 Job Title:', job_title)
    console.log('📱 Mobile Phone:', mobile_phone)

    // Validação básica
    if (!RD_API_KEY) {
      throw new Error('RD_API_KEY não configurada no Supabase')
    }

    // 2. Montar o Payload para RD Station API 2.0
    // CRÍTICO: name, email, mobile_phone, city e state devem estar na RAIZ do payload
    const rdPayload: any = {
      event_type: "CONVERSION",
      event_family: "CDP",
      payload: {
        // Identificador da conversão
        conversion_identifier: customFields.cf_tipo_solicitacao_seguro || "lead_seguro",
        
        // Campos PADRÃO do RD Station - na raiz do payload
        email: contactData.email,
        name: contactData.name,
        personal_phone: contactData.personal_phone,
        mobile_phone: mobile_phone || contactData.personal_phone, // RD Station pode preferir mobile_phone
        city: contactData.city || '',             // CIDADE na raiz
        state: contactData.state || '',           // ESTADO na raiz
        job_title: job_title || '',               // Profissão (campo padrão RD)
        
        // Campos personalizados (cf_...) - spread dos custom fields
        ...customFields
      }
    }

    // 3. Adicionar dados de funil se fornecidos
    if (funnelData?.funnel_name && funnelData?.funnel_stage) {
      rdPayload.payload.funnel_name = funnelData.funnel_name
      rdPayload.payload.funnel_stage = funnelData.funnel_stage
    }

    console.log('🚀 Payload FINAL para RD Station:', JSON.stringify(rdPayload, null, 2))
    console.log('📍 Campos padrão - name:', rdPayload.payload.name)
    console.log('📍 Campos padrão - email:', rdPayload.payload.email)
    console.log('📍 Campos padrão - mobile_phone:', rdPayload.payload.mobile_phone)
    console.log('📍 Campos padrão - city:', rdPayload.payload.city)
    console.log('📍 Campos padrão - state:', rdPayload.payload.state)

    // 4. POST direto com api_key na query string
    const rdResponse = await fetch(`https://api.rd.services/platform/conversions?api_key=${RD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(rdPayload)
    })

    const responseText = await rdResponse.text()
    console.log('📬 Response Status:', rdResponse.status)
    console.log('📬 Response Body:', responseText)

    if (!rdResponse.ok) {
      console.error('❌ Erro RD Station:', responseText)
      throw new Error(`RD Station API Error: ${responseText}`)
    }

    const responseData = JSON.parse(responseText)
    console.log('✅ Sucesso RD Station:', JSON.stringify(responseData))
    
    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Erro na Edge Function:', errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
