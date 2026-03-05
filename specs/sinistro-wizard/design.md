# Design: QAR de Sinistro

## Diretrizes Visuais

- Utilizar o mesmo base design dos Wizards atuais (`FormCard`, `FormInput`, `Button variant="cta"`, animações de framer-motion).
- O ícone da cotação deverá ser algo como `AlertTriangle` ou `Wrench` (lucide-react) para diferenciar de uma simples cotação comercial.
- O badge pode ser "Aviso de Sinistro" em cor avermelhada ou âmbar (warning) para indicar o estado de urgência, se adequado.

## Estrutura dos Campos

### Step 1: Veículo e Condutor

**DADOS DO VEICULO**

- Modelo do Veículo (Input text)
- Placa (Input text, uppercase)
- Ano/Modelo (Mask ex: 2024/2025)

**DADOS DO CONDUTOR NO MOMENTO DO SINISTRO**

- Nome Completo (Input text)
- CPF (Input Mask)
- Data de Nascimento (Date picker ou Input formatado)
- Estado Civil (Select)
- Email (Input email)
- Número da CNH (Input numérico)
- Validade da CNH (Input date)

### Step 2: Ocorrência e Oficina

**DADOS GERAIS**

- Dia (Input date)
- Hora (Input time)
- Local / Endereço (Input text)
- Relato Breve (Textarea)

**DADOS DA OFICINA**

- Razão Social (Input text)
- CNPJ (Input Mask)
- Endereço (Input text)
- Telefone (Input tel)

### Step 3: Terceiros

- Toggle: Houve envolvimento de terceiros? (Sim / Não)
- Se Sim:
  - Nome Completo, CPF, Nascimento, Estado Civil, Email, Endereço, Número CNH, Validade CNH.
  - _Observação sobre upload_: Adicionar um campo de Drag & Drop (usando componente atual se existir) ou um alerta de texto instruindo o segurado a preparar as fotos do documento e do veículo e enviá-las pelo WhatsApp ao final do formulário (para simplificar caso não haja infraestrutura imediata de upload).
