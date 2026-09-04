import { getSiteSettings } from '@/lib/queries/siteSettings'

export const metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Contact Us</h1>
      <dl className="mt-8 flex flex-col gap-6">
        {settings.contact_email && (
          <div>
            <dt className="text-sm text-neutral-500">Email</dt>
            <dd><a href={`mailto:${settings.contact_email}`} className="text-brand-accent">{settings.contact_email}</a></dd>
          </div>
        )}
        {settings.whatsapp_number && (
          <div>
            <dt className="text-sm text-neutral-500">WhatsApp</dt>
            <dd>{settings.whatsapp_number}</dd>
          </div>
        )}
        {settings.phone_number && (
          <div>
            <dt className="text-sm text-neutral-500">Phone</dt>
            <dd>{settings.phone_number}</dd>
          </div>
        )}
        {settings.college_address && (
          <div>
            <dt className="text-sm text-neutral-500">Address</dt>
            <dd>{settings.college_address}</dd>
          </div>
        )}
        {socialEntries.length > 0 && (
          <div>
            <dt className="text-sm text-neutral-500">Social</dt>
            <dd className="flex gap-4">
              {socialEntries.map(([platform, url]) => (
                <a key={platform} href={url} className="capitalize text-brand-accent">{platform}</a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </main>
  )
}
