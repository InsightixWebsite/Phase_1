# Insightix Public Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the existing public Insightix site (Home, About, Team, Events, Contact + navbar/footer) into the premium dark/orange analytics-club aesthetic from `docs/superpowers/specs/2026-09-29-club-website-redesign-design.md`, reusing all existing CMS-backed content.

**Architecture:** Pure presentation-layer change on top of the existing Next.js App Router site. A new `components/ui/` primitive library (buttons, cards, section headings, pills, stat bar, icons) is built first, then every existing page/layout component is restructured to use it. A handful of pure logic functions (active-nav-link matching, events status filtering, name initials, decorative globe point generation) are extracted into `lib/` and TDD'd — everything else is presentational JSX with no new data flow.

**Tech Stack:** Next.js 16 (App Router, TS), Tailwind CSS v4 (`@theme inline` tokens), Framer Motion (existing hero animation only), Vitest.

## Global Constraints

- No new Supabase tables/columns, no new routes, no new npm dependencies (spec: Explicit Non-Goals). Icons are hand-rolled inline SVG.
- No Classes page, no About timeline, no Events category tags (filter stays All/Upcoming/Past), no functional Contact form, no fabricated photography — substitute a CSS/SVG graphic panel wherever the reference used a stock photo (spec: Explicit Non-Goals).
- Stats strip numbers (Home, About) are placeholders, defined as a commented constant (`// Placeholder — replace with real club figures`) — not wired to any query (spec: Home/About sections).
- Color tokens: `--color-brand-bg:#0B0B0B`, `--color-brand-surface:rgba(255,255,255,0.03)`, `--color-brand-border:rgba(255,255,255,0.10)`, `--color-brand-border-hover:rgba(255,122,0,0.40)`, `--color-brand-accent:#FF7A00`, `--color-brand-accent-hover:#FF8A00`, `--color-brand-text:#FFFFFF`, `--color-brand-muted:#A1A1AA` (spec: Design Tokens).
- Primary CTA buttons use **black** text on the orange fill, not white — `#FF7A00` against white text is ~2.65:1 contrast (fails WCAG AA even for large text); against black it's ~7.9:1. This matches the existing codebase's amber-button convention (`app/(public)/events/page.tsx` today uses `text-black` on its amber CTA).
- All existing null-safe conditional rendering of CMS fields (e.g. `content.vision &&`, `settings.contact_email &&`) must be preserved — never assume a field is set.
- Decorative motion (globe badge float, any CSS `animation`) relies on the existing global rule in `app/globals.css` that forces `animation-duration: 0.01ms !important` under `prefers-reduced-motion: reduce` — no per-component reduced-motion logic needed as long as motion is done via CSS `animation`/`transition`, not inline JS loops.
- This codebase's convention (confirmed: 12 of 13 existing `.test.ts(x)` files test pure `lib/**` functions; only one tests a complex form) is to unit-test extracted logic, not presentational leaf components. Tasks that only produce JSX with no branching logic verify via `npx tsc --noEmit` (and, for pages, a real route smoke test) rather than a component test file — this is intentional, not an omission.
- Test style: `describe`/`it`/`expect` from `vitest`, colocated `X.test.ts` next to `X.ts` (see `lib/slugify.ts` / `lib/slugify.test.ts`).
- **Logo assets already exist** (committed ahead of this plan, derived from the club's actual logo image): `public/logo-mark.png` — the lightbulb+chart+magnifying-glass icon only, cropped tight and with its near-black background keyed to transparent, for use in the navbar/footer next to the "Insightix" text — and `app/icon.png` — a 512×512 square version of the same mark, which Next.js's file-convention favicon system (`app/icon.png`) picks up automatically with zero code. No task needs to (re)create these; sampled colors from the source logo (`#FF8C00` bright orange, `#091117` near-black background) already closely match the chosen `--color-brand-accent-hover` (`#FF8A00`) and `--color-brand-bg` (`#0B0B0B`) tokens, so no token values changed because of it.

---

## Task 1: Design tokens, global grid background, OG image color fix

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Modify: `app/opengraph-image.tsx`
- Modify: `app/(public)/events/[slug]/opengraph-image.tsx`

**Interfaces:**
- Produces: Tailwind utility classes available to every later task — `bg-brand-bg`, `bg-brand-surface`, `border-brand-border`, `border-brand-border-hover`, `bg-brand-accent`, `bg-brand-accent-hover`, `text-brand-accent`, `text-brand-text`, `text-brand-muted`, `divide-brand-border`. Also a `float` CSS keyframe usable via `[animation:float_6s_ease-in-out_infinite]`. Also a `.bg-grid` utility class that paints the fixed page-wide grid layer.

- [ ] **Step 1: Update color tokens in `app/globals.css`**

Replace the `@theme inline` block's brand tokens (keep everything else — the `--font-display`/`--font-body` mappings must stay):

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Brand tokens -> bg-brand-bg / text-brand-accent / text-brand-text, etc. */
  --color-brand-bg: #0b0b0b;
  --color-brand-surface: rgba(255, 255, 255, 0.03);
  --color-brand-border: rgba(255, 255, 255, 0.1);
  --color-brand-border-hover: rgba(255, 122, 0, 0.4);
  --color-brand-accent: #ff7a00;
  --color-brand-accent-hover: #ff8a00;
  --color-brand-text: #ffffff;
  --color-brand-muted: #a1a1aa;

  --font-display: var(--font-display-family);
  --font-body: var(--font-body-family);
}
```

Also update `:root`'s `--background` to match (`#0b0b0b`) and `--foreground` to `#ffffff`:

```css
:root {
  --background: #0b0b0b;
  --foreground: #ffffff;
}
```

- [ ] **Step 2: Add the grid background utility and float keyframe**

Append to `app/globals.css` (after the existing `html { scroll-behavior: smooth; }` block, before the `prefers-reduced-motion` block):

```css
.bg-grid {
  position: fixed;
  inset: 0;
  z-index: -10;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 55%, transparent 100%);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
```

- [ ] **Step 3: Mount the grid layer in `app/layout.tsx`**

In the `<body>` element, add a `<div className="bg-grid" aria-hidden="true" />` as the first child, before `<MotionConfig>`:

```tsx
<body className="min-h-full flex flex-col bg-brand-bg font-body text-brand-text">
  <div className="bg-grid" aria-hidden="true" />
  <MotionConfig reducedMotion="user">{children}</MotionConfig>
</body>
```

