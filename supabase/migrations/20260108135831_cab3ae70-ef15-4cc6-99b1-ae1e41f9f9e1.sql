-- Criar lead fictício de teste para validar Edge Function humanizada
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
  'TESTE FICTÍCIO - João Auto',
  'teste.ficticio.auto@teste.com',
  '(11) 99999-8888',
  '123.456.789-00',
  'Seguro Auto',
  'Pessoa Física',
  false,
  1,
  false,
  NOW() - INTERVAL '26 hours'
);