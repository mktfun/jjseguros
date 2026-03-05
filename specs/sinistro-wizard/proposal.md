# Proposal: QAR de Abertura de Sinistro

## Contexto e Objetivo

O corretor necessita de um fluxo digital (QAR) para abertura e aviso de **Sinistro de Automóvel**. Atualmente o sistema não possui uma jornada dedicada à coleta de informações pós-venda para ocorrências (colisões, roubo, etc.). O objetivo é criar um Wizard de Sinistro específico que capte todos os dados necessários de forma guiada, envie as informações para o CRM na pipelene correta e possibilite um atendimento ágil pelo corretor.

## Escopo do QAR de Sinistro

O novo `SinistroWizard.tsx` seguirá as etapas de preenchimento solicitadas:

1. **Dados do Veículo Segurado**: Modelo, Placa, Ano/Modelo.
2. **Dados do Condutor (no momento do sinistro)**: Nome Completo, CPF, Data de Nascimento, Estado Civil, Email, Número da CNH, Validade da CNH.
3. **Dados do Terceiro (se houver)**: Nome Completo, CPF, Data de Nascimento, Estado Civil, Email, Endereço, Número da CNH, Validade da CNH, Foto do Documento do Veículo (upload opcional ou placeholder/aviso).
4. **Dados Gerais da Ocorrência**: Dia, Hora, Local (Endereço do acidente/fato), Relato breve de como aconteceu.
5. **Dados da Oficina**: Razão Social, CNPJ, Endereço, Telefone.

## Arquitetura e Integração

- **Frontend**:
  - Adicionar `sinistro` na lista de `validTypes` em `Cotacao.tsx` e `Links.tsx`.
  - Criar componente `SinistroWizard.tsx` nos moldes dos outros wizards existentes (usando `react-hook-form` ou estados locais, mantendo o padrão visual).
- **Processamento (dataProcessor.ts)**:
  - Criar um formato `qarReport` específico para Sinistro (semelhante ao Auto, porém com os campos relatados acima).
- **Backend (Integração RD Station CRM)**:
  - Como o sistema atualmente joga todas as leads de cotação para o funil "1-Auto" -> "Agr Cotação", teremos que definir se "Sinistro" vai para o mesmo funil ou para um funil específico de Pós-Venda/Sinistro. A princípio, manteremos a rotina existente, mas o título da negociação será claramente "SINISTRO - Nome - Placa".

## Etapas do Wizard (Steps)

1. **Identificação e Veículo**: Dados do Segurado/Veículo.
2. **Condutor no Momento**: Dados do Condutor.
3. **Ocorrência e Oficina**: Dados Gerais do Sinistro e Oficina Escolhida.
4. **Terceiros**: Informações sobre Terceiros envolvidos.

---

Aguardando aprovação do usuário para a geração e implementação baseada neste fluxo.
