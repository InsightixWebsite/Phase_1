import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { getActiveSponsors } from '@/lib/queries/sponsors'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { Hero } from '@/components/home/Hero'
import { EventsEditorial } from '@/components/home/EventsEditorial'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { StatBar } from '@/components/ui/StatBar'
import { EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'

// Placeholder — replace with real club figures once available.
const HOME_STATS = [
  { value: '50+', label: 'Members' },
  { value: '10+', label: 'Workshops' },
  { value: '8+', label: 'Projects' },
  { value: '12+', label: 'Sessions' },
]

const WHY_INSIGHTIX = [
  { title: 'Learn', description: 'Hands-on sessions covering analytics tools, from spreadsheets to Python.', Icon: EyeIcon },
  { title: 'Build', description: 'Apply what you learn on real datasets and real projects.', Icon: LayersIcon },
  { title: 'Collaborate', description: 'Work alongside a community of curious, driven students.', Icon: PeopleIcon },
  { title: 'Compete', description: 'Take your skills into hackathons and case competitions.', Icon: TargetIcon },
]

export default async function HomePage() {
  const [content, recentEvents, sponsors] = await Promise.all([
    getHomeContent(),
    getRecentEvents(6),
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

      <RevealSection className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="— WHY INSIGHTIX"
          title="Why Join Insightix"
          align="center"
          className="mx-auto items-center text-center"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_INSIGHTIX.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-brand-border bg-brand-surface p-6 transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-brand-muted">{description}</p>
            </div>
          ))}
        </div>
      </RevealSection>

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
