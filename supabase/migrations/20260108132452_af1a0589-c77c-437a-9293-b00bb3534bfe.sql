-- Controle de preenchimento parcial
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_step_index INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS abandoned_alert_sent BOOLEAN DEFAULT FALSE;

-- Tornar qar_report nullable para leads parciais
ALTER TABLE public.leads ALTER COLUMN qar_report DROP NOT NULL;

-- Index para busca de leads abandonados (performance)
CREATE INDEX IF NOT EXISTS idx_leads_abandonment ON public.leads (is_completed, abandoned_alert_sent, created_at) 
WHERE is_completed = FALSE AND abandoned_alert_sent = FALSE;