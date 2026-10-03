import type { MetadataRoute } from 'next'
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightix.example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])
  const events = [...upcoming, ...past]

  const staticRoutes: MetadataRoute.Sitemap = ['', '/about', '/team', '/events', '/sponsors', '/contact'].map((path) => ({
    url: `${BASE_URL}${path}`,
  }))

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    lastModified: event.event_date,
  }))

  return [...staticRoutes, ...eventRoutes]
}
