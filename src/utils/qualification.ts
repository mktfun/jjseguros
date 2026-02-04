export interface QualificationResult {
  isQualified: boolean;
  disqualificationReason?: string;
}

export interface QualificationConfig {
  healthAgeMax: number;
}

export interface HealthLeadData {
  ages: number[];
  hasCNPJ: boolean;
  employeeCount?: number;
}

/**
 * Verifica qualificação do lead de Plano de Saúde
 * Shadow Filter - marca leads desqualificados sem mostrar ao usuário
 */
export function checkHealthQualification(
  data: HealthLeadData,
  config: QualificationConfig
): QualificationResult {
  // Regra 1: Idade máxima
  const overAgeLimit = data.ages.some(age => age > config.healthAgeMax);
  if (overAgeLimit) {
    return {
      isQualified: false,
      disqualificationReason: `Idade acima do limite (${config.healthAgeMax} anos)`,
    };
  }

  // Regra 2: Para CNPJ, mínimo de funcionários (se aplicável)
  if (data.hasCNPJ && data.employeeCount !== undefined && data.employeeCount < 2) {
    return {
      isQualified: false,
      disqualificationReason: 'CNPJ com menos de 2 vidas',
    };
  }

  return { isQualified: true };
}

/**
 * Calcula idade a partir da data de nascimento
 */
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Extrai idades de uma lista de pessoas com data de nascimento
 */
export function extractAges(people: Array<{ birthDate: string }>): number[] {
  return people
    .filter(p => p.birthDate)
    .map(p => calculateAge(p.birthDate));
}
