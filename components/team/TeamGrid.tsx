import { buildCloudinaryUrl } from '@/lib/cloudinary'
import type { TeamMember } from '@/lib/supabase/types'

const CATEGORY_LABELS: Record<TeamMember['category'], string> = {
  core: 'Core Committee',
  faculty: 'Faculty Coordinators',
  senior: 'Senior Team',
  junior: 'Junior Team',
}

export function TeamGrid({ members }: { members: TeamMember[] }) {
  const grouped = (['core', 'faculty', 'senior', 'junior'] as const).map((category) => ({
    category,
    members: members.filter((m) => m.category === category),
  }))

  return (
    <>
      {grouped.map(({ category, members }) =>
        members.length > 0 ? (
          <div key={category} className="mt-12">
            <h2 className="font-display text-2xl font-bold">{CATEGORY_LABELS[category]}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {members.map((member) => (
                <div key={member.id} className="rounded border border-neutral-800 p-4 text-center">
                  {member.photo_url && (
                    <img
                      src={buildCloudinaryUrl(member.photo_url, { width: 200 })}
                      alt={member.name}
                      className="mx-auto h-24 w-24 rounded-full object-cover"
                    />
                  )}
                  <p className="mt-3 font-semibold">{member.name}</p>
                  <p className="text-sm text-neutral-400">{member.role}</p>
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} className="mt-2 inline-block text-sm text-brand-accent">
                      LinkedIn
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </>
  )
}
