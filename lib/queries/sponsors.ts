import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Sponsor } from '@/lib/supabase/types'

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data as Sponsor[]
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('sponsors').select('*').order('display_order')
  if (error) throw error
  return data as Sponsor[]
}

export async function getSponsorById(id: string): Promise<Sponsor> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('sponsors').select('*').eq('id', id).single()
  if (error) throw error
  return data as Sponsor
}
