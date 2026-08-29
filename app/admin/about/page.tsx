import { getAboutContent } from '@/lib/queries/aboutContent'
import { AboutContentForm } from './AboutContentForm'

export default async function AboutContentPage() {
  const content = await getAboutContent()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">About Page Content</h1>
      <AboutContentForm initial={content} />
    </div>
  )
}
