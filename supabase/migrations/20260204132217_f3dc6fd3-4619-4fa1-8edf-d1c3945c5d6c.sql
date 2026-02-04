-- Adicionar metadados de qualificação aos leads
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS is_qualified BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS disqualification_reason TEXT;

-- Adicionar configurações de Marketing e Health Age Limit na tabela integration_settings
ALTER TABLE public.integration_settings
ADD COLUMN IF NOT EXISTS meta_pixel_id TEXT,
ADD COLUMN IF NOT EXISTS meta_capi_token TEXT,
ADD COLUMN IF NOT EXISTS health_age_limit_max INTEGER DEFAULT 65;