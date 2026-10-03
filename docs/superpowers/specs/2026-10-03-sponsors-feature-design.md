# Sponsors & Partners Feature

**Status:** Approved, ready for implementation plan
**Scope:** A new `sponsors` content type, admin-managed like every other repeating item on the site (Team, Events), displayed on a new dedicated public page and as a secondary section on Home.

## Goal

Let the club showcase companies that sponsor its events: a logo, name, short description, and an optional link-out to the sponsor's site. Fully admin-editable (add/edit/archive), matching the exact architecture and conventions of the existing Team/Events admin sections — no new patterns introduced.

## Context

This fulfils part of what the original site design spec (`2026-08-27-club-website-design.md`) already scoped for "Phase 2 — remaining sections": *"Public pages: ... Sponsors & Partners ... Admin CRUD: sponsors/tiers, ..."*. This spec implements it now, flat (no tiers — explicit decision below), using the premium dark/orange aesthetic from the September redesign.

## Explicit decisions (from brainstorming)

- **Page name/route:** `/sponsors`, nav label "Sponsors".
- **No tiers/categories.** One flat list, ordered by an admin-controlled `display_order` — same mechanism Team members already use. Not a Platinum/Gold/Silver grouping.
- **Logos get a white "chip" background**, not shown raw on the dark card. Real company logos are almost always designed assuming a light background; showing them directly on `bg-brand-surface` risks an invisible or illegible logo (dark text/mark with no contrast against near-black). A small white rounded-square insert behind each logo guarantees every sponsor's logo stays legible regardless of its own color palette — a standard treatment on dark-themed sponsor walls.
- **Migration application is a manual, final step.** The Supabase CLI in this environment isn't authenticated (`supabase projects list` → `Unauthorized`), and no DB password or Management API token is available to apply schema changes programmatically. The implementation plan produces a single SQL migration file; the last step is the user pasting it into the Supabase Dashboard's SQL Editor (or running `supabase login && supabase db push` themselves). Every other part of the feature (admin CRUD, public pages) is buildable and verifiable via `tsc`/`next build` without the table existing yet — only *runtime* data operations need the real table.

## Data Model

New table, same shape conventions as `team_members` (`supabase/migrations/0001_phase1_schema.sql`): soft-delete via `is_active`, UUID primary key, `display_order` for manual admin-controlled ordering, RLS public-read / authenticated-write.

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

