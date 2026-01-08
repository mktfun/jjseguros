-- Lead fictício COMPLETO (Auto) para testar QAR formato limpo
INSERT INTO leads (
  name, 
  email, 
  phone, 
  cpf, 
  insurance_type, 
  person_type,
  qar_report,
  is_completed, 
  last_step_index, 
  abandoned_alert_sent,
  funnel_name,
  funnel_stage,
  rd_station_synced,
  created_at
) VALUES (
  'TESTE EXORCISMO - Pedro Completo',
  'teste.exorcismo.completo@teste.com',
  '(11) 97777-6666',
  '111.222.333-44',
  'Seguro Auto',
  'Pessoa Fisica',
  'NOVO LEAD: SEGURO AUTO
───────────────────────
Nome: TESTE EXORCISMO - Pedro Completo
Chamar: https://wa.me/5511977776666
───────────────────────

TIPO SOLICITACAO: Seguro Novo

DADOS DO CONDUTOR:
Nome: TESTE EXORCISMO - Pedro Completo
Tipo: Pessoa Fisica
CPF/CNPJ: 111.222.333-44
Estado Civil: Casado(a)
Profissao: Engenheiro

DADOS DO VEICULO:
Modelo: Honda Civic 2024
Placa: ABC1D23
Ano/Modelo: 2024/2024
Zero KM: Nao
Financiado/Alienado: Sim
Tipo de Uso: Uso Pessoal (Lazer/Trabalho)

ENDERECO E PERNOITE:
CEP: 01310-100
Endereco: Av. Paulista, 1000, Bela Vista, Sao Paulo, SP
Tipo Residencia: Apartamento
Garagem Casa: Portao Automatico

ROTINA DE USO:
Usa p/ Trabalho: Sim
  > Estacionamento Trabalho: Garagem Fechada
Usa p/ Faculdade: Nao

PERFIL DE RISCO:
Reside com pessoa de 18-25 anos: Nao

───────────────────────
CONTATO:
Email: teste.exorcismo.completo@teste.com
Telefone: (11) 97777-6666',
  true,
  4,
  false,
  '1-Auto',
  'AGR Cotacao',
  true,
  NOW()
);