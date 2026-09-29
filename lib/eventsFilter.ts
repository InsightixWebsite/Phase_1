import type { Event } from './supabase/types'

export type EventStatusFilter = 'all' | 'upcoming' | 'past'

export function filterEventsByStatus(
  upcoming: Event[],
  past: Event[],
  filter: EventStatusFilter
): Event[] {
  if (filter === 'upcoming') return upcoming
  if (filter === 'past') return past
  return [...upcoming, ...past]
}
