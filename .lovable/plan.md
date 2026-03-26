

## Endereço obrigatório em TODOS os wizards

Adicionar coleta de endereço (CEP + ViaCEP auto-fill) nos 3 wizards que ainda não coletam: **LifeWizard**, **TravelWizard** e **HealthWizard**.

### Wizards que precisam de endereço

| Wizard | Situação atual | Mudança |
|---|---|---|
| **LifeWizard** | 3 steps, sem endereço | Adicionar Step 2 "Endereço" → passa para 4 steps |
| **TravelWizard** | 3 steps, sem endereço | Adicionar Step 2 "Endereço" → passa para 4 steps |
| **HealthWizard** | 5 steps, endereço só via CNPJ API | Adicionar campos de endereço pessoal no Step 4 (Contato) |

### Campos de endereço (padrão em todos)
- CEP (com auto-fill via ViaCEP)
- Rua, Número, Complemento (opcional)
- Bairro, Cidade, Estado (preenchidos pelo CEP)

### Arquivos a editar

| Arquivo | Mudança |
|---|---|
| `src/components/wizards/LifeWizard.tsx` | Novo step "Endereço" entre "Saúde" e "Beneficiários" (3→4 steps), campos CEP+ViaCEP |
| `src/components/wizards/TravelWizard.tsx` | Novo step "Endereço" entre "Destino" e "Viajantes" (3→4 steps), campos CEP+ViaCEP |
| `src/components/wizards/HealthWizard.tsx` | Adicionar campos de endereço pessoal no Step 4 (Contato), com CEP+ViaCEP |
| `src/utils/dataProcessor.ts` | Adicionar seção ENDERECO no `buildLifePayload`, `buildTravelPayload` e `buildHealthPayload` (condicional, mesmo padrão dos outros) |

### QAR — seção adicionada nos 3 builders

```text
ENDERECO:
CEP: 01310-100
Endereco: Av Paulista, 1000, Apto 42, Bela Vista, Sao Paulo, SP
```

Segue o mesmo padrão condicional já implementado: só inclui se `cep` ou `street` estão preenchidos.

