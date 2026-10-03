export interface SiteSettings {
  logo_url: string | null
  tagline: string | null
  contact_email: string | null
  social_links: Record<string, string>
  whatsapp_number: string | null
  phone_number: string | null
  college_address: string | null
}

export interface AboutContent {
  vision: string | null
  mission: string | null
  history: string | null
  objectives: string | null
  faculty_message: string | null
}

export interface HomeContent {
  intro_text: string | null
  banner_media_url: string | null
  banner_media_type: 'image' | 'video' | null
}

export interface TeamMember {
  id: string
  name: string
  role: string
  photo_url: string | null
  linkedin_url: string | null
  category: 'core' | 'faculty' | 'senior' | 'junior'
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  event_date: string
  type: 'upcoming' | 'past'
  registration_url: string | null
  cover_photo_url: string | null
  gallery_urls: string[]
  video_embed_urls: string[]
  is_active: boolean
  created_at: string
}

export interface Sponsor {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  website_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}
