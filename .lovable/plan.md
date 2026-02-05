
# Plano: Reestruturação do Wizard de Plano de Saúde

## Resumo das Alterações

Três telas do wizard precisam ser modificadas conforme as solicitações:

1. **Step 2 (Contratação)**: Priorizar CNPJ com link discreto "Não tenho CNPJ" para CPF
2. **Step 3 (Preferências)**: Hospital/Rede como input livre (opcional) + remover coparticipação
3. **Step 5 (Cross-sell)**: Remover promessa de desconto %, focar em cross-sell consultivo

---

## Mudança 1: Priorizar CNPJ no Step 2

### Layout Atual vs. Proposto

```text
┌─ ATUAL ──────────────────────────────────────┐
│  ┌─────────────┐  ┌─────────────┐            │
│  │ PF (CPF)    │  │ PJ (CNPJ) ✓ │            │
│  └─────────────┘  └─────────────┘            │
│  Campos CNPJ...                              │
└──────────────────────────────────────────────┘

┌─ PROPOSTO ───────────────────────────────────┐
│          Contratação Empresarial             │
│   Informe o CNPJ da empresa contratante.     │
│                                              │
│   CNPJ *                                     │
│   [ 00.000.000/0000-00           ]           │
│                                              │
│   Razão Social                               │
│   [ Preenchido automaticamente   ]           │
│                                              │
│   Número de Funcionários                     │
│   [ Mínimo 2 vidas               ]           │
│                                              │
│           ─────────────────────              │
│      Não tenho CNPJ (contratar como PF)      │
│           ─────────────────────              │
│                                              │
│   ⤷ Se clicado, abre formulário CPF:        │
│     - CPF de cada vida                       │
│     - Escolaridade de cada vida              │
└──────────────────────────────────────────────┘
```

### Comportamento

- **Default**: Exibe formulário CNPJ diretamente (sem toggle PF/PJ)
- **Link discreto**: "Não tenho CNPJ" abaixo do formulário CNPJ
- **Modo CPF**: Pede CPF e escolaridade para CADA vida (não apenas do titular)
- **Estrutura de dados**: Expandir `lives[]` para incluir `cpf` e `educationLevel`

---

## Mudança 2: Simplificar Step 3 (Preferências)

### Remover
- Dropdown de "Hospital/Rede de preferência" (lista fixa)
- Toggle de "Coparticipação"

### Alterar
- **Hospital/Rede**: Input de texto livre, opcional
  - Label: "Hospital ou rede de preferência (opcional)"
  - Placeholder: "Ex: Albert Einstein, Rede D'Or, Unimed..."

### Manter
- Slider de orçamento
- Seletores de Estado e Cidade
- Botões de acomodação (Enfermaria/Apartamento)

---

## Mudança 3: Reformular Step 5 (Cross-sell)

### Problema Atual
- Promete "15% de desconto" por combinar seguros (não é real)
- Abordagem comercial agressiva

### Nova Abordagem
- Foco consultivo: "Vamos cuidar de todos os seus seguros"
- Perguntar se TEM seguros ativos (para renovação) ou se quer COTAR novos
- Sem promessa de desconto percentual

### Layout Proposto

```text
┌─────────────────────────────────────────────┐
│          🛡️ Seus Outros Seguros             │
│                                              │
│   Além do plano de saúde, você possui       │
│   algum seguro que vence em breve?          │
│                                              │
│   Na renovação, conseguimos condições       │
│   especiais. Se não tiver, cotamos sem      │
│   compromisso!                              │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │ [✓] Tenho seguro auto renovando     │   │
│   │     Vencimento: [ dd/mm/aaaa ]      │   │
│   └─────────────────────────────────────┘   │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │ [ ] Tenho seguro de vida renovando  │   │
│   │     Vencimento: [ dd/mm/aaaa ]      │   │
│   └─────────────────────────────────────┘   │
│                                              │
│   ┌─────────────────────────────────────┐   │
│   │ [ ] Quero cotar outros seguros      │   │
│   │     (sem compromisso)               │   │
│   └─────────────────────────────────────┘   │
│                                              │
│   💡 Tudo certo! Enviaremos sua cotação     │
│      de saúde e, se marcou interesse,       │
│      entraremos em contato sobre os outros. │
└─────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

| # | Arquivo | Alterações |
|---|---------|------------|
| 1 | `src/components/wizards/HealthWizard.tsx` | Expandir tipo `lives[]` com `cpf` e `educationLevel` |
| 2 | `src/components/wizards/health/HealthStep2Business.tsx` | Refazer layout: CNPJ default + link "não tenho CNPJ" + CPF/escolaridade por vida |
| 3 | `src/components/wizards/health/HealthStep3Preferences.tsx` | Trocar dropdown por input livre + remover toggle coparticipação |
| 4 | `src/components/wizards/health/HealthStep5CrossSell.tsx` | Nova abordagem consultiva sem promessa de % |

---

## Seção Técnica

### Interface Atualizada de Lives

```typescript
interface Life {
  id: string;
  age: string;
  relationship: string;
  cpf?: string;        // Novo: CPF individual (modo PF)
  educationLevel?: string;  // Novo: Escolaridade individual (modo PF)
}
```

### Nova Interface de Cross-sell

```typescript
interface CrossSellData {
  hasAutoInsurance: boolean;
  autoExpiry: string;
  hasLifeInsurance: boolean;
  lifeExpiry: string;
  wantsOtherQuotes: boolean;  // Novo: interesse em cotar outros
}
```

### Validação Step 2

```typescript
// Modo CNPJ
if (data.contractType === 'cnpj') {
  return isValidCNPJ(data.cnpj) && data.razaoSocial.length > 0;
}

// Modo CPF (todos os lives precisam ter CPF válido)
return data.lives.every(life => 
  life.cpf && life.cpf.replace(/\D/g, '').length === 11
);
```

### Lista de Escolaridades (por vida)

```typescript
const educationLevels = [
  { value: 'fundamental', label: 'Ensino Fundamental' },
  { value: 'medio', label: 'Ensino Médio' },
  { value: 'superior', label: 'Ensino Superior' },
  { value: 'pos', label: 'Pós-graduação' },
  { value: 'mestrado', label: 'Mestrado/Doutorado' },
];
```

---

## Resultado Final

Após implementação:

1. O wizard priorizará contratação empresarial (CNPJ), com opção discreta para PF
2. Leads PF terão CPF e escolaridade coletados para CADA vida
3. Hospital/Rede será campo livre e opcional (sem dropdown)
4. Cross-sell será consultivo, sem promessas de desconto irreal
5. Dados coletados continuam fluindo para qualificação e RD Station
