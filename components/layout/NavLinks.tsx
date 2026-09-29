'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActiveNavLink } from '@/lib/navLinks'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
] as const

export function NavLinks({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className={className}>
      {NAV_ITEMS.map((item) => {
        const active = isActiveNavLink(pathname, item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`focus-ring relative pb-1 text-sm font-medium transition hover:text-brand-accent ${
              active
                ? 'text-brand-accent after:absolute after:inset-x-0 after:-bottom-0 after:h-px after:bg-brand-accent'
                : 'text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
