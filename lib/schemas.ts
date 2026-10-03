import { z } from 'zod'

export const siteSettingsSchema = z.object({
  logo_url: z.string().url().nullable(),
  tagline: z.string().min(1, 'Tagline is required').nullable(),
  contact_email: z.string().email('Enter a valid email').nullable(),
  social_links: z.object({
    instagram: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
    linkedin: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  }),
  whatsapp_number: z.string().nullable(),
  phone_number: z.string().nullable(),
  college_address: z.string().nullable(),
})
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>

export const homeContentSchema = z.object({
  intro_text: z.string().nullable(),
  banner_media_url: z.string().url().nullable(),
  banner_media_type: z.enum(['image', 'video']).nullable(),
})
export type HomeContentInput = z.infer<typeof homeContentSchema>

export const aboutContentSchema = z.object({
  vision: z.string().nullable(),
  mission: z.string().nullable(),
  history: z.string().nullable(),
  objectives: z.string().nullable(),
  faculty_message: z.string().nullable(),
})
export type AboutContentInput = z.infer<typeof aboutContentSchema>

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  photo_url: z.string().url().nullable(),
  linkedin_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  category: z.enum(['core', 'faculty', 'senior', 'junior']),
  display_order: z.coerce.number().int(),
})
export type TeamMemberInput = z.infer<typeof teamMemberSchema>

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).optional(),
  description: z.string().nullable(),
  event_date: z.string().min(1, 'Date is required'),
  type: z.enum(['upcoming', 'past']),
  registration_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  cover_photo_url: z.string().url().nullable(),
  gallery_urls: z.array(z.string().url()),
  video_embed_urls: z.array(z.string().url()),
})
export type EventInput = z.infer<typeof eventSchema>

export const sponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo_url: z.string().url().nullable(),
  description: z.string().nullable(),
  website_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  display_order: z.coerce.number().int(),
})
export type SponsorInput = z.infer<typeof sponsorSchema>
