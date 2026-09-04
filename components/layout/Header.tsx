import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

export async function Header() {
  const settings = await getSiteSettings()
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        {settings.logo_url && (
          <img src={buildCloudinaryUrl(settings.logo_url, { width: 48 })} alt="Insightix logo" className="h-10 w-10 rounded-full" />
        )}
        <span className="font-display text-lg font-bold">Insightix</span>
      </Link>
      <nav className="flex gap-6 text-sm">
        <Link href="/about">About</Link>
        <Link href="/team">Team</Link>
        <Link href="/events">Events</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  )
}
