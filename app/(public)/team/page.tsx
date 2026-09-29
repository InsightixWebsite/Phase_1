import { getActiveTeamMembers } from '@/lib/queries/teamMembers'
import { TeamGrid } from '@/components/team/TeamGrid'
import { SectionHeading } from '@/components/ui/SectionHeading'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const members = await getActiveTeamMembers()
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="— OUR TEAM"
        title="Meet the Team"
        subtitle="A group of passionate students building a stronger analytics community, together."
        align="center"
        className="mx-auto items-center text-center"
      />
      <div className="mt-12">
        <TeamGrid members={members} />
      </div>
    </main>
  )
}
