
# Plano: Sistema de Qualificação Granular (Shadow Filters) - Plano de Saúde

## Objetivo
Criar um sistema de filtros configuráveis no Admin para qualificar/desqualificar leads de Plano de Saúde automaticamente. Leads que não passarem nos critérios serão marcados como `is_qualified: false` silenciosamente (o usuário nunca saberá que foi desqualificado).

---

## Status do Banco de Dados
As colunas já existem em `integration_settings`:
- `health_age_limit_min` = 0
- `health_age_limit_max` = 65
- `health_lives_min` = 1
- `health_lives_max` = 99
- `health_accept_cpf` = true
- `health_accept_cnpj` = true
- `health_cnpj_min_employees` = 2
- `health_cpf_require_higher_education` = false
- `health_region_mode` = 'allow_all'
- `health_region_states` = []
- `health_budget_min` = 0

**Não será necessária migration de banco de dados.**

---

## Passo 1: Atualizar Motor de Qualificação
**Arquivo:** `src/utils/qualification.ts`

Expandir a função `checkHealthQualification` para avaliar TODOS os critérios:

| Critério | Regra | Mensagem de Desqualificação |
|----------|-------|----------------------------|
| Idade mínima | `age < config.ageMin` | "Idade abaixo do mínimo (X anos)" |
| Idade máxima | `age > config.ageMax` | "Idade acima do máximo (X anos)" |
| Mínimo de vidas | `livesCount < config.livesMin` | "Menos de X vidas" |
| Máximo de vidas | `livesCount > config.livesMax` | "Mais de X vidas" |
| Aceitar CPF | `contractType === 'cpf' && !config.acceptCPF` | "Não aceitamos CPF" |
| Aceitar CNPJ | `contractType === 'cnpj' && !config.acceptCNPJ` | "Não aceitamos CNPJ" |
| Mínimo funcionários CNPJ | `employeeCount < config.cnpjMinEmployees` | "CNPJ com menos de X funcionários" |
| Exigir ensino superior (CPF) | `educationLevel não é superior/pós/mestrado` | "Exigimos ensino superior para PF" |
| Região (lista permitida) | `state não está na lista` | "Estado XX não atendido" |
| Região (lista bloqueada) | `state está na lista de bloqueio` | "Estado XX bloqueado" |
| Orçamento mínimo | `budgetPerPerson < config.budgetMin` | "Orçamento abaixo do mínimo (R$ X)" |

---

## Passo 2: Adicionar Campo de Estado no Wizard
**Arquivo:** `src/components/wizards/health/HealthStep3Preferences.tsx`

Adicionar um seletor de Estado (UF) para capturar a localização do lead:

```text
┌─────────────────────────────────────┐
│  Suas Preferências                  │
├─────────────────────────────────────┤
│  💰 Orçamento mensal por pessoa     │
│  [========●===========] R$ 500      │
│                                     │
│  🏥 Hospital/Rede de preferência    │
│  [ Selecione...              ▼ ]    │
│                                     │
│  📍 Estado (UF)  ← NOVO CAMPO       │
│  [ São Paulo - SP            ▼ ]    │
│                                     │
│  🛏️ Tipo de acomodação              │
│  [Enfermaria] [Apartamento✓]        │
│                                     │
│  % Coparticipação [Toggle OFF]      │
└─────────────────────────────────────┘
```

---

## Passo 3: Atualizar Tipos do Wizard
**Arquivo:** `src/components/wizards/HealthWizard.tsx`

Adicionar campo `state` ao tipo `HealthWizardData`:
- `state: string` - UF selecionada pelo lead

Atualizar o carregamento de configurações para buscar TODOS os campos de qualificação.

---

## Passo 4: Criar Painel de Configuração SDR no Admin
**Arquivo:** `src/pages/admin/AdminConfig.tsx`

Adicionar nova Card "Qualificação SDR - Saúde" com 4 seções:

```text
┌─────────────────────────────────────────────────────────────┐
│  👥 VIDAS                                                   │
├─────────────────────────────────────────────────────────────┤
│  Idade mínima: [  0 ] anos    Idade máxima: [ 65 ] anos     │
│  Mín. vidas:   [  1 ]         Máx. vidas:   [ 99 ]          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🏢 CONTRATAÇÃO                                             │
├─────────────────────────────────────────────────────────────┤
│  [✓] Aceitar Pessoa Física (CPF)                            │
│      └─ [ ] Exigir ensino superior                          │
│  [✓] Aceitar Pessoa Jurídica (CNPJ)                         │
│      └─ Mín. funcionários: [ 2 ]                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📍 REGIÃO                                                  │
├─────────────────────────────────────────────────────────────┤
│  (●) Aceitar todos os estados                               │
│  ( ) Aceitar APENAS esses estados                           │
│  ( ) Bloquear esses estados                                 │
│                                                             │
│  Estados: [SP] [RJ] [MG] [ES] [+Adicionar]                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💰 ORÇAMENTO                                               │
├─────────────────────────────────────────────────────────────┤
│  Orçamento mínimo por vida: R$ [ 0 ]                        │
│  ⓘ Leads com orçamento abaixo serão desqualificados.        │
└─────────────────────────────────────────────────────────────┘

                    [ Salvar Qualificação SDR ]
```

---

## Passo 5: Atualizar Utilitário de Settings
**Arquivo:** `src/utils/settings.ts`

