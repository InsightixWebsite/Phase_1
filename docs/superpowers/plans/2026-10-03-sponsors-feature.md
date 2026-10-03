# Sponsors & Partners Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new admin-managed `sponsors` content type — CRUD under `/admin/sponsors`, displayed on a new `/sponsors` page and as a logo strip on Home — built from `docs/superpowers/specs/2026-10-03-sponsors-feature-design.md`.

**Architecture:** A new Supabase table (`sponsors`) following the exact same shape and RLS pattern as the existing `team_members` table. Every file in this plan directly mirrors an existing, already-shipped counterpart (`lib/queries/teamMembers.ts` → `lib/queries/sponsors.ts`, `app/admin/team/**` → `app/admin/sponsors/**`, etc.) — this is a known-good pattern being replicated, not new architecture.

**Tech Stack:** Next.js App Router, Supabase (Postgres + RLS), Cloudinary (logo upload via the existing `ImageUpload` component), react-hook-form + zod, Tailwind v4 brand tokens from the September redesign, Vitest.

## Global Constraints

- RLS on the new table: public read, write restricted to authenticated admin — exact policy text given in Task 1.
- Soft-delete via `is_active`, never hard `DELETE` (existing project-wide convention).
- Sponsor logos get a white rounded-square "chip" background behind them wherever displayed (SponsorCard and the Home logo strip) — real company logos are designed for light backgrounds and would risk being illegible on the site's near-black cards otherwise. This is the one visual detail that differs from how Team/Event images are shown (those display directly on the dark card).
- No sponsor tiers/categories — one flat list ordered by `display_order` (explicit decision, not a gap).
- No new npm dependencies.
- **The migration is not applied by any task in this plan.** The Supabase CLI in this environment is unauthenticated and no DB credentials are available to run DDL. Task 1 only creates the migration SQL file; Task 7 (final) hands the user the exact SQL to paste into the Supabase Dashboard's SQL Editor. Every other task's code is written and verified (via `tsc`/`next build`) without the table needing to exist yet — Supabase client calls aren't validated against a live schema at build time, only at runtime.
- This codebase's convention: presentational components are not unit-tested; pure/declarative logic (zod schemas, `lib/` pure functions) is tested with colocated vitest tests, following the existing style (`describe`/`it`/`expect`, see `lib/schemas.test.ts`). Query files that are thin Supabase I/O wrappers (e.g. `lib/queries/teamMembers.ts`) have no test file in this codebase — `lib/queries/sponsors.ts` follows that same convention; do not add a test file for it.

---

## Task 1: Data model — migration, types, schema

**Files:**
- Create: `supabase/migrations/0002_sponsors.sql`
- Modify: `lib/supabase/types.ts`
- Modify: `lib/schemas.ts`
- Modify: `lib/schemas.test.ts`

**Interfaces:**
- Produces: the `sponsors` table (applied manually later, see Global Constraints), the `Sponsor` TypeScript interface, and `sponsorSchema`/`SponsorInput` — consumed by every later task in this plan.

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/0002_sponsors.sql`:

```sql
create table sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  description text,
  website_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table sponsors enable row level security;

