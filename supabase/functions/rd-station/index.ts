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
    const { contactData, customFields, funnelData } = await req.json()

    // Validação básica
    if (!RD_API_KEY) {
      throw new Error('RD_API_KEY não configurada no Supabase')
    }

    // 2. Montar o Payload para RD Station API 2.0
    const rdPayload: any = {
      event_type: "CONVERSION",
      event_family: "CDP",
      payload: {
        conversion_identifier: customFields.cf_tipo_solicitacao_seguro || "lead_seguro",
        email: contactData.email,
        name: contactData.name,
        personal_phone: contactData.personal_phone,
        mobile_phone: contactData.personal_phone,
        
        // Espalha os campos personalizados (cf_...)
        ...customFields
      }
    }

    // 3. Adicionar dados de funil se fornecidos
    if (funnelData?.funnel_name && funnelData?.funnel_stage) {
      rdPayload.payload.funnel_name = funnelData.funnel_name
      rdPayload.payload.funnel_stage = funnelData.funnel_stage
    }

    console.log('🚀 Enviando para RD Station:', JSON.stringify(rdPayload))

    // 4. POST direto com api_key na query string
    const rdResponse = await fetch(`https://api.rd.services/platform/conversions?api_key=${RD_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(rdPayload)
    })

    if (!rdResponse.ok) {
      const errorText = await rdResponse.text()
      console.error('❌ Erro RD Station:', errorText)
      throw new Error(`RD Station API Error: ${errorText}`)
    }

    const responseData = await rdResponse.json()
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
