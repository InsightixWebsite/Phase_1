'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'
import { eventSchema, type EventInput } from '@/lib/schemas'

// Bounds the number of numeric suffixes uniqueSlug will try (base, base-2,
// base-3, ...) before giving up. Large enough to never matter in practice,
// small enough to guarantee termination instead of looping forever.
const MAX_UNIQUE_SLUG_LOOKUPS = 50

// Bounds the number of times createEvent/updateEvent will re-derive a slug
// and retry the write after losing a race to a concurrent insert/update
// (TOCTOU: another request claims the same slug between our uniqueness
// check and our write). Kept small because this is a low-traffic admin
// panel — a real collision storm here would indicate a different bug.
const MAX_WRITE_ATTEMPTS = 3

const POSTGRES_UNIQUE_VIOLATION = '23505'

function isSlugConflict(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === POSTGRES_UNIQUE_VIOLATION) return true
  // Fallback in case the driver/error shape doesn't surface a `code`.
  return /slug/i.test(error.message ?? '') && /duplicate|unique/i.test(error.message ?? '')
}

async function uniqueSlug(supabase: ReturnType<typeof createServiceSupabaseClient>, base: string, excludeId?: string) {
  let slug = base
  let suffix = 2
  for (let i = 0; i < MAX_UNIQUE_SLUG_LOOKUPS; i++) {
    let query = supabase.from('events').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data, error } = await query.maybeSingle()
    if (error) throw new Error(error.message)
    if (!data) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
  throw new Error('Could not generate a unique slug, please try again')
}

export async function createEvent(input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const base = slugify(parsed.data.title)

  let slug: string | undefined
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    let candidate: string
    try {
      // Re-derive on every attempt: if a concurrent request just claimed
      // the slug we tried last time, this lookup will see that new row
      // and pick the next available suffix.
      candidate = await uniqueSlug(supabase, base)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to generate a unique slug' }
    }

    const { error } = await supabase.from('events').insert({ ...parsed.data, slug: candidate })
    if (!error) {
      slug = candidate
      break
    }
    if (!isSlugConflict(error)) return { error: error.message }
    // Lost the race to a concurrent insert on this slug — loop and retry.
  }
  if (!slug) return { error: 'Could not generate a unique slug, please try again' }

  revalidatePath('/events')
  revalidatePath('/')
  redirect('/admin/events')
}

export async function updateEvent(id: string, input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const base = slugify(parsed.data.slug || parsed.data.title)

  let slug: string | undefined
  for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
    let candidate: string
    try {
      candidate = await uniqueSlug(supabase, base, id)
    } catch (e) {
      return { error: e instanceof Error ? e.message : 'Failed to generate a unique slug' }
    }

    const { error } = await supabase.from('events').update({ ...parsed.data, slug: candidate }).eq('id', id)
    if (!error) {
      slug = candidate
      break
    }
    if (!isSlugConflict(error)) return { error: error.message }
    // Lost the race to a concurrent write on this slug — loop and retry.
  }
  if (!slug) return { error: 'Could not generate a unique slug, please try again' }

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
