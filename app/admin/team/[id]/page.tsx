import { getTeamMemberById } from '@/lib/queries/teamMembers'
import { TeamMemberForm } from '../TeamMemberForm'
import { updateTeamMember } from '../actions'

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const member = await getTeamMemberById(id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Team Member</h1>
      <TeamMemberForm initial={member} action={updateTeamMember.bind(null, id)} />
    </div>
  )
}
