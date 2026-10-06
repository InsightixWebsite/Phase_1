'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import type { Event } from '@/lib/supabase/types'

const EASE = [0.22, 0.61, 0.36, 1] as const

function formatEventDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Matches md: in tailwind.config -- keeps the breakpoint this section reacts
// to in sync with the rest of the site rather than inventing a new one.
function useIsDesktop(): boolean {
  // Lazy initializer reads the real value on first client render (guarded
  // for SSR, where `window` doesn't exist) -- avoids both an unnecessary
  // setState-in-effect on mount and a one-frame "mobile" flash on desktop.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  )

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return isDesktop
}

interface EventRowProps {
  event: Event
  index: number
  imageOnRight: boolean
}

function EventRow({ event, index, imageOnRight }: EventRowProps) {
  const isDesktop = useIsDesktop()

  // Desktop: large opposing horizontal travel, image and text approach each
  // other from outside the row. Mobile: a much smaller combined vertical +
  // horizontal reveal -- no large horizontal movement, no overflow risk.
  const imageInitial = isDesktop
    ? { opacity: 0.25, x: imageOnRight ? 90 : -90, scale: 1.04 }
    : { opacity: 0.3, y: 36, x: imageOnRight ? 14 : -14, scale: 1.03 }
  const textInitial = isDesktop
    ? { opacity: 0.2, x: imageOnRight ? -60 : 60 }
    : { opacity: 0.25, y: 30, x: imageOnRight ? -12 : 12 }

  const viewport = { once: false, amount: 0.3 } as const
  const transition = { duration: 0.85, ease: EASE }

  const imageBlock = (
    <motion.div
      initial={imageInitial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={viewport}
      transition={transition}
      className="overflow-hidden rounded-xl border border-brand-border md:w-[44%]"
    >
      {event.cover_photo_url ? (
        <img
          src={buildCloudinaryUrl(event.cover_photo_url, { width: 700 })}
          alt={event.title}
          loading="lazy"
          className="aspect-[16/11] w-full object-cover"
        />
      ) : (
        <div
          className="aspect-[16/11] w-full bg-brand-bg"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />
      )}
    </motion.div>
  )

  const textBlock = (
    <motion.div
      initial={textInitial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={viewport}
      transition={transition}
      className="flex flex-col gap-3 md:w-[48%]"
    >
      <span className="font-display text-sm font-bold text-brand-accent">{String(index + 1).padStart(2, '0')}</span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
        {event.type === 'upcoming' ? 'Upcoming' : 'Past'} · {formatEventDate(event.event_date)}
      </span>
      <h3 className="font-display text-2xl font-bold sm:text-3xl">{event.title}</h3>
      {event.description && <p className="line-clamp-2 text-brand-muted">{event.description}</p>}
      <a
        href={`/events/${event.slug}`}
        className="focus-ring mt-1 w-fit text-sm font-semibold text-white transition hover:text-brand-accent"
      >
        View event →
      </a>
    </motion.div>
  )

  return (
    <div className={`flex flex-col gap-6 md:items-center md:gap-10 ${imageOnRight ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
      {imageBlock}
      {textBlock}
    </div>
  )
}

export function EventsEditorial({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <div>
        <SectionHeading
          eyebrow="— EVENTS"
          title="A Glimpse of What We've Been Up To"
          subtitle="Workshops, competitions, speaker sessions and hands-on learning experiences from the community."
        />
        <p className="mt-8 text-brand-muted">No events yet — check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="— EVENTS"
          title="A Glimpse of What We've Been Up To"
          subtitle="Workshops, competitions, speaker sessions and hands-on learning experiences from the community."
        />
        <SecondaryButton href="/events">View All Events</SecondaryButton>
      </div>
      <div className="mt-16 flex flex-col gap-20 md:gap-28">
        {events.map((event, index) => (
          <EventRow key={event.id} event={event} index={index} imageOnRight={index % 2 === 1} />
        ))}
      </div>
    </div>
  )
}
