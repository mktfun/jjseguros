import { supabase } from "@/integrations/supabase/client";
import { getSettings } from "@/utils/settings";

// Separador visual limpo (compatível com WhatsApp e CRMs)
const SEPARATOR = '───────────────────────';

// Interfaces
export interface ContactData {
  name: string;
  email: string;
  personal_phone: string;
  city?: string;
  state?: string;
}

export interface CustomFields {
  cf_tipo_solicitacao_seguro: string;
  cf_qar_auto?: string;
  cf_qar_residencial?: string;
  cf_qar_vida?: string;
  cf_qar_empresarial?: string;
  cf_qar_viagem?: string;
  cf_qar_saude?: string;
  cf_qar_respondido?: string;
  cf_aqr_respondido?: string;
  [key: string]: string | undefined;
}

export interface FunnelData {
  funnel_name: string;
  funnel_stage: string;
}

export interface RDStationPayload {
  contactData: ContactData;
  customFields: CustomFields;
  funnelData?: FunnelData;
}

// Função auxiliar para traduzir valores
export const translateValue = (field: string, value: string | boolean | undefined): string => {
  if (value === undefined || value === null || value === '') return 'Nao informado';
  
  const translations: Record<string, Record<string, string>> = {
    yesNo: {
      'sim': 'Sim',
      'nao': 'Nao',
      'true': 'Sim',
      'false': 'Nao'
    },
    maritalStatus: {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viuvo(a)',
      'uniao_estavel': 'Uniao Estavel'
    },
    personType: {
      'fisica': 'Pessoa Fisica',
      'juridica': 'Pessoa Juridica',
      'pf': 'Pessoa Fisica',
      'pj': 'Pessoa Juridica'
    },
    vehicleUseType: {
      'pessoal': 'Uso Pessoal (Lazer/Trabalho)',
      'comercial': 'Comercial / Visitas / App'
    },
    residenceType: {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'condominio': 'Casa em Condominio'
    },
    garageType: {
      'automatico': 'Portao Automatico',
      'manual': 'Portao Manual',
      'estacionamento': 'Estacionamento Pago',
      'rua': 'Rua'
    },
    workParking: {
      'fechada': 'Garagem Fechada',
      'estacionamento': 'Estacionamento Pago',
      'rua': 'Rua'
    },
    schoolParking: {
      'fechada': 'Garagem Fechada',
      'estacionamento': 'Estacionamento Pago',
      'rua': 'Rua'
    },
    propertyType: {
      'casa': 'Casa',
      'apartamento': 'Apartamento'
    },
    ownershipType: {
      'proprietario': 'Proprietario',
      'inquilino': 'Inquilino'
    },
    smoker: {
      'sim': 'Sim',
      'nao': 'Nao'
    },
    planType: {
      'individual': 'Individual',
      'familiar': 'Familiar',
      'empresarial': 'Empresarial'
    },
    accommodation: {
      'enfermaria': 'Enfermaria',
      'apartamento': 'Apartamento'
    }
  };

  if (typeof value === 'boolean') {
    return value ? 'Sim' : 'Nao';
  }

  return translations[field]?.[value] || value;
};

// Helper para formatar sim/não
const formatYesNo = (value: string | boolean | undefined): string => {
  if (value === 'sim' || value === true) return 'Sim';
  if (value === 'nao' || value === false) return 'Nao';
  return 'Nao informado';
};

// Helper para formatar link do WhatsApp (limpo)
const formatWhatsAppLink = (phone: string): string => {
  const digits = phone?.replace(/\D/g, '') || '';
  return `https://wa.me/55${digits}`;
};

