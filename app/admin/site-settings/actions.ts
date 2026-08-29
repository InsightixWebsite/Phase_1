'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/schemas'

export async function updateSiteSettings(input: SiteSettingsInput): Promise<{ error?: string }> {
  const parsed = siteSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('site_settings')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/contact')
  return {}
}
