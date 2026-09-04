'use client'

import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

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

export function Hero({ introText, bannerUrl, bannerType }: HeroProps) {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {bannerUrl && bannerType === 'image' && (
        <img
          src={buildCloudinaryUrl(bannerUrl, { width: 1600 })}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
        />
      )}
      <motion.div variants={container} initial="hidden" animate="show" className="flex max-w-2xl flex-col items-center gap-4">
        <motion.h1 variants={item} className="font-display text-5xl font-bold sm:text-7xl">
          Insight<span className="text-brand-accent">ix</span>
        </motion.h1>
        {introText && (
          <motion.p variants={item} className="text-lg text-neutral-300">
            {introText}
          </motion.p>
        )}
        {bannerUrl && bannerType === 'video' && (
          <motion.iframe
            variants={item}
            src={bannerUrl}
            className="aspect-video w-full max-w-xl rounded"
            allowFullScreen
          />
        )}
      </motion.div>
    </section>
  )
}
