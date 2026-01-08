-- Novo lead fictício de ABANDONO para teste final
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
  'TESTE FINAL - Carlos Residencial',
  'teste.final.residencial@teste.com',
  '(31) 96666-5555',
  '555.444.333-22',
  'Seguro Residencial',
  'Pessoa Fisica',
  false,
  2,
  false,
  NOW() - INTERVAL '28 hours'
);