import { getActiveSponsors } from '@/lib/queries/sponsors'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SponsorCard } from '@/components/ui/SponsorCard'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'Sponsors & Partners' }

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsors()

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        as="h1"
        eyebrow="— SPONSORS"
        title="Our Sponsors & Partners"
        subtitle="The companies and organizations that make our events possible."
      />

      <RevealSection className="mt-12">
        {sponsors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <p className="text-brand-muted">No sponsors listed yet — check back soon.</p>
        )}
      </RevealSection>
    </main>
  )
}
