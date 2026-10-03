import { describe, it, expect, vi } from 'vitest'
import type { Event } from '@/lib/supabase/types'

vi.mock('@/lib/queries/events', () => ({
  getUpcomingEvents: vi.fn().mockResolvedValue([]),
  getPastEvents: vi.fn().mockResolvedValue([{ slug: 'hack-night', event_date: '2026-01-01' } as Event]),
}))

import sitemap from './sitemap'

describe('sitemap', () => {
  it('includes every static top-level page', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://insightix.example.com',
        'https://insightix.example.com/about',
        'https://insightix.example.com/team',
        'https://insightix.example.com/events',
        'https://insightix.example.com/sponsors',
        'https://insightix.example.com/contact',
      ])
    )
  })

  it('includes a URL for each event slug', async () => {
    const entries = await sitemap()
    expect(entries.map((e) => e.url)).toContain('https://insightix.example.com/events/hack-night')
  })
})
