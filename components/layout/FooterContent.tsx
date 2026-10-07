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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}
const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, ease: EASE } },
}
const dividerVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.7, ease: EASE } },
}

const navLinkClasses =
  'focus-ring w-fit text-brand-muted transition-[color,transform] duration-200 ease-out hover:translate-x-[3px] hover:text-white'
const labelClasses = 'mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted'

export function FooterContent({ settings }: { settings: SiteSettings }) {
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={containerVariants}
      className="footer-grid px-5 pt-[72px] pb-7 text-sm sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-y-12 md:grid-cols-[minmax(320px,1.4fr)_minmax(160px,.7fr)_minmax(260px,1fr)] md:gap-x-[clamp(48px,7vw,120px)] md:gap-y-0">
          <motion.div variants={riseVariants}>
            <div className="flex items-center gap-2">
              <img src="/logo-mark.png" alt="" className="h-7 w-7" aria-hidden="true" />
              <span className="font-display text-lg font-bold text-white">Insightix</span>
            </div>
            {settings.tagline && (
              <p className="mt-6 max-w-sm text-[clamp(2.5rem,4vw,4.2rem)] font-display font-bold leading-[0.97] tracking-tight text-white">
                {settings.tagline}
              </p>
            )}
          </motion.div>

          <motion.nav variants={riseVariants} aria-label="Footer" className="flex flex-col">
            <span className={labelClasses}>Explore</span>
            <div className="grid gap-3">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={navLinkClasses}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>

          <motion.div variants={riseVariants} className="flex flex-col gap-8">
            {socialEntries.length > 0 && (
              <div className="flex flex-col">
                <span className={labelClasses}>Connect</span>
                <div className="grid gap-3">
                  {socialEntries.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group focus-ring inline-flex w-fit items-center gap-1 capitalize text-brand-muted transition-colors duration-200 ease-out hover:text-white"
                    >
                      {platform}
                      <span
                        className="text-brand-accent transition-transform duration-200 ease-out group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {settings.contact_email && (
              <div className="flex flex-col">
                <span className={labelClasses}>Contact</span>
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="w-fit bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat text-brand-muted transition-[background-size,color] duration-200 ease-out hover:bg-[length:100%_1px] hover:text-white focus-ring"
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
          className="mt-12 h-px w-full bg-white/[0.08]"
        />

        <motion.div
          variants={fadeVariants}
          className="mt-7 flex flex-col gap-1 text-sm text-brand-muted sm:flex-row sm:items-center sm:justify-between"
        >
          <span>© {new Date().getFullYear()} Insightix. All rights reserved.</span>
          <span>IMT Hyderabad</span>
        </motion.div>
      </div>
    </motion.footer>
  )
}
