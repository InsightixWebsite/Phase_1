import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { getInitials } from '@/lib/initials'
import type { TeamMember } from '@/lib/supabase/types'
import { LinkedInIcon } from './icons'

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-brand-surface p-6 text-center transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]">
      {member.photo_url ? (
        <img
          src={buildCloudinaryUrl(member.photo_url, { width: 200 })}
          alt={member.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-bg text-lg font-semibold text-brand-accent"
          aria-hidden="true"
        >
          {getInitials(member.name)}
        </div>
      )}
      <div>
        <p className="font-semibold text-white">{member.name}</p>
        <p className="text-sm text-brand-accent">{member.role}</p>
      </div>
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="focus-ring mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-brand-muted transition hover:border-brand-border-hover hover:text-brand-accent"
        >
          <LinkedInIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
