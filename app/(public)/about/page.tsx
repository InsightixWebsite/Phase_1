import { getAboutContent } from '@/lib/queries/aboutContent'
import { getHomeContent } from '@/lib/queries/homeContent'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { StatBar } from '@/components/ui/StatBar'
import { EyeIcon, TargetIcon } from '@/components/ui/icons'

export const metadata = { title: 'About Us' }

// Placeholder — replace with real club figures once available.
const ABOUT_STATS = [
  { value: '50+', label: 'Members' },
  { value: '10+', label: 'Workshops' },
  { value: '5+', label: 'Industry Speakers' },
]

export default async function AboutPage() {
  const [content, homeContent] = await Promise.all([getAboutContent(), getHomeContent()])

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <SectionHeading
          as="h1"
          eyebrow="— ABOUT US"
          title="About Insightix"
          subtitle="We are the analytics club, creating a platform for students to learn, apply, and grow their data and analytics skills through hands-on sessions, real-world projects, and industry interactions."
        />
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border">
          {homeContent.banner_media_url && homeContent.banner_media_type === 'image' ? (
            <img
              src={buildCloudinaryUrl(homeContent.banner_media_url, { width: 800 })}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-brand-bg"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              aria-hidden="true"
            />
          )}
          <div
            className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent p-6"
            aria-hidden="true"
          >
            <img
              src="/logo-mark.png"
              alt=""
              className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 opacity-25 sm:h-52 sm:w-52"
            />
            <span className="font-display text-2xl font-bold text-white/80">Insightix</span>
            <ul className="flex flex-col gap-1 text-right text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <li>People</li>
              <li>Ideas</li>
              <li>Data</li>
              <li>Impact</li>
            </ul>
          </div>
        </div>
      </div>

      <RevealSection className="mt-12">
        <StatBar eyebrow="— OUR IMPACT" stats={ABOUT_STATS} />
      </RevealSection>

      {(content.mission || content.vision) && (
        <RevealSection className="mt-12 grid gap-6 sm:grid-cols-2">
          {content.mission && (
            <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <TargetIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Our Mission</h2>
              <p className="mt-2 text-brand-muted">{content.mission}</p>
            </div>
          )}
          {content.vision && (
            <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <EyeIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Our Vision</h2>
              <p className="mt-2 text-brand-muted">{content.vision}</p>
            </div>
          )}
        </RevealSection>
      )}

      {content.objectives && (
        <RevealSection className="mt-12">
          <SectionHeading eyebrow="— WHAT WE DO" title="What We Do" />
          <p className="mt-4 max-w-3xl text-brand-muted">{content.objectives}</p>
        </RevealSection>
      )}

      {content.history && (
        <RevealSection className="mt-12">
          <SectionHeading eyebrow="— OUR STORY" title="Our Story" />
          <p className="mt-4 max-w-3xl text-brand-muted">{content.history}</p>
        </RevealSection>
      )}

      {content.faculty_message && (
        <RevealSection className="mt-12 rounded-xl border border-brand-border bg-brand-surface p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            A Message From Our Faculty Mentor
          </p>
          <p className="mt-4 text-lg text-brand-muted">&ldquo;{content.faculty_message}&rdquo;</p>
        </RevealSection>
      )}

      <RevealSection className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-10 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to get involved?</h2>
        <p className="max-w-md text-brand-muted">
          Join a community of students exploring data, analytics, and AI together.
        </p>
        <PrimaryButton href="/contact">Join Insightix</PrimaryButton>
      </RevealSection>
    </main>
  )
}
