import { TeamMemberForm } from '../TeamMemberForm'
import { createTeamMember } from '../actions'

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Team Member</h1>
      <TeamMemberForm action={createTeamMember} />
    </div>
  )
}
