import { describe, it, expect, expectTypeOf } from 'vitest'
import type { Event, TeamMember } from './types'

describe('shared Supabase types', () => {
  it('Event has a required unique slug field', () => {
    const event: Event = {
      id: '1', title: 'Hack Night', slug: 'hack-night', description: null,
      event_date: '2026-09-01', type: 'upcoming', registration_url: null,
      cover_photo_url: null, gallery_urls: [], video_embed_urls: [],
      is_active: true, created_at: '2026-08-27T00:00:00Z',
    }
    expect(event.slug).toBe('hack-night')
  })

  it('TeamMember category is restricted to the four known values', () => {
    expectTypeOf<TeamMember['category']>().toEqualTypeOf<'core' | 'faculty' | 'senior' | 'junior'>()
  })
})
