import { supabase } from "@/integrations/supabase/client";

// Interfaces
export interface ContactData {
  name: string;
  email: string;
  personal_phone: string;
}

export interface CustomFields {
  cf_tipo_solicitacao_seguro: string;
  cf_cpf?: string;
  [key: string]: string | undefined;
}

export interface RDStationPayload {
  contactData: ContactData;
  customFields: CustomFields;
}

// Função auxiliar para traduzir valores
export const translateValue = (field: string, value: string | boolean | undefined): string => {
  if (value === undefined || value === null) return '';
  
  const translations: Record<string, Record<string, string>> = {
    maritalStatus: {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viúvo(a)',
      'uniao_estavel': 'União Estável'
    },
    isFinanced: {
      'sim': 'Sim',
      'nao': 'Não'
    },
    garageType: {
      'automatico': 'Portão Automático',
      'manual': 'Portão Manual',
      'sem_garagem': 'Sem Garagem'
    },
    residenceType: {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'condominio': 'Condomínio Fechado'
    },
    usesForWork: {
      'sim': 'Sim',
      'nao': 'Não'
    },
    personType: {
      'fisica': 'Pessoa Física',
      'juridica': 'Pessoa Jurídica'
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

// Função principal para envio ao RD Station
export const sendToRDStation = async (payload: RDStationPayload): Promise<boolean> => {
  try {
    console.log('📤 Preparando envio para RD Station via Edge Function...');
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const { data, error } = await supabase.functions.invoke('rd-station', {
      body: payload
    });

    if (error) {
      console.error('❌ Erro na Edge Function:', error);
      return false;
    }

    console.log('✅ Resposta RD Station:', data);
    return true;

  } catch (error) {
    console.error('💥 Erro crítico ao enviar para RD Station:', error);
    return false;
  }
};

// Builders específicos para cada tipo de wizard

export const buildAutoPayload = (formData: any): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Auto',
      cf_cpf: formData.cpf,
      cf_cnpj: formData.cnpj,
      cf_tipo_pessoa: translateValue('personType', formData.personType),
      cf_veiculo_placa: formData.plate,
      cf_veiculo_zero_km: formData.isZeroKm ? 'Sim' : 'Não',
      cf_veiculo_financiado: translateValue('isFinanced', formData.isFinanced),
      cf_cep_pernoite: formData.cep,
      cf_endereco: `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city}/${formData.state}`,
      cf_tipo_residencia: translateValue('residenceType', formData.residenceType),
      cf_garagem_automatica: translateValue('garageType', formData.garageType)
    }
  };
};

export const buildResidentialPayload = (formData: any): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Residencial',
      cf_cpf: formData.cpf,
      cf_tipo_imovel: translateValue('propertyType', formData.propertyType),
      cf_proprietario_inquilino: translateValue('ownershipType', formData.ownershipType),
      cf_cep: formData.cep,
      cf_endereco: `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city}/${formData.state}`,
      cf_valor_imovel: formData.propertyValue,
      cf_cobertura_roubo: formData.coverageTheft ? 'Sim' : 'Não',
      cf_cobertura_danos_eletricos: formData.coverageElectrical ? 'Sim' : 'Não',
      cf_cobertura_responsabilidade_civil: formData.coverageLiability ? 'Sim' : 'Não',
      cf_cobertura_eletronicos: formData.coverageElectronics ? 'Sim' : 'Não'
    }
  };
};

export const buildLifePayload = (formData: any): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro de Vida',
      cf_cpf: formData.cpf,
      cf_data_nascimento: formData.birthDate,
      cf_profissao: formData.profession,
      cf_fumante: translateValue('smoker', formData.smoker),
      cf_pratica_esportes_radicais: formData.extremeSports ? 'Sim' : 'Não',
      cf_capital_segurado: formData.coverageAmount,
      cf_cobertura_invalidez: formData.coverageDisability ? 'Sim' : 'Não',
      cf_cobertura_doencas_graves: formData.coverageIllness ? 'Sim' : 'Não',
      cf_cobertura_funeral: formData.coverageFuneral ? 'Sim' : 'Não'
    }
  };
};

export const buildBusinessPayload = (formData: any): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Empresarial',
      cf_cnpj: formData.cnpj,
      cf_razao_social: formData.companyName,
      cf_ramo_atividade: formData.businessActivity,
      cf_cep: formData.cep,
      cf_endereco: `${formData.street}, ${formData.number} - ${formData.neighborhood}, ${formData.city}/${formData.state}`,
      cf_faturamento_anual: formData.annualRevenue,
      cf_numero_funcionarios: formData.employeeCount,
      cf_cobertura_incendio: formData.coverageFire ? 'Sim' : 'Não',
      cf_cobertura_roubo: formData.coverageTheft ? 'Sim' : 'Não',
      cf_cobertura_responsabilidade_civil: formData.coverageLiability ? 'Sim' : 'Não'
    }
  };
};

export const buildTravelPayload = (formData: any, travelers: any[]): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName || travelers[0]?.name || '',
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Seguro Viagem',
      cf_destino: formData.destination,
      cf_tipo_destino: formData.destinationType,
      cf_data_ida: formData.departureDate,
      cf_data_volta: formData.returnDate,
      cf_motivo_viagem: formData.tripPurpose,
      cf_qtd_viajantes: String(travelers.length),
      cf_viajantes: travelers.map(t => `${t.name} (${t.cpf})`).join('; '),
      cf_cobertura_medica: formData.coverageMedical ? 'Sim' : 'Não',
      cf_cobertura_bagagem: formData.coverageBaggage ? 'Sim' : 'Não',
      cf_cobertura_cancelamento: formData.coverageCancellation ? 'Sim' : 'Não'
    }
  };
};

export const buildHealthPayload = (formData: any, dependents: any[]): RDStationPayload => {
  return {
    contactData: {
      name: formData.fullName,
      email: formData.email,
      personal_phone: formData.phone
    },
    customFields: {
      cf_tipo_solicitacao_seguro: 'Plano de Saúde',
      cf_cpf: formData.cpf,
      cf_data_nascimento: formData.birthDate,
      cf_tipo_plano: translateValue('planType', formData.planType),
      cf_acomodacao: translateValue('accommodation', formData.accommodation),
      cf_coparticipacao: formData.coparticipation ? 'Sim' : 'Não',
      cf_qtd_dependentes: String(dependents.length),
      cf_dependentes: dependents.map(d => `${d.name} (${d.relationship})`).join('; '),
      cf_possui_plano_atual: formData.hasCurrentPlan ? 'Sim' : 'Não',
      cf_operadora_atual: formData.currentProvider || ''
    }
  };
};
