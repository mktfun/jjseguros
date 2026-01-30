
# Correção: Erro 500 ao Enviar Cotação

## Diagnóstico

### Causa Raiz
O problema tem **duas partes**:

1. **Erro no n8n (externo)**: O workflow configurado (`https://n8n.davicode.me/webhook/avisar-rodrigo`) retorna erro 500 com mensagem:
   - `"Unused Respond to Webhook node found in the workflow"`
   - Isso significa que o workflow no n8n tem um nó "Respond to Webhook" que não está conectado corretamente

2. **Bug no código**: Quando o webhook falha, a Edge Function retorna status 500 mesmo que o lead tenha sido salvo no banco. O frontend interpreta isso como falha total.

### Evidência
O teste direto retornou:
```text
lead_id: "b68964ff-2fa6-4b76-9787-9c473bd3aca6"  (Lead FOI salvo!)
success: false (erro reportado ao frontend)
```

---

## Solução

### 1. Corrigir Edge Function `send-lead`
Mudar a lógica de resposta para:
- Retornar sucesso (200) se o lead foi salvo, mesmo com falha no webhook
- Incluir warning sobre falha de sincronização
- O erro do webhook fica registrado nos logs, mas não bloqueia o usuário

### 2. Corrigir n8n (ação do usuário)
No workflow do n8n, é necessário:
- Remover ou conectar corretamente o nó "Respond to Webhook"
- Ou usar um nó "Respond to Webhook" que retorne 200

---

## Alterações no Código

### Arquivo: `supabase/functions/send-lead/index.ts`

Atualizar a lógica de resposta (linhas 213-221):

```typescript
// ANTES (problemático):
return new Response(JSON.stringify({ 
  success: sendSuccess,  // false se webhook falhou
  ...
}), {
  status: sendSuccess ? 200 : 500,  // 500 mesmo com lead salvo!
})

// DEPOIS (corrigido):
// O "sucesso" agora depende de salvar o lead, não do webhook
const leadSaved = savedLeadId !== null
return new Response(JSON.stringify({ 
  success: leadSaved,
  destination,
  lead_id: savedLeadId,
  integration_synced: sendSuccess,
  integration_error: sendError 
}), {
  status: leadSaved ? 200 : 500,  // Só falha se não salvou lead
})
```

### Lógica Atualizada
1. Tentar enviar para webhook/RD Station
2. Salvar lead no banco (independente do resultado acima)
3. Retornar:
   - `success: true` + status 200 se lead foi salvo
   - `integration_synced: true/false` indicando se webhook/RD funcionou
   - `integration_error` com detalhes se falhou

---

## Benefícios

1. **Usuário não vê erro**: Se o lead foi salvo, mostra sucesso
2. **Transparência no admin**: Logs mostram se webhook falhou
3. **Resiliência**: Mesmo com n8n fora, leads são capturados
4. **Depuração fácil**: Erro do webhook fica visível nos logs

---

## Ação Necessária no n8n

Para corrigir definitivamente, no workflow do n8n:

**Opção A**: Remover o nó "Respond to Webhook" se não for usar

**Opção B**: Conectar o nó corretamente assim:
```text
Webhook Trigger → [sua lógica] → Respond to Webhook (retornar 200)
```

---

## Seção Técnica

### Arquivo Modificado
`supabase/functions/send-lead/index.ts`

### Mudanças
1. Criar variável `leadSaved` para rastrear se o lead foi persistido
2. Atualizar lógica de insert/update para setar corretamente `savedLeadId`
3. Mudar resposta final para basear sucesso no salvamento do lead
4. Adicionar campo `integration_synced` para indicar status do webhook

### Compatibilidade
Todos os wizards usam a mesma função `sendToRDStation()` que agora receberá:
- `success: true` quando o lead for salvo
- O frontend continua funcionando igual

### Deploy
A Edge Function será automaticamente deployada após a alteração.
