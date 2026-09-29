export interface Stat {
  value: string
  label: string
}

interface StatBarProps {
  eyebrow?: string
  stats: Stat[]
  className?: string
}

export function StatBar({ eyebrow, stats, className }: StatBarProps) {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border border-brand-border bg-brand-surface p-6 sm:flex-row sm:items-center sm:gap-0 ${className ?? ''}`.trim()}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-muted sm:mr-6">{eyebrow}</span>
      )}
      <dl className="grid flex-1 grid-cols-2 gap-6 sm:flex sm:flex-row sm:divide-x sm:divide-brand-border">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 sm:px-6 sm:first:pl-0">
            <dt className="order-2 text-sm text-brand-muted">{stat.label}</dt>
            <dd className="order-1 font-display text-3xl font-bold text-white">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
