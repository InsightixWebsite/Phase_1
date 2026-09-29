import { describe, it, expect } from 'vitest'
import { filterEventsByStatus } from './eventsFilter'
import type { Event } from './supabase/types'

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Test Event',
    slug: 'test-event',
    description: null,
    event_date: '2026-01-01',
    type: 'upcoming',
    registration_url: null,
    cover_photo_url: null,
    gallery_urls: [],
    video_embed_urls: [],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('filterEventsByStatus', () => {
  const upcoming = [makeEvent({ id: 'u1', type: 'upcoming' })]
  const past = [makeEvent({ id: 'p1', type: 'past' })]

  it('returns only upcoming events for "upcoming"', () => {
    expect(filterEventsByStatus(upcoming, past, 'upcoming')).toEqual(upcoming)
  })

  it('returns only past events for "past"', () => {
    expect(filterEventsByStatus(upcoming, past, 'past')).toEqual(past)
  })

  it('returns upcoming followed by past for "all"', () => {
    expect(filterEventsByStatus(upcoming, past, 'all')).toEqual([...upcoming, ...past])
  })

  it('handles empty lists', () => {
    expect(filterEventsByStatus([], [], 'all')).toEqual([])
  })
})
