

## Novo Wizard: Assistência Funeral Familiar

Criar um wizard completo para "Assistência Funeral Familiar" seguindo o padrão dos outros wizards (stepper, FormCards por step, validação inline, LGPD, partial lead, QAR report).

### Campos do QAR (organizados em steps)

**Step 1 - Dados do Titular**
- Nome Completo
- CPF (formatado, validado 11 dígitos)
- Data de Nascimento
- Email
- Celular

**Step 2 - Perfil do Titular**
- Profissão
- Endereço (CEP + auto-fill rua/bairro/cidade/estado + número + complemento)
- Faixa de Renda Mensal (RadioCardGroup: R$1-3k, R$3-5k, R$5-10k, R$10k+)

**Step 3 - Saúde e Cobertura**
- Altura (inputMode numeric)
- Peso (inputMode numeric)
- É Fumante? (ToggleSwitch)
- Quantidade de dependentes (input numeric)
- Observações adicionais (textarea opcional)

### Arquivos a criar/editar

| Arquivo | Ação |
|---|---|
| `src/components/wizards/FuneralWizard.tsx` | Criar — wizard 3 steps, padrão LifeWizard |
| `src/components/wizards/index.ts` | Adicionar export `FuneralWizard` |
| `src/utils/dataProcessor.ts` | Adicionar `buildFuneralPayload` com QAR formatado e funnel `7-Funeral`, stage `AGR Cotacao` |
| `src/pages/Cotacao.tsx` | Adicionar tipo `funeral` no config e validTypes |
| `src/pages/InsuranceHub.tsx` | Adicionar tile "Assistência Funeral" no bento grid |

### QAR Report Format

```text
NOVO LEAD: ASSISTENCIA FUNERAL FAMILIAR
───────────────────────
Nome: ...
Chamar: https://wa.me/55...
───────────────────────

DADOS DO TITULAR:
Nome: ...
CPF: ...
Data Nascimento: ...
Profissao: ...

ENDERECO:
CEP: ...
Endereco: Rua, 123, Apto 4, Bairro, Cidade, UF

PERFIL:
Renda Mensal: R$ 3.000 - R$ 5.000
Altura: 1.75m
Peso: 80kg
Fumante: Nao
Dependentes: 3

OBSERVACOES:
...

───────────────────────
CONTATO:
Email: ...
Telefone: ...
```

### Detalhes Técnicos

- Funnel: `funnel_name: '7-Funeral'`, `funnel_stage: 'AGR Cotacao'`
- Custom field: `cf_qar_funeral` + `cf_qar_respondido` + `cf_aqr_respondido`
- `cf_tipo_solicitacao_seguro: 'Assistencia Funeral Familiar'`
- CEP auto-fill via ViaCEP (mesmo padrão do ResidentialWizard)
- Partial lead salvo ao sair do Step 1

