import { getAboutContent } from '@/lib/queries/aboutContent'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'About Us' }

export default async function AboutPage() {
  const content = await getAboutContent()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">About Insightix</h1>
      {content.vision && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Vision</h2>
          <p className="mt-2 text-neutral-300">{content.vision}</p>
        </RevealSection>
      )}
      {content.mission && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Mission</h2>
          <p className="mt-2 text-neutral-300">{content.mission}</p>
        </RevealSection>
      )}
      {content.history && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">History</h2>
          <p className="mt-2 text-neutral-300">{content.history}</p>
        </RevealSection>
      )}
      {content.objectives && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Objectives</h2>
          <p className="mt-2 text-neutral-300">{content.objectives}</p>
        </RevealSection>
      )}
      {content.faculty_message && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">A Message from Our Faculty Mentor</h2>
          <p className="mt-2 text-neutral-300">{content.faculty_message}</p>
        </RevealSection>
      )}
    </main>
  )
}
