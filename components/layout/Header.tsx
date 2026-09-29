import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { NavLinks } from './NavLinks'
import { MobileMenu } from './MobileMenu'

export async function Header() {
  const settings = await getSiteSettings()
  const logoSrc = settings.logo_url ? buildCloudinaryUrl(settings.logo_url, { width: 48 }) : '/logo-mark.png'
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/70 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoSrc} alt="" aria-hidden="true" className="h-9 w-9" />
          <span className="font-display text-lg font-bold">Insightix</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <NavLinks className="flex items-center gap-8" />
          <Link
            href="/contact"
            className="focus-ring rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-accent-hover"
          >
            Join Us
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  )
}
