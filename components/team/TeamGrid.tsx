import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TeamCard } from '@/components/ui/TeamCard'
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
    <div className="flex flex-col gap-16">
      {grouped.map(({ category, members }) =>
        members.length > 0 ? (
          <RevealSection key={category}>
            <SectionHeading title={CATEGORY_LABELS[category]} />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {members.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </RevealSection>
        ) : null
      )}
    </div>
  )
}
