import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import type { Sponsor } from '@/lib/supabase/types'

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  // brightness-0 + invert flattens any logo (whatever its original colors)
  // into a plain white silhouette -- a monochrome treatment that matches
  // the site's black/white/orange palette regardless of a sponsor's own
  // branding. Hover removes both filters to reveal the logo's true colors.
  const content = sponsor.logo_url ? (
    <img
      src={buildCloudinaryUrl(sponsor.logo_url, { width: 160 })}
      alt={sponsor.name}
      loading="lazy"
      className="max-h-10 max-w-full object-contain opacity-40 brightness-0 invert transition duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
    />
  ) : (
    <span className="text-center text-xs font-semibold uppercase tracking-wide text-brand-muted opacity-50 transition duration-300 group-hover:text-white group-hover:opacity-100">
      {sponsor.name}
    </span>
  )

  const boxClasses =
    'group flex h-20 w-40 shrink-0 items-center justify-center rounded-lg border border-brand-border px-4 transition hover:border-brand-border-hover'

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        title={sponsor.name}
        className={`focus-ring ${boxClasses}`}
      >
        {content}
      </a>
    )
  }

  return (
    <div className={boxClasses} title={sponsor.name}>
      {content}
    </div>
  )
}

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null

  return (
    <RevealSection className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        title="Sponsors & Partners"
        subtitle="Backing ideas. Building opportunities."
        align="center"
        className="mx-auto items-center text-center"
      />
      <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((sponsor) => (
          <SponsorLogo key={sponsor.id} sponsor={sponsor} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <SecondaryButton href="/sponsors">View all partners →</SecondaryButton>
      </div>
    </RevealSection>
  )
}
