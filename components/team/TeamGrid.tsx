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

// Internal divider borders for a cell at index `i` in a grid that's 2
// columns on mobile and 4 on sm+. Each cell owns its own top/left border so
// the divider lines up with wherever that cell actually lands at each
// breakpoint -- a plain `divide-x`/`divide-y` on the grid container can't
// do this correctly once the column count changes between breakpoints.
function dividerClasses(i: number): string {
  const mobileRow = Math.floor(i / 2)
  const desktopRow = Math.floor(i / 4)
  const classes: string[] = []
  if (mobileRow > 0) classes.push('border-t')
  if (i % 2 === 1) classes.push('border-l')
  if (desktopRow === 0 && mobileRow > 0) classes.push('sm:border-t-0')
  classes.push(i % 4 !== 0 ? 'sm:border-l' : 'sm:border-l-0')
  return classes.join(' ')
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
            {/*
             * One solid grouped panel instead of a grid of separate bordered
             * cards -- members are visually separated by spacing and a thin
             * internal divider, not by each getting their own box.
             */}
            <div className="mt-6 overflow-hidden rounded-[18px] border border-brand-border bg-brand-surface">
              <div className="grid grid-cols-2 sm:grid-cols-4">
                {members.map((member, i) => (
                  <div key={member.id} className={`border-brand-border px-4 py-8 ${dividerClasses(i)}`}>
                    <TeamCard member={member} />
                  </div>
                ))}
              </div>
            </div>
          </RevealSection>
        ) : null
      )}
    </div>
  )
}
