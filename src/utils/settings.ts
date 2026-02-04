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
  health_age_limit_max: number;
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
  settings: Partial<Pick<IntegrationSettings, 'mode' | 'webhook_url' | 'is_active' | 'meta_pixel_id' | 'meta_capi_token' | 'health_age_limit_max'>>
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
