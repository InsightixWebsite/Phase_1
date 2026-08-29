'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { teamMemberSchema, type TeamMemberInput } from '@/lib/schemas'

export async function createTeamMember(input: TeamMemberInput): Promise<{ error?: string }> {
  const parsed = teamMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/team')
  redirect('/admin/team')
}

export async function updateTeamMember(id: string, input: TeamMemberInput): Promise<{ error?: string }> {
  const parsed = teamMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/team')
  redirect('/admin/team')
}

export async function archiveTeamMember(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/team')
  redirect('/admin/team')
}