create policy "public read" on sponsors for select using (true);
create policy "admin write" on sponsors for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
```

- [ ] **Step 2: Add the `Sponsor` type**

In `lib/supabase/types.ts`, add (matching the existing `TeamMember` interface's style — same file, just append):

```ts
export interface Sponsor {
  id: string
  name: string
  logo_url: string | null
  description: string | null
  website_url: string | null
  display_order: number
  is_active: boolean
  created_at: string
}
```

- [ ] **Step 3: Write the failing test for `sponsorSchema`**

In `lib/schemas.test.ts`, add this `describe` block (after the existing `eventSchema` block — the import line at the top of the file will need `sponsorSchema` added to it too):

```ts
describe('sponsorSchema', () => {
  it('requires a name', () => {
    const result = sponsorSchema.safeParse({
      name: '', logo_url: null, description: null, website_url: '', display_order: 0,
    })
    expect(result.success).toBe(false)
  })

  it('accepts a valid sponsor with an empty website_url', () => {
    const result = sponsorSchema.safeParse({
      name: 'Acme Corp', logo_url: null, description: 'A great sponsor', website_url: '', display_order: 0,
    })
    expect(result.success).toBe(true)
  })
})
```

Update the import at the top of `lib/schemas.test.ts` from:
```ts
import { siteSettingsSchema, teamMemberSchema, eventSchema } from './schemas'
```
to:
```ts
import { siteSettingsSchema, teamMemberSchema, eventSchema, sponsorSchema } from './schemas'
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run lib/schemas.test.ts`
Expected: FAIL — `sponsorSchema` is not exported from `./schemas`.

- [ ] **Step 5: Add `sponsorSchema` to `lib/schemas.ts`**

Append to `lib/schemas.ts` (after `eventSchema`), mirroring `teamMemberSchema`'s style:

```ts
export const sponsorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo_url: z.string().url().nullable(),
  description: z.string().nullable(),
  website_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  display_order: z.coerce.number().int(),
})
export type SponsorInput = z.infer<typeof sponsorSchema>
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `npx vitest run lib/schemas.test.ts`
Expected: PASS (all `describe` blocks, including the 2 new `sponsorSchema` tests).

- [ ] **Step 7: Verify the whole project still typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/0002_sponsors.sql lib/supabase/types.ts lib/schemas.ts lib/schemas.test.ts
git commit -m "feat: add sponsors data model (migration, type, zod schema)"
```

---

## Task 2: `lib/queries/sponsors.ts`

**Files:**
- Create: `lib/queries/sponsors.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient` (existing, `lib/supabase/server.ts`), `Sponsor` type (Task 1).
- Produces: `getActiveSponsors(): Promise<Sponsor[]>`, `getAllSponsors(): Promise<Sponsor[]>`, `getSponsorById(id: string): Promise<Sponsor>` — used by Task 3 (admin), Task 5 (public page), Task 6 (Home).

- [ ] **Step 1: Create `lib/queries/sponsors.ts`**

Mirrors `lib/queries/teamMembers.ts` exactly:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Sponsor } from '@/lib/supabase/types'

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  if (error) throw error
  return data as Sponsor[]
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('sponsors').select('*').order('display_order')
  if (error) throw error
  return data as Sponsor[]
}

export async function getSponsorById(id: string): Promise<Sponsor> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.from('sponsors').select('*').eq('id', id).single()
  if (error) throw error
  return data as Sponsor
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

No test file for this task — thin Supabase I/O wrapper, matches `lib/queries/teamMembers.ts`'s existing convention (no test sibling).

- [ ] **Step 3: Commit**

```bash
git add lib/queries/sponsors.ts
git commit -m "feat: add sponsors query functions"
```

---

## Task 3: Admin CRUD (`app/admin/sponsors/`)

**Files:**
- Create: `app/admin/sponsors/SponsorForm.tsx`
- Create: `app/admin/sponsors/actions.ts`
- Create: `app/admin/sponsors/page.tsx`
- Create: `app/admin/sponsors/new/page.tsx`
- Create: `app/admin/sponsors/[id]/page.tsx`
- Modify: `app/admin/layout.tsx`

**Interfaces:**
- Consumes: `sponsorSchema`/`SponsorInput` (Task 1), `getAllSponsors`/`getSponsorById` (Task 2), `ImageUpload` (existing, `components/admin/ImageUpload.tsx`), `createServiceSupabaseClient` (existing).
- Produces: the full `/admin/sponsors` CRUD flow. No other task consumes this directly — it's the admin-side leaf of the feature.

- [ ] **Step 1: Create `app/admin/sponsors/SponsorForm.tsx`**

Mirrors `app/admin/team/TeamMemberForm.tsx` exactly, swapping fields:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { z } from 'zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { sponsorSchema, type SponsorInput } from '@/lib/schemas'
import type { Sponsor } from '@/lib/supabase/types'

interface SponsorFormProps {
  initial?: Sponsor
  action: (input: SponsorInput) => Promise<{ error?: string }>
}

export function SponsorForm({ initial, action }: SponsorFormProps) {
  const [logoUrl, setLogoUrl] = useState(initial?.logo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof sponsorSchema>, unknown, SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: {
      name: initial?.name ?? '',
      logo_url: initial?.logo_url ?? null,
      description: initial?.description ?? '',
      website_url: initial?.website_url ?? '',
      display_order: initial?.display_order ?? 0,
    },
  })

  async function onSubmit(values: SponsorInput) {
    setServerError(null)
    const result = await action({ ...values, logo_url: logoUrl })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Name
        <input {...register('name')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.name && <span className="text-sm text-red-400">{errors.name.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Logo
        <ImageUpload
          value={logoUrl}
          onChange={(url) => { setLogoUrl(url); setValue('logo_url', url) }}
          folder="sponsors"
        />
      </label>
      <label className="flex flex-col gap-1">
        Description
        <textarea {...register('description')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.description && <span className="text-sm text-red-400">{errors.description.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Website URL
        <input {...register('website_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.website_url && <span className="text-sm text-red-400">{errors.website_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Display order
        <input {...register('display_order')} type="number" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.display_order && <span className="text-sm text-red-400">{errors.display_order.message}</span>}
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `app/admin/sponsors/actions.ts`**

Mirrors `app/admin/team/actions.ts` exactly, with one addition: because sponsors also show on Home, both `/sponsors` and `/` must be revalidated (Team's actions only revalidate `/team`, since Team members don't appear on Home):

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { sponsorSchema, type SponsorInput } from '@/lib/schemas'

export async function createSponsor(input: SponsorInput): Promise<{ error?: string }> {
  const parsed = sponsorSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}

export async function updateSponsor(id: string, input: SponsorInput): Promise<{ error?: string }> {
  const parsed = sponsorSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}

export async function archiveSponsor(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('sponsors').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/sponsors')
  revalidatePath('/')
  redirect('/admin/sponsors')
}
```

