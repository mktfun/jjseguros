-- Create leads table to store all quotation requests
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Contact data
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  cpf TEXT,
  cnpj TEXT,
  
  -- Lead classification
  insurance_type TEXT NOT NULL,
  person_type TEXT,
  
  -- Full QAR report (human readable)
  qar_report TEXT NOT NULL,
  
  -- All custom fields as JSON for flexibility
  custom_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Funnel tracking
  funnel_name TEXT,
  funnel_stage TEXT,
  
  -- RD Station sync status
  rd_station_synced BOOLEAN NOT NULL DEFAULT false,
  rd_station_error TEXT
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to insert (edge functions)
CREATE POLICY "Service role can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (true);

-- Create policy for service role to select
CREATE POLICY "Service role can read leads"
ON public.leads
FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_leads_insurance_type ON public.leads(insurance_type);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_email ON public.leads(email);