// Função para salvar/atualizar lead no Supabase
// Se já existe um lead parcial (leadId), faz UPDATE. Senão, faz INSERT.
const saveLeadToSupabase = async (
  payload: RDStationPayload, 
  rdSuccess: boolean, 
  rdError?: string,
  existingLeadId?: string | null
): Promise<void> => {
  try {
    const insuranceType = payload.customFields.cf_tipo_solicitacao_seguro;
    
    // Encontra o QAR report baseado no tipo de seguro
    const qarReport = payload.customFields.cf_qar_auto ||
      payload.customFields.cf_qar_residencial ||
      payload.customFields.cf_qar_vida ||
      payload.customFields.cf_qar_empresarial ||
      payload.customFields.cf_qar_viagem ||
      payload.customFields.cf_qar_saude || '';

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
      rd_station_synced: rdSuccess,
      rd_station_error: rdError || null,
      is_completed: true, // Marca como completo quando chega ao final
    };

    if (existingLeadId) {
      // UPDATE: lead parcial já existe
      const { error } = await supabase
        .from('leads')
        .update(leadData)
        .eq('id', existingLeadId);

      if (error) {
        console.error('Erro ao atualizar lead no Supabase:', error);
      } else {
        console.log('Lead atualizado no Supabase (ID:', existingLeadId, ')');
      }
    } else {
      // INSERT: lead novo (fallback se não passou pelo step 0)
      const { error } = await supabase.from('leads').insert({
        ...leadData,
        is_completed: true,
        last_step_index: 0,
        abandoned_alert_sent: false,
      });

      if (error) {
        console.error('Erro ao inserir lead no Supabase:', error);
      } else {
        console.log('Lead inserido no Supabase');
      }
    }
  } catch (error) {
    console.error('Erro critico ao salvar lead:', error);
  }
};

// Função principal para envio de leads
// Verifica a configuração no Supabase e envia para RD Station ou Webhook
export const sendToRDStation = async (
  payload: RDStationPayload, 
  existingLeadId?: string | null
): Promise<boolean> => {
  let rdSuccess = false;
  let rdError: string | undefined;

  try {
    console.log('Verificando configuração de integração...');
    if (existingLeadId) {
      console.log('Lead parcial existente:', existingLeadId);
    }

    // 1. Buscar configuração
    const settings = await getSettings();
    console.log('Configuração atual:', settings);

    // 2. Se mode == 'webhook' e URL configurada
    if (settings?.mode === 'webhook' && settings?.webhook_url) {
      console.log('Enviando para Webhook customizado:', settings.webhook_url);
      
      // Payload unificado para webhook
      const webhookPayload = {
        ...payload.contactData,
        ...payload.customFields,
        funnel: payload.funnelData,
        timestamp: new Date().toISOString(),
        source: 'JJ Seguros - Formulário de Cotação'
      };
      
      const response = await fetch(settings.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      });
      
      if (!response.ok) {
        throw new Error(`Webhook retornou ${response.status}: ${response.statusText}`);
      }
      
      rdSuccess = true;
      console.log('Webhook enviado com sucesso');
      
    } else {
      // 3. Se mode == 'rd_station' (padrão)
      console.log('Enviando para RD Station via Edge Function...');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const { data, error } = await supabase.functions.invoke('rd-station', {
        body: payload
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        rdError = error.message;
        rdSuccess = false;
      } else {
        console.log('Resposta RD Station:', data);
        rdSuccess = true;
      }
    }

  } catch (error) {
    console.error('Erro crítico ao enviar lead:', error);
    rdError = error instanceof Error ? error.message : 'Erro desconhecido';
    rdSuccess = false;
  }

  // Salva no Supabase independente do resultado
  await saveLeadToSupabase(payload, rdSuccess, rdError, existingLeadId);

  return rdSuccess;
};

// ============================================
// BUILDERS COM RELATÓRIO CONSOLIDADO (QAR)
// FORMATO LIMPO - SEM EMOJIS
// ============================================

