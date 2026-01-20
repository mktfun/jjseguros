-- Criar tabela integration_settings (singleton)
CREATE TABLE public.integration_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  mode TEXT NOT NULL DEFAULT 'rd_station',
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT mode_check CHECK (mode IN ('rd_station', 'webhook'))
);

-- Inserir configuração padrão
INSERT INTO public.integration_settings (id, mode, is_active) 
VALUES (1, 'rd_station', true);

-- Garantir que só existe uma linha (singleton)
CREATE UNIQUE INDEX integration_settings_singleton ON public.integration_settings ((id = 1));

-- Habilitar RLS
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Apenas usuários autenticados podem ler
CREATE POLICY "Authenticated users can read settings"
  ON public.integration_settings 
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Apenas usuários autenticados podem atualizar
CREATE POLICY "Authenticated users can update settings"
  ON public.integration_settings 
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);