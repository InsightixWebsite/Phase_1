import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { getInitials } from '@/lib/initials'
import type { TeamMember } from '@/lib/supabase/types'
import { LinkedInIcon } from './icons'

// No card, no inner box -- this sits directly inside a grouped panel cell
// (see TeamGrid), separated from its neighbors by spacing and a divider
// the panel itself draws, not by a border/background of its own.
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="group flex flex-col items-center gap-3 text-center">
      {member.photo_url ? (
        <img
          src={buildCloudinaryUrl(member.photo_url, { width: 200 })}
          alt={member.name}
          className="h-20 w-20 rounded-full object-cover transition-transform duration-300 group-hover:-translate-y-1"
        />
      ) : (
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-lg font-semibold text-brand-accent transition-transform duration-300 group-hover:-translate-y-1"
          aria-hidden="true"
        >
          {getInitials(member.name)}
        </div>
      )}
      <div>
        <p className="font-semibold text-white/90 transition-colors duration-300 group-hover:text-white">{member.name}</p>
        <p className="text-sm text-brand-muted transition-colors duration-300 group-hover:text-brand-accent">{member.role}</p>
      </div>
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="focus-ring mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-muted transition-colors duration-300 hover:text-brand-accent"
        >
          <LinkedInIcon className="h-3.5 w-3.5" />
          LinkedIn ↗
        </a>
      )}
    </div>
  )
}
