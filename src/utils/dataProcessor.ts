import { supabase } from "@/integrations/supabase/client";

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
  if (value === undefined || value === null || value === '') return 'Não informado';
  
  const translations: Record<string, Record<string, string>> = {
    yesNo: {
      'sim': 'Sim',
      'nao': 'Não',
      'true': 'Sim',
      'false': 'Não'
    },
    maritalStatus: {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viúvo(a)',
      'uniao_estavel': 'União Estável'
    },
    personType: {
      'fisica': 'Pessoa Física',
      'juridica': 'Pessoa Jurídica',
      'pf': 'Pessoa Física',
      'pj': 'Pessoa Jurídica'
    },
    vehicleUseType: {
      'pessoal': 'Uso Pessoal (Lazer/Trabalho)',
      'comercial': 'Comercial / Visitas / App'
    },
    residenceType: {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'condominio': 'Casa em Condomínio'
    },
    garageType: {
      'automatico': 'Portão Automático',
      'manual': 'Portão Manual',
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
      'proprietario': 'Proprietário',
      'inquilino': 'Inquilino'
    },
    smoker: {
      'sim': 'Sim',
      'nao': 'Não'
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
    return value ? 'Sim' : 'Não';
  }

  return translations[field]?.[value] || value;
};

// Helper para formatar sim/não
const formatYesNo = (value: string | boolean | undefined): string => {
  if (value === 'sim' || value === true) return 'Sim';
  if (value === 'nao' || value === false) return 'Não';
  return 'Não informado';
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
        console.error('❌ Erro ao atualizar lead no Supabase:', error);
      } else {
        console.log('✅ Lead atualizado no Supabase (ID:', existingLeadId, ')');
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
        console.error('❌ Erro ao inserir lead no Supabase:', error);
      } else {
        console.log('✅ Lead inserido no Supabase');
      }
    }
  } catch (error) {
    console.error('💥 Erro crítico ao salvar lead:', error);
  }
};

