'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'
import { eventSchema, type EventInput } from '@/lib/schemas'

async function uniqueSlug(supabase: ReturnType<typeof createServiceSupabaseClient>, base: string, excludeId?: string) {
  let slug = base
  let suffix = 2
  while (true) {
    let query = supabase.from('events').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
}

export async function createEvent(input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const slug = await uniqueSlug(supabase, slugify(parsed.data.title))

  const { error } = await supabase.from('events').insert({ ...parsed.data, slug })
  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/')
  redirect('/admin/events')
}

export async function updateEvent(id: string, input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const requestedSlug = parsed.data.slug || slugify(parsed.data.title)
  const slug = await uniqueSlug(supabase, slugify(requestedSlug), id)

  const { error } = await supabase.from('events').update({ ...parsed.data, slug }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath(`/events/${slug}`)
  revalidatePath('/')
  redirect('/admin/events')
}

export async function archiveEvent(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('events').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/events')
  revalidatePath('/')
  redirect('/admin/events')
}