- [ ] **Step 3: Create `app/admin/sponsors/page.tsx`**

Mirrors `app/admin/team/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllSponsors } from '@/lib/queries/sponsors'
import { archiveSponsor } from './actions'

export default async function SponsorsListPage() {
  const sponsors = await getAllSponsors()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Sponsors</h1>
        <Link href="/admin/sponsors/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add sponsor</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {sponsors.map((s) => (
          <li key={s.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={s.is_active ? '' : 'text-neutral-500 line-through'}>{s.name}</span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/sponsors/${s.id}`} className="text-brand-accent">Edit</Link>
              {s.is_active && (
                <form action={archiveSponsor.bind(null, s.id)}>
                  <button type="submit" className="text-neutral-400">Archive</button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 4: Create `app/admin/sponsors/new/page.tsx`**

```tsx
import { SponsorForm } from '../SponsorForm'
import { createSponsor } from '../actions'

export default function NewSponsorPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Sponsor</h1>
      <SponsorForm action={createSponsor} />
    </div>
  )
}
```

- [ ] **Step 5: Create `app/admin/sponsors/[id]/page.tsx`**

```tsx
import { getSponsorById } from '@/lib/queries/sponsors'
import { SponsorForm } from '../SponsorForm'
import { updateSponsor } from '../actions'

export default async function EditSponsorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sponsor = await getSponsorById(id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Sponsor</h1>
      <SponsorForm initial={sponsor} action={updateSponsor.bind(null, id)} />
    </div>
  )
}
```

- [ ] **Step 6: Add the nav link in `app/admin/layout.tsx`**

Add one line to the existing nav `<div>` (after the Events link):

```tsx
<Link href="/admin/sponsors">Sponsors</Link>
```

- [ ] **Step 7: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds. The new `/admin/sponsors`, `/admin/sponsors/new`, `/admin/sponsors/[id]` routes appear in the route list; no existing route removed.

- [ ] **Step 8: Commit**

```bash
git add app/admin/sponsors app/admin/layout.tsx
git commit -m "feat: add Sponsors admin CRUD"
```

---

## Task 4: `components/ui/SponsorCard.tsx`

**Files:**
- Create: `components/ui/SponsorCard.tsx`

**Interfaces:**
- Consumes: `Sponsor` type (Task 1), `buildCloudinaryUrl` (existing, `lib/cloudinary.ts`).
- Produces: `SponsorCard({ sponsor: Sponsor })` — used by Task 5 (public `/sponsors` page). The Home page's logo strip (Task 6) is visually different enough (compact, no description) that it renders its own markup rather than reusing this component — see Task 6.

- [ ] **Step 1: Create `components/ui/SponsorCard.tsx`**

```tsx
import { buildCloudinaryUrl } from '@/lib/cloudinary'
import type { Sponsor } from '@/lib/supabase/types'

function SponsorCardContent({ sponsor }: { sponsor: Sponsor }) {
  return (
    <>
      <div className="flex h-20 w-full items-center justify-center rounded-lg bg-white p-3">
        {sponsor.logo_url ? (
          <img
            src={buildCloudinaryUrl(sponsor.logo_url, { width: 240 })}
            alt={sponsor.name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="font-display text-sm font-bold text-neutral-400">{sponsor.name}</span>
        )}
      </div>
      <p className="mt-4 font-display font-bold text-white">{sponsor.name}</p>
      {sponsor.description && <p className="mt-2 text-sm text-brand-muted">{sponsor.description}</p>}
    </>
  )
}

export function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const cardClasses =
    'flex flex-col rounded-xl border border-brand-border bg-brand-surface p-6 text-center items-center transition hover:-translate-y-1 hover:border-brand-border-hover hover:shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]'

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`focus-ring ${cardClasses}`}
      >
        <SponsorCardContent sponsor={sponsor} />
      </a>
    )
  }

  return (
    <div className={cardClasses}>
      <SponsorCardContent sponsor={sponsor} />
    </div>
  )
}
```

Note: when `logo_url` is null, the logo chip shows the sponsor's name as text instead of a broken image — never render an `<img>` with no `src`.

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/SponsorCard.tsx
git commit -m "feat: add SponsorCard component"
```

---

## Task 5: Public `/sponsors` page

**Files:**
- Create: `app/(public)/sponsors/page.tsx`

**Interfaces:**
- Consumes: `getActiveSponsors` (Task 2), `SponsorCard` (Task 4), `SectionHeading` (existing, `components/ui/SectionHeading.tsx`), `RevealSection` (existing).
- Produces: the `/sponsors` route.

- [ ] **Step 1: Create `app/(public)/sponsors/page.tsx`**

```tsx
import { getActiveSponsors } from '@/lib/queries/sponsors'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SponsorCard } from '@/components/ui/SponsorCard'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'Sponsors & Partners' }

