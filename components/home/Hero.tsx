'use client'

import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { ChartIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'
import { ParticleGlobe } from './ParticleGlobe'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface HeroProps {
  introText: string | null
  bannerUrl: string | null
  bannerType: 'image' | 'video' | null
}

const FEATURES = [
  { label: 'Workshops', description: 'Learn by doing', Icon: LayersIcon },
  { label: 'Projects', description: 'Apply knowledge', Icon: ChartIcon },
  { label: 'Community', description: 'Grow together', Icon: PeopleIcon },
  { label: 'Real Impact', description: 'Turn ideas into solutions', Icon: TargetIcon },
]

export function Hero({ introText, bannerUrl, bannerType }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.span
            variants={item}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent"
          >
            <span className="h-px w-6 bg-brand-accent" aria-hidden="true" />
            IMT Hyderabad Analytics Club
          </motion.span>
          <motion.h1 variants={item} className="font-display text-5xl font-bold sm:text-7xl">
            Insight<span className="text-brand-accent">ix</span>
          </motion.h1>
          {introText && (
            <motion.p variants={item} className="max-w-md text-lg text-brand-muted">
              {introText}
            </motion.p>
          )}
          {bannerUrl && bannerType === 'video' && (
            <motion.iframe variants={item} src={bannerUrl} className="aspect-video w-full max-w-xl rounded-lg" allowFullScreen />
          )}
          {bannerUrl && bannerType === 'image' && (
            <motion.img
              variants={item}
              src={buildCloudinaryUrl(bannerUrl, { width: 800 })}
              alt=""
              className="w-full max-w-md rounded-lg"
            />
          )}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <PrimaryButton href="/events">Explore Events →</PrimaryButton>
            <SecondaryButton href="/about">Learn More</SecondaryButton>
          </motion.div>
          <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FEATURES.map(({ label, description, Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-brand-muted">{description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <ParticleGlobe />
      </div>
    </section>
  )
}
