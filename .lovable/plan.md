

## Problema Atual

A tabela `integration_settings` usa um campo `mode` que é `'rd_station'` OU `'webhook'` — só permite **um destino por vez**. O `send-lead` Edge Function faz `if/else` baseado nesse modo.

## Solução: Tabela de Destinos de Integração

Criar uma nova tabela `integration_destinations` onde cada linha é um destino ativo. O admin pode adicionar quantos quiser.

### 1. Nova tabela `integration_destinations`

```sql
CREATE TABLE integration_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,                          -- "RD CRM", "Webhook n8n", "RD Marketing"
  type text NOT NULL CHECK (type IN ('rd_crm', 'rd_marketing', 'webhook')),
  webhook_url text,                            -- só para type='webhook'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

Com RLS: authenticated pode SELECT/UPDATE/INSERT/DELETE; service_role pode tudo.

### 2. Migrar dados existentes

Inserir um registro baseado no `mode` atual do `integration_settings` para não quebrar nada.

### 3. Atualizar `send-lead` Edge Function

Em vez de `if/else`, buscar todos os destinos ativos (`is_active = true`) e iterar sobre eles, disparando em paralelo (`Promise.allSettled`):

- `rd_crm` → chama `/functions/v1/rd-crm`
- `rd_marketing` → chama `/functions/v1/rd-station` (RD Station Marketing)
- `webhook` → POST para `webhook_url`

Cada resultado gera seu próprio `integration_log`. O lead é salvo independente dos resultados (mantém resiliência atual).

### 4. Atualizar Admin UI (`AdminConfig.tsx`)

Substituir o RadioGroup (RD Station / Webhook) por uma **lista de destinos** com:
- Botão "Adicionar destino"
- Cada destino: nome, tipo (select: RD CRM / RD Marketing / Webhook), URL (se webhook), toggle ativo/inativo, botão remover
- Botão "Testar" individual por destino

### 5. Atualizar `settings.ts`

Remover `mode` e `webhook_url` da interface (manter backward-compatible). Adicionar funções para CRUD da nova tabela `integration_destinations`.

### Resumo de arquivos alterados

| Arquivo | Mudança |
|---|---|
| Migration SQL | Criar tabela `integration_destinations` + seed |
| `supabase/functions/send-lead/index.ts` | Loop por destinos ativos em paralelo |
| `src/pages/admin/AdminConfig.tsx` | UI de lista de destinos (CRUD) |
| `src/utils/settings.ts` | Helpers para nova tabela |

