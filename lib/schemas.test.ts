import { describe, it, expect } from 'vitest'
import { siteSettingsSchema, teamMemberSchema, eventSchema, sponsorSchema } from './schemas'

describe('siteSettingsSchema', () => {
  it('rejects an invalid contact email', () => {
    const result = siteSettingsSchema.safeParse({
      logo_url: null, tagline: 'Club', contact_email: 'not-an-email',
      social_links: {}, whatsapp_number: null, phone_number: null, college_address: null,
    })
    expect(result.success).toBe(false)
  })
})

describe('teamMemberSchema', () => {
  it('requires a name and a valid category', () => {
    const result = teamMemberSchema.safeParse({
      name: '', role: 'President', photo_url: null, linkedin_url: '',
      category: 'core', display_order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('eventSchema', () => {
  it('requires a title and a valid type', () => {
    const result = eventSchema.safeParse({
      title: 'Hack Night', description: null, event_date: '2026-09-01', type: 'upcoming',
      registration_url: '', cover_photo_url: null, gallery_urls: [], video_embed_urls: [],
    })
    expect(result.success).toBe(true)
  })
})

describe('sponsorSchema', () => {
  it('requires a name', () => {
    const result = sponsorSchema.safeParse({
      name: '', logo_url: null, description: null, website_url: '', display_order: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sponsor with an empty website_url', () => {
    const result = sponsorSchema.safeParse({
      name: 'Acme Corp', logo_url: null, description: 'A great sponsor', website_url: '', display_order: 0,
    })
    expect(result.success).toBe(true)
  })
})
