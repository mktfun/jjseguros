-- Tabela para logs de integração (RD Station, n8n, etc.)
CREATE TABLE public.integration_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'pending')),
  payload JSONB,
  response JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_integration_logs_lead_id ON public.integration_logs(lead_id);
CREATE INDEX idx_integration_logs_service_name ON public.integration_logs(service_name);
CREATE INDEX idx_integration_logs_status ON public.integration_logs(status);
CREATE INDEX idx_integration_logs_created_at ON public.integration_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ler logs
CREATE POLICY "Authenticated users can read integration logs"
ON public.integration_logs
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role pode inserir logs (para Edge Functions)
CREATE POLICY "Service role can insert integration logs"
ON public.integration_logs
FOR INSERT
TO service_role
WITH CHECK (true);

-- Habilitar realtime para a tabela (opcional, útil para dashboard)
ALTER TABLE public.integration_logs REPLICA IDENTITY FULL;

-- Comentários para documentação
COMMENT ON TABLE public.integration_logs IS 'Logs de integração com serviços externos (RD Station, n8n)';
COMMENT ON COLUMN public.integration_logs.service_name IS 'Nome do serviço: rd_station, n8n, etc.';
COMMENT ON COLUMN public.integration_logs.status IS 'Status: success, error, pending';
COMMENT ON COLUMN public.integration_logs.payload IS 'Dados enviados para o serviço';
COMMENT ON COLUMN public.integration_logs.response IS 'Resposta do serviço';
COMMENT ON COLUMN public.integration_logs.error_message IS 'Mensagem de erro (se houver)';