import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RD_CRM_TOKEN = Deno.env.get('RD_CRM_TOKEN')
const CRM_BASE = 'https://crm.rdstation.com/api/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ═══════════════════════════════════════════════════
// DESTINO FIXO: Funil 1-Auto → Etapa "Agr Cotação"
// Todos os tipos de seguro vão pro mesmo funil
// ═══════════════════════════════════════════════════
const PIPELINE_ID = '677e81a1b36c270014ee2b56'   // 1-Auto
const STAGE_ID    = '677e81a1b36c270014ee2b5b'    // Agr Cotação
const PIPELINE_NAME = '1-Auto'

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
}): Promise<{ id: string; isNew: boolean }> {
  // 1. Buscar contato existente pelo email
  try {
    const searchResult = await crmFetch(`/contacts?email=${encodeURIComponent(contactData.email)}&limit=1`, 'GET')
    
    if (searchResult?.contacts?.length > 0) {
      const existingId = searchResult.contacts[0]._id || searchResult.contacts[0].id
      console.log(`✅ Contato encontrado: ${existingId}`)
      return { id: existingId, isNew: false }
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
  console.log(`✅ Contato criado (novo): ${contactId}`)
  return { id: contactId, isNew: true }
}

// Cria a negociação no funil 1-Auto → Agr Cotação
async function createDeal(params: {
  insuranceType: string;
  name: string;
  isNewContact: boolean;
}): Promise<string> {
  // "Novo" só aparece se o contato foi CRIADO agora (cliente novo)
  const dealName = params.isNewContact
    ? `Novo - ${params.name} - ${params.insuranceType}`
    : `${params.name} - ${params.insuranceType}`

  const deal = await crmFetch('/deals', 'POST', {
    deal: {
      name: dealName,
      deal_pipeline_id: PIPELINE_ID,
      deal_stage_id: STAGE_ID,
      deal_source_id: DEAL_SOURCE_ID,
      rating: 1,
    }
  })

  const dealId = deal._id || deal.id
  console.log(`✅ Negociação criada: ${dealId} → ${dealName}`)
  return dealId
}

// Associa contato à negociação via PUT /contacts/{id}
async function linkContactToDeal(contactId: string, dealId: string): Promise<void> {
  await crmFetch(`/contacts/${contactId}`, 'PUT', {
    contact: {
      deal_ids: [dealId],
    }
  })
  console.log(`✅ Contato ${contactId} vinculado ao deal ${dealId}`)
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

    // Tipo de seguro (usado no nome da negociação)
    const insuranceType = customFields?.cf_tipo_solicitacao_seguro || 'Seguro'
    console.log(`📍 Tipo: ${insuranceType} → Funil: ${PIPELINE_NAME} / Agr Cotação`)

    // Passo 1: Encontrar ou criar contato
    const contact = await findOrCreateContact({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.personal_phone,
      cpf: customFields.cf_cpf,
    })

    // Passo 2: Criar negociação no funil 1-Auto
    const dealId = await createDeal({
      insuranceType,
      name: contactData.name,
      isNewContact: contact.isNew,
    })

    // Passo 3: Vincular contato à negociação
    await linkContactToDeal(contact.id, dealId)

    // Passo 4: Adicionar anotação com QAR
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
      const annotationText = [
        `TIPO DE SEGURO: ${insuranceType}`,
        `CONTATO: ${contact.isNew ? 'Novo' : 'Existente'}`,
        '',
        '═══ QAR RESPONDIDO ═══',
        qarReport,
      ].join('\n')

      await addAnnotation(dealId, annotationText)
    }

    console.log('✅ Integração CRM concluída com sucesso!')

    return new Response(JSON.stringify({
      success: true,
      contact_id: contact.id,
      deal_id: dealId,
      pipeline: PIPELINE_NAME,
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
