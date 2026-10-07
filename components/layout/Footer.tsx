import { getSiteSettings } from '@/lib/queries/siteSettings'
import { FooterContent } from './FooterContent'

export async function Footer() {
  const settings = await getSiteSettings()
  return <FooterContent settings={settings} />
}
