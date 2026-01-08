-- Lead fictício de ABANDONO (Auto) para testar formato limpo
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
  created_at
) VALUES (
  'TESTE EXORCISMO - Maria Auto',
  'teste.exorcismo.auto@teste.com',
  '(21) 98888-7777',
  '987.654.321-00',
  'Seguro Auto',
  'Pessoa Fisica',
  false,
  1,
  false,
  NOW() - INTERVAL '26 hours'
);