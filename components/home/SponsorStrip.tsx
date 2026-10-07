'use client'

import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Sponsor } from '@/lib/supabase/types'

const EASE = [0.22, 0.61, 0.36, 1] as const

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const riseVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  // Real uploaded logos are rarely transparent cutouts -- most are flat
  // JPG/PNG files with their own solid white or light background. An
  // invert-to-silhouette filter assumes transparency and, on an opaque
  // logo, flattens the ENTIRE rectangle to a plain white block (the "weird
  // blob" bug). A plain grayscale filter has no such assumption: it only
  // desaturates, so an opaque logo's own light background stays light and
  // its mark/text stays legible at whatever contrast the source art has.
  // The soft white plate behind it (no border, no shadow) is what actually
  // makes this format-agnostic: a white-background logo blends into it
  // seamlessly, and a transparent one gets a clean plinth to sit on --
  // either way nothing reads as "a broken box."
  const content = sponsor.logo_url ? (
    <img
      src={buildCloudinaryUrl(sponsor.logo_url, { width: 200 })}
      alt={sponsor.name}
      loading="lazy"
      className="max-h-8 w-auto max-w-[120px] object-contain opacity-90 grayscale transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0"
    />
  ) : (
    <span className="text-sm font-semibold uppercase tracking-wide text-brand-muted transition-colors duration-300 group-hover:text-brand-accent">
      {sponsor.name}
    </span>
  )

  const plateClasses = sponsor.logo_url
    ? 'rounded-lg bg-white/90 px-5 py-3 group-hover:bg-white'
    : 'rounded-lg border border-brand-border bg-brand-surface px-5 py-3'

  const inner = (
    <span
      className={`group inline-flex items-center justify-center border-b border-transparent transition-all duration-300 hover:-translate-y-[3px] hover:scale-[1.02] hover:border-brand-accent/50 ${plateClasses}`}
    >
      {content}
    </span>
  )

  if (sponsor.website_url) {
    return (
      <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" title={sponsor.name} className="focus-ring">
        {inner}
      </a>
    )
  }

  return <div title={sponsor.name}>{inner}</div>
}

export function SponsorStrip({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.2 }}
      variants={containerVariants}
      className="mx-auto max-w-6xl px-6 py-16"
    >
      <motion.div variants={riseVariants}>
        <SectionHeading
          eyebrow="— PARTNERSHIPS"
          title="Sponsors & Partners"
          subtitle="Backing ideas. Building opportunities."
          subtitleClassName="text-brand-accent"
        />
      </motion.div>

      {/*
       * A plain responsive grid, not a row of cards -- each logo gets
       * generous whitespace instead of a bordered box. 2 per row on
       * mobile, 3 on tablet, 6 on desktop, per the brief.
       */}
      <motion.div
        variants={containerVariants}
        className="mt-14 grid grid-cols-2 place-items-center gap-x-10 gap-y-10 sm:grid-cols-3 sm:gap-x-12 lg:grid-cols-6"
      >
        {sponsors.map((sponsor) => (
          <motion.div key={sponsor.id} variants={riseVariants}>
            <SponsorLogo sponsor={sponsor} />
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-10 flex justify-center">
        <a href="/sponsors" className="focus-ring text-sm font-semibold text-white transition hover:text-brand-accent">
          View all partners →
        </a>
      </div>
    </motion.section>
  )
}
