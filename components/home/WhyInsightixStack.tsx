'use client'

import { useEffect, useRef, useState } from 'react'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'

const STAGES = [
  { title: 'Learn', description: 'Hands-on sessions covering analytics tools, from spreadsheets to Python.', Icon: EyeIcon },
  { title: 'Build', description: 'Apply what you learn on real datasets and real projects.', Icon: LayersIcon },
  { title: 'Collaborate', description: 'Work alongside a community of curious, driven students.', Icon: PeopleIcon },
  { title: 'Compete', description: 'Take your skills into hackathons and case competitions.', Icon: TargetIcon },
] as const

// Identifies which card is currently covering its own sticky trigger line --
// the frontmost ("active") card in the deck. This is detection only, never
// positioning: for each card we collapse the IntersectionObserver root to a
// single horizontal line at the exact viewport y-coordinate that card
// sticks to (--stack-top + i * --header-height), so the card intersects
// that line for precisely as long as position:sticky (applied in the
// markup below) holds it there. CSS does all of the actual layout.
function useActiveStackCard(count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let observers: IntersectionObserver[] = []
    const stuck = new Array(count).fill(false)

    function setup() {
      if (!container) return
      observers.forEach((observer) => observer.disconnect())
      observers = []

      const style = getComputedStyle(container)
      const top = parseFloat(style.getPropertyValue('--stack-top'))
      const headerHeight = parseFloat(style.getPropertyValue('--header-height'))
      const viewportHeight = window.innerHeight

      cardRefs.current.forEach((card, i) => {
        if (!card) return
        const triggerY = top + i * headerHeight
        const rootMargin = `${-triggerY}px 0px ${-(viewportHeight - triggerY)}px 0px`
        const observer = new IntersectionObserver(
          ([entry]) => {
            stuck[i] = entry.isIntersecting
            let active = 0
            for (let k = 0; k < count; k++) {
              if (stuck[k]) active = k
            }
            setActiveIndex(active)
          },
          { rootMargin, threshold: 0 }
        )
        observer.observe(card)
        observers.push(observer)
      })
    }

    setup()
    window.addEventListener('resize', setup)
    return () => {
      observers.forEach((observer) => observer.disconnect())
      window.removeEventListener('resize', setup)
    }
  }, [count])

  return { containerRef, cardRefs, activeIndex }
}

export function WhyInsightixStack() {
  const { containerRef, cardRefs, activeIndex } = useActiveStackCard(STAGES.length)

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/*
       * The heading/rail get RevealSection's entrance fade -- fine, since
       * nothing sticky lives inside it. The deck below is deliberately
       * OUTSIDE RevealSection: Framer Motion animates that wrapper via a
       * CSS `transform` (even at rest it leaves `transform: translateY(0px)`
       * on the element, not `none`), and a `transform` on ANY ancestor
       * creates a new containing block that silently breaks
       * `position: sticky` for every descendant.
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

      <div ref={containerRef} className="why-stack relative mt-16">
        {STAGES.map((stage, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={stage.title}
              ref={(el) => {
                cardRefs.current[i] = el
              }}
              style={{
                position: 'sticky',
                top: `calc(var(--stack-top) + ${i} * var(--header-height))`,
                zIndex: i + 1,
                // Release-point compensation, not visible spacing: a sticky
                // card's margin box (not just its border box) counts toward
                // the containing block's bottom boundary, so a bigger `top`
                // makes a card hit that boundary EARLIER than one with a
                // smaller `top` -- without this, card 4 (the largest top)
                // always reaches the boundary first and creeps away while
                // 1-3 are still pinned. Owing each earlier card the header
                // steps it's "ahead" by equalizes every card's effective
                // release point to card 4's, so all four let go together.
                marginBottom: `calc(${STAGES.length - 1 - i} * var(--header-height))`,
              }}
            >
              {/*
               * bg-neutral-900 (solid), not bg-brand-surface (rgba(255,255,
               * 255,0.03), near-transparent) -- multiple cards overlap here
               * and whatever has scrolled up behind the deck; a solid color
               * is what lets the frontmost card actually hide everything
               * behind it, the way an opaque sheet of paper would.
               */}
              <div
                style={{ height: 'var(--stack-card-height)' }}
                className={`flex flex-col overflow-hidden rounded-xl border bg-neutral-900 transition-colors duration-300 ${
                  isActive ? 'border-brand-accent/40' : 'border-brand-border'
                }`}
              >
                {/*
                 * Height is pinned to --header-height on purpose: that's
                 * also the sticky `top` step between consecutive cards, so
                 * each earlier card's peek reveals exactly this header
                 * strip, cropped cleanly at its own bottom border -- never
                 * a partial slice of whatever sits below it.
                 */}
                <div
                  style={{ height: 'var(--header-height)' }}
                  className={`flex shrink-0 items-center gap-3 border-b px-6 transition-colors duration-300 ${
                    isActive ? 'border-brand-accent/30 bg-white/[0.07]' : 'border-brand-border bg-white/[0.04]'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-brand-accent transition-colors duration-300 ${
                      isActive ? 'border-brand-accent/60' : 'border-brand-border'
                    }`}
                  >
                    <stage.Icon className="h-4 w-4" />
                  </span>
                  <span
                    className={`font-display text-sm font-bold transition-colors duration-300 ${
                      isActive ? 'text-brand-accent' : 'text-brand-muted'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-display text-lg font-bold">{stage.title}</h3>
                </div>
                <div className="flex flex-1 flex-col justify-center px-6 py-6">
                  <p className="max-w-md text-brand-muted">{stage.description}</p>
                </div>
              </div>
            </div>
          )
        })}
        {/* Gives the last card the same dwell time every earlier card gets
            "for free" from the next card's approach -- without it, the
            deck's own bottom edge would end exactly where the last card's
            sticky range starts, releasing it immediately. */}
        <div style={{ height: 'var(--stack-end-gap)' }} aria-hidden="true" />
      </div>
    </div>
  )
}
