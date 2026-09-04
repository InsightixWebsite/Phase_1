import { getActiveTeamMembers } from '@/lib/queries/teamMembers'
import { TeamGrid } from '@/components/team/TeamGrid'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const members = await getActiveTeamMembers()
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Our Team</h1>
      <TeamGrid members={members} />
    </main>
  )
}
