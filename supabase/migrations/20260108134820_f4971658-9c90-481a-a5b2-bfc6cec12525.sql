-- Marca todos os leads criados antes de HOJE como já alertados
-- Isso impede que a Edge Function processe lixo antigo
UPDATE leads
SET abandoned_alert_sent = true
WHERE created_at < CURRENT_DATE 
  AND abandoned_alert_sent = false
  AND is_completed = false;