// Função principal para envio ao RD Station
// Agora aceita um leadId opcional para atualizar um lead parcial existente
export const sendToRDStation = async (
  payload: RDStationPayload, 
  existingLeadId?: string | null
): Promise<boolean> => {
  let rdSuccess = false;
  let rdError: string | undefined;

  try {
    console.log('📤 Preparando envio para RD Station via Edge Function...');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    if (existingLeadId) {
      console.log('🔗 Lead parcial existente:', existingLeadId);
    }

    const { data, error } = await supabase.functions.invoke('rd-station', {
      body: payload
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      rdError = error.message;
      rdSuccess = false;
    } else {
      console.log('✅ Resposta RD Station:', data);
      rdSuccess = true;
    }

  } catch (error) {
    console.error('💥 Erro crítico ao enviar para RD Station:', error);
    rdError = error instanceof Error ? error.message : 'Erro desconhecido';
    rdSuccess = false;
  }

  // Salva no Supabase independente do resultado do RD Station
  await saveLeadToSupabase(payload, rdSuccess, rdError, existingLeadId);

  return rdSuccess;
};

// ============================================
// BUILDERS COM RELATÓRIO CONSOLIDADO (QAR)
// ============================================

export const buildAutoPayload = (formData: any): RDStationPayload => {
  // Determinar tipo de seguro baseado em isUber
  const insuranceLabel = formData.isUber ? 'Seguro Uber/Similares' : 'Seguro Auto';
  
  // Traduzir deal type
  const dealTypeLabel = formData.dealType === 'renovacao' 
    ? 'Renovação JJ Seguros' 
    : formData.dealType === 'novo' 
      ? 'Seguro Novo' 
      : 'Não informado';

  // Construção do Relatório QAR com CABEÇALHO DINÂMICO
  let qarReport = '';
  
  // Cabeçalho dinâmico baseado no deal type
  if (formData.dealType === 'renovacao') {
    qarReport += `🚨🚨 CLIENTE DE RENOVAÇÃO - JÁ É DA CASA 🚨🚨\n\n`;
  } else if (formData.dealType === 'novo') {
    qarReport += `✨ OPORTUNIDADE: SEGURO NOVO ✨\n\n`;
  }
  
  qarReport += `📌 RESUMO DA COTAÇÃO - ${insuranceLabel.toUpperCase()}\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Tipo de Solicitação
  qarReport += `📋 TIPO SOLICITAÇÃO: ${dealTypeLabel}\n\n`;

  // Dados Pessoais
  qarReport += `👤 DADOS DO CONDUTOR\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Tipo: ${translateValue('personType', formData.personType)}\n`;
  qarReport += `CPF/CNPJ: ${formData.cpf || formData.cnpj || 'Não informado'}\n`;
  qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.maritalStatus)}\n`;
  qarReport += `Profissão: ${formData.profession || 'Não informada'}\n\n`;

  // Dados do Veículo
  qarReport += `🚗 DADOS DO VEÍCULO\n`;
  qarReport += `Modelo: ${formData.model || 'Não informado'}\n`;
  qarReport += `Placa: ${formData.plate || 'Zero KM (sem placa)'}\n`;
  qarReport += `Ano/Modelo: ${formData.year || 'Não informado'}\n`;
  // Só exibe Zero KM e Financiado para seguro novo
  if (formData.dealType !== 'renovacao') {
    qarReport += `Zero KM: ${formatYesNo(formData.isZeroKm)}\n`;
    qarReport += `Financiado/Alienado: ${formatYesNo(formData.isFinanced)}\n`;
  }
  qarReport += `Tipo de Uso: ${translateValue('vehicleUseType', formData.vehicleUseType)}\n\n`;

  // Endereço e Pernoite
  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `🏠 ENDEREÇO & PERNOITE\n`;
  qarReport += `CEP: ${formData.cep || 'Não informado'}\n`;
  qarReport += `Endereço: ${endereco || 'Não informado'}\n`;
  qarReport += `Tipo Residência: ${translateValue('residenceType', formData.residenceType)}\n`;
  qarReport += `Garagem Casa: ${translateValue('garageType', formData.garageType)}\n\n`;

  // Rotina de Uso
  qarReport += `🚦 ROTINA DE USO\n`;
  qarReport += `Usa p/ Trabalho: ${formatYesNo(formData.usesForWork)}\n`;
  if (formData.usesForWork) {
    qarReport += `  ↳ Estacionamento Trabalho: ${translateValue('workParking', formData.workParking)}\n`;
  }
  qarReport += `Usa p/ Faculdade: ${formatYesNo(formData.usesForSchool)}\n`;
  if (formData.usesForSchool) {
    qarReport += `  ↳ Estacionamento Faculdade: ${translateValue('schoolParking', formData.schoolParking)}\n`;
  }
  qarReport += `\n`;

  // Perfil de Risco - Condutor Jovem (Lógica Condicional)
  qarReport += `⚠️ PERFIL DE RISCO\n`;
  qarReport += `Reside com pessoa de 18-25 anos: ${formatYesNo(formData.livesWithYoungPerson)}\n`;
  if (formData.livesWithYoungPerson) {
    qarReport += `  ↳ Essa pessoa conduz o veículo: ${formatYesNo(formData.youngPersonDrives)}\n`;
    if (formData.youngPersonDrives) {
      qarReport += `  ↳ Idade do condutor jovem: ${formData.youngDriverAge || 'Não informada'} anos\n`;
      qarReport += `  ↳ Sexo: ${formData.youngDriverGender === 'masculino' ? 'Masculino' : formData.youngDriverGender === 'feminino' ? 'Feminino' : 'Não informado'}\n`;
    }
  }

  // Sinistro - Apenas para renovação
  if (formData.dealType === 'renovacao') {
    qarReport += `\n🚨 HISTÓRICO DE SINISTROS\n`;
    qarReport += `Houve sinistro na vigência atual: ${formatYesNo(formData.hadClaim)}\n`;
  }

  // Log para validação
  console.log('🏗️ buildAutoPayload - city:', formData.city);
  console.log('🏗️ buildAutoPayload - state:', formData.state);
  console.log('🏗️ buildAutoPayload - dealType:', formData.dealType);

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
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildResidentialPayload = (formData: any): RDStationPayload => {
  const phoneDigits = formData.phone?.replace(/\D/g, '') || '';
  const whatsappLink = `https://wa.me/55${phoneDigits}`;

  let qarReport = `NOVO LEAD: SEGURO RESIDENCIAL\n\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Chamar: ${whatsappLink}\n\n`;

  qarReport += `DADOS DO SEGURADO:\n\n`;
  qarReport += `Tipo: ${translateValue('personType', formData.personType)}\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF/CNPJ: ${formData.cpfCnpj || 'Não informado'}\n`;
  qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.maritalStatus)}\n`;
  qarReport += `Profissão: ${formData.profession || 'Não informada'}\n\n`;

  qarReport += `DADOS DO IMOVEL:\n\n`;
  qarReport += `Tipo: ${formData.propertyType === 'house' ? 'Casa' : 'Apartamento'}\n`;
  qarReport += `Condição: ${formData.ownershipType === 'owner' ? 'Proprietário' : 'Inquilino'}\n`;
  qarReport += `Alarme Monitorado: ${formData.hasAlarm ? 'Sim' : 'Não'}\n`;
  qarReport += `Condomínio Fechado: ${formData.hasGatedCommunity ? 'Sim' : 'Não'}\n\n`;

  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `ENDERECO:\n\n`;
  qarReport += `CEP: ${formData.cep || 'Não informado'}\n`;
  qarReport += `Endereço: ${endereco || 'Não informado'}\n\n`;

  qarReport += `VALORES E COBERTURAS:\n\n`;
  qarReport += `Valor de Reconstrução: ${formData.reconstructionValue || 'Não informado'}\n`;
  qarReport += `Valor do Conteúdo: ${formData.contentsValue || 'Não informado'}\n`;
  qarReport += `Roubo/Furto: ${formData.coverageTheft ? 'Sim' : 'Não'}\n`;
  qarReport += `Incêndio/Raio/Explosão: ${formData.coverageFire ? 'Sim' : 'Não'}\n`;
  qarReport += `Eletrônicos Portáteis: ${formData.coverageElectronics ? 'Sim' : 'Não'}\n`;
  if (formData.coverageElectronics && formData.portableElectronicsValue) {
    qarReport += `Valor NF Eletrônicos Portáteis: ${formData.portableElectronicsValue}\n`;
  }
  qarReport += `Cobertura Valor de Novo: ${formData.coverageNewValue ? 'Sim' : 'Não'}\n`;

  qarReport += `\nCONTATO:\n\n`;
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
      cf_tipo_pessoa: formData.personType === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica',
      cf_cpf: cpfField || undefined,
      cf_cnpj: cnpjField || undefined,
      cf_qar_residencial: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '2-Residencial',
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildLifePayload = (formData: any): RDStationPayload => {
  let qarReport = `📌 RESUMO DA COTAÇÃO - SEGURO DE VIDA\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `👤 DADOS DO SEGURADO\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Não informado'}\n`;
  qarReport += `Data Nascimento: ${formData.birthDate || 'Não informada'}\n`;
  qarReport += `Profissão: ${formData.profession || 'Não informada'}\n\n`;

  qarReport += `📋 PERFIL DE SAÚDE\n`;
  qarReport += `Fumante: ${translateValue('smoker', formData.smoker)}\n`;
  qarReport += `Esportes Radicais: ${formData.extremeSports ? 'Sim' : 'Não'}\n\n`;

  qarReport += `💰 CAPITAL E COBERTURAS\n`;
  qarReport += `Capital Segurado: ${formData.coverageAmount || 'Não informado'}\n`;
  qarReport += `Invalidez: ${formData.coverageDisability ? 'Sim' : 'Não'}\n`;
  qarReport += `Doenças Graves: ${formData.coverageIllness ? 'Sim' : 'Não'}\n`;
  qarReport += `Funeral: ${formData.coverageFuneral ? 'Sim' : 'Não'}\n`;

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
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildBusinessPayload = (formData: any): RDStationPayload => {
  let qarReport = `📌 RESUMO DA COTAÇÃO - SEGURO EMPRESARIAL\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `🏢 DADOS DA EMPRESA\n`;
  qarReport += `Razão Social: ${formData.companyName || 'Não informada'}\n`;
  qarReport += `CNPJ: ${formData.cnpj || 'Não informado'}\n`;
  qarReport += `Ramo de Atividade: ${formData.businessActivity || 'Não informado'}\n`;
  qarReport += `Faturamento Anual: ${formData.annualRevenue || 'Não informado'}\n`;
  qarReport += `Nº Funcionários: ${formData.employeeCount || 'Não informado'}\n\n`;

  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `📍 ENDEREÇO\n`;
  qarReport += `CEP: ${formData.cep || 'Não informado'}\n`;
  qarReport += `Endereço: ${endereco || 'Não informado'}\n\n`;

  qarReport += `🛡️ COBERTURAS SOLICITADAS\n`;
  qarReport += `Incêndio: ${formData.coverageFire ? 'Sim' : 'Não'}\n`;
  qarReport += `Roubo/Furto: ${formData.coverageTheft ? 'Sim' : 'Não'}\n`;
  qarReport += `Responsabilidade Civil: ${formData.coverageLiability ? 'Sim' : 'Não'}\n`;

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
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildTravelPayload = (formData: any, travelers: any[]): RDStationPayload => {
  let qarReport = `📌 RESUMO DA COTAÇÃO - SEGURO VIAGEM\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `✈️ DADOS DA VIAGEM\n`;
  qarReport += `Destino: ${formData.destination || 'Não informado'}\n`;
  qarReport += `Tipo: ${formData.destinationType || 'Não informado'}\n`;
  qarReport += `Data Ida: ${formData.departureDate || 'Não informada'}\n`;
  qarReport += `Data Volta: ${formData.returnDate || 'Não informada'}\n`;
  qarReport += `Motivo: ${formData.tripPurpose || 'Não informado'}\n\n`;

  qarReport += `👥 VIAJANTES (${travelers.length})\n`;
  travelers.forEach((t, i) => {
    qarReport += `${i + 1}. ${t.name} - CPF: ${t.cpf}\n`;
  });
  qarReport += `\n`;

  qarReport += `🛡️ COBERTURAS SOLICITADAS\n`;
  qarReport += `Despesas Médicas: ${formData.coverageMedical ? 'Sim' : 'Não'}\n`;
  qarReport += `Bagagem: ${formData.coverageBaggage ? 'Sim' : 'Não'}\n`;
  qarReport += `Cancelamento: ${formData.coverageCancellation ? 'Sim' : 'Não'}\n`;

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
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildHealthPayload = (formData: any, dependents: any[]): RDStationPayload => {
  let qarReport = `📌 RESUMO DA COTAÇÃO - PLANO DE SAÚDE\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `👤 TITULAR\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Não informado'}\n`;
  qarReport += `Data Nascimento: ${formData.birthDate || 'Não informada'}\n\n`;

  qarReport += `📋 PREFERÊNCIAS DO PLANO\n`;
  qarReport += `Tipo: ${translateValue('planType', formData.planType)}\n`;
  qarReport += `Acomodação: ${translateValue('accommodation', formData.accommodation)}\n`;
  qarReport += `Coparticipação: ${formData.coparticipation ? 'Sim' : 'Não'}\n\n`;

  if (dependents.length > 0) {
    qarReport += `👥 DEPENDENTES (${dependents.length})\n`;
    dependents.forEach((d, i) => {
      qarReport += `${i + 1}. ${d.name} - ${d.relationship}\n`;
    });
    qarReport += `\n`;
  }

  qarReport += `🏥 SITUAÇÃO ATUAL\n`;
  qarReport += `Possui plano atual: ${formData.hasCurrentPlan ? 'Sim' : 'Não'}\n`;
  if (formData.hasCurrentPlan && formData.currentProvider) {
    qarReport += `Operadora atual: ${formData.currentProvider}\n`;
  }

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Plano de Saúde',
      cf_qar_saude: qarReport,
      cf_qar_respondido: qarReport,
      cf_aqr_respondido: qarReport
    },
    funnelData: {
      funnel_name: '6-Saúde',
      funnel_stage: 'AGR Cotação'
    }
  };
};

