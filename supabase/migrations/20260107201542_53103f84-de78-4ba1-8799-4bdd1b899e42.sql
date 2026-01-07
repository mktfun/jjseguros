-- Adicionar coluna para marcar confirmação do webhook
ALTER TABLE public.leads 
ADD COLUMN sync_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Índice para queries de leads não confirmados
CREATE INDEX idx_leads_sync_confirmed ON public.leads(sync_confirmed_at) 
WHERE sync_confirmed_at IS NULL;

-- Comentário para documentação
COMMENT ON COLUMN public.leads.sync_confirmed_at IS 'Timestamp da confirmação de sincronização via webhook do RD Station';