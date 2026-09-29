# Insightix Club Website — Visual Redesign

**Status:** Implemented (pending manual visual QA)
**Scope:** Public site only (`app/(public)/**`, shared layout components). Admin CMS (`app/admin/**`) is untouched — it already reads the updated color tokens from `globals.css` but its layout/markup is out of scope.

## Goal

Redesign the existing public Insightix site (Home, About, Team, Events, Contact + navbar/footer) into a premium, futuristic dark analytics-club aesthetic, matching two reference mockups the user supplied. This is a **visual and structural** redesign: no new Supabase tables, no new routes, no new npm dependencies, no new backend capabilities. Every page keeps its existing CMS-backed content; only presentation and layout change.

## Explicit Non-Goals (decided during brainstorming)

- **No Classes/Learning page.** No `classes` table exists and none is being added. Any reference-image content about Classes is ignored.
- **No About page timeline/milestones.** No founding-date or milestone data exists in the CMS; fabricating club history is out. About page has no timeline section.
- **No Events category tags** (Workshop/Competition/Speaker Session/etc.). Events only have `type: 'upcoming' | 'past'` today — filtering stays to **All / Upcoming / Past**, styled as pills.
- **No functional Contact form.** No submission backend exists (no table, no email service) and none is being added. The Contact page is redesigned as an info-only layout — see Contact section below. The second reference image shows a working message form; per explicit user decision this is *not* built.
- **No fabricated photography.** The reference mockups use stock photos (a building exterior, a laptop dashboard) which don't correspond to anything Insightix actually has. Anywhere the reference uses a photo we don't have a real source for, this spec substitutes a graphic panel (grid pattern / wordmark / motif) built from CSS+SVG — never a fake photo presented as if it were real.
- **No new npm dependencies.** Icons are hand-rolled inline SVG. No icon library, no UI kit, no carousel library.

## Design Tokens (`app/globals.css`)

```
--color-brand-bg:            #0B0B0B   /* page background */
--color-brand-surface:       rgba(255,255,255,0.03)  /* card background */
--color-brand-border:        rgba(255,255,255,0.10)  /* default border */
--color-brand-border-hover:  rgba(255,122,0,0.40)     /* hover border */
--color-brand-accent:        #FF7A00
--color-brand-accent-hover:  #FF8A00
--color-brand-text:          #FFFFFF
--color-brand-muted:         #A1A1AA
```

`#f5820c` is replaced by `#FF7A00` everywhere it's hardcoded today (both `opengraph-image.tsx` files, since `@vercel/og` can't read CSS vars).

**Card style:** `bg-brand-surface border border-brand-border rounded-xl`, hover → `border-brand-border-hover` + a soft orange glow (`shadow-[0_0_24px_-8px_rgba(255,122,0,0.35)]`) + `-translate-y-1`, transition on `transform, box-shadow, border-color` only (cheap, GPU-friendly).

