

## Problema

Vários wizards enviam campos de endereço como `''` (string vazia) no payload, que o `dataProcessor.ts` converte silenciosamente em `"Nao informado"` no QAR. O BusinessWizard é o caso mais grave: passa `cep: '', street: '', number: '', neighborhood: '', city: '', state: ''` porque **nunca coleta endereço no UI**.

### Wizards afetados

| Wizard | Coleta endereço? | QAR tem seção ENDERECO? | Problema |
|---|---|---|---|
| **BusinessWizard** | Não | Sim | Envia tudo vazio → "Nao informado" |
| **LifeWizard** | Não | Não | OK (não tem seção endereço no QAR) |
| **TravelWizard** | Não | Não | OK |
| **AutoWizard** | Sim | Sim | OK |
| **ResidentialWizard** | Sim | Sim | OK |
| **FuneralWizard** | Sim | Sim | OK |
| **SmartphoneWizard** | Sim | Sim | OK |
| **FiancaWizard** | Sim | Sim | OK |

## Solução em 2 partes

### 1. Adicionar coleta de endereço no BusinessWizard

Adicionar um **Step 2 novo** (entre "Atividade" e "Coberturas") com campos de endereço da empresa:
- CEP (com auto-fill via ViaCEP)
- Rua, Número, Complemento (opcional)
- Bairro, Cidade, Estado (preenchidos via CEP)

Atualizar o `steps` array para 4 steps e ajustar os índices. Passar os campos reais no `handleSubmit` em vez de strings vazias.

### 2. Proteção no dataProcessor contra campos vazios

Adicionar uma função helper `safeField` que retorna `undefined` (em vez de `"Nao informado"`) para campos que são strings vazias. Se um campo **obrigatório** (como CEP/endereço) chegar vazio, o QAR deve **omitir a seção inteira** em vez de imprimir "Nao informado".

Aplicar em **todos** os builders que montam seção ENDERECO: `buildAutoPayload`, `buildResidentialPayload`, `buildBusinessPayload`, `buildEndorsementPayload`, `buildFuneralPayload`, `buildSmartphonePayload`, `buildFiancaPayload`.

Lógica:
```typescript
// Se endereço está vazio, não incluir seção no QAR
if (formData.cep || formData.street) {
  qarReport += `ENDERECO:\n`;
  qarReport += `CEP: ${formData.cep}\n`;
  qarReport += `Endereco: ${endereco}\n\n`;
}
```

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `src/components/wizards/BusinessWizard.tsx` | Adicionar step de endereço (CEP + ViaCEP auto-fill + número + complemento), ajustar steps de 3→4 |
| `src/utils/dataProcessor.ts` | Condicionar seção ENDERECO no QAR: só incluir se campos preenchidos. Aplicar em todos os builders |

### Resultado esperado

- BusinessWizard coleta endereço real da empresa
- Nenhum QAR jamais mostra "Nao informado" para campos de endereço
- Se por algum bug um endereço chegar vazio, a seção é omitida do QAR em vez de enviar dados inválidos

