import type { CSSProperties } from 'react'
import { generateGlobePoints } from '@/lib/particleGlobe'
import { ChartIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'

const POINTS = generateGlobePoints({ rings: 7, pointsPerRing: 16, maxRadius: 120 })

const BADGES = [
  { label: 'Data', Icon: ChartIcon, style: { top: '6%', left: '-6%' }, delay: '0s' },
  { label: 'People', Icon: PeopleIcon, style: { top: '42%', right: '-10%' }, delay: '1.2s' },
  { label: 'Impact', Icon: TargetIcon, style: { bottom: '2%', left: '20%' }, delay: '2.4s' },
] as const

export function ParticleGlobe() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm" aria-hidden="true">
      <svg viewBox="-130 -130 260 260" className="h-full w-full">
        {/* Both rings stay fully static -- only the dots move. */}
        <ellipse cx="0" cy="0" rx="118" ry="46" fill="none" stroke="rgba(255,122,0,0.25)" strokeWidth={1} />
        <ellipse cx="0" cy="0" rx="90" ry="118" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        {/*
         * Each dot sweeps horizontally back and forth through its own
         * mirror position (from +x to -x and back), so its travel is
         * centered on the vertical axis and never exceeds the width it
         * already sits within -- which keeps every dot's motion inside the
         * orange ellipse's own radius (118), since no generated point's x
         * exceeds that. A plain per-dot CSS transform animation (--orbit-x
         * set once via inline style, the @keyframes lives in
         * app/globals.css) -- GPU-composited, no JS/rAF loop driving 112
         * elements every frame. Delays are staggered by index so the field
         * drifts rather than moving as one rigid block. Respects
         * prefers-reduced-motion through the existing global rule.
         */}
        {POINTS.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.r}
            fill="#FF7A00"
            opacity={point.opacity}
            style={
              {
                '--orbit-x': `${-2 * point.x}px`,
                animationDelay: `${(i % 9) * 0.35}s`,
              } as CSSProperties
            }
            className="[animation:orbit-dot_7s_ease-in-out_infinite_alternate]"
          />
        ))}
      </svg>
      {BADGES.map(({ label, Icon, style, delay }) => (
        <div
          key={label}
          style={{ ...style, animationDelay: delay }}
          className="absolute flex items-center gap-2 rounded-full border border-brand-border bg-brand-bg/90 px-3 py-1.5 text-xs font-medium text-white shadow-lg [animation:float_6s_ease-in-out_infinite]"
        >
          <Icon className="h-4 w-4 text-brand-accent" />
          {label}
        </div>
      ))}
    </div>
  )
}
