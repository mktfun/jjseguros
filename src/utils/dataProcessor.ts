import { supabase } from "@/integrations/supabase/client";

// Interfaces
export interface ContactData {
  name: string;
  email: string;
  personal_phone: string;
}

export interface CustomFields {
  cf_tipo_solicitacao_seguro: string;
  cf_tipo_cotacao?: string;
  cf_qar_auto?: string;
  cf_qar_residencial?: string;
  cf_qar_vida?: string;
  cf_qar_empresarial?: string;
  cf_qar_viagem?: string;
  cf_qar_saude?: string;
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
      'comercial': 'Motorista Uber/Similares'
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

// Função para salvar lead no Supabase
const saveLeadToSupabase = async (payload: RDStationPayload, rdSuccess: boolean, rdError?: string): Promise<void> => {
  try {
    const insuranceType = payload.customFields.cf_tipo_solicitacao_seguro;
    
    // Encontra o QAR report baseado no tipo de seguro
    const qarReport = payload.customFields.cf_qar_auto ||
      payload.customFields.cf_qar_residencial ||
      payload.customFields.cf_qar_vida ||
      payload.customFields.cf_qar_empresarial ||
      payload.customFields.cf_qar_viagem ||
      payload.customFields.cf_qar_saude || '';

    const { error } = await supabase.from('leads').insert({
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
      rd_station_error: rdError || null
    });

    if (error) {
      console.error('❌ Erro ao salvar lead no Supabase:', error);
    } else {
      console.log('✅ Lead salvo no Supabase');
    }
  } catch (error) {
    console.error('💥 Erro crítico ao salvar lead:', error);
  }
};

// Função principal para envio ao RD Station
export const sendToRDStation = async (payload: RDStationPayload): Promise<boolean> => {
  let rdSuccess = false;
  let rdError: string | undefined;

  try {
    console.log('📤 Preparando envio para RD Station via Edge Function...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

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
  await saveLeadToSupabase(payload, rdSuccess, rdError);

  return rdSuccess;
};

// ============================================
// BUILDERS COM RELATÓRIO CONSOLIDADO (QAR)
// ============================================

export const buildAutoPayload = (formData: any): RDStationPayload => {
  // Construção do Relatório QAR
  let qarReport = `📌 RESUMO DA COTAÇÃO - SEGURO AUTO\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // NOVO: Tipo de cotação no topo
  qarReport += `🏷️ TIPO: ${formData.quoteType === 'new' ? 'SEGURO NOVO' : 'RENOVAÇÃO'}\n\n`;

  // NOVO: Dados do Cliente repetidos no início
  qarReport += `📞 DADOS DO CLIENTE\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `Email: ${formData.email}\n`;
  qarReport += `Telefone: ${formData.phone}\n\n`;

  // Dados do Condutor
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
  qarReport += `Zero KM: ${formatYesNo(formData.isZeroKm)}\n`;
  qarReport += `Financiado/Alienado: ${formatYesNo(formData.isFinanced)}\n`;
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

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Auto',
      cf_tipo_cotacao: formData.quoteType === 'new' ? 'Novo' : 'Renovação',
      cf_qar_auto: qarReport
    },
    funnelData: {
      funnel_name: '1-Auto',
      funnel_stage: 'AGR Cotação'
    }
  };
};

export const buildResidentialPayload = (formData: any): RDStationPayload => {
  let qarReport = `📌 RESUMO DA COTAÇÃO - SEGURO RESIDENCIAL\n`;
  qarReport += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  qarReport += `👤 DADOS DO SEGURADO\n`;
  qarReport += `Nome: ${formData.fullName}\n`;
  qarReport += `CPF: ${formData.cpf || 'Não informado'}\n\n`;

  qarReport += `🏠 DADOS DO IMÓVEL\n`;
  qarReport += `Tipo: ${translateValue('propertyType', formData.propertyType)}\n`;
  qarReport += `Condição: ${translateValue('ownershipType', formData.ownershipType)}\n`;
  qarReport += `Valor Estimado: ${formData.propertyValue || 'Não informado'}\n\n`;

  const endereco = [formData.street, formData.number, formData.neighborhood, formData.city, formData.state].filter(Boolean).join(', ');
  qarReport += `📍 ENDEREÇO\n`;
  qarReport += `CEP: ${formData.cep || 'Não informado'}\n`;
  qarReport += `Endereço: ${endereco || 'Não informado'}\n\n`;

  qarReport += `🛡️ COBERTURAS SOLICITADAS\n`;
  qarReport += `Roubo/Furto: ${formData.coverageTheft ? 'Sim' : 'Não'}\n`;
  qarReport += `Danos Elétricos: ${formData.coverageElectrical ? 'Sim' : 'Não'}\n`;
  qarReport += `Responsabilidade Civil: ${formData.coverageLiability ? 'Sim' : 'Não'}\n`;
  qarReport += `Eletrônicos Portáteis: ${formData.coverageElectronics ? 'Sim' : 'Não'}\n`;

  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Residencial',
      cf_qar_residencial: qarReport
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
      cf_qar_vida: qarReport
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
      cf_qar_empresarial: qarReport
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
      cf_qar_viagem: qarReport
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
      cf_qar_saude: qarReport
    },
    funnelData: {
      funnel_name: '6-Saúde',
      funnel_stage: 'AGR Cotação'
    }
  };
};
