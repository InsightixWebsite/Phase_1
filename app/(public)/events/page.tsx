import Link from 'next/link'
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'

export const metadata = { title: 'Events & Competitions' }

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Events & Competitions</h1>

      <h2 className="mt-10 font-display text-2xl font-bold text-brand-accent">Upcoming</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {upcoming.map((event) => (
          <li key={event.id} className="rounded border border-neutral-800 p-4">
            <Link href={`/events/${event.slug}`} className="font-semibold hover:text-brand-accent">
              {event.title}
            </Link>
            <p className="text-sm text-neutral-400">{event.event_date}</p>
            {event.registration_url && (
              <a
                href={event.registration_url}
                className="mt-2 inline-block rounded bg-amber-500 px-3 py-1 text-sm font-semibold text-black"
              >
                Register
              </a>
            )}
          </li>
        ))}
        {upcoming.length === 0 && <p className="text-neutral-500">No upcoming events right now — check back soon.</p>}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-bold text-brand-accent">Past</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {past.map((event) => (
          <li key={event.id} className="rounded border border-neutral-800 p-4">
            <Link href={`/events/${event.slug}`} className="font-semibold hover:text-brand-accent">
              {event.title}
            </Link>
            <p className="text-sm text-neutral-400">{event.event_date}</p>
          </li>
        ))}
        {past.length === 0 && <p className="text-neutral-500">No past events yet.</p>}
      </ul>
    </main>
  )
}