export const buildAutoPayload = (formData: any): RDStationPayload => {
  // Determinar tipo de seguro baseado em isUber
  const insuranceLabel = formData.isUber ? 'Seguro Uber/Similares' : 'Seguro Auto';
  const whatsappLink = formatWhatsAppLink(formData.phone);
  
  // Traduzir deal type
  const dealTypeLabel = formData.dealType === 'renovacao' 
    ? 'Renovacao JJ Seguros' 
    : formData.dealType === 'novo' 
      ? 'Seguro Novo' 
      : 'Nao informado';

  // Construção do Relatório QAR - FORMATO LIMPO
  let qarReport = '';
  
  // Cabeçalho dinâmico baseado no deal type
  if (formData.dealType === 'renovacao') {
    qarReport += `CLIENTE DE RENOVACAO - JA E DA CASA\n${SEPARATOR}\n\n`;
  } else if (formData.dealType === 'novo') {
    qarReport += `NOVO LEAD: ${insuranceLabel.toUpperCase()}\n${SEPARATOR}\n`;
  }
  
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  // Tipo de Solicitação
  qarReport += `TIPO SOLICITACAO: ${dealTypeLabel}\n\n`;

  // Dados Pessoais
  qarReport += `DADOS DO CONDUTOR:\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Tipo: ${translateValue('personType', formData.personType)}\n`;
  qarReport += `CPF/CNPJ: ${formData.cpf || formData.cnpj || 'Nao informado'}\n`;
  qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.maritalStatus)}\n`;
  qarReport += `Profissao: ${formData.profession || 'Nao informada'}\n\n`;

  // Dados do Veículo
  qarReport += `DADOS DO VEICULO:\n`;
  qarReport += `Modelo: ${formData.model || 'Nao informado'}\n`;
  qarReport += `Placa: ${formData.plate || 'Zero KM (sem placa)'}\n`;
  qarReport += `Ano/Modelo: ${formData.year || 'Nao informado'}\n`;
  // Só exibe Zero KM e Financiado para seguro novo
  if (formData.dealType !== 'renovacao') {
    qarReport += `Zero KM: ${formatYesNo(formData.isZeroKm)}\n`;
    qarReport += `Financiado/Alienado: ${formatYesNo(formData.isFinanced)}\n`;
  }
  qarReport += `Tipo de Uso: ${translateValue('vehicleUseType', formData.vehicleUseType)}\n\n`;

  // Endereço e Pernoite
  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `ENDERECO E PERNOITE:\n`;
  qarReport += `CEP: ${formData.cep || 'Nao informado'}\n`;
  qarReport += `Endereco: ${endereco || 'Nao informado'}\n`;
  qarReport += `Tipo Residencia: ${translateValue('residenceType', formData.residenceType)}\n`;
  qarReport += `Garagem Casa: ${translateValue('garageType', formData.garageType)}\n\n`;

  // Rotina de Uso
  qarReport += `ROTINA DE USO:\n`;
  qarReport += `Usa p/ Trabalho: ${formatYesNo(formData.usesForWork)}\n`;
  if (formData.usesForWork) {
    qarReport += `  > Estacionamento Trabalho: ${translateValue('workParking', formData.workParking)}\n`;
  }
  qarReport += `Usa p/ Faculdade: ${formatYesNo(formData.usesForSchool)}\n`;
  if (formData.usesForSchool) {
    qarReport += `  > Estacionamento Faculdade: ${translateValue('schoolParking', formData.schoolParking)}\n`;
  }
  qarReport += `\n`;

  // Perfil de Risco - Condutor Jovem (Lógica Condicional)
  qarReport += `PERFIL DE RISCO:\n`;
  qarReport += `Reside com pessoa de 18-25 anos: ${formatYesNo(formData.livesWithYoungPerson)}\n`;
  if (formData.livesWithYoungPerson) {
    qarReport += `  > Essa pessoa conduz o veiculo: ${formatYesNo(formData.youngPersonDrives)}\n`;
    if (formData.youngPersonDrives) {
      qarReport += `  > Idade do condutor jovem: ${formData.youngDriverAge || 'Nao informada'} anos\n`;
      qarReport += `  > Sexo: ${formData.youngDriverGender === 'masculino' ? 'Masculino' : formData.youngDriverGender === 'feminino' ? 'Feminino' : 'Nao informado'}\n`;
    }
  }

  // Sinistro - Apenas para renovação
  if (formData.dealType === 'renovacao') {
    qarReport += `\nHISTORICO DE SINISTROS:\n`;
    qarReport += `Houve sinistro na vigencia atual: ${formatYesNo(formData.hadClaim)}\n`;
  }

  // Contato
  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  // Log para validação
  console.log('buildAutoPayload - city:', formData.city);
  console.log('buildAutoPayload - state:', formData.state);
  console.log('buildAutoPayload - dealType:', formData.dealType);

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone,
      city: formData.city || '',
      state: formData.state || ''
    },
    customFields: {
      cf_tipo_solicitacao_seguro: insuranceLabel,
      cf_deal_type: dealTypeLabel,
      cf_qar_auto: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: formData.isUber ? '1-Uber' : '1-Auto',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

export const buildResidentialPayload = (formData: any): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: SEGURO RESIDENCIAL\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `DADOS DO SEGURADO:\n`;
  qarReport += `Tipo: ${translateValue('personType', formData.personType)}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF/CNPJ: ${formData.cpfCnpj || 'Nao informado'}\n`;
  qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.maritalStatus)}\n`;
  qarReport += `Profissao: ${formData.profession || 'Nao informada'}\n\n`;

  qarReport += `DADOS DO IMOVEL:\n`;
  qarReport += `Tipo: ${formData.propertyType === 'house' ? 'Casa' : 'Apartamento'}\n`;
  qarReport += `Condicao: ${formData.ownershipType === 'owner' ? 'Proprietario' : 'Inquilino'}\n`;
  qarReport += `Alarme Monitorado: ${formData.hasAlarm ? 'Sim' : 'Nao'}\n`;
  qarReport += `Condominio Fechado: ${formData.hasGatedCommunity ? 'Sim' : 'Nao'}\n\n`;

  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `ENDERECO:\n`;
  qarReport += `CEP: ${formData.cep || 'Nao informado'}\n`;
  qarReport += `Endereco: ${endereco || 'Nao informado'}\n\n`;

  qarReport += `VALORES E COBERTURAS:\n`;
  qarReport += `Valor de Reconstrucao: ${formData.reconstructionValue || 'Nao informado'}\n`;
  qarReport += `Valor do Conteudo: ${formData.contentsValue || 'Nao informado'}\n`;
  qarReport += `Roubo/Furto: ${formData.coverageTheft ? 'Sim' : 'Nao'}\n`;
  qarReport += `Incendio/Raio/Explosao: ${formData.coverageFire ? 'Sim' : 'Nao'}\n`;
  qarReport += `Eletronicos Portateis: ${formData.coverageElectronics ? 'Sim' : 'Nao'}\n`;
  if (formData.coverageElectronics && formData.portableElectronicsValue) {
    qarReport += `Valor NF Eletronicos Portateis: ${formData.portableElectronicsValue}\n`;
  }
  qarReport += `Cobertura Valor de Novo: ${formData.coverageNewValue ? 'Sim' : 'Nao'}\n`;

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  // Determinar CPF ou CNPJ baseado no tipo de pessoa
  const cpfField = formData.personType === 'pf' ? formData.cpfCnpj : null;
  const cnpjField = formData.personType === 'pj' ? formData.cpfCnpj : null;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone,
      city: formData.city || '',
      state: formData.state || ''
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Residencial',
      cf_tipo_pessoa: formData.personType === 'pf' ? 'Pessoa Fisica' : 'Pessoa Juridica',
      cf_cpf: cpfField || undefined,
      cf_cnpj: cnpjField || undefined,
      cf_qar_residencial: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '2-Residencial',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

