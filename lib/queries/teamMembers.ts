import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { TeamMember } from '@/lib/supabase/types'

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('display_order')
  if (error) throw error
  return data as TeamMember[]
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('category')
    .order('display_order')
  if (error) throw error
  return data as TeamMember[]
}

export async function getTeamMemberById(id: string): Promise<TeamMember> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('team_members').select('*').eq('id', id).single()
  if (error) throw error
  return data as TeamMember
}