New migration file: `supabase/migrations/0002_sponsors.sql` (additive, following the existing `0001_phase1_schema.sql`'s numbering).

**Types:** add to `lib/supabase/types.ts`, same shape as `TeamMember`:
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

**Zod schema:** add to `lib/schemas.ts`, mirroring `teamMemberSchema`:
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

## Queries (`lib/queries/sponsors.ts`)

Mirrors `lib/queries/teamMembers.ts` exactly:
- `getActiveSponsors(): Promise<Sponsor[]>` — `is_active = true`, ordered by `display_order` — used by both public touchpoints.
- `getAllSponsors(): Promise<Sponsor[]>` — admin list, all rows (active + archived), ordered by `display_order`.
- `getSponsorById(id): Promise<Sponsor>` — admin edit form.

## Admin CRUD (`app/admin/sponsors/`)

Byte-for-byte the same structure as `app/admin/team/`:
- `app/admin/sponsors/page.tsx` — list, name + Edit link + Archive button (soft-delete, same `archiveTeamMember` pattern — never a hard `DELETE`).
- `app/admin/sponsors/new/page.tsx` — uses `SponsorForm` + `createSponsor`.
- `app/admin/sponsors/[id]/page.tsx` — uses `SponsorForm` + `updateSponsor.bind(null, id)`.
- `app/admin/sponsors/SponsorForm.tsx` — react-hook-form + zodResolver, same field-wrapper markup as `TeamMemberForm.tsx`. Fields: Name (text), Logo (`<ImageUpload folder="sponsors" />`, same Cloudinary component every other admin form already uses), Description (textarea), Website URL (url input), Display order (number input).
- `app/admin/sponsors/actions.ts` — `createSponsor`, `updateSponsor`, `archiveSponsor`, identical shape to `app/admin/team/actions.ts` (parse with `sponsorSchema`, `createServiceSupabaseClient()`, `revalidatePath('/sponsors')` + `revalidatePath('/')` since Home also shows sponsors, then `redirect('/admin/sponsors')`).
- `app/admin/layout.tsx` — add `<Link href="/admin/sponsors">Sponsors</Link>` to the existing nav list.

No changes to `middleware.ts` — it already matches `/admin/:path*`, so the new routes are auth-gated automatically.

## Public Page (`app/(public)/sponsors/page.tsx`)

New route, new nav item. Structure matches the established page pattern (`SectionHeading` + `RevealSection`-wrapped content, brand-token cards):

```
SectionHeading (as="h1", eyebrow "— SPONSORS", title "Our Sponsors & Partners",
  subtitle something like "The companies and organizations that make our events possible.")

RevealSection: responsive grid (sm:grid-cols-2 lg:grid-cols-3) of SponsorCard,
  one per active sponsor (empty-state message if none, matching the
  "No events yet" / "No events in this category yet" pattern already used
  on Home/Events).
```

**New component `components/ui/SponsorCard.tsx`:**
- White rounded-square "chip" (`bg-white`, padding, rounded) containing the logo `<img>` (or a neutral placeholder square if `logo_url` is null — never broken-image).
- Name (`font-display font-bold`), description (`text-brand-muted`, null-safe — only rendered if set).
- If `website_url` is set, the whole card is a `<a href={website_url} target="_blank" rel="noopener noreferrer" className="focus-ring ...">`; if not set, it's a plain `<div>` (no dead/empty link).
- Same hover treatment as every other card on the site (lift + border + glow — the `.card-hover`-style classes already used in `EventCard`/`TeamCard`).

## Home Page Addition

A new section in `app/(public)/page.tsx`, after "Why Insightix", before the closing `</main>`:

```
RevealSection:
  SectionHeading (eyebrow "— OUR SPONSORS", title "Our Sponsors", align="center")
  Horizontal logo strip: same white-chip logo treatment as SponsorCard but
    compact (just the chip + name, no description) — a flex-wrap row of
    small logo chips, not full cards (sponsors are a secondary Home mention,
    not a primary section).
  SecondaryButton "View All Sponsors" -> /sponsors
  If getActiveSponsors() returns [], the whole section renders nothing
    (unlike Events, which always shows an empty-state message) -- an
    empty sponsor strip reads as more broken than an absent one on a
    primary landing page; the dedicated /sponsors page still shows its
    own explicit empty state since a visitor who navigated there
    deliberately should get confirmation, not a blank page.
```

`getActiveSponsors()` is called via the same `Promise.all` already fetching `getHomeContent()`/`getRecentEvents()` on Home — one added parallel query, no added waterfall.

## Non-goals

- No sponsor tiers/categories (explicit decision above).
- No sponsor-submission form (sponsors are added by the admin, not self-service).
- No payment/checkout anywhere — this is a static showcase of existing sponsorship relationships, not a way to become a sponsor online.
- No changes to any existing table, page, or component beyond the additions listed above.

## Files Touched

**New:** `supabase/migrations/0002_sponsors.sql`, `lib/queries/sponsors.ts`, `components/ui/SponsorCard.tsx`, `app/(public)/sponsors/page.tsx`, `app/admin/sponsors/{page.tsx, SponsorForm.tsx, actions.ts, new/page.tsx, [id]/page.tsx}`.

**Modified:** `lib/supabase/types.ts` (add `Sponsor`), `lib/schemas.ts` (add `sponsorSchema`), `components/layout/NavLinks.tsx` (add Sponsors to `NAV_ITEMS`, positioned after Events and before Contact: Home / About / Team / Events / **Sponsors** / Contact), `components/layout/Footer.tsx`'s `NAV_LINKS` (same addition, same position, for consistency with how Home/About/Team/Events/Contact are already listed there), `app/admin/layout.tsx` (add nav link), `app/(public)/page.tsx` (new section).

No changes to: `middleware.ts`, `app/api/cloudinary-sign/route.ts` (folder is a free-form string already, no allowlist to update), any existing table or RLS policy.