export const buildLifePayload = (formData: any): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: SEGURO DE VIDA\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `DADOS DO SEGURADO:\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Nao informado'}\n`;
  qarReport += `Data Nascimento: ${formData.birthDate || 'Nao informada'}\n`;
  qarReport += `Profissao: ${formData.profession || 'Nao informada'}\n\n`;

  qarReport += `PERFIL DE SAUDE:\n`;
  qarReport += `Fumante: ${translateValue('smoker', formData.smoker)}\n`;
  qarReport += `Esportes Radicais: ${formData.extremeSports ? 'Sim' : 'Nao'}\n\n`;

  qarReport += `CAPITAL E COBERTURAS:\n`;
  qarReport += `Capital Segurado: ${formData.coverageAmount || 'Nao informado'}\n`;
  qarReport += `Invalidez: ${formData.coverageDisability ? 'Sim' : 'Nao'}\n`;
  qarReport += `Doencas Graves: ${formData.coverageIllness ? 'Sim' : 'Nao'}\n`;
  qarReport += `Funeral: ${formData.coverageFuneral ? 'Sim' : 'Nao'}\n`;

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro de Vida',
      cf_qar_vida: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '3-Vida',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

export const buildBusinessPayload = (formData: any): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: SEGURO EMPRESARIAL\n${SEPARATOR}\n`;
  qarReport += `Contato: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `DADOS DA EMPRESA:\n`;
  qarReport += `Razao Social: ${formData.companyName || 'Nao informada'}\n`;
  qarReport += `CNPJ: ${formData.cnpj || 'Nao informado'}\n`;
  qarReport += `Ramo de Atividade: ${formData.businessActivity || 'Nao informado'}\n`;
  qarReport += `Faturamento Anual: ${formData.annualRevenue || 'Nao informado'}\n`;
  qarReport += `N. Funcionarios: ${formData.employeeCount || 'Nao informado'}\n\n`;

  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `ENDERECO:\n`;
  qarReport += `CEP: ${formData.cep || 'Nao informado'}\n`;
  qarReport += `Endereco: ${endereco || 'Nao informado'}\n\n`;

  qarReport += `COBERTURAS SOLICITADAS:\n`;
  qarReport += `Incendio: ${formData.coverageFire ? 'Sim' : 'Nao'}\n`;
  qarReport += `Roubo/Furto: ${formData.coverageTheft ? 'Sim' : 'Nao'}\n`;
  qarReport += `Responsabilidade Civil: ${formData.coverageLiability ? 'Sim' : 'Nao'}\n`;

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Empresarial',
      cf_qar_empresarial: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '4-Empresarial',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

