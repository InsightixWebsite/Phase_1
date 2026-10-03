'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { sponsorSchema, type SponsorInput } from '@/lib/schemas'

export async function createSponsor(input: SponsorInput): Promise<{ error?: string }> {
  const parsed = sponsorSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}

export async function updateSponsor(id: string, input: SponsorInput): Promise<{ error?: string }> {
  const parsed = sponsorSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}

export async function archiveSponsor(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}
