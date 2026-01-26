
# Plano: Corrigir Roteamento de Leads via Edge Function

## Problema Identificado
A tabela `integration_settings` tem RLS que bloqueia leitura por usuários anônimos. Quando um visitante preenche o formulário:
1. `getSettings()` retorna `null` (RLS bloqueia)
2. O código cai no `else` e envia para RD Station (fallback)
3. Leads vão pro RD ao invés do n8n configurado

## Solução Proposta

### Criar Edge Function `send-lead`
Uma Edge Function que:
1. Lê `integration_settings` usando `SUPABASE_SERVICE_ROLE_KEY` (ignora RLS)
2. Roteia o lead para o destino correto (n8n webhook ou RD Station)
3. Salva o lead no banco e registra logs
4. Retorna sucesso/erro para o frontend

### Atualizar `dataProcessor.ts`
Alterar `sendToRDStation()` para:
1. Chamar a Edge Function `send-lead` ao invés de tentar ler settings no frontend
2. Enviar todo o payload para a Edge Function processar

## Arquitetura Final

```text
Visitante preenche formulário
         ↓
   Frontend (React)
         ↓
   Edge Function "send-lead"
         ↓
   Lê integration_settings (service_role)
         ↓
   ┌─────────────────┬──────────────────┐
   │ mode = webhook  │ mode = rd_station │
   ├─────────────────┼──────────────────┤
   │ POST → n8n URL  │ POST → rd-station │
   └─────────────────┴──────────────────┘
         ↓
   Salva lead no Supabase
         ↓
   Resposta para frontend
```

## Arquivos a Modificar

### 1. Criar `supabase/functions/send-lead/index.ts`

```typescript
// Pseudocódigo da Edge Function
import { createClient } from "@supabase/supabase-js"

serve(async (req) => {
  // 1. Receber payload do frontend
  const payload = await req.json()
  
  // 2. Ler integration_settings com service_role (ignora RLS)
  const supabase = createClient(url, serviceRoleKey)
  const { data: settings } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('id', 1)
    .single()
  
  // 3. Rotear para destino correto
  if (settings?.mode === 'webhook' && settings?.webhook_url) {
    // Enviar para n8n/Make/Zapier
    await fetch(settings.webhook_url, {
      method: 'POST',
      body: JSON.stringify(webhookPayload)
    })
  } else {
    // Enviar para RD Station API
    await fetch('https://api.rd.services/platform/conversions?api_key=...')
  }
  
  // 4. Salvar lead no banco
  await supabase.from('leads').upsert({...})
  
  // 5. Registrar log
  await supabase.from('integration_logs').insert({...})
  
  return Response.json({ success: true })
})
```

### 2. Atualizar `src/utils/dataProcessor.ts`

```typescript
// Antes (problemático):
export const sendToRDStation = async (payload, existingLeadId) => {
  const settings = await getSettings() // <<< BLOQUEADO POR RLS!
  if (settings?.mode === 'webhook') { ... }
}

// Depois (corrigido):
export const sendToRDStation = async (payload, existingLeadId) => {
  const { data, error } = await supabase.functions.invoke('send-lead', {
    body: { payload, existingLeadId }
  })
  return !error && data?.success
}
```

## Benefícios
1. **Funciona para visitantes**: Edge Function usa service_role, ignora RLS
2. **URL do n8n privada**: Nunca exposta no frontend
3. **Centralizado**: Toda lógica de roteamento num só lugar
4. **Logging completo**: Registra qual destino foi usado

## Seção Técnica

### Secrets Necessários
A Edge Function precisa do `RD_API_KEY` que já existe no projeto.

### Atualizar `supabase/config.toml`
Adicionar configuração para nova função:
```toml
[functions.send-lead]
verify_jwt = false  # Permitir chamadas não autenticadas
```

### RLS
Não precisa alterar RLS. A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` que já tem acesso total.

### Migration
Nenhuma migration necessária. Apenas código.

### Ordem de Implementação
1. Criar Edge Function `send-lead`
2. Atualizar `config.toml`
3. Simplificar `dataProcessor.ts`
4. Testar com um lead de verdade
