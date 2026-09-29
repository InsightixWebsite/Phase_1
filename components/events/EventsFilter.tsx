'use client'

import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { EventCard } from '@/components/ui/EventCard'
import { filterEventsByStatus, type EventStatusFilter } from '@/lib/eventsFilter'
import type { Event } from '@/lib/supabase/types'

const FILTERS: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

export function EventsFilter({ upcoming, past }: { upcoming: Event[]; past: Event[] }) {
  const [filter, setFilter] = useState<EventStatusFilter>('all')
  const events = filterEventsByStatus(upcoming, past, filter)

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((option) => (
          <Pill key={option.value} as="button" active={filter === option.value} onClick={() => setFilter(option.value)}>
            {option.label}
          </Pill>
        ))}
      </div>
      {events.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-brand-muted">No events in this category yet.</p>
      )}
    </div>
  )
}
