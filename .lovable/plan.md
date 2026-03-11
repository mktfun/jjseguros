

# Plano: Corrigir Teste do Meta CAPI

## Problema
A Meta Conversions API exige parâmetros mínimos de cliente para aceitar eventos:
- `client_ip_address` (IP do request)
- `client_user_agent` (User-Agent do navegador)
- Dados de usuário hasheados (email, telefone, nome)

O erro atual ocorre porque só enviamos `country` no `user_data`.

## Solução

### 1. Atualizar Edge Function `meta-capi`

Capturar do request HTTP:
```typescript
// Extrair IP e User-Agent do request
const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
  || req.headers.get('cf-connecting-ip') 
  || 'unknown'
const clientUserAgent = req.headers.get('user-agent') || 'unknown'
```

Adicionar na interface `user_data`:
```typescript
user_data: {
  client_ip_address?: string   // NÃO hasheado
  client_user_agent?: string   // NÃO hasheado
  em?: string[]  // hashed
  ph?: string[]  // hashed
  // ...
}
```

### 2. Lógica para Eventos de Teste

Quando receber `test_event_code` no body:
- Usar email/telefone fake pré-hasheados se não fornecidos
- Garantir que IP e User-Agent sejam preenchidos
- Passar o `test_event_code` no payload para a Meta

```typescript
// Se for teste e não tiver email, usar fake hasheado
if (test_event_code && !email) {
  // test@example.com já hasheado
  userData.em = ['973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b']
}
```

### 3. Atualizar AdminConfig

Simplificar a chamada de teste (a edge function cuida do resto):
```typescript
body: {
  event_name: 'PageView',
  email: 'teste@admin.local',
  phone: '11999999999',
  name: 'Teste Admin',
  event_source_url: window.location.href,
  test_event_code: 'TEST' + Date.now().toString().slice(-5),
}
```

## Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `supabase/functions/meta-capi/index.ts` | Capturar IP/UA do request, suportar test_event_code, fallback para dados de teste |
| `src/pages/admin/AdminConfig.tsx` | Enviar dados de usuário reais (email, phone, name) no teste |

## Resultado Esperado

Após implementação:
1. Botão "Testar Pixel/CAPI" envia evento PageView com dados completos
2. Meta recebe `client_ip_address`, `client_user_agent` e dados hasheados
3. Evento aparece no Gerenciador de Eventos com "Test Event" destacado

