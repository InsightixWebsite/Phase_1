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
  // brightness-0 + invert flattens any logo into a plain white silhouette --
  // "monochrome like our theme" -- but at near-full opacity by default (not
  // faded) so the wall reads as present and legible at rest, not disabled.
  // Hover lifts the mark, reveals its true colors, and adds a restrained
  // accent underline -- no card, no glow, no scale beyond a hair over 1x.
  const content = sponsor.logo_url ? (
    <img
      src={buildCloudinaryUrl(sponsor.logo_url, { width: 200 })}
      alt={sponsor.name}
      loading="lazy"
      className="max-h-9 w-auto max-w-[140px] object-contain opacity-85 brightness-0 invert transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
    />
  ) : (
    <span className="text-sm font-semibold uppercase tracking-wide text-white/85 transition-colors duration-300 group-hover:text-brand-accent">
      {sponsor.name}
    </span>
  )

  const inner = (
    <span className="group inline-flex items-center justify-center border-b border-transparent pb-1.5 transition-all duration-300 hover:-translate-y-[3px] hover:scale-[1.02] hover:border-brand-accent/50">
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
          title="Sponsors & Partners"
          subtitle="Backing ideas. Building opportunities."
          align="center"
          className="mx-auto items-center text-center"
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
