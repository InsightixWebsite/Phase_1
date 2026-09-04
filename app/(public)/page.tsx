import Link from 'next/link'
import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { Hero } from '@/components/home/Hero'

export default async function HomePage() {
  const [content, recentEvents] = await Promise.all([getHomeContent(), getRecentEvents(3)])

  return (
    <main>
      <Hero introText={content.intro_text} bannerUrl={content.banner_media_url} bannerType={content.banner_media_type} />
      <section className="px-6 py-16">
        <h2 className="font-display text-2xl font-bold">Recent Events</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {recentEvents.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.slug}`} className="block rounded border border-neutral-800 p-4 hover:border-brand-accent">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-neutral-400">{event.event_date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