// ============================================
// ENDOSSO BUILDER
// ============================================

const endorsementTypeLabels: Record<string, string> = {
  substituicao_veiculo: "Substituição de Veículo",
  alteracao_cep: "Alteração de CEP de Pernoite",
  troca_condutor: "Troca de Condutor Principal",
  cancelamento: "Cancelamento do Seguro"
};

export const buildEndorsementPayload = (formData: any): RDStationPayload => {
  const insuranceLabel = formData.isUber ? 'Endosso Uber/Similares' : 'Endosso Auto';
  const endorsementTypeLabel = endorsementTypeLabels[formData.endorsementType] || formData.endorsementType;
  const phoneDigits = formData.phone?.replace(/\D/g, '') || '';
  const whatsappLink = `https://wa.me/55${phoneDigits}`;

  let qarReport = `📝 SOLICITAÇÃO DE ENDOSSO - ${insuranceLabel.toUpperCase()}\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `📋 TIPO DE ENDOSSO: ${endorsementTypeLabel}\n\n`;

  qarReport += `👤 DADOS DO SEGURADO\n`;
  qarReport += `Nome: ${formData.name}\n`;
  qarReport += `CPF: ${formData.cpf || 'Não informado'}\n`;
  qarReport += `Chamar: ${whatsappLink}\n\n`;

  // Campos específicos por tipo de endosso
  switch (formData.endorsementType) {
    case "substituicao_veiculo":
      qarReport += `🚗 VEÍCULO ATUAL (A SER SUBSTITUÍDO)\n`;
      qarReport += `Placa: ${formData.currentPlate || 'Não informada'}\n\n`;

      qarReport += `🚗 NOVO VEÍCULO\n`;
      qarReport += `Modelo: ${formData.newModel || 'Não informado'}\n`;
      qarReport += `Placa: ${formData.newPlate || 'Zero KM'}\n`;
      qarReport += `Ano/Modelo: ${formData.newYearModel || 'Não informado'}\n`;
      qarReport += `Zero KM: ${formData.isZeroKm ? 'Sim' : 'Não'}\n`;
      qarReport += `Financiado: ${formData.isFinanced ? 'Sim' : 'Não'}\n`;
      break;

    case "alteracao_cep":
      const endereco = [formData.newStreet, formData.newNumber, formData.newNeighborhood, formData.newCity, formData.newState].filter(Boolean).join(', ');
      qarReport += `📍 NOVO ENDEREÇO DE PERNOITE\n`;
      qarReport += `CEP: ${formData.newCep || 'Não informado'}\n`;
      qarReport += `Endereço: ${endereco || 'Não informado'}\n`;
      break;

    case "troca_condutor":
      qarReport += `👤 NOVO CONDUTOR PRINCIPAL\n`;
      qarReport += `Nome: ${formData.newDriverName || 'Não informado'}\n`;
      qarReport += `CPF: ${formData.newDriverCpf || 'Não informado'}\n`;
      qarReport += `Data Nascimento: ${formData.newDriverBirthDate || 'Não informada'}\n`;
      if (formData.newDriverCnh) {
        qarReport += `CNH: ${formData.newDriverCnh}\n`;
      }
      if (formData.newDriverMaritalStatus) {
        qarReport += `Estado Civil: ${translateValue('maritalStatus', formData.newDriverMaritalStatus)}\n`;
      }
      break;

    case "cancelamento":
      qarReport += `🚗 VEÍCULO A SER CANCELADO\n`;
      qarReport += `Placa: ${formData.currentPlate || 'Não informada'}\n`;
      qarReport += `Modelo: ${formData.currentModel || 'Não informado'}\n\n`;

      qarReport += `⚠️ CANCELAMENTO SOLICITADO\n`;
      if (formData.cancelReason) {
        qarReport += `Motivo: ${formData.cancelReason}\n`;
      } else {
        qarReport += `Motivo: Não informado\n`;
      }
      qarReport += `\n🚨 ATENÇÃO: O segurado está ciente de que o cancelamento é irreversível.`;
      break;
  }

  qarReport += `\n\n📞 CONTATO\n`;
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
