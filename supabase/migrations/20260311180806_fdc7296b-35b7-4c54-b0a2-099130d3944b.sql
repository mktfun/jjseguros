
-- Create integration_destinations table
CREATE TABLE public.integration_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('rd_crm', 'rd_marketing', 'webhook')),
  webhook_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.integration_destinations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Authenticated users can read destinations"
  ON public.integration_destinations FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert destinations"
  ON public.integration_destinations FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update destinations"
  ON public.integration_destinations FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete destinations"
  ON public.integration_destinations FOR DELETE TO authenticated
  USING (true);

CREATE POLICY "Service role full access destinations"
  ON public.integration_destinations FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Seed: migrate existing config to a destination row
INSERT INTO public.integration_destinations (name, type, webhook_url, is_active)
SELECT
  CASE
    WHEN mode = 'webhook' THEN 'Webhook Principal'
    ELSE 'RD CRM'
  END,
  CASE
    WHEN mode = 'webhook' THEN 'webhook'
    ELSE 'rd_crm'
  END,
  CASE
    WHEN mode = 'webhook' THEN webhook_url
    ELSE NULL
  END,
  true
FROM public.integration_settings
WHERE id = 1;
