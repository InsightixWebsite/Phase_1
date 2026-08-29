import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/supabase/types'

export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'upcoming')
    .order('event_date', { ascending: true })
  if (error) throw error
  return data as Event[]
}

export async function getPastEvents(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'past')
    .order('event_date', { ascending: false })
  if (error) throw error
  return data as Event[]
}

export async function getRecentEvents(limit: number): Promise<Event[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Event[]
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as Event | null
}

export async function getAllEventsForAdmin(): Promise<Event[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false })
  if (error) throw error
  return data as Event[]
}

export async function getEventById(id: string): Promise<Event> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
  if (error) throw error
  return data as Event
}
