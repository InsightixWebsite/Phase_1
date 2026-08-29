import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AboutContent } from '@/lib/supabase/types'

export async function getAboutContent(): Promise<AboutContent> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('about_content').select('*').single()
  if (error) throw error
  return data as AboutContent
}
