import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

export async function Footer() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <footer className="border-t border-brand-border px-6 py-12 text-sm text-brand-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="" className="h-7 w-7" aria-hidden="true" />
            <span className="font-display text-lg font-bold text-white">Insightix</span>
          </div>
          {settings.tagline && <p className="mt-2">{settings.tagline}</p>}
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2">
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-accent">
              {settings.contact_email}
            </a>
          )}
          {socialEntries.length > 0 && (
            <div className="flex gap-4">
              {socialEntries.map(([platform, url]) => (
                <a key={platform} href={url} className="capitalize hover:text-brand-accent">
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-brand-border pt-6 text-xs">
        © {new Date().getFullYear()} Insightix. All rights reserved.
      </div>
    </footer>
  )
}
