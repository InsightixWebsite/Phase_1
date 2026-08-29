import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { HomeContent } from '@/lib/supabase/types'

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('home_content').select('*').single()
  if (error) throw error
  return data as HomeContent
}
