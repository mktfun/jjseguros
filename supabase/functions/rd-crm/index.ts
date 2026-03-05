import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RD_CRM_TOKEN = Deno.env.get('RD_CRM_TOKEN')
const CRM_BASE = 'https://crm.rdstation.com/api/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ═══════════════════════════════════════════════════
// MAPEAMENTO: Tipo de Seguro → Pipeline + Stage
// Dados reais do CRM (queried 2026-03-04)
// ═══════════════════════════════════════════════════
const PIPELINE_MAP: Record<string, { pipeline_id: string; stage_id: string; name: string }> = {
  'auto': {
    pipeline_id: '677e81a1b36c270014ee2b56',   // 1-Auto
    stage_id: '677e81a1b36c270014ee2b5b',       // Agr Cotação
    name: '1-Auto',
  },
  'residencial': {
    pipeline_id: '677e8400f73b660015c4e90e',   // 3-Residencial
    stage_id: '677e8400f73b660015c4e913',       // Agr Cotação
    name: '3-Residencial',
  },
  'vida': {
    pipeline_id: '677e8667f17866001ee87b75',   // 6-Vida
    stage_id: '677e8667f17866001ee87b7a',       // Agr Cotação
    name: '6-Vida',
  },
  'empresarial': {
    pipeline_id: '677e8652543788001448ab73',   // 5-Empresarial
    stage_id: '677e8652543788001448ab78',       // Agr Cotação
    name: '5-Empresarial',
  },
  'viagem': {
    pipeline_id: '677e86f4961152001aaf385c',   // 10-Viagem
    stage_id: '677e86f4961152001aaf3861',       // Agr Cotação
    name: '10-Viagem',
  },
  'saude': {
    pipeline_id: '677e864a39e4b4001dba6eeb',   // 4-Saúde
    stage_id: '677e864a39e4b4001dba6eed',       // Prospecção (Saúde não tem "Agr Cotação" direto)
    name: '4-Saúde',
  },
  'smartphone': {
    pipeline_id: '677e86d9acf4580014dea77d',   // 8-Equipamentos
    stage_id: '677e86d9acf4580014dea785',       // Agr Cotação
    name: '8-Equipamentos',
  },
  'fianca': {
    pipeline_id: '677e866daa82190020bf9312',   // 7-Fiança
    stage_id: '677e866daa82190020bf9317',       // Agr Cotação
    name: '7-Fiança',
  },
}

// Fonte: "Contato pelo Site"
const DEAL_SOURCE_ID = '6762e8c79515d2001630310d'

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

async function crmFetch(endpoint: string, method: string, body?: unknown) {
  const url = `${CRM_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}token=${RD_CRM_TOKEN}`
  console.log(`🔗 CRM ${method} ${endpoint}`)
  
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const text = await res.text()
  console.log(`📬 CRM Response: ${res.status} - ${text.substring(0, 500)}`)

  if (!res.ok) {
    throw new Error(`CRM API ${res.status}: ${text}`)
  }

  return JSON.parse(text)
}

// Busca contato por email ou cria novo
async function findOrCreateContact(contactData: {
  name: string;
  email: string;
  phone: string;
  cpf?: string;
}): Promise<string> {
  // 1. Buscar contato existente pelo email
  try {
    const searchResult = await crmFetch(`/contacts?email=${encodeURIComponent(contactData.email)}&limit=1`, 'GET')
    
    if (searchResult?.contacts?.length > 0) {
      const existingId = searchResult.contacts[0]._id || searchResult.contacts[0].id
      console.log(`✅ Contato encontrado: ${existingId}`)
      return existingId
    }
  } catch (e) {
    console.log('⚠️ Busca contato falhou, tentando criar:', e)
  }

  // 2. Criar contato novo
  const newContact = await crmFetch('/contacts', 'POST', {
    contact: {
      name: contactData.name,
      emails: [{ email: contactData.email }],
      phones: [{ phone: contactData.phone, type: 'cellphone' }],
      ...(contactData.cpf ? { cpf: contactData.cpf } : {}),
    }
  })

  const contactId = newContact._id || newContact.id
  console.log(`✅ Contato criado: ${contactId}`)
  return contactId
}

