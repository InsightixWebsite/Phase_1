interface PillProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  as?: 'button' | 'span'
  className?: string
}

export function Pill({ children, active = false, onClick, as = 'span', className }: PillProps) {
  const classes = `inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition ${
    active
      ? 'border-brand-accent bg-brand-accent text-black'
      : 'border-brand-border text-brand-muted hover:border-brand-border-hover hover:text-white'
  } ${className ?? ''}`.trim()

  if (as === 'button') {
    return (
      <button type="button" onClick={onClick} aria-pressed={active} className={classes}>
        {children}
      </button>
    )
  }
  return <span className={classes}>{children}</span>
}
