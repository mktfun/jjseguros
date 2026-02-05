import { supabase } from '@/integrations/supabase/client';

export interface IntegrationSettings {
  id: number;
  mode: 'rd_station' | 'webhook';
  webhook_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Marketing & Conversão
  meta_pixel_id: string | null;
  meta_capi_token: string | null;
  // SDR Qualification - Health
  health_age_limit_min: number;
  health_age_limit_max: number;
  health_lives_min: number;
  health_lives_max: number;
  health_accept_cpf: boolean;
  health_accept_cnpj: boolean;
  health_cnpj_min_employees: number;
  health_cpf_require_higher_education: boolean;
  health_region_mode: 'allow_all' | 'allow_list' | 'block_list';
  health_region_states: string[];
  health_budget_min: number;
}

export async function getSettings(): Promise<IntegrationSettings | null> {
  const { data, error } = await supabase
    .from('integration_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) {
    console.error('Erro ao buscar settings:', error);
    return null;
  }

  return data as IntegrationSettings;
}

export async function saveSettings(
  settings: Partial<Pick<IntegrationSettings, 
    'mode' | 'webhook_url' | 'is_active' | 'meta_pixel_id' | 'meta_capi_token' |
    'health_age_limit_min' | 'health_age_limit_max' | 'health_lives_min' | 'health_lives_max' |
    'health_accept_cpf' | 'health_accept_cnpj' | 'health_cnpj_min_employees' |
    'health_cpf_require_higher_education' | 'health_region_mode' | 'health_region_states' |
    'health_budget_min'
  >>
): Promise<boolean> {
  const { error } = await supabase
    .from('integration_settings')
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    console.error('Erro ao salvar settings:', error);
    return false;
  }

  return true;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}
