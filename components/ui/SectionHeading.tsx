interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left', className }: SectionHeadingProps) {
  const alignClasses = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  return (
    <div className={`flex flex-col gap-3 ${alignClasses} ${className ?? ''}`.trim()}>
      {eyebrow && (
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
          <span className="h-px w-6 bg-brand-accent" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="max-w-2xl text-brand-muted">{subtitle}</p>}
    </div>
  )
}
