import { getHomeContent } from '@/lib/queries/homeContent'
import { HomeContentForm } from './HomeContentForm'

export default async function HomeContentPage() {
  const content = await getHomeContent()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Home Page Content</h1>
      <HomeContentForm initial={content} />
    </div>
  )
}