// Cria a negociação no funil correto
async function createDeal(params: {
  contactId: string;
  insuranceType: string;
  name: string;
  dealType?: string;
}): Promise<string> {
  const pipeline = PIPELINE_MAP[params.insuranceType]
  if (!pipeline) {
    throw new Error(`Tipo de seguro não mapeado: ${params.insuranceType}`)
  }

  const dealTypeLabel = params.dealType === 'renovacao' ? 'Renovação'
    : params.dealType === 'endosso' ? 'Endosso'
    : 'Novo'

  const dealName = `${dealTypeLabel} - ${params.name} - ${pipeline.name}`

  const deal = await crmFetch('/deals', 'POST', {
    deal: {
      name: dealName,
      deal_pipeline_id: pipeline.pipeline_id,
      deal_stage_id: pipeline.stage_id,
      deal_source_id: DEAL_SOURCE_ID,
      contact_ids: [params.contactId],
      rating: 1,
    }
  })

  const dealId = deal._id || deal.id
  console.log(`✅ Negociação criada: ${dealId} → ${dealName}`)
  return dealId
}

// Adiciona anotação (QAR) à negociação
async function addAnnotation(dealId: string, text: string): Promise<void> {
  await crmFetch('/activities', 'POST', {
    activity: {
      deal_id: dealId,
      text: text,
      type: 2, // 2 = annotation/note
    }
  })
  console.log(`✅ Anotação adicionada ao deal ${dealId}`)
}

// ═══════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!RD_CRM_TOKEN) {
      throw new Error('RD_CRM_TOKEN não configurado no Supabase')
    }

    const body = await req.json()
    const { contactData, customFields, funnelData } = body

    console.log('═══════════════════════════════════════')
    console.log('🚀 RD CRM - Nova integração direta')
    console.log('📧 Contact:', contactData?.name, contactData?.email)
    console.log('📦 Tipo:', customFields?.cf_tipo_solicitacao_seguro)
    console.log('═══════════════════════════════════════')

    // Identificar tipo de seguro
    const insuranceType = (customFields?.cf_tipo_solicitacao_seguro || '').toLowerCase()
      .replace('seguro ', '')
      .replace('plano de ', '')
      .replace('saúde', 'saude')
      .replace('fiança residencial', 'fianca')
      .trim()

    // Normalizar para chave do mapa
    const typeKey = Object.keys(PIPELINE_MAP).find(key => 
      insuranceType.includes(key)
    ) || 'auto'

    console.log(`📍 Tipo normalizado: "${insuranceType}" → key: "${typeKey}"`)

    // Passo 1: Encontrar ou criar contato
    const contactId = await findOrCreateContact({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.personal_phone,
      cpf: customFields.cf_cpf,
    })

    // Passo 2: Criar negociação no funil correto
    const dealType = customFields.cf_deal_type || funnelData?.deal_type || 'novo'
    const dealId = await createDeal({
      contactId,
      insuranceType: typeKey,
      name: contactData.name,
      dealType,
    })

    // Passo 3: Adicionar anotação com QAR
    const qarReport = customFields.cf_qar_respondido
      || customFields.cf_aqr_respondido
      || customFields.cf_qar_auto
      || customFields.cf_qar_residencial
      || customFields.cf_qar_vida
      || customFields.cf_qar_empresarial
      || customFields.cf_qar_viagem
      || customFields.cf_qar_saude
      || ''

    if (qarReport) {
      // Montar texto da anotação completo
      const annotationText = [
        `TIPO DE SEGURO: ${customFields.cf_tipo_solicitacao_seguro || typeKey}`,
        `DEAL TYPE: ${dealType}`,
        '',
        '═══ QAR RESPONDIDO ═══',
        qarReport,
      ].join('\n')

      await addAnnotation(dealId, annotationText)
    }

    console.log('✅ Integração CRM concluída com sucesso!')

    return new Response(JSON.stringify({
      success: true,
      contact_id: contactId,
      deal_id: dealId,
      pipeline: PIPELINE_MAP[typeKey]?.name,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('💥 Erro RD CRM:', errorMessage)
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
