import Link from 'next/link'

interface PrimaryButtonProps {
  children: React.ReactNode
  href?: string
  type?: 'button' | 'submit'
  className?: string
}

const baseClasses =
  'inline-flex items-center gap-2 rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-black transition hover:bg-brand-accent-hover hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg'

export function PrimaryButton({ children, href, type = 'button', className }: PrimaryButtonProps) {
  const classes = `${baseClasses} ${className ?? ''}`.trim()
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return (
    <button type={type} className={classes}>
      {children}
    </button>
  )
}
