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
      <div style={{ perspective: '900px' }} className="h-full w-full">
        {/*
         * Spins the whole flat dot+ring graphic around its vertical (Y)
         * axis in 3D -- the plane squashes edge-on and reveals again right
         * along the wide orange ellipse's own horizontal profile, reading
         * as a globe turning on its axis rather than a flat disc spinning
         * to face the viewer. Plain CSS 3D transform on a <div> (not the
         * SVG itself -- 3D transforms on SVG internals are inconsistently
         * supported across browsers) -- GPU-composited, no JS/rAF loop, no
         * per-frame re-render of the 112 points. Respects
         * prefers-reduced-motion through the existing global rule in
         * app/globals.css.
         */}
        <div
          style={{ transformStyle: 'preserve-3d' }}
          className="h-full w-full [animation:spin_16s_linear_infinite]"
        >
          <svg viewBox="-130 -130 260 260" className="h-full w-full">
            <ellipse cx="0" cy="0" rx="118" ry="46" fill="none" stroke="rgba(255,122,0,0.25)" strokeWidth={1} />
            <ellipse cx="0" cy="0" rx="90" ry="118" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
            {POINTS.map((point, i) => (
              <circle key={i} cx={point.x} cy={point.y} r={point.r} fill="#FF7A00" opacity={point.opacity} />
            ))}
          </svg>
        </div>
      </div>
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
