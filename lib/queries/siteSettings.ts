import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/lib/supabase/types'

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('site_settings').select('*').single()
  if (error) throw error
  return data as SiteSettings
}
