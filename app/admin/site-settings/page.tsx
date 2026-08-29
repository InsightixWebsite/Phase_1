import { getSiteSettings } from '@/lib/queries/siteSettings'
import { SiteSettingsForm } from './SiteSettingsForm'

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Site Settings</h1>
      <SiteSettingsForm initial={settings} />
    </div>
  )
}
