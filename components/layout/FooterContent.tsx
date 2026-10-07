'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { SiteSettings } from '@/lib/supabase/types'

const EASE = [0.22, 0.61, 0.36, 1] as const

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Sponsors', href: '/sponsors' },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const riseVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}
const dividerVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
}

export function FooterContent({ settings }: { settings: SiteSettings }) {
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      // Nearly-opaque, not fully solid -- the page's fixed grid background
      // sits behind the footer same as everywhere else; this mutes it to a
      // faint trace instead of letting it compete with the footer content,
      // without fully erasing it (the grid stays a recognizable identity
      // element even here).
      className="bg-[rgba(11,11,11,0.92)] px-6 pt-20 pb-9 text-sm"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1.3fr_0.8fr_0.9fr] md:gap-8">
          <motion.div variants={riseVariants}>
            <div className="flex items-center gap-2">
              <img src="/logo-mark.png" alt="" className="h-7 w-7" aria-hidden="true" />
              <span className="font-display text-lg font-bold text-white">Insightix</span>
            </div>
            {settings.tagline && (
              <p className="mt-6 max-w-sm font-display text-4xl font-bold leading-[1.05] text-white sm:text-5xl">
                {settings.tagline}
              </p>
            )}
          </motion.div>

          <motion.nav variants={riseVariants} aria-label="Footer" className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Explore</span>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring w-fit text-brand-muted transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>

          <motion.div variants={riseVariants} className="flex flex-col gap-8">
            {socialEntries.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Connect</span>
                {socialEntries.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group focus-ring inline-flex w-fit items-center gap-1 capitalize text-brand-muted transition-colors duration-300 hover:text-white"
                  >
                    {platform}
                    <span
                      className="text-brand-accent transition-transform duration-300 group-hover:translate-x-[3px]"
                      aria-hidden="true"
                    >
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            )}
            {settings.contact_email && (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted">Contact</span>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="focus-ring w-fit text-brand-muted transition-colors duration-300 hover:text-white"
                >
                  {settings.contact_email}
                </a>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div
          variants={dividerVariants}
          style={{ transformOrigin: 'left' }}
          className="mt-14 h-px w-full bg-white/[0.08]"
        />

        <div className="mt-6 flex flex-col gap-1 text-xs text-brand-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Insightix. All rights reserved.</span>
          <span>IMT Hyderabad</span>
        </div>
      </div>
    </motion.footer>
  )
}
