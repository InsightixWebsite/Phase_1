import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EventCard } from '@/components/ui/EventCard'
import { EventsFilter } from '@/components/events/EventsFilter'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'Events & Competitions' }

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])
  const [featuredEvent, ...restUpcoming] = upcoming

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="— EVENTS"
        title="Learn. Build. Network."
        subtitle="From workshops to speaker sessions, we host events that spark curiosity and turn learning into real-world skills."
      />

      {featuredEvent && (
        <RevealSection className="mt-10">
          <EventCard event={featuredEvent} variant="featured" />
        </RevealSection>
      )}

      <RevealSection className="mt-16">
        <EventsFilter upcoming={restUpcoming} past={past} />
      </RevealSection>
    </main>
  )
}
