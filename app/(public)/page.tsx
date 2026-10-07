import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { getActiveSponsors } from '@/lib/queries/sponsors'
import { Hero } from '@/components/home/Hero'
import { EventsEditorial } from '@/components/home/EventsEditorial'
import { WhyInsightixStack } from '@/components/home/WhyInsightixStack'
import { SponsorStrip } from '@/components/home/SponsorStrip'
import { RevealSection } from '@/components/RevealSection'
import { StatBar } from '@/components/ui/StatBar'

// Placeholder — replace with real club figures once available.
const HOME_STATS = [
  { value: '50+', label: 'Members' },
  { value: '10+', label: 'Workshops' },
  { value: '8+', label: 'Projects' },
  { value: '12+', label: 'Sessions' },
]

export default async function HomePage() {
  const [content, recentEvents, sponsors] = await Promise.all([
    getHomeContent(),
    getRecentEvents(3),
    getActiveSponsors().catch(() => []),
  ])

  return (
    <main>
      <Hero introText={content.intro_text} bannerUrl={content.banner_media_url} bannerType={content.banner_media_type} />

      <RevealSection className="mx-auto max-w-6xl px-6 py-12">
        <StatBar stats={HOME_STATS} />
      </RevealSection>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <EventsEditorial events={recentEvents} />
      </section>

      <WhyInsightixStack />

      <SponsorStrip sponsors={sponsors} />
    </main>
  )
}