export const buildTravelPayload = (formData: any, travelers: any[]): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: SEGURO VIAGEM\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.fullName || travelers[0]?.name || ''}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `DADOS DA VIAGEM:\n`;
  qarReport += `Destino: ${formData.destination || 'Nao informado'}\n`;
  qarReport += `Tipo: ${formData.destinationType || 'Nao informado'}\n`;
  qarReport += `Data Ida: ${formData.departureDate || 'Nao informada'}\n`;
  qarReport += `Data Volta: ${formData.returnDate || 'Nao informada'}\n`;
  qarReport += `Motivo: ${formData.tripPurpose || 'Nao informado'}\n\n`;

  qarReport += `VIAJANTES (${travelers.length}):\n`;
  travelers.forEach((t, i) => {
    qarReport += `${i + 1}. ${t.name} - CPF: ${t.cpf}\n`;
  });
  qarReport += `\n`;

  qarReport += `COBERTURAS SOLICITADAS:\n`;
  qarReport += `Despesas Medicas: ${formData.coverageMedical ? 'Sim' : 'Nao'}\n`;
  qarReport += `Bagagem: ${formData.coverageBaggage ? 'Sim' : 'Nao'}\n`;
  qarReport += `Cancelamento: ${formData.coverageCancellation ? 'Sim' : 'Nao'}\n`;

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.fullName || travelers[0]?.name || '',
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Viagem',
      cf_qar_viagem: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '5-Viagem',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

export const buildHealthPayload = (formData: any, dependents: any[]): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: PLANO DE SAUDE\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `TITULAR:\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Nao informado'}\n`;
  qarReport += `Data Nascimento: ${formData.birthDate || 'Nao informada'}\n\n`;

  qarReport += `PREFERENCIAS DO PLANO:\n`;
  qarReport += `Tipo: ${translateValue('planType', formData.planType)}\n`;
  qarReport += `Acomodacao: ${translateValue('accommodation', formData.accommodation)}\n`;
  qarReport += `Coparticipacao: ${formData.coparticipation ? 'Sim' : 'Nao'}\n\n`;

  if (dependents.length > 0) {
    qarReport += `DEPENDENTES (${dependents.length}):\n`;
    dependents.forEach((d, i) => {
      qarReport += `${i + 1}. ${d.name} - ${d.relationship}\n`;
    });
    qarReport += `\n`;
  }

  qarReport += `SITUACAO ATUAL:\n`;
  qarReport += `Possui plano atual: ${formData.hasCurrentPlan ? 'Sim' : 'Nao'}\n`;
  if (formData.hasCurrentPlan && formData.currentProvider) {
    qarReport += `Operadora atual: ${formData.currentProvider}\n`;
  }

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Plano de Saude',
      cf_qar_saude: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '6-Saude',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

// ============================================
// SMARTPHONE BUILDER
// ============================================

export const buildSmartphonePayload = (formData: any): RDStationPayload => {
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `NOVO LEAD: SEGURO SMARTPHONE\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `DADOS DO SEGURADO:\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Nao informado'}\n`;
  qarReport += `Data Nascimento: ${formData.birthDate || 'Nao informada'}\n`;
  qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.maritalStatus)}\n`;
  qarReport += `Profissao: ${formData.profession || 'Nao informada'}\n\n`;

  qarReport += `ENDERECO DO IMOVEL:\n`;
  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `CEP: ${formData.cep || 'Nao informado'}\n`;
  qarReport += `Endereco: ${endereco || 'Nao informado'}\n`;
  qarReport += `Imovel de Veraneio: ${formData.isVacationHome ? 'Sim' : 'Nao'}\n\n`;

  qarReport += `DADOS DO SMARTPHONE:\n`;
  qarReport += `Valor da NF: ${formData.smartphoneValue || 'Nao informado'}\n`;

  qarReport += `\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone,
      city: formData.city || '',
      state: formData.state || ''
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Residencial', // RD Station recebe como Residencial
      cf_tipo_pessoa: 'Pessoa Fisica',
      cf_cpf: formData.cpf || undefined,
      cf_qar_residencial: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '2-Residencial',
      funnel_stage: 'AGR Cotacao'
    }
  };
};

// ============================================
// ENDOSSO BUILDER
// ============================================

