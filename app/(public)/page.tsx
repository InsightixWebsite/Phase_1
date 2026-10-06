import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { getActiveSponsors } from '@/lib/queries/sponsors'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { Hero } from '@/components/home/Hero'
import { EventsEditorial } from '@/components/home/EventsEditorial'
import { WhyInsightixStack } from '@/components/home/WhyInsightixStack'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
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

      {sponsors.length > 0 && (
        <RevealSection className="mx-auto max-w-6xl px-6 py-16">
          <SectionHeading eyebrow="— OUR SPONSORS" title="Our Sponsors" align="center" className="mx-auto items-center text-center" />
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-white p-2">
                  {sponsor.logo_url ? (
                    <img
                      src={buildCloudinaryUrl(sponsor.logo_url, { width: 160 })}
                      alt={sponsor.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-center text-xs font-semibold text-neutral-500">{sponsor.name}</span>
                  )}
                </div>
                <span className="text-xs text-brand-muted">{sponsor.name}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <SecondaryButton href="/sponsors">View All Sponsors</SecondaryButton>
          </div>
        </RevealSection>
      )}
    </main>
  )
}
