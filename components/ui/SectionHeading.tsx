interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
  as?: 'h1' | 'h2'
}

export function SectionHeading({ eyebrow, title, subtitle, align = 'left', className, as = 'h2' }: SectionHeadingProps) {
  const alignClasses = align === 'center' ? 'items-center text-center' : 'items-start text-left'
  const Heading = as
  return (
    <div className={`flex flex-col gap-3 ${alignClasses} ${className ?? ''}`.trim()}>
      {eyebrow && (
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
          <span className="h-px w-6 bg-brand-accent" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <Heading className="font-display text-3xl font-bold sm:text-4xl">{title}</Heading>
      {subtitle && <p className="max-w-2xl text-brand-muted">{subtitle}</p>}
    </div>
  )
}
