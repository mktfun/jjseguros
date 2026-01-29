
# Correção: Tela Branca nos Detalhes do Lead

## Problema
O componente `Select` do Radix UI crasheia quando um `SelectItem` tem `value=""` (string vazia). Isso causa a tela branca.

A mensagem de erro confirma:
> `<Select.Item />` must have a value prop that is not an empty string

## Causa
Na última alteração, adicionamos:
```typescript
const FUNNEL_STAGES = [
  { value: '', label: 'Não definido' },  // <<< CAUSA O CRASH!
  ...
];
```

## Solução
Usar um valor não-vazio como `'not_set'` ou `'undefined'` para representar "Não definido":

```typescript
const FUNNEL_STAGES = [
  { value: 'not_set', label: 'Não definido' },  // Valor válido
  { value: 'novo', label: 'Novo' },
  { value: 'em_contato', label: 'Em Contato' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
];
```

E atualizar os lugares que usam string vazia para usar `'not_set'`:

```typescript
// useEffect - linha 203
setSelectedStage(lead.funnel_stage || 'not_set');

// onError - linha 271
setSelectedStage(lead?.funnel_stage || 'not_set');
```

## Seção Técnica

### Arquivo Modificado
`src/pages/admin/AdminLeadDetail.tsx`

### Alterações
1. **Linha 33**: Mudar `value: ''` para `value: 'not_set'`
2. **Linha 203**: Mudar `|| ''` para `|| 'not_set'`
3. **Linha 271**: Mudar `|| ''` para `|| 'not_set'`

### Comportamento
- Leads sem `funnel_stage` definido mostrarão "Não definido" no dropdown
- O banco continua armazenando `null` para leads sem status (não salvamos 'not_set')
- Ao selecionar "Não definido", o mutation pode salvar como `null` ou manter o valor atual
