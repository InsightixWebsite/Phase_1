import { getSiteSettings } from '@/lib/queries/siteSettings'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { MailIcon, PhoneIcon, ChatIcon, PinIcon } from '@/components/ui/icons'

export const metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  const infoRows = [
    settings.contact_email && {
      label: 'Email',
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
      Icon: MailIcon,
    },
    settings.phone_number && {
      label: 'Phone',
      value: settings.phone_number,
      href: `tel:${settings.phone_number}`,
      Icon: PhoneIcon,
    },
    settings.whatsapp_number && { label: 'WhatsApp', value: settings.whatsapp_number, Icon: ChatIcon },
    settings.college_address && { label: 'Address', value: settings.college_address, Icon: PinIcon },
  ].filter((row): row is { label: string; value: string; href?: string; Icon: typeof MailIcon } => Boolean(row))

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading
        as="h1"
        eyebrow="— GET IN TOUCH"
        title="Let's Build Something Great"
        subtitle="Have a question, an idea, or want to collaborate? Reach out and we'll get back to you."
        align="center"
        className="mx-auto items-center text-center"
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 rounded-xl border border-brand-border bg-brand-surface p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-accent">
              <row.Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{row.label}</p>
              {row.href ? (
                <a href={row.href} className="mt-1 block font-medium text-white hover:text-brand-accent">
                  {row.value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-white">{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {socialEntries.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {socialEntries.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              className="rounded-full border border-brand-border px-4 py-2 text-sm capitalize text-brand-muted hover:border-brand-border-hover hover:text-brand-accent"
            >
              {platform}
            </a>
          ))}
        </div>
      )}

      {settings.contact_email && (
        <div className="mt-12 flex justify-center">
          <PrimaryButton href={`mailto:${settings.contact_email}`}>Join Insightix</PrimaryButton>
        </div>
      )}
    </main>
  )
}