**Grid background:** a fixed, full-viewport layer behind all content (`position: fixed; inset: 0; z-index: -10`), built from two `repeating-linear-gradient`/`linear-gradient` layers — white lines at ~6% opacity, 1px, 48px cells — plus a radial-gradient mask so the grid is most visible mid-viewport and fades toward the extreme edges (matches the reference's vignette look). Pure CSS, no image asset. Applied once in `app/layout.tsx`, visible through every page including admin (harmless there).

**Typography:** unchanged — `Space_Grotesk` (display/headings) + `Inter` (body), already loaded via `next/font` in `app/layout.tsx`.

## Shared Components (new `components/ui/`)

| Component | Purpose |
|---|---|
| `PrimaryButton` | Orange-filled CTA. Hover: `brand-accent-hover` bg + lift. Focus-visible: orange ring. |
| `SecondaryButton` | Outlined ghost button, white/10 border → orange border on hover. |
| `SectionHeading` | Small orange eyebrow (e.g. `— ABOUT US`) + large `font-display` title + optional subtitle. Used at the top of every page section. |
| `Pill` | Rounded-full tag/filter chip. `active` prop toggles orange-filled vs outlined — used for nav active-state indicator styling and the Events All/Upcoming/Past filter. |
| `StatBar` | Compact inline stat row: eyebrow label + N number/label pairs separated by thin vertical dividers (the About page "OUR IMPACT" strip and Home stats strip both use this). |
| `EventCard` | Two variants: `featured` (large, image/graphic panel + meta row + description + Register CTA) and `compact` (icon badge + title + date/location + arrow, used in horizontal lists and the Home "recent events" grid). |
| `TeamCard` | Circular photo (Cloudinary) or initials-avatar fallback, name, role in orange, single LinkedIn icon button (only field the data model has — no fabricated GitHub/Instagram/email icons). |

`RevealSection` (existing) stays as-is and wraps each page section for scroll-reveal (`whileInView`, respects `prefers-reduced-motion` via the existing global media-query rule + `MotionConfig`).

## Navbar (`components/layout/Header.tsx`, redesigned)

- Sticky (`sticky top-0 z-50`), translucent (`bg-brand-bg/70 backdrop-blur border-b border-brand-border`).
- Left: Cloudinary logo (if set) + "Insightix" wordmark, links to `/`.
- Right: **Home, About, Team, Events, Contact** (Classes omitted), active link shown in orange with a thin underline. Active-state detection is a small client subcomponent (`NavLinks`, uses `usePathname`) so the Header itself stays an async server component for the logo fetch.
- Far right: orange `Pill`-style "Join Us" button → `/contact`.
- Mobile (`< md`): hamburger icon toggles a slide-down panel with the same links; `aria-expanded` on the toggle, `Escape` closes it, focus returns to the toggle button on close.

## Footer (redesigned)

Logo + tagline, nav link list, social icon row (from existing `social_links`), contact email, bottom copyright bar. Same `site_settings` fields as today, restyled to match card/border language.

## Home Page

1. **Hero**
   - Small orange eyebrow: `— STUDENT ANALYTICS CLUB`.
   - `Insight`+`ix` heading (ix in orange, existing treatment kept).
   - Static subtitle line (e.g. "Explore Data. Build Skills. Create Impact.") + CMS `intro_text` paragraph beneath it.
   - CTAs: `PrimaryButton` **"Explore Events"** → `/events`, `SecondaryButton` **"Learn More"** → `/about`.
   - Below CTAs: a row of 4 small icon+label pairs (Workshops/Learn by doing, Projects/Apply knowledge, Community/Grow together, Real Impact/Turn ideas into solutions) — static copy, inline SVG icons in small circular badges.
   - **Right side: particle-globe graphic.** A hand-built SVG decorative piece — dots arranged in a sphere-like scatter (precomputed points, no external lib) in shades of orange/white, 1-2 thin elliptical orbit rings, and 2-3 floating pill badges ("Data", "People", "Impact" with small icons) absolutely positioned around it with a slow CSS float animation. This is the hero's visual centerpiece, replacing the old plain Cloudinary banner treatment (banner_media_url still renders if an admin sets one, but the globe is the default/primary visual). Respects `prefers-reduced-motion` (float animation disabled, static globe shown).
   - Grid background shows through (global layer).

2. **Stats strip** — `StatBar`: Members / Workshops / Projects / Sessions, **placeholder values** defined as a commented constant at the top of the component (`// Placeholder — replace with real club figures`).

3. **Recent Events** — existing `getRecentEvents(3)` data rendered as 3 `EventCard` (`compact` variant, grid layout) + "View All Events" `SecondaryButton` → `/events`.

4. **Why Insightix** — static 4-card section: Learn / Build / Collaborate / Compete, small inline-SVG icons, short static descriptions.

## About Page

- `SectionHeading`: eyebrow `— ABOUT US`, large heading (static marketing copy, e.g. "A Community for Data-Driven Minds" — distinct from the CMS paragraph fields, same pattern as the existing hardcoded "About Insightix" heading today), short paragraph built from CMS content.
- Right of the intro: a **graphic panel** (not a fake photo) — dark gradient/grid panel with a large ghost-style "Insightix" wordmark and a vertical PEOPLE / IDEAS / DATA / IMPACT label stack, thin orange accent line. If `home_content.banner_media_url` is set, that real Cloudinary image is used instead with the same overlay treatment; otherwise the graphic panel is the default.
- Two icon cards side by side: **Our Mission** (target icon, CMS `mission` field) / **Our Vision** (eye icon, CMS `vision` field).
- `StatBar`: "OUR IMPACT" eyebrow + 4 placeholder numbers (Events / Members / Speakers / Projects), same placeholder pattern as Home.
- "What We Do" section from CMS `objectives`.
- "Our Story" narrative section from CMS `history` (real content, plain section — not a fabricated visual timeline).
- Faculty message as a quote-style card from CMS `faculty_message`.
- CTA: `PrimaryButton` "Join Insightix" → `/contact`.
- All five fields (`vision`, `mission`, `history`, `objectives`, `faculty_message`) already render conditionally today (null-safe) — that behavior is preserved.

## Team Page

- `SectionHeading`: eyebrow `— OUR TEAM`, "Meet the Team", short static subtitle.
- Existing category grouping (Core Committee / Faculty Coordinators / Senior Team / Junior Team) preserved, each rendered as a responsive card grid (not a carousel — the reference shows carousel arrows, but that's new interaction complexity not requested in the original brief; a wrapping grid is simpler, fully accessible, and works at all viewport widths) using the new `TeamCard`.

## Events Page

- `SectionHeading`: eyebrow `— EVENTS`, "Learn. Build. Network.", subtitle, "View Past Events" `SecondaryButton` (scrolls to / links to the past-events section).
- **Featured event**: the single nearest upcoming event (first item from `getUpcomingEvents()`) rendered as `EventCard` `featured` variant — large card, "FEATURED EVENT" orange pill badge, title, date/time/location meta row with icons, description, Register CTA. Image side uses `event.cover_photo_url` via Cloudinary if set, otherwise a graphic panel (grid + chart-line motif, same honest-placeholder approach as About).
- **Upcoming Events**: remaining upcoming events as `compact` `EventCard`s in a row, "View All" pointing further down the page.
- **Past events**: existing past-events list, restyled with the same `compact` `EventCard`.
- Filter pills: `Pill` row — **All / Upcoming / Past** (client-side toggle over the already-fetched arrays, no new data fetching or routing).
- Event detail page (`events/[slug]`) keeps its current structure, restyled to the new card/border/type language for visual consistency.

## Contact Page

No form (per explicit decision). Redesigned as a single-column, centered layout:
- `SectionHeading`: eyebrow `— GET IN TOUCH`, heading (e.g. "Let's Build Something Great"), short subtitle.
- Info rows restyled with icon-in-badge treatment (email, phone, WhatsApp, address — each conditionally rendered exactly as today, null-safe).
- Social links row (existing `social_links`), same icon-badge style.
- `PrimaryButton` "Join Insightix" → `mailto:{contact_email}` (falls back to omitted if no `contact_email` set, same null-safety as today).

## Interactions & Accessibility

- Scroll-reveal via existing `RevealSection` on every page section.
- Card hover: lift + orange glow border, CSS transitions only (no Framer Motion per-card, keeps it cheap).
- All buttons/links get visible `focus-visible` states (orange ring) — required since the design leans on subtle borders that don't double as focus indicators.
- Hamburger menu, filter pills, and any other interactive control are real buttons with correct ARIA state, keyboard-operable.
- Hero globe animation and any other decorative motion is disabled under `prefers-reduced-motion` (already enforced globally in `app/globals.css`).
- Fully responsive down to mobile: grid/card layouts collapse to single column, navbar collapses to hamburger, hero globe graphic scales down or stacks below the text on narrow viewports.

## Files Touched

- `app/globals.css` — tokens, grid background, card/focus utilities.
- `app/layout.tsx` — mount the grid background layer.
- `app/opengraph-image.tsx`, `app/(public)/events/[slug]/opengraph-image.tsx` — color fix (`#f5820c` → `#FF7A00`), no structural change.
- `components/layout/Header.tsx`, `components/layout/Footer.tsx` — redesigned.
- `components/home/Hero.tsx` — redesigned, adds the particle-globe graphic.
- `components/team/TeamGrid.tsx` — refactored to use new `TeamCard`.
- `app/(public)/page.tsx`, `about/page.tsx`, `team/page.tsx`, `events/page.tsx`, `events/[slug]/page.tsx`, `contact/page.tsx` — restructured to the new layout/components.
- New: `components/ui/PrimaryButton.tsx`, `SecondaryButton.tsx`, `SectionHeading.tsx`, `Pill.tsx`, `StatBar.tsx`, `EventCard.tsx`, `TeamCard.tsx`, and a decorative `components/home/ParticleGlobe.tsx`.

No changes to: `lib/queries/**`, `lib/supabase/**`, `supabase/migrations/**`, `app/admin/**`, `app/api/**`, `middleware.ts`.
