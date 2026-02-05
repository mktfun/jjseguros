import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const META_PIXEL_ID = '653871503979893'
const META_API_VERSION = 'v18.0'

interface MetaEventData {
  event_name: 'Lead' | 'CompleteRegistration' | 'ViewContent' | 'PageView'
  event_time: number
  action_source: 'website'
  event_source_url?: string
  user_data: {
    client_ip_address?: string  // NOT hashed
    client_user_agent?: string  // NOT hashed
    em?: string[]  // hashed email
    ph?: string[]  // hashed phone
    fn?: string[]  // hashed first name
    ln?: string[]  // hashed last name
    ct?: string[]  // hashed city
    st?: string[]  // hashed state
    country?: string[]
    external_id?: string[]
  }
  custom_data?: {
    content_name?: string
    content_category?: string
    value?: number
    currency?: string
    lead_id?: string
    insurance_type?: string
  }
}

// Hash SHA256 para dados do usuário (requisito do Meta)
async function hashData(value: string): Promise<string> {
  if (!value) return ''
  
  // Normalizar: lowercase, trim
  const normalized = value.toLowerCase().trim()
  
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Normalizar telefone brasileiro para E.164
function normalizePhone(phone: string): string {
  // Remove tudo exceto números
  const digits = phone.replace(/\D/g, '')
  
  // Adiciona código do país se necessário
  if (digits.length === 11) {
    return `55${digits}` // DDD + número
  } else if (digits.length === 10) {
    return `55${digits}` // DDD + número (fixo)
  } else if (digits.startsWith('55')) {
    return digits
  }
  
  return digits
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const META_CAPI_TOKEN = Deno.env.get('META_CAPI_TOKEN')
  
  if (!META_CAPI_TOKEN) {
    console.error('❌ META_CAPI_TOKEN não configurado')
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'META_CAPI_TOKEN not configured' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const body = await req.json()
    const { 
      event_name, 
      email, 
      phone, 
      name, 
      city, 
      state, 
      lead_id,
      insurance_type,
      event_source_url,
      is_qualified,
      test_event_code
    } = body

    // Capturar IP e User-Agent do request HTTP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || req.headers.get('x-real-ip')
      || 'unknown'
    const clientUserAgent = req.headers.get('user-agent') || 'unknown'

    console.log('📊 Meta CAPI - Recebido:', { event_name, email, is_qualified, insurance_type, test_event_code })
    console.log('📊 Meta CAPI - Request info:', { clientIp, clientUserAgent: clientUserAgent.slice(0, 50) })

    // Só dispara se o lead for qualificado (exceto eventos de teste)
    if (is_qualified === false && !test_event_code) {
      console.log('🚫 Meta CAPI: Lead desqualificado, evento bloqueado')
      return new Response(JSON.stringify({ 
        success: true, 
        skipped: true,
        reason: 'Lead not qualified'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Preparar dados do usuário com hash
    let hashedEmail = email ? await hashData(email) : undefined
    let hashedPhone = phone ? await hashData(normalizePhone(phone)) : undefined
    const hashedCity = city ? await hashData(city) : undefined
    const hashedState = state ? await hashData(state) : undefined
    
    // Separar nome em first/last
    let hashedFn: string | undefined
    let hashedLn: string | undefined
    if (name) {
      const nameParts = name.trim().split(' ')
      hashedFn = await hashData(nameParts[0])
      if (nameParts.length > 1) {
        hashedLn = await hashData(nameParts.slice(1).join(' '))
      }
    }

    // Hash do país (Brasil = 'br')
    const hashedCountry = await hashData('br')

    // Para eventos de teste sem dados de usuário, usar dados fake pré-hasheados
    // Isso satisfaz os requisitos mínimos da Meta CAPI
    if (test_event_code) {
      // test@example.com hasheado = 973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b
      if (!hashedEmail) {
        hashedEmail = '973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b'
      }
      // 5511999999999 hasheado
      if (!hashedPhone) {
        hashedPhone = await hashData('5511999999999')
      }
      // Nomes fake
      if (!hashedFn) {
        hashedFn = await hashData('teste')
      }
      if (!hashedLn) {
        hashedLn = await hashData('admin')
      }
    }

    // Montar user_data - SEMPRE incluir IP e User-Agent (requisito Meta)
    const userData: MetaEventData['user_data'] = {
      client_ip_address: clientIp !== 'unknown' ? clientIp : undefined,
      client_user_agent: clientUserAgent !== 'unknown' ? clientUserAgent : undefined,
      country: [hashedCountry]
    }
    
    if (hashedEmail) userData.em = [hashedEmail]
    if (hashedPhone) userData.ph = [hashedPhone]
    if (hashedFn) userData.fn = [hashedFn]
    if (hashedLn) userData.ln = [hashedLn]
    if (hashedCity) userData.ct = [hashedCity]
    if (hashedState) userData.st = [hashedState]
    if (lead_id) userData.external_id = [lead_id]

    // Montar evento
    const eventData: MetaEventData = {
      event_name: event_name || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: userData,
      custom_data: {
        content_category: 'Insurance Quote',
        currency: 'BRL',
      }
    }

    if (event_source_url) {
      eventData.event_source_url = event_source_url
    }

    if (insurance_type) {
      eventData.custom_data!.content_name = insurance_type
      eventData.custom_data!.insurance_type = insurance_type
    }

    if (lead_id) {
      eventData.custom_data!.lead_id = lead_id
    }

    // Preparar payload para API
    const payload: { data: MetaEventData[], test_event_code?: string } = {
      data: [eventData]
    }
    
    // Incluir test_event_code se fornecido (para aparecer na aba Test Events)
    if (test_event_code) {
      payload.test_event_code = test_event_code
    }

    console.log('🚀 Meta CAPI - Enviando payload:', JSON.stringify(payload, null, 2))

    // Enviar para Meta Conversions API
    const metaUrl = `https://graph.facebook.com/${META_API_VERSION}/${META_PIXEL_ID}/events?access_token=${META_CAPI_TOKEN}`
    
    const metaResponse = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const responseData = await metaResponse.json()

    if (!metaResponse.ok) {
      console.error('❌ Meta CAPI - Erro:', responseData)
      return new Response(JSON.stringify({ 
        success: false, 
        error: responseData.error?.message || 'Meta API error',
        details: responseData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    console.log('✅ Meta CAPI - Sucesso:', responseData)

    return new Response(JSON.stringify({ 
      success: true, 
      events_received: responseData.events_received,
      fbtrace_id: responseData.fbtrace_id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Meta CAPI - Erro crítico:', errorMessage)
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
