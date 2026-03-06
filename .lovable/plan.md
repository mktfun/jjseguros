

## Problema

O campo `complement` (complemento do endereço) existe no formulário do AutoWizard mas **não está sendo enviado** no payload para o `buildAutoPayload`. Isso significa que o QAR gerado nunca inclui o complemento no endereço.

Wizards que **já têm** complemento no UI e no payload: Residencial, Fiança, Smartphone.

Wizards que **têm** complemento no UI mas **não enviam** no payload: **Auto**.

Wizards que **não têm** campo de endereço (não se aplica): Life, Travel, Business (endereço vazio), Health (usa dados do CNPJ).

## Plano

### 1. AutoWizard - Passar `complement` no payload

No `src/components/wizards/AutoWizard.tsx`, adicionar `complement` ao objeto passado para `buildAutoPayload` (linha ~339, junto com `street`, `number`, etc.).

### 2. dataProcessor.ts - Confirmar inclusão

O `buildAutoPayload` já monta o endereço com `formData.complement` na concatenação (linha 218). Basta garantir que o campo chegue no payload — o que será resolvido pelo passo 1.

---

Mudança mínima: **1 linha** no AutoWizard para adicionar `complement` ao payload.

