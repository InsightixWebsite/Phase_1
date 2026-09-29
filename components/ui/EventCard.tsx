import Link from 'next/link'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import type { Event } from '@/lib/supabase/types'
import { PrimaryButton } from './PrimaryButton'

function formatEventDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface EventCardProps {
  event: Event
  variant?: 'featured' | 'compact'
}

export function EventCard({ event, variant = 'compact' }: EventCardProps) {
  const statusLabel = event.type === 'upcoming' ? 'Upcoming' : 'Past'

  if (variant === 'featured') {
    return (
      <div className="grid gap-8 overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-8 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
            Featured Event
          </span>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">{event.title}</h3>
          <p className="text-sm text-brand-muted">{formatEventDate(event.event_date)}</p>
          {event.description && <p className="text-brand-muted">{event.description}</p>}
          {event.registration_url && (
            <PrimaryButton href={event.registration_url} className="w-fit">
              Register Now
            </PrimaryButton>
          )}
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg border border-brand-border">
          {event.cover_photo_url ? (
            <img
              src={buildCloudinaryUrl(event.cover_photo_url, { width: 800 })}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-brand-bg"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-brand-border bg-brand-surface p-5 transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]"
    >
      <span className="w-fit rounded-full border border-brand-border px-2.5 py-0.5 text-xs font-medium text-brand-muted">
        {statusLabel}
      </span>
      <h3 className="font-display font-semibold text-white group-hover:text-brand-accent">{event.title}</h3>
      <p className="text-sm text-brand-muted">{formatEventDate(event.event_date)}</p>
    </Link>
  )
}
