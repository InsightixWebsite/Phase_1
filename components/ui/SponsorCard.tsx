import { buildCloudinaryUrl } from '@/lib/cloudinary'
import type { Sponsor } from '@/lib/supabase/types'

function SponsorCardContent({ sponsor }: { sponsor: Sponsor }) {
  return (
    <>
      <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-3">
        {sponsor.logo_url ? (
          <img
            src={buildCloudinaryUrl(sponsor.logo_url, { width: 240 })}
            alt={sponsor.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="font-display text-sm font-bold text-neutral-500" aria-hidden="true">
            {sponsor.name}
          </span>
        )}
      </div>
      <p className="mt-4 font-display font-bold text-white">{sponsor.name}</p>
      {sponsor.description && <p className="mt-2 text-sm text-brand-muted">{sponsor.description}</p>}
    </>
  )
}

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const cardClasses =
    'flex flex-col rounded-xl border border-brand-border bg-brand-surface p-6 text-center items-center transition hover:-translate-y-1 hover:border-brand-border-hover-neutral'

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`focus-ring ${cardClasses}`}
      >
        <SponsorCardContent sponsor={sponsor} />
      </a>
    )
  }

  return (
    <div className={cardClasses}>
      <SponsorCardContent sponsor={sponsor} />
    </div>
  )
}