- [ ] **Step 4: Fix hardcoded accent color in OG images**

In `app/opengraph-image.tsx`, change `style={{ color: '#f5820c' }}` to `style={{ color: '#FF7A00' }}`.

In `app/(public)/events/[slug]/opengraph-image.tsx`, change `style={{ color: '#f5820c' }}` to `style={{ color: '#FF7A00' }}`.

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds (the existing pages still compile against the same token *names*, only hex values changed, so nothing should break).

- [ ] **Step 6: Commit**

```bash
git add app/globals.css app/layout.tsx app/opengraph-image.tsx "app/(public)/events/[slug]/opengraph-image.tsx"
git commit -m "feat: update brand tokens to redesign palette, add grid background"
```

---

## Task 2: `lib/navLinks.ts` — active nav link matching

**Files:**
- Create: `lib/navLinks.ts`
- Test: `lib/navLinks.test.ts`

**Interfaces:**
- Produces: `isActiveNavLink(pathname: string, href: string): boolean` — used by Task 10 (`NavLinks`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { isActiveNavLink } from './navLinks'

describe('isActiveNavLink', () => {
  it('matches the home link only on the exact root path', () => {
    expect(isActiveNavLink('/', '/')).toBe(true)
    expect(isActiveNavLink('/about', '/')).toBe(false)
  })

  it('matches a section link on its own path and nested paths', () => {
    expect(isActiveNavLink('/events', '/events')).toBe(true)
    expect(isActiveNavLink('/events/hack-night', '/events')).toBe(true)
  })

  it('does not match a different path that merely shares a prefix', () => {
    expect(isActiveNavLink('/eventsomething', '/events')).toBe(false)
  })

  it('does not match unrelated paths', () => {
    expect(isActiveNavLink('/team', '/events')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/navLinks.test.ts`
Expected: FAIL — `Cannot find module './navLinks'` (or similar).

- [ ] **Step 3: Write minimal implementation**

```ts
export function isActiveNavLink(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/navLinks.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/navLinks.ts lib/navLinks.test.ts
git commit -m "feat: add isActiveNavLink for navbar active-state matching"
```

---

## Task 3: `lib/eventsFilter.ts` — events status filter

**Files:**
- Create: `lib/eventsFilter.ts`
- Test: `lib/eventsFilter.test.ts`

**Interfaces:**
- Consumes: `Event` type from `lib/supabase/types.ts` (fields: `id, title, slug, description, event_date, type, registration_url, cover_photo_url, gallery_urls, video_embed_urls, is_active, created_at`).
- Produces: `type EventStatusFilter = 'all' | 'upcoming' | 'past'` and `filterEventsByStatus(upcoming: Event[], past: Event[], filter: EventStatusFilter): Event[]` — used by Task 17 (`EventsFilter`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { filterEventsByStatus } from './eventsFilter'
import type { Event } from './supabase/types'

function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: '1',
    title: 'Test Event',
    slug: 'test-event',
    description: null,
    event_date: '2026-01-01',
    type: 'upcoming',
    registration_url: null,
    cover_photo_url: null,
    gallery_urls: [],
    video_embed_urls: [],
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('filterEventsByStatus', () => {
  const upcoming = [makeEvent({ id: 'u1', type: 'upcoming' })]
  const past = [makeEvent({ id: 'p1', type: 'past' })]

  it('returns only upcoming events for "upcoming"', () => {
    expect(filterEventsByStatus(upcoming, past, 'upcoming')).toEqual(upcoming)
  })

  it('returns only past events for "past"', () => {
    expect(filterEventsByStatus(upcoming, past, 'past')).toEqual(past)
  })

  it('returns upcoming followed by past for "all"', () => {
    expect(filterEventsByStatus(upcoming, past, 'all')).toEqual([...upcoming, ...past])
  })

  it('handles empty lists', () => {
    expect(filterEventsByStatus([], [], 'all')).toEqual([])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/eventsFilter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
import type { Event } from './supabase/types'

export type EventStatusFilter = 'all' | 'upcoming' | 'past'

export function filterEventsByStatus(
  upcoming: Event[],
  past: Event[],
  filter: EventStatusFilter
): Event[] {
  if (filter === 'upcoming') return upcoming
  if (filter === 'past') return past
  return [...upcoming, ...past]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/eventsFilter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/eventsFilter.ts lib/eventsFilter.test.ts
git commit -m "feat: add filterEventsByStatus for Events page filter pills"
```

---

## Task 4: `lib/initials.ts` — name initials for avatar fallback

**Files:**
- Create: `lib/initials.ts`
- Test: `lib/initials.test.ts`

**Interfaces:**
- Produces: `getInitials(name: string): string` — used by Task 8 (`TeamCard`).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { getInitials } from './initials'

describe('getInitials', () => {
  it('takes the first letter of the first and last word for multi-word names', () => {
    expect(getInitials('Aarav Mehta')).toBe('AM')
    expect(getInitials('Sanya Kapoor Iyer')).toBe('SI')
  })

  it('takes the first two letters of a single-word name', () => {
    expect(getInitials('Riya')).toBe('RI')
  })

  it('trims and collapses extra whitespace', () => {
    expect(getInitials('  Sanya   Iyer  ')).toBe('SI')
  })

  it('returns an empty string for an empty name', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/initials.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase()
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/initials.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/initials.ts lib/initials.test.ts
git commit -m "feat: add getInitials for team card avatar fallback"
```

---

## Task 5: `lib/particleGlobe.ts` — hero globe dot generation

**Files:**
- Create: `lib/particleGlobe.ts`
- Test: `lib/particleGlobe.test.ts`

**Interfaces:**
- Produces: `interface GlobePoint { x: number; y: number; r: number; opacity: number }`, `interface GlobeOptions { rings?: number; pointsPerRing?: number; maxRadius?: number }`, `generateGlobePoints(options?: GlobeOptions): GlobePoint[]` — used by Task 9 (`ParticleGlobe`). Deterministic (no `Math.random`) so server-rendered and client-hydrated markup always match — this matters because the component that consumes it renders on the server first.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { generateGlobePoints } from './particleGlobe'

describe('generateGlobePoints', () => {
  it('returns rings * pointsPerRing points', () => {
    expect(generateGlobePoints({ rings: 3, pointsPerRing: 4 })).toHaveLength(12)
  })

  it('defaults to a reasonable point count', () => {
    expect(generateGlobePoints().length).toBeGreaterThan(0)
  })

  it('returns an empty array when rings is 0', () => {
    expect(generateGlobePoints({ rings: 0, pointsPerRing: 10 })).toEqual([])
  })

  it('keeps every point within maxRadius on the x axis, with valid opacity', () => {
    const maxRadius = 50
    const points = generateGlobePoints({ rings: 5, pointsPerRing: 8, maxRadius })
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(-maxRadius)
      expect(point.x).toBeLessThanOrEqual(maxRadius)
      expect(point.opacity).toBeGreaterThan(0)
      expect(point.opacity).toBeLessThanOrEqual(1)
      expect(point.r).toBeGreaterThan(0)
      expect(Number.isFinite(point.y)).toBe(true)
    }
  })

  it('is deterministic across calls with the same options', () => {
    const a = generateGlobePoints({ rings: 4, pointsPerRing: 6, maxRadius: 80 })
    const b = generateGlobePoints({ rings: 4, pointsPerRing: 6, maxRadius: 80 })
    expect(a).toEqual(b)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/particleGlobe.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```ts
export interface GlobePoint {
  x: number
  y: number
  r: number
  opacity: number
}

export interface GlobeOptions {
  rings?: number
  pointsPerRing?: number
  maxRadius?: number
}

/**
 * Deterministically scatters points across latitude "rings" to fake a
 * sphere silhouette for the hero's decorative globe graphic. No randomness
 * — this must render identically on the server and after client hydration.
 */
export function generateGlobePoints(options: GlobeOptions = {}): GlobePoint[] {
  const { rings = 7, pointsPerRing = 16, maxRadius = 120 } = options
  const points: GlobePoint[] = []

  for (let ring = 0; ring < rings; ring++) {
    // 0 at the poles (ring 0 / ring rings-1), maxRadius at the equator.
    const latitudeFraction = Math.sin((Math.PI * (ring + 1)) / (rings + 1))
    const ringRadius = maxRadius * latitudeFraction
    const verticalOffset = maxRadius * (0.5 - (ring + 1) / (rings + 1))
    const opacity = 0.25 + 0.55 * latitudeFraction

    for (let i = 0; i < pointsPerRing; i++) {
      const angle = (2 * Math.PI * i) / pointsPerRing + ring * 0.35
      points.push({
        x: ringRadius * Math.cos(angle),
        y: verticalOffset + ringRadius * 0.35 * Math.sin(angle),
        r: 1.4,
        opacity,
      })
    }
  }

  return points
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/particleGlobe.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/particleGlobe.ts lib/particleGlobe.test.ts
git commit -m "feat: add generateGlobePoints for hero particle-globe graphic"
```

---

## Task 6: Shared UI primitives — icons, buttons, SectionHeading, Pill, StatBar

**Files:**
- Create: `components/ui/icons.tsx`
- Create: `components/ui/PrimaryButton.tsx`
- Create: `components/ui/SecondaryButton.tsx`
- Create: `components/ui/SectionHeading.tsx`
- Create: `components/ui/Pill.tsx`
- Create: `components/ui/StatBar.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1 (`bg-brand-accent`, `border-brand-border`, etc.).
- Produces:
  - `components/ui/icons.tsx`: `ChartIcon`, `PeopleIcon`, `TargetIcon`, `LayersIcon`, `EyeIcon`, `LinkedInIcon`, `MailIcon`, `PhoneIcon`, `ChatIcon`, `PinIcon` — each `({ className }: { className?: string }) => JSX.Element`.
  - `PrimaryButton({ children, href?, type?, className? })` and `SecondaryButton({ children, href?, type?, className? })` — render a `next/link` `<Link>` when `href` is set, otherwise a `<button type={type ?? 'button'}>`.
  - `SectionHeading({ eyebrow?, title, subtitle?, align?: 'left' | 'center', className? })`.
  - `Pill({ children, active?, onClick?, as?: 'button' | 'span', className? })`.
  - `StatBar({ eyebrow?, stats: { value: string; label: string }[], className? })` and the exported `Stat` type.
  - Used by every remaining task.

- [ ] **Step 1: Create `components/ui/icons.tsx`**

```tsx
type IconProps = { className?: string }

export function ChartIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-6" strokeLinecap="round" />
    </svg>
  )
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M16 11a3 3 0 1 0 0-6M21 20c0-2.3-1.7-4-4-4.5" strokeLinecap="round" />
    </svg>
  )
}

export function TargetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function LayersIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 3l8 4-8 4-8-4 8-4zM4 13l8 4 8-4M4 17l8 4 8-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EyeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path
        d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2C9.5 21 3 14.5 3 6a2 2 0 0 1 2-2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-5.5a8.5 8.5 0 1 1 17-3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden="true">
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  )
}
```

- [ ] **Step 2: Create `components/ui/PrimaryButton.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `components/ui/SecondaryButton.tsx`**

```tsx
import Link from 'next/link'

interface SecondaryButtonProps {
  children: React.ReactNode
  href?: string
  type?: 'button' | 'submit'
  className?: string
}

const baseClasses =
  'inline-flex items-center gap-2 rounded-full border border-brand-border px-6 py-3 text-sm font-semibold text-white transition hover:border-brand-accent hover:text-brand-accent hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg'

export function SecondaryButton({ children, href, type = 'button', className }: SecondaryButtonProps) {
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
```

- [ ] **Step 4: Create `components/ui/SectionHeading.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `components/ui/Pill.tsx`**

```tsx
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
```

- [ ] **Step 6: Create `components/ui/StatBar.tsx`**

```tsx
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
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add components/ui/icons.tsx components/ui/PrimaryButton.tsx components/ui/SecondaryButton.tsx components/ui/SectionHeading.tsx components/ui/Pill.tsx components/ui/StatBar.tsx
git commit -m "feat: add shared UI primitives (icons, buttons, SectionHeading, Pill, StatBar)"
```

---

## Task 7: `components/ui/EventCard.tsx`

**Files:**
- Create: `components/ui/EventCard.tsx`

**Interfaces:**
- Consumes: `Event` type (`lib/supabase/types.ts`), `buildCloudinaryUrl` (`lib/cloudinary.ts`), `PrimaryButton` (Task 6).
- Produces: `EventCard({ event: Event, variant?: 'featured' | 'compact' })` — used by Task 14 (Home), Task 17 (Events list), and available for reuse anywhere an `Event` needs to render.

- [ ] **Step 1: Create `components/ui/EventCard.tsx`**

```tsx
import Link from 'next/link'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import type { Event } from '@/lib/supabase/types'
import { PrimaryButton } from './PrimaryButton'

function formatEventDate(dateString: string): string {
  const date = new Date(`${dateString}T00:00:00`)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

interface EventCardProps {
  event: Event
  variant?: 'featured' | 'compact'
}

export function EventCard({ event, variant = 'compact' }: EventCardProps) {
  const statusLabel = event.type === 'upcoming' ? 'Upcoming' : 'Past'

  if (variant === 'featured') {
    return (
      <div className="grid gap-8 overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-8 md:grid-cols-2 md:items-center">
        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
            Featured Event
          </span>
          <h3 className="font-display text-2xl font-bold sm:text-3xl">{event.title}</h3>
          <p className="text-sm text-brand-muted">{formatEventDate(event.event_date)}</p>
          {event.description && <p className="text-brand-muted">{event.description}</p>}
          {event.registration_url && (
            <PrimaryButton href={event.registration_url} className="w-fit">
              Register Now
            </PrimaryButton>
          )}
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg border border-brand-border">
          {event.cover_photo_url ? (
            <img
              src={buildCloudinaryUrl(event.cover_photo_url, { width: 800 })}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-brand-bg"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col gap-3 rounded-xl border border-brand-border bg-brand-surface p-5 transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]"
    >
      <span className="w-fit rounded-full border border-brand-border px-2.5 py-0.5 text-xs font-medium text-brand-muted">
        {statusLabel}
      </span>
      <h3 className="font-display font-semibold text-white group-hover:text-brand-accent">{event.title}</h3>
      <p className="text-sm text-brand-muted">{formatEventDate(event.event_date)}</p>
    </Link>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/EventCard.tsx
git commit -m "feat: add EventCard (featured + compact variants)"
```

---

## Task 8: `components/ui/TeamCard.tsx`

**Files:**
- Create: `components/ui/TeamCard.tsx`

**Interfaces:**
- Consumes: `TeamMember` type (`lib/supabase/types.ts`), `buildCloudinaryUrl` (`lib/cloudinary.ts`), `getInitials` (Task 4), `LinkedInIcon` (Task 6).
- Produces: `TeamCard({ member: TeamMember })` — used by Task 16 (`TeamGrid`).

- [ ] **Step 1: Create `components/ui/TeamCard.tsx`**

```tsx
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { getInitials } from '@/lib/initials'
import type { TeamMember } from '@/lib/supabase/types'
import { LinkedInIcon } from './icons'

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-brand-border bg-brand-surface p-6 text-center transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]">
      {member.photo_url ? (
        <img
          src={buildCloudinaryUrl(member.photo_url, { width: 200 })}
          alt={member.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-bg text-lg font-semibold text-brand-accent"
          aria-hidden="true"
        >
          {getInitials(member.name)}
        </div>
      )}
      <div>
        <p className="font-semibold text-white">{member.name}</p>
        <p className="text-sm text-brand-accent">{member.role}</p>
      </div>
      {member.linkedin_url && (
        <a
          href={member.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
          className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-brand-muted transition hover:border-brand-border-hover hover:text-brand-accent"
        >
          <LinkedInIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/TeamCard.tsx
git commit -m "feat: add TeamCard with initials-avatar fallback"
```

---

## Task 9: `components/home/ParticleGlobe.tsx`

**Files:**
- Create: `components/home/ParticleGlobe.tsx`

**Interfaces:**
- Consumes: `generateGlobePoints` (Task 5), `ChartIcon`/`PeopleIcon`/`TargetIcon` (Task 6).
- Produces: `ParticleGlobe()` (no props) — used by Task 13 (`Hero`). Server component (no `'use client'` — the float animation is pure CSS, gated by the existing global `prefers-reduced-motion` rule).

- [ ] **Step 1: Create `components/home/ParticleGlobe.tsx`**

```tsx
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
        <ellipse cx="0" cy="0" rx="118" ry="46" fill="none" stroke="rgba(255,122,0,0.25)" strokeWidth={1} />
        <ellipse cx="0" cy="0" rx="90" ry="118" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
        {POINTS.map((point, i) => (
          <circle key={i} cx={point.x} cy={point.y} r={point.r} fill="#FF7A00" opacity={point.opacity} />
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
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/home/ParticleGlobe.tsx
git commit -m "feat: add hero particle-globe decorative graphic"
```

---

## Task 10: `components/layout/NavLinks.tsx` + `components/layout/MobileMenu.tsx`

**Files:**
- Create: `components/layout/NavLinks.tsx`
- Create: `components/layout/MobileMenu.tsx`

**Interfaces:**
- Consumes: `isActiveNavLink` (Task 2).
- Produces: `NavLinks({ className?: string; onNavigate?: () => void })` (client component, `'use client'`) and `MobileMenu()` (client component, wraps `NavLinks`) — both used by Task 11 (`Header`).

- [ ] **Step 1: Create `components/layout/NavLinks.tsx`**

```tsx
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
            className={`relative pb-1 text-sm font-medium transition hover:text-brand-accent ${
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
```

- [ ] **Step 2: Create `components/layout/MobileMenu.tsx`**

```tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { NavLinks } from './NavLinks'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  function close() {
    setOpen(false)
    buttonRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open])

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-white"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          )}
        </svg>
      </button>
      {open && (
        <div id="mobile-nav-panel" className="absolute inset-x-0 top-full border-b border-brand-border bg-brand-bg/95 px-6 py-6 backdrop-blur">
          <NavLinks className="flex flex-col gap-4" onNavigate={close} />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/layout/NavLinks.tsx components/layout/MobileMenu.tsx
git commit -m "feat: add NavLinks and MobileMenu for redesigned navbar"
```

---

## Task 11: Redesign `components/layout/Header.tsx`

**Files:**
- Modify: `components/layout/Header.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` (existing, `lib/queries/siteSettings.ts`), `buildCloudinaryUrl` (existing), `NavLinks` + `MobileMenu` (Task 10), `public/logo-mark.png` (pre-existing asset, see Global Constraints).
- Produces: `Header()` (async server component, unchanged signature) — consumed by `app/(public)/layout.tsx` (no change needed there).

- [ ] **Step 1: Replace `components/layout/Header.tsx`**

The brand mark defaults to the club's own `/logo-mark.png` and only switches to a CMS-uploaded logo if an admin has set one in Site Settings — this preserves the existing admin override behavior while giving the site a real default logo instead of text-only.

```tsx
import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { NavLinks } from './NavLinks'
import { MobileMenu } from './MobileMenu'

export async function Header() {
  const settings = await getSiteSettings()
  const logoSrc = settings.logo_url ? buildCloudinaryUrl(settings.logo_url, { width: 48 }) : '/logo-mark.png'
  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/70 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src={logoSrc} alt="Insightix logo" className="h-9 w-9" />
          <span className="font-display text-lg font-bold">Insightix</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <NavLinks className="flex items-center gap-8" />
          <Link
            href="/contact"
            className="rounded-full bg-brand-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-brand-accent-hover"
          >
            Join Us
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds (Header is used by `app/(public)/layout.tsx`, which every public page renders — this is the first integration checkpoint).

- [ ] **Step 3: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: redesign Header as sticky translucent navbar with logo mark and active links"
```

---

## Task 12: Redesign `components/layout/Footer.tsx`

**Files:**
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` (existing), `public/logo-mark.png` (pre-existing asset, see Global Constraints).
- Produces: `Footer()` (async server component, unchanged signature) — consumed by `app/(public)/layout.tsx` (no change needed there).

- [ ] **Step 1: Replace `components/layout/Footer.tsx`**

```tsx
import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Contact', href: '/contact' },
]

export async function Footer() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <footer className="border-t border-brand-border px-6 py-12 text-sm text-brand-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="" className="h-7 w-7" aria-hidden="true" />
            <span className="font-display text-lg font-bold text-white">Insightix</span>
          </div>
          {settings.tagline && <p className="mt-2">{settings.tagline}</p>}
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-accent">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-2">
          {settings.contact_email && (
            <a href={`mailto:${settings.contact_email}`} className="hover:text-brand-accent">
              {settings.contact_email}
            </a>
          )}
          {socialEntries.length > 0 && (
            <div className="flex gap-4">
              {socialEntries.map(([platform, url]) => (
                <a key={platform} href={url} className="capitalize hover:text-brand-accent">
                  {platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-brand-border pt-6 text-xs">
        © {new Date().getFullYear()} Insightix. All rights reserved.
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: redesign Footer with logo mark, brand tokens, and structured columns"
```

---

## Task 13: Redesign `components/home/Hero.tsx`

**Files:**
- Modify: `components/home/Hero.tsx`

**Interfaces:**
- Consumes: `buildCloudinaryUrl` (existing), `PrimaryButton`/`SecondaryButton` (Task 6), `EyeIcon`/`LayersIcon`/`PeopleIcon`/`TargetIcon` (Task 6), `ParticleGlobe` (Task 9).
- Produces: `Hero({ introText: string | null; bannerUrl: string | null; bannerType: 'image' | 'video' | null })` (unchanged props signature) — consumed by Task 14 (`app/(public)/page.tsx`).

- [ ] **Step 1: Replace `components/home/Hero.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'
import { ParticleGlobe } from './ParticleGlobe'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

interface HeroProps {
  introText: string | null
  bannerUrl: string | null
  bannerType: 'image' | 'video' | null
}

const FEATURES = [
  { label: 'Workshops', description: 'Learn by doing', Icon: LayersIcon },
  { label: 'Projects', description: 'Apply knowledge', Icon: ChartIconFeature },
  { label: 'Community', description: 'Grow together', Icon: PeopleIcon },
  { label: 'Real Impact', description: 'Turn ideas into solutions', Icon: TargetIcon },
]

// Placeholder to keep the array literal above readable — replaced in Step 1b below.
function ChartIconFeature() {
  return null
}

export function Hero({ introText, bannerUrl, bannerType }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6">
          <motion.span
            variants={item}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent"
          >
            <span className="h-px w-6 bg-brand-accent" aria-hidden="true" />
            Student Analytics Club
          </motion.span>
          <motion.h1 variants={item} className="font-display text-5xl font-bold sm:text-7xl">
            Insight<span className="text-brand-accent">ix</span>
          </motion.h1>
          {introText && (
            <motion.p variants={item} className="max-w-md text-lg text-brand-muted">
              {introText}
            </motion.p>
          )}
          {bannerUrl && bannerType === 'video' && (
            <motion.iframe variants={item} src={bannerUrl} className="aspect-video w-full max-w-xl rounded-lg" allowFullScreen />
          )}
          {bannerUrl && bannerType === 'image' && (
            <motion.img
              variants={item}
              src={buildCloudinaryUrl(bannerUrl, { width: 800 })}
              alt=""
              className="w-full max-w-md rounded-lg"
            />
          )}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <PrimaryButton href="/events">Explore Events →</PrimaryButton>
            <SecondaryButton href="/about">Learn More</SecondaryButton>
          </motion.div>
          <motion.div variants={item} className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {FEATURES.map(({ label, description, Icon }) => (
              <div key={label} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-brand-muted">{description}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
        <ParticleGlobe />
      </div>
    </section>
  )
}
```

- [ ] **Step 1b: Fix the `FEATURES` icon list**

The `ChartIconFeature` placeholder in Step 1 exists only so the file is syntactically complete for review — replace it now. Delete the `ChartIconFeature` function and its usage, import `ChartIcon` alongside the other icons, and use it directly:

```tsx
import { ChartIcon, EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'
```

```tsx
const FEATURES = [
  { label: 'Workshops', description: 'Learn by doing', Icon: LayersIcon },
  { label: 'Projects', description: 'Apply knowledge', Icon: ChartIcon },
  { label: 'Community', description: 'Grow together', Icon: PeopleIcon },
  { label: 'Real Impact', description: 'Turn ideas into solutions', Icon: TargetIcon },
]
```

(`EyeIcon` is imported but unused here — it's used by Task 15's About page and Task 14's Why-Insightix section, not by Hero. Remove `EyeIcon` from this file's import list since Hero itself doesn't use it.)

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors (in particular: no unused-import errors — double check the import list only names icons actually used in this file: `ChartIcon`, `LayersIcon`, `PeopleIcon`, `TargetIcon`).

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/home/Hero.tsx
git commit -m "feat: redesign Hero with particle globe and feature row"
```

---

## Task 14: Redesign `app/(public)/page.tsx` (Home)

**Files:**
- Modify: `app/(public)/page.tsx`

**Interfaces:**
- Consumes: `getHomeContent`, `getRecentEvents` (existing), `Hero` (Task 13), `RevealSection` (existing), `SectionHeading`/`SecondaryButton`/`StatBar` (Task 6), `EventCard` (Task 7), `EyeIcon`/`LayersIcon`/`PeopleIcon`/`TargetIcon` (Task 6).
- Produces: default export `HomePage()` — the `/` route.

- [ ] **Step 1: Replace `app/(public)/page.tsx`**

```tsx
import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { Hero } from '@/components/home/Hero'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SecondaryButton } from '@/components/ui/SecondaryButton'
import { StatBar } from '@/components/ui/StatBar'
import { EventCard } from '@/components/ui/EventCard'
import { EyeIcon, LayersIcon, PeopleIcon, TargetIcon } from '@/components/ui/icons'

// Placeholder — replace with real club figures once available.
const HOME_STATS = [
  { value: '50+', label: 'Members' },
  { value: '10+', label: 'Workshops' },
  { value: '8+', label: 'Projects' },
  { value: '12+', label: 'Sessions' },
]

const WHY_INSIGHTIX = [
  { title: 'Learn', description: 'Hands-on sessions covering analytics tools, from spreadsheets to Python.', Icon: EyeIcon },
  { title: 'Build', description: 'Apply what you learn on real datasets and real projects.', Icon: LayersIcon },
  { title: 'Collaborate', description: 'Work alongside a community of curious, driven students.', Icon: PeopleIcon },
  { title: 'Compete', description: 'Take your skills into hackathons and case competitions.', Icon: TargetIcon },
]

export default async function HomePage() {
  const [content, recentEvents] = await Promise.all([getHomeContent(), getRecentEvents(3)])

  return (
    <main>
      <Hero introText={content.intro_text} bannerUrl={content.banner_media_url} bannerType={content.banner_media_type} />

      <RevealSection className="mx-auto max-w-6xl px-6 py-12">
        <StatBar stats={HOME_STATS} />
      </RevealSection>

      <RevealSection className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="— RECENT EVENTS" title="Recent Events & Workshops" />
          <SecondaryButton href="/events">View All Events</SecondaryButton>
        </div>
        {recentEvents.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-brand-muted">No events yet — check back soon.</p>
        )}
      </RevealSection>

      <RevealSection className="mx-auto max-w-6xl px-6 py-16">
        <SectionHeading
          eyebrow="— WHY INSIGHTIX"
          title="Why Join Insightix"
          align="center"
          className="mx-auto items-center text-center"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_INSIGHTIX.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-brand-border bg-brand-surface p-6 transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm text-brand-muted">{description}</p>
            </div>
          ))}
        </div>
      </RevealSection>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "feat: redesign Home page with stats strip and Why Insightix section"
```

---

## Task 15: Redesign `app/(public)/about/page.tsx`

**Files:**
- Modify: `app/(public)/about/page.tsx`

**Interfaces:**
- Consumes: `getAboutContent` (existing), `getHomeContent` (existing, reused here for the optional real banner image), `buildCloudinaryUrl` (existing), `RevealSection` (existing), `SectionHeading`/`PrimaryButton`/`StatBar` (Task 6), `EyeIcon`/`TargetIcon` (Task 6).
- Produces: default export `AboutPage()` — the `/about` route.

- [ ] **Step 1: Replace `app/(public)/about/page.tsx`**

```tsx
import { getAboutContent } from '@/lib/queries/aboutContent'
import { getHomeContent } from '@/lib/queries/homeContent'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { StatBar } from '@/components/ui/StatBar'
import { EyeIcon, TargetIcon } from '@/components/ui/icons'

export const metadata = { title: 'About Us' }

// Placeholder — replace with real club figures once available.
const ABOUT_STATS = [
  { value: '50+', label: 'Members' },
  { value: '10+', label: 'Workshops' },
  { value: '5+', label: 'Industry Speakers' },
]

export default async function AboutPage() {
  const [content, homeContent] = await Promise.all([getAboutContent(), getHomeContent()])

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <SectionHeading
          eyebrow="— ABOUT US"
          title="About Insightix"
          subtitle="We are the analytics club, creating a platform for students to learn, apply, and grow their data and analytics skills through hands-on sessions, real-world projects, and industry interactions."
        />
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-brand-border">
          {homeContent.banner_media_url && homeContent.banner_media_type === 'image' ? (
            <img
              src={buildCloudinaryUrl(homeContent.banner_media_url, { width: 800 })}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full bg-brand-bg"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-brand-bg/90 via-transparent to-transparent p-6">
            <span className="font-display text-2xl font-bold text-white/80">Insightix</span>
            <ul className="flex flex-col gap-1 text-right text-xs font-semibold uppercase tracking-widest text-brand-muted">
              <li>People</li>
              <li>Ideas</li>
              <li>Data</li>
              <li>Impact</li>
            </ul>
          </div>
        </div>
      </div>

      <RevealSection className="mt-12">
        <StatBar eyebrow="— OUR IMPACT" stats={ABOUT_STATS} />
      </RevealSection>

      {(content.mission || content.vision) && (
        <RevealSection className="mt-12 grid gap-6 sm:grid-cols-2">
          {content.mission && (
            <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <TargetIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Our Mission</h2>
              <p className="mt-2 text-brand-muted">{content.mission}</p>
            </div>
          )}
          {content.vision && (
            <div className="rounded-xl border border-brand-border bg-brand-surface p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-border text-brand-accent">
                <EyeIcon className="h-5 w-5" />
              </span>
              <h2 className="mt-4 font-display text-xl font-bold">Our Vision</h2>
              <p className="mt-2 text-brand-muted">{content.vision}</p>
            </div>
          )}
        </RevealSection>
      )}

      {content.objectives && (
        <RevealSection className="mt-12">
          <SectionHeading eyebrow="— WHAT WE DO" title="What We Do" />
          <p className="mt-4 max-w-3xl text-brand-muted">{content.objectives}</p>
        </RevealSection>
      )}

      {content.history && (
        <RevealSection className="mt-12">
          <SectionHeading eyebrow="— OUR STORY" title="Our Story" />
          <p className="mt-4 max-w-3xl text-brand-muted">{content.history}</p>
        </RevealSection>
      )}

      {content.faculty_message && (
        <RevealSection className="mt-12 rounded-xl border border-brand-border bg-brand-surface p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">
            A Message From Our Faculty Mentor
          </p>
          <p className="mt-4 text-lg text-brand-muted">&ldquo;{content.faculty_message}&rdquo;</p>
        </RevealSection>
      )}

      <RevealSection className="mt-16 flex flex-col items-center gap-4 rounded-xl border border-brand-border bg-brand-surface p-10 text-center">
        <h2 className="font-display text-2xl font-bold">Ready to get involved?</h2>
        <p className="max-w-md text-brand-muted">
          Join a community of students exploring data, analytics, and AI together.
        </p>
        <PrimaryButton href="/contact">Join Insightix</PrimaryButton>
      </RevealSection>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/about/page.tsx"
git commit -m "feat: redesign About page with mission/vision cards and impact stats"
```

---

## Task 16: Redesign Team page + `components/team/TeamGrid.tsx`

**Files:**
- Modify: `components/team/TeamGrid.tsx`
- Modify: `app/(public)/team/page.tsx`

**Interfaces:**
- Consumes: `RevealSection` (existing), `SectionHeading` (Task 6), `TeamCard` (Task 8), `TeamMember` type (existing).
- Produces: `TeamGrid({ members: TeamMember[] })` (unchanged signature) and default export `TeamPage()` — the `/team` route.

- [ ] **Step 1: Replace `components/team/TeamGrid.tsx`**

```tsx
import { RevealSection } from '@/components/RevealSection'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TeamCard } from '@/components/ui/TeamCard'
import type { TeamMember } from '@/lib/supabase/types'

const CATEGORY_LABELS: Record<TeamMember['category'], string> = {
  core: 'Core Committee',
  faculty: 'Faculty Coordinators',
  senior: 'Senior Team',
  junior: 'Junior Team',
}

export function TeamGrid({ members }: { members: TeamMember[] }) {
  const grouped = (['core', 'faculty', 'senior', 'junior'] as const).map((category) => ({
    category,
    members: members.filter((m) => m.category === category),
  }))

  return (
    <div className="flex flex-col gap-16">
      {grouped.map(({ category, members }) =>
        members.length > 0 ? (
          <RevealSection key={category}>
            <SectionHeading title={CATEGORY_LABELS[category]} />
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {members.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          </RevealSection>
        ) : null
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/(public)/team/page.tsx`**

```tsx
import { getActiveTeamMembers } from '@/lib/queries/teamMembers'
import { TeamGrid } from '@/components/team/TeamGrid'
import { SectionHeading } from '@/components/ui/SectionHeading'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const members = await getActiveTeamMembers()
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="— OUR TEAM"
        title="Meet the Team"
        subtitle="A group of passionate students building a stronger analytics community, together."
        align="center"
        className="mx-auto items-center text-center"
      />
      <div className="mt-12">
        <TeamGrid members={members} />
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/team/TeamGrid.tsx "app/(public)/team/page.tsx"
git commit -m "feat: redesign Team page and TeamGrid with TeamCard"
```

---

## Task 17: `components/events/EventsFilter.tsx` + redesign Events list page

**Files:**
- Create: `components/events/EventsFilter.tsx`
- Modify: `app/(public)/events/page.tsx`

**Interfaces:**
- Consumes: `filterEventsByStatus`/`EventStatusFilter` (Task 3), `Pill` (Task 6), `EventCard` (Task 7), `getUpcomingEvents`/`getPastEvents` (existing).
- Produces: `EventsFilter({ upcoming: Event[]; past: Event[] })` (client component) and default export `EventsPage()` — the `/events` route.

- [ ] **Step 1: Create `components/events/EventsFilter.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Pill } from '@/components/ui/Pill'
import { EventCard } from '@/components/ui/EventCard'
import { filterEventsByStatus, type EventStatusFilter } from '@/lib/eventsFilter'
import type { Event } from '@/lib/supabase/types'

const FILTERS: { value: EventStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'past', label: 'Past' },
]

export function EventsFilter({ upcoming, past }: { upcoming: Event[]; past: Event[] }) {
  const [filter, setFilter] = useState<EventStatusFilter>('all')
  const events = filterEventsByStatus(upcoming, past, filter)

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {FILTERS.map((option) => (
          <Pill key={option.value} as="button" active={filter === option.value} onClick={() => setFilter(option.value)}>
            {option.label}
          </Pill>
        ))}
      </div>
      {events.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-brand-muted">No events in this category yet.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Replace `app/(public)/events/page.tsx`**

```tsx
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EventCard } from '@/components/ui/EventCard'
import { EventsFilter } from '@/components/events/EventsFilter'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'Events & Competitions' }

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])
  const [featuredEvent, ...restUpcoming] = upcoming

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        eyebrow="— EVENTS"
        title="Learn. Build. Network."
        subtitle="From workshops to speaker sessions, we host events that spark curiosity and turn learning into real-world skills."
      />

      {featuredEvent && (
        <RevealSection className="mt-10">
          <EventCard event={featuredEvent} variant="featured" />
        </RevealSection>
      )}

      <RevealSection className="mt-16">
        <EventsFilter upcoming={restUpcoming} past={past} />
      </RevealSection>
    </main>
  )
}
```

Note: `featuredEvent` is the nearest upcoming event (`getUpcomingEvents()` orders ascending by `event_date`, so index 0 is soonest). `restUpcoming` (everything after it) is what `EventsFilter` receives as its `upcoming` list, so the featured event is never duplicated in the grid below. If there are no upcoming events, `featuredEvent` is `undefined` (the featured block is skipped) and `restUpcoming` is `[]` — both handled safely.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components/events/EventsFilter.tsx "app/(public)/events/page.tsx"
git commit -m "feat: redesign Events page with featured event and status filter pills"
```

---

## Task 18: Restyle Event detail page

**Files:**
- Modify: `app/(public)/events/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getEventBySlug` (existing), `buildCloudinaryUrl` (existing), `PrimaryButton` (Task 6), `Pill` (Task 6).
- Produces: default export `EventDetailPage()` — the `/events/[slug]` route (structure unchanged, only presentation).

- [ ] **Step 1: Replace `app/(public)/events/[slug]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/queries/events'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { Pill } from '@/components/ui/Pill'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event || !event.is_active) return {}
  return { title: event.title, description: event.description ?? undefined }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event || !event.is_active) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {event.cover_photo_url && (
        <img
          src={buildCloudinaryUrl(event.cover_photo_url, { width: 1200 })}
          alt={event.title}
          className="w-full rounded-xl border border-brand-border"
        />
      )}
      <Pill className="mt-6" active={event.type === 'upcoming'}>
        {event.type === 'upcoming' ? 'Upcoming' : 'Past'}
      </Pill>
      <h1 className="mt-4 font-display text-4xl font-bold">{event.title}</h1>
      <p className="mt-1 text-brand-muted">{event.event_date}</p>
      {event.description && <p className="mt-6 text-brand-muted">{event.description}</p>}
      {event.registration_url && (
        <PrimaryButton href={event.registration_url} className="mt-6">
          Register
        </PrimaryButton>
      )}
      {event.gallery_urls.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.gallery_urls.map((url) => (
            <img
              key={url}
              src={buildCloudinaryUrl(url, { width: 400 })}
              alt=""
              className="rounded-lg border border-brand-border object-cover"
            />
          ))}
        </div>
      )}
      {event.video_embed_urls.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {event.video_embed_urls.map((url) => (
            <iframe key={url} src={url} className="aspect-video w-full rounded-lg" allowFullScreen />
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/events/[slug]/page.tsx"
git commit -m "feat: restyle Event detail page with brand tokens"
```

---

## Task 19: Redesign `app/(public)/contact/page.tsx`

**Files:**
- Modify: `app/(public)/contact/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings` (existing), `SectionHeading`/`PrimaryButton` (Task 6), `MailIcon`/`PhoneIcon`/`ChatIcon`/`PinIcon` (Task 6).
- Produces: default export `ContactPage()` — the `/contact` route. No form (explicit decision — see plan's Global Constraints).

- [ ] **Step 1: Replace `app/(public)/contact/page.tsx`**

```tsx
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PrimaryButton } from '@/components/ui/PrimaryButton'
import { MailIcon, PhoneIcon, ChatIcon, PinIcon } from '@/components/ui/icons'

export const metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  const infoRows = [
    settings.contact_email && {
      label: 'Email',
      value: settings.contact_email,
      href: `mailto:${settings.contact_email}`,
      Icon: MailIcon,
    },
    settings.phone_number && {
      label: 'Phone',
      value: settings.phone_number,
      href: `tel:${settings.phone_number}`,
      Icon: PhoneIcon,
    },
    settings.whatsapp_number && { label: 'WhatsApp', value: settings.whatsapp_number, Icon: ChatIcon },
    settings.college_address && { label: 'Address', value: settings.college_address, Icon: PinIcon },
  ].filter((row): row is { label: string; value: string; href?: string; Icon: typeof MailIcon } => Boolean(row))

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <SectionHeading
        eyebrow="— GET IN TOUCH"
        title="Let's Build Something Great"
        subtitle="Have a question, an idea, or want to collaborate? Reach out and we'll get back to you."
        align="center"
        className="mx-auto items-center text-center"
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-start gap-4 rounded-xl border border-brand-border bg-brand-surface p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-border text-brand-accent">
              <row.Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted">{row.label}</p>
              {row.href ? (
                <a href={row.href} className="mt-1 block font-medium text-white hover:text-brand-accent">
                  {row.value}
                </a>
              ) : (
                <p className="mt-1 font-medium text-white">{row.value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {socialEntries.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {socialEntries.map(([platform, url]) => (
            <a
              key={platform}
              href={url}
              className="rounded-full border border-brand-border px-4 py-2 text-sm capitalize text-brand-muted hover:border-brand-border-hover hover:text-brand-accent"
            >
              {platform}
            </a>
          ))}
        </div>
      )}

      {settings.contact_email && (
        <div className="mt-12 flex justify-center">
          <PrimaryButton href={`mailto:${settings.contact_email}`}>Join Insightix</PrimaryButton>
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/contact/page.tsx"
git commit -m "feat: redesign Contact page as info-only layout"
```

---

## Task 20: Final verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests pass, including the 4 new `lib/*.test.ts` files from Tasks 2-5 and every pre-existing test file.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors. If any `no-unused-vars` or similar warnings surface from the redesign (e.g. a leftover import), fix them now.

- [ ] **Step 3: Type check and production build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds, same route list as before (no routes added or removed) — `/`, `/about`, `/team`, `/events`, `/events/[slug]`, `/contact` all still present alongside the unchanged admin/API routes.

- [ ] **Step 4: Route smoke test**

Start the production server and confirm every public route returns 200 (not the 500 the site was showing before this work started — this repeats the exact technique used to diagnose that unrelated outage):

```bash
npx next start -p 3123 &
sleep 3
for p in / /about /team /events /contact; do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:3123$p")
  echo "$code  $p"
done
```

Expected: every path prints `200` (assuming `.env.local` points at a reachable Supabase project — if it still 500s with a `getaddrinfo ENOTFOUND` error identical to the earlier debugging session, that is the unrelated Supabase-project outage, not this redesign, and is out of scope for this plan).

Stop the server afterward (find and kill the process listening on port 3123).

- [ ] **Step 5: Manual visual check**

With the dev server running (`npm run dev`), open each of `/`, `/about`, `/team`, `/events`, `/events/<a real slug>`, `/contact` in a browser and confirm against the spec:
- Grid background visible but subtle on every page.
- Navbar sticky, translucent, active link shown in orange on the current page; the lightbulb logo mark renders next to "Insightix" (not a broken image) in both the navbar and footer, and the browser tab shows the same mark as its favicon.
- Mobile width (< 768px): navbar collapses to a hamburger that opens/closes and closes on Escape.
- Cards lift and get an orange-tinted glow on hover.
- Hero shows the particle globe with its three floating badges.
- Events page: featured event card, filter pills switch between All/Upcoming/Past.
- No layout overflow or broken images at 400px width.

- [ ] **Step 6: Update the design spec status**

In `docs/superpowers/specs/2026-09-29-club-website-redesign-design.md`, change the `**Status:**` line from `Approved, ready for implementation plan` to `Implemented`.

- [ ] **Step 7: Commit**

```bash
git add docs/superpowers/specs/2026-09-29-club-website-redesign-design.md
git commit -m "docs: mark redesign spec as implemented"
```
