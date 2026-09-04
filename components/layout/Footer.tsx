import { getSiteSettings } from '@/lib/queries/siteSettings'

export async function Footer() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <footer className="border-t border-neutral-800 px-6 py-8 text-sm text-neutral-400">
      <p>{settings.tagline}</p>
      {settings.contact_email && <p className="mt-2">{settings.contact_email}</p>}
      {settings.college_address && <p className="mt-1">{settings.college_address}</p>}
      {socialEntries.length > 0 && (
        <div className="mt-3 flex gap-4">
          {socialEntries.map(([platform, url]) => (
            <a key={platform} href={url} className="capitalize hover:text-brand-accent">{platform}</a>
          ))}
        </div>
      )}
    </footer>
  )
}
