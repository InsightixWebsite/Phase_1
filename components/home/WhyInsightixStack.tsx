import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'

const STAGES = [
  { title: 'Learn', description: 'Hands-on sessions covering analytics tools, from spreadsheets to Python.', Icon: EyeIcon },
  { title: 'Build', description: 'Apply what you learn on real datasets and real projects.', Icon: LayersIcon },
  { title: 'Collaborate', description: 'Work alongside a community of curious, driven students.', Icon: PeopleIcon },
  { title: 'Compete', description: 'Take your skills into hackathons and case competitions.', Icon: TargetIcon },
] as const

export function WhyInsightixStack() {
  return (
    <RevealSection className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="— WHY INSIGHTIX"
        title="Why Join Insightix"
        subtitle="Four stages of what being part of the club actually looks like."
        align="center"
        className="mx-auto items-center text-center"
      />

      {/* Stage rail -- a visual index only, not interactive tabs. */}
      <div className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-4">
        {STAGES.map((stage, i) => (
          <div
            key={stage.title}
            className="flex items-center justify-center gap-2 rounded-full border border-brand-border px-3 py-2 text-xs font-medium text-brand-muted"
          >
            <span className="font-display font-bold text-brand-accent">{String(i + 1).padStart(2, '0')}</span>
            {stage.title}
          </div>
        ))}
      </div>

      {/*
       * Sticky card stack. Pure CSS: each card is `position: sticky` at an
       * increasing `top` offset (via the --stack-* custom properties on
       * .why-stack, defined in app/globals.css with a mobile/desktop
       * split), inside a "slot" whose height gives enough scroll distance
       * to read one stage before the next card rises to cover it. No JS
       * drives the stacking -- native scroll + sticky positioning only,
       * exactly as specced. Reduced-motion is unaffected since this isn't
       * a Framer Motion / transform-based animation, just layout.
       */}
      <div className="why-stack relative mt-16">
        {STAGES.map((stage, i) => {
          const isLast = i === STAGES.length - 1
          // A slot must be taller than the card itself -- the extra height
          // beyond --stack-card-height is the scroll distance the card
          // dwells in its stuck position before the next slot begins. The
          // last slot gets a second helping of that dwell distance so the
          // final card has room to rest before the section releases.
          const slotHeight = isLast
            ? 'calc(var(--stack-card-height) + 2 * var(--stack-gap))'
            : 'calc(var(--stack-card-height) + var(--stack-gap))'
          return (
            <div key={stage.title} style={{ height: slotHeight }}>
              <div
                style={{
                  position: 'sticky',
                  top: `calc(var(--stack-top) + ${i} * var(--stack-step))`,
                  zIndex: i + 1,
                  height: 'var(--stack-card-height)',
                }}
                className="flex flex-col overflow-hidden rounded-xl border border-brand-border bg-brand-surface"
              >
                {/*
                 * Height is pinned to --stack-step on purpose: that's also
                 * the vertical offset between consecutive cards, so each
                 * earlier card's peek reveals exactly this header strip,
                 * cropped cleanly at its own bottom border -- never a
                 * partial slice of whatever sits below it.
                 */}
                <div
                  style={{ height: 'var(--stack-step)' }}
                  className="flex shrink-0 items-center gap-3 border-b border-brand-border bg-white/[0.04] px-6"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                    <stage.Icon className="h-4 w-4" />
                  </span>
                  <span className="font-display text-sm font-bold text-brand-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-lg font-bold">{stage.title}</h3>
                </div>
                <div className="flex flex-1 flex-col justify-center px-6 py-8">
                  <p className="max-w-md text-brand-muted">{stage.description}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </RevealSection>
  )
}
