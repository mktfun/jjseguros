# Tasks: Implementação do QAR de Sinistro

- [ ] **Fase 1: Preparação**
  - [ ] Adicionar `sinistro` como um tipo válido em `Cotacao.tsx` e configurar ícone/rota (ex: ícone de Alerta ou Ferramenta).
  - [ ] Atualizar `Links.tsx` para permitir a geração do link WhatsApp do QAR de Sinistro.

- [ ] **Fase 2: Componente do Wizard**
  - [ ] Criar `src/components/wizards/SinistroWizard.tsx`.
  - [ ] Implementar Step 1: Dados do Veículo (Modelo, Placa, Ano/Modelo).
  - [ ] Implementar Step 2: Dados do Condutor (Nome, CPF, Nascimento, Estado Civil, Email, CNH, Validade CNH).
  - [ ] Implementar Step 3: Dados da Ocorrência e Oficina (Dia, Hora, Local, Relato, Dados Oficina).
  - [ ] Implementar Step 4: Dados do Terceiro (Toggle: "Houve Terceiro?", se sim, abrir campos).

- [ ] **Fase 3: Integração e Processamento**
  - [ ] Atualizar `src/utils/dataProcessor.ts` para capturar os dados do state do SinistroWizard e montar a string formatada do QAR.
  - [ ] Testar o fluxo completo para garantir que o Payload JSON enviado pela Edge Function `send-lead` chega corretamente ao RD CRM.

- [ ] **Fase 4: Finalização**
  - [ ] Verificar layout responsivo do novo wizard.
  - [ ] Commit das alterações.