Adicionar os novos campos ao tipo `IntegrationSettings` e à função `saveSettings`.

---

## Fluxo de Qualificação (Resumo)

```text
USUÁRIO PREENCHE WIZARD
         ↓
    CLICA "ENVIAR"
         ↓
┌─────────────────────────┐
│ Carregar config do DB   │
│ (integration_settings)  │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ checkHealthQualification│
│ - Avaliar idade         │
│ - Avaliar vidas         │
│ - Avaliar contratação   │
│ - Avaliar região        │
│ - Avaliar orçamento     │
└───────────┬─────────────┘
            ↓
      PASSOU EM TUDO?
       /          \
      SIM         NÃO
       ↓           ↓
is_qualified:   is_qualified:
   true            false
       ↓           ↓
Meta Pixel     Meta Pixel
 DISPARA        NÃO dispara
       ↓           ↓
    LEAD SALVO NO BANCO
    (ambos os casos)
         ↓
  USUÁRIO VÊ TELA SUCESSO
  (não sabe se foi qualificado)
```

---

## Arquivos a Serem Modificados

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `src/utils/qualification.ts` | Expandir lógica com todas as regras |
| 2 | `src/utils/settings.ts` | Adicionar tipos dos novos campos |
| 3 | `src/components/wizards/health/HealthStep3Preferences.tsx` | Adicionar campo de Estado (UF) |
| 4 | `src/components/wizards/HealthWizard.tsx` | Carregar config expandida + campo `state` |
| 5 | `src/pages/admin/AdminConfig.tsx` | Nova seção de Qualificação SDR |

---

## Seção Técnica

### Interfaces Atualizadas

```typescript
// qualification.ts
export interface HealthQualificationConfig {
  ageMin: number;
  ageMax: number;
  livesMin: number;
  livesMax: number;
  acceptCPF: boolean;
  acceptCNPJ: boolean;
  cnpjMinEmployees: number;
  cpfRequireHigherEducation: boolean;
  regionMode: 'allow_all' | 'allow_list' | 'block_list';
  regionStates: string[];
  budgetMin: number;
}

export interface HealthLeadData {
  ages: number[];
  livesCount: number;
  contractType: 'cpf' | 'cnpj';
  employeeCount?: number;
  educationLevel?: string;
  state?: string;
  budgetPerPerson: number;
}
```

### Lista de Estados Brasileiros
```typescript
const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];
```

### Lógica de Qualificação Expandida
```typescript
export function checkHealthQualification(
  data: HealthLeadData,
  config: HealthQualificationConfig
): QualificationResult {
  const reasons: string[] = [];
  
  // 1. Validar idades
  if (data.ages.some(age => age < config.ageMin)) {
    reasons.push(`Idade abaixo do mínimo (${config.ageMin} anos)`);
  }
  if (data.ages.some(age => age > config.ageMax)) {
    reasons.push(`Idade acima do máximo (${config.ageMax} anos)`);
  }
  
  // 2. Validar quantidade de vidas
  if (data.livesCount < config.livesMin) {
    reasons.push(`Menos de ${config.livesMin} vidas`);
  }
  if (data.livesCount > config.livesMax) {
    reasons.push(`Mais de ${config.livesMax} vidas`);
  }
  
  // 3. Validar tipo de contratação
  if (data.contractType === 'cpf' && !config.acceptCPF) {
    reasons.push('Não aceitamos CPF');
  }
  if (data.contractType === 'cnpj' && !config.acceptCNPJ) {
    reasons.push('Não aceitamos CNPJ');
  }
  
  // 4. Validar CNPJ específico
  if (data.contractType === 'cnpj' && data.employeeCount !== undefined) {
    if (data.employeeCount < config.cnpjMinEmployees) {
      reasons.push(`CNPJ com menos de ${config.cnpjMinEmployees} funcionários`);
    }
  }
  
  // 5. Validar escolaridade para CPF
  if (data.contractType === 'cpf' && config.cpfRequireHigherEducation) {
    const higherEdu = ['superior', 'pos', 'mestrado'];
    if (!data.educationLevel || !higherEdu.includes(data.educationLevel)) {
      reasons.push('Exigimos ensino superior para PF');
    }
  }
  
  // 6. Validar região
  if (data.state && config.regionMode !== 'allow_all') {
    if (config.regionMode === 'allow_list' && !config.regionStates.includes(data.state)) {
      reasons.push(`Estado ${data.state} não atendido`);
    }
    if (config.regionMode === 'block_list' && config.regionStates.includes(data.state)) {
      reasons.push(`Estado ${data.state} bloqueado`);
    }
  }
  
  // 7. Validar orçamento
  if (data.budgetPerPerson < config.budgetMin) {
    reasons.push(`Orçamento abaixo do mínimo (R$ ${config.budgetMin})`);
  }
  
  return {
    isQualified: reasons.length === 0,
    disqualificationReason: reasons.join('; ') || undefined,
  };
}
```

---

## Resultado Final

Ao aprovar este plano:

1. O Admin terá controle total sobre quais leads de Saúde são qualificados
2. Leads desqualificados serão salvos normalmente, mas marcados internamente
3. Eventos de conversão (Meta Pixel) só dispararão para leads qualificados
4. O usuário nunca saberá que foi desqualificado (Shadow Filter)
5. O time de vendas receberá apenas leads que passaram nos filtros

