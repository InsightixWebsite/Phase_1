import Link from 'next/link'
import { getAllEventsForAdmin } from '@/lib/queries/events'
import { archiveEvent } from './actions'

export default async function EventsListPage() {
  const events = await getAllEventsForAdmin()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Events</h1>
        <Link href="/admin/events/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add event</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={e.is_active ? '' : 'text-neutral-500 line-through'}>
              {e.title} — {e.event_date} ({e.type})
            </span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/events/${e.id}`} className="text-brand-accent">Edit</Link>
              {e.is_active && (
                <form action={archiveEvent.bind(null, e.id)}>
                  <button type="submit" className="text-neutral-400">Archive</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