const endorsementTypeLabels: Record<string, string> = {
  substituicao_veiculo: "Substituicao de Veiculo",
  alteracao_cep: "Alteracao de CEP de Pernoite",
  troca_condutor: "Troca de Condutor Principal",
  cancelamento: "Cancelamento do Seguro"
};

export const buildEndorsementPayload = (formData: any): RDStationPayload => {
  const insuranceLabel = formData.isUber ? 'Endosso Uber/Similares' : 'Endosso Auto';
  const endorsementTypeLabel = endorsementTypeLabels[formData.endorsementType] || formData.endorsementType;
  const whatsappLink = formatWhatsAppLink(formData.phone);

  let qarReport = `SOLICITACAO DE ENDOSSO: ${insuranceLabel.toUpperCase()}\n${SEPARATOR}\n`;
  qarReport += `Nome: ${formData.name}\n`;
  qarReport += `Chamar: ${whatsappLink}\n`;
  qarReport += `${SEPARATOR}\n\n`;

  qarReport += `TIPO DE ENDOSSO: ${endorsementTypeLabel}\n\n`;

  qarReport += `DADOS DO SEGURADO:\n`;
  qarReport += `Nome: ${formData.name}\n`;
  qarReport += `CPF: ${formData.cpf || 'Nao informado'}\n\n`;

  // Campos específicos por tipo de endosso
  switch (formData.endorsementType) {
    case "substituicao_veiculo":
      qarReport += `VEICULO ATUAL (A SER SUBSTITUIDO):\n`;
      qarReport += `Placa: ${formData.currentPlate || 'Nao informada'}\n\n`;

      qarReport += `NOVO VEICULO:\n`;
      qarReport += `Modelo: ${formData.newModel || 'Nao informado'}\n`;
      qarReport += `Placa: ${formData.newPlate || 'Zero KM'}\n`;
      qarReport += `Ano/Modelo: ${formData.newYearModel || 'Nao informado'}\n`;
      qarReport += `Zero KM: ${formData.isZeroKm ? 'Sim' : 'Nao'}\n`;
      qarReport += `Financiado: ${formData.isFinanced ? 'Sim' : 'Nao'}\n`;
      break;

    case "alteracao_cep":
      const endereco = [formData.newStreet, formData.newNumber, formData.newNeighborhood, formData.newCity, formData.newState].filter(Boolean).join(', ');
      qarReport += `NOVO ENDERECO DE PERNOITE:\n`;
      qarReport += `CEP: ${formData.newCep || 'Nao informado'}\n`;
      qarReport += `Endereco: ${endereco || 'Nao informado'}\n`;
      break;

    case "troca_condutor":
      qarReport += `NOVO CONDUTOR PRINCIPAL:\n`;
      qarReport += `Nome: ${formData.newDriverName || 'Nao informado'}\n`;
      qarReport += `CPF: ${formData.newDriverCpf || 'Nao informado'}\n`;
      qarReport += `Data Nascimento: ${formData.newDriverBirthDate || 'Nao informada'}\n`;
      if (formData.newDriverCnh) {
        qarReport += `CNH: ${formData.newDriverCnh}\n`;
      }
      if (formData.newDriverMaritalStatus) {
        qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.newDriverMaritalStatus)}\n`;
      }
      break;

    case "cancelamento":
      qarReport += `VEICULO A SER CANCELADO:\n`;
      qarReport += `Placa: ${formData.currentPlate || 'Nao informada'}\n`;
      qarReport += `Modelo: ${formData.currentModel || 'Nao informado'}\n\n`;

      qarReport += `CANCELAMENTO SOLICITADO:\n`;
      if (formData.cancelReason) {
        qarReport += `Motivo: ${formData.cancelReason}\n`;
      } else {
        qarReport += `Motivo: Nao informado\n`;
      }
      qarReport += `\nATENCAO: O segurado esta ciente de que o cancelamento e irreversivel.`;
      break;
  }

  qarReport += `\n\n${SEPARATOR}\n`;
  qarReport += `CONTATO:\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n`;

  return {
    contactData: {
      name: formData.name,
      email: formData.email,
      personal_phone: formData.phone,
      city: formData.newCity || '',
      state: formData.newState || ''
    },
    customFields: {
      cf_tipo_solicitacao_seguro: insuranceLabel,
      cf_tipo_endosso: endorsementTypeLabel,
      cf_qar_auto: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: formData.isUber ? '1-Uber' : '1-Auto',
      funnel_stage: 'AGR Endosso'
    }
  };
};
