-- Lead de teste SMARTPHONE para validação final
INSERT INTO leads (
  name, 
  email, 
  phone, 
  cpf, 
  insurance_type, 
  person_type, 
  is_completed, 
  last_step_index, 
  abandoned_alert_sent,
  qar_report,
  custom_fields,
  funnel_name,
  funnel_stage,
  rd_station_synced,
  created_at
) VALUES (
  'TESTE FINAL - Smartphone Lead',
  'teste.smartphone.final@teste.com',
  '(31) 97777-8888',
  '111.222.333-44',
  'Residencial (Smartphone)',
  'Pessoa Fisica',
  true,
  3,
  false,
  'NOVO LEAD: SEGURO SMARTPHONE
───────────────────────
Nome: TESTE FINAL - Smartphone Lead
Chamar: https://wa.me/5531977778888
───────────────────────

DADOS DO SEGURADO:
Nome: TESTE FINAL - Smartphone Lead
CPF: 111.222.333-44
Data Nascimento: 1990-05-15
Estado Civil: Casado(a)
Profissao: Analista de Sistemas

ENDERECO DO IMOVEL:
CEP: 30140-100
Endereco: Rua da Bahia, 1500, Centro, Belo Horizonte, MG
Imovel de Veraneio: Nao

DADOS DO SMARTPHONE:
Valor da NF: R$ 5.500,00

───────────────────────
CONTATO:
Email: teste.smartphone.final@teste.com
Telefone: (31) 97777-8888',
  '{"cf_tipo_solicitacao_seguro": "Seguro Residencial", "cf_tipo_pessoa": "Pessoa Fisica", "cf_cpf": "111.222.333-44", "cf_qar_respondido": "NOVO LEAD: SEGURO SMARTPHONE..."}'::jsonb,
  '2-Residencial',
  'AGR Cotacao',
  false,
  NOW()
);