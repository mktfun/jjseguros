
# Plano: Ajustes na Tela de Detalhes e Config

## Problemas Identificados

### 1. CPF/CNPJ não aparece para Seguro Auto
O `buildAutoPayload` em `src/utils/dataProcessor.ts` não inclui `cf_cpf` e `cf_cnpj` nos customFields. Por isso:
- A Edge Function `send-lead` tenta ler `payload.customFields.cf_cpf` mas não encontra
- O campo `cpf` no banco fica null
- A tela de detalhes mostra "-" (linha 486)

### 2. Status do funil aparece pré-setado
O Select de status inicia com `selectedStage` que herda `lead?.funnel_stage || 'novo'`. Se o lead não tem status definido, mostra "Novo" quando deveria mostrar algo como "Não definido" ou ficar vazio.

### 3. Falta URL de callback para webhook
Quando modo `webhook` está ativo, o usuário precisa saber qual URL configurar no n8n para confirmar recebimento dos leads. Atualmente só existe a URL do RD Station callback.

---

## Solução Proposta

### Arquivo 1: `src/utils/dataProcessor.ts`
Adicionar `cf_cpf`, `cf_cnpj` e `cf_tipo_pessoa` em `buildAutoPayload`:

```typescript
// Linha ~273 (customFields dentro de buildAutoPayload)
customFields: {
  cf_tipo_solicitacao_seguro: insuranceLabel,
  cf_deal_type: dealTypeLabel,
  cf_tipo_pessoa: formData.personType === 'pf' ? 'Pessoa Fisica' : 
                   formData.personType === 'pj' ? 'Pessoa Juridica' : undefined,
  cf_cpf: formData.personType === 'pf' ? formData.cpf : undefined,
  cf_cnpj: formData.personType === 'pj' ? formData.cnpj : undefined,
  cf_qar_auto: qarReport,
  cf_qar_respondido: qarReport,
  cf_aqr_respondido: qarReport
},
```

### Arquivo 2: `src/pages/admin/AdminLeadDetail.tsx`
Remover o default 'novo' do status do funil e mostrar o valor real:

```typescript
// Atualizar FUNNEL_STAGES para incluir opção vazia
const FUNNEL_STAGES = [
  { value: '', label: 'Não definido' },  // Nova opção
  { value: 'novo', label: 'Novo' },
  // ... resto igual
];

// Inicializar selectedStage sem forçar default
setSelectedStage(lead.funnel_stage || '');
```

### Arquivo 3: `src/pages/admin/AdminConfig.tsx`
Adicionar seção com URL de callback para modo webhook:

```typescript
// Após a seção de URL do Webhook, adicionar:
{integrationMode === 'webhook' && (
  <div className="space-y-2 pl-7 pt-4 border-t">
    <Label>URL de Callback (Confirmação)</Label>
    <p className="text-sm text-muted-foreground">
      Configure no n8n para confirmar que o lead foi recebido:
    </p>
    <div className="flex gap-2 items-center">
      <Input
        readOnly
        value={`https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/rd-webhook-confirm?token=SEU_TOKEN`}
        className="font-mono text-xs"
      />
      <Button variant="outline" onClick={copyCallbackUrl}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
    <Alert className="mt-2">
      <AlertDescription className="text-xs">
        O n8n deve fazer um POST para esta URL com o email do lead para 
        marcar como sincronizado na timeline.
      </AlertDescription>
    </Alert>
  </div>
)}
```

---

## Seção Técnica

### Dependências
Nenhuma nova dependência necessária.

### Arquivos Modificados
1. `src/utils/dataProcessor.ts` - Adicionar cf_cpf/cf_cnpj/cf_tipo_pessoa no buildAutoPayload
2. `src/pages/admin/AdminLeadDetail.tsx` - Mostrar status real do funil
3. `src/pages/admin/AdminConfig.tsx` - Adicionar seção de URL callback

### Edge Functions
Não precisa alterar a Edge Function `send-lead` pois ela já lê `cf_cpf` dos customFields.

### Banco de Dados
Não precisa migration. Os novos leads já virão com CPF corretamente.

### Testes Recomendados
1. Preencher um formulário de Auto completo e verificar se CPF aparece nos detalhes
2. Verificar se status "Não definido" aparece para leads sem funnel_stage
3. Copiar URL de callback e testar no n8n

### Ordem de Implementação
1. Corrigir `buildAutoPayload` (prioridade - resolve CPF)
2. Ajustar status do funil na tela de detalhes
3. Adicionar URL de callback na Config