export default async function SponsorsPage() {
  const sponsors = await getActiveSponsors()

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <SectionHeading
        as="h1"
        eyebrow="— SPONSORS"
        title="Our Sponsors & Partners"
        subtitle="The companies and organizations that make our events possible."
      />

      <RevealSection className="mt-12">
        {sponsors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => (
              <SponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <p className="text-brand-muted">No sponsors listed yet — check back soon.</p>
        )}
      </RevealSection>
    </main>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds, `/sponsors` appears in the route list.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/sponsors/page.tsx"
git commit -m "feat: add public Sponsors page"
```

---

## Task 6: Home page section + nav/footer links

**Files:**
- Modify: `app/(public)/page.tsx`
- Modify: `components/layout/NavLinks.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: `getActiveSponsors` (Task 2), `buildCloudinaryUrl` (existing), `SectionHeading`/`SecondaryButton` (existing).
- Produces: nothing new consumed elsewhere — this is the plan's final wiring task.

- [ ] **Step 1: Add Sponsors to `components/layout/NavLinks.tsx`**

In the `NAV_ITEMS` array, add `{ label: 'Sponsors', href: '/sponsors' }` positioned after Events and before Contact:

```ts
const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Contact', href: '/contact' },
] as const
```

- [ ] **Step 2: Add Sponsors to `components/layout/Footer.tsx`**

Same addition, same position, in the `NAV_LINKS` array:

```ts
const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Events', href: '/events' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Contact', href: '/contact' },
]
```

- [ ] **Step 3: Add the Sponsors section to `app/(public)/page.tsx`**

Add `getActiveSponsors` to the existing `Promise.all` and `buildCloudinaryUrl` to the imports:

```ts
import { getActiveSponsors } from '@/lib/queries/sponsors'
import { buildCloudinaryUrl } from '@/lib/cloudinary'
```

```tsx
const [content, recentEvents, sponsors] = await Promise.all([
  getHomeContent(),
  getRecentEvents(3),
  getActiveSponsors(),
])
```

Add this new section after the existing "Why Insightix" `RevealSection` and before the closing `</main>` tag. Unlike the other Home sections, this one renders nothing at all when there are no sponsors yet (an empty logo strip reads as more broken than an absent section on a primary landing page — the dedicated `/sponsors` page still shows its own explicit "No sponsors listed yet" message for a visitor who navigated there on purpose):

```tsx
{sponsors.length > 0 && (
  <RevealSection className="mx-auto max-w-6xl px-6 py-16">
    <SectionHeading eyebrow="— OUR SPONSORS" title="Our Sponsors" align="center" className="mx-auto items-center text-center" />
    <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
      {sponsors.map((sponsor) => (
        <div key={sponsor.id} className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-32 items-center justify-center rounded-lg bg-white p-2">
            {sponsor.logo_url ? (
              <img
                src={buildCloudinaryUrl(sponsor.logo_url, { width: 160 })}
                alt={sponsor.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-center text-xs font-semibold text-neutral-500">{sponsor.name}</span>
            )}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-8 flex justify-center">
      <SecondaryButton href="/sponsors">View All Sponsors</SecondaryButton>
    </div>
  </RevealSection>
)}
```

`SecondaryButton` is already imported in this file (used by the Recent Events section) — no new import needed for it.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx next build`
Expected: build succeeds, same route list plus `/sponsors` (added in Task 5).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/page.tsx" components/layout/NavLinks.tsx components/layout/Footer.tsx
git commit -m "feat: show sponsors on Home page, add Sponsors to nav and footer"
```

---

## Task 7: Final verification and migration handoff

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: all tests pass, including the 2 new `sponsorSchema` tests from Task 1, and every pre-existing test.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors introduced by this plan (the codebase has 8 pre-existing `no-img-element` warnings in an unrelated admin file — don't fix those, they're out of scope).

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit` — must be clean.
Run: `npx next build` — must succeed. Confirm the route list now includes `/sponsors`, `/admin/sponsors`, `/admin/sponsors/new`, `/admin/sponsors/[id]`, with every pre-existing route still present.

- [ ] **Step 4: Report the migration SQL to the user**

This plan does not and cannot apply the migration (see Global Constraints — no authenticated Supabase CLI session or DB credentials are available). The final report to the user MUST include the exact contents of `supabase/migrations/0002_sponsors.sql`, with instructions to:
1. Open the Supabase Dashboard for the project → SQL Editor.
2. Paste and run the migration SQL.
3. Confirm the `sponsors` table appears under Table Editor with RLS enabled and the two policies listed.

Without this step, every page/route built in this plan will compile and deploy correctly, but will throw a runtime error the moment it queries the (not-yet-existing) `sponsors` table — this is expected and resolves the instant the SQL is run.

- [ ] **Step 5: Commit** (only if Steps 1-3 required any fix)

If lint/build required no fixes, there is nothing to commit for this task — just report the verification results and the migration SQL to the user.
