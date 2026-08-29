import Link from 'next/link'
import { getAllTeamMembers } from '@/lib/queries/teamMembers'
import { archiveTeamMember } from './actions'

export default async function TeamListPage() {
  const members = await getAllTeamMembers()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Team Members</h1>
        <Link href="/admin/team/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add member</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={m.is_active ? '' : 'text-neutral-500 line-through'}>
              {m.name} — {m.role} ({m.category})
            </span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/team/${m.id}`} className="text-brand-accent">Edit</Link>
              {m.is_active && (
                <form action={archiveTeamMember.bind(null, m.id)}>
                  <button type="submit" className="text-neutral-400">Archive</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
