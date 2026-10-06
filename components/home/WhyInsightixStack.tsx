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
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/*
       * The heading/rail get RevealSection's entrance fade -- fine, since
       * nothing sticky lives inside it. The card stack below is
       * deliberately OUTSIDE RevealSection: Framer Motion animates that
       * wrapper via a CSS `transform` (even at rest it leaves
       * `transform: translateY(0px)` on the element, not `none`), and a
       * `transform` on ANY ancestor creates a new containing block that
       * silently breaks `position: sticky` for every descendant. That was
       * the actual bug -- the cards were never sticking at all.
       */}
      <RevealSection>
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
      </RevealSection>

      {/*
       * Sticky card stack. Pure CSS: each card is `position: sticky` at an
       * increasing `top` offset (via the --stack-* custom properties on
       * .why-stack, defined in app/globals.css with a mobile/desktop
       * split), inside a "slot" whose height gives enough scroll distance
       * to read one stage before the next card rises to cover it. No JS
       * drives the stacking -- native scroll + sticky positioning only.
       */}
      <div className="why-stack relative mt-16">
        {STAGES.map((stage, i) => {
          // How long a sticky card stays visibly stuck is governed by its
          // own slot's height alone -- and because every card's `top`
          // increases by the SAME --stack-step, any two consecutive cards'
          // stuck windows only ever overlap by exactly one --stack-step,
          // no matter how tall you make an individual slot. The only way
          // for EARLIER cards to still be pinned once the LAST card has
          // settled (so the final view shows all of them fanned together,
          // matching the reference) is for every card to release at the
          // same scroll position -- which forces every slot except the
          // first down to exactly --stack-step, with all of the dwell
          // time concentrated in the first card's slot instead.
          const slotHeight =
            i === 0 ? 'calc(var(--stack-card-height) + 3 * var(--stack-gap))' : 'var(--stack-step)'
          // Layers back from the front card (0 = frontmost/widest, fixed
          // per card rather than tracked dynamically against scroll --
          // every card's own depth in the final stack never changes).
          // This inset on both sides is what makes the stack actually
          // read as a 3D fan rather than flat cards offset only vertically.
          const layersBack = STAGES.length - 1 - i
          return (
            <div key={stage.title} style={{ height: slotHeight }}>
              <div
                style={{
                  position: 'sticky',
                  top: `calc(var(--stack-top) + ${i} * var(--stack-step))`,
                  zIndex: i + 1,
                  height: 'var(--stack-card-height)',
                  marginInline: `calc(${layersBack} * var(--stack-inset))`,
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
    </div>
  )
}
