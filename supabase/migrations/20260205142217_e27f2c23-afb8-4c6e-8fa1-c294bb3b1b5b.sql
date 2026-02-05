-- Adicionar coluna para filtro granular por estado+cidade
-- Substitui health_region_states por health_region_locations (JSON array de objetos)
ALTER TABLE public.integration_settings 
ADD COLUMN IF NOT EXISTS health_region_locations jsonb DEFAULT '[]'::jsonb;

-- Migrar dados existentes de health_region_states para o novo formato
UPDATE public.integration_settings
SET health_region_locations = (
  SELECT jsonb_agg(
    jsonb_build_object('state', state_value, 'city', null)
  )
  FROM unnest(health_region_states) AS state_value
)
WHERE health_region_states IS NOT NULL 
  AND array_length(health_region_states, 1) > 0;

-- Comentário explicativo
COMMENT ON COLUMN public.integration_settings.health_region_locations IS 
'Array de objetos {state: string, city?: string} para filtro granular de região. Se city for null, aplica ao estado inteiro.';