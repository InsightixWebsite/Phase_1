# Insightix Club Website — Design Spec

**Date:** 2026-08-27
**Status:** Approved for planning

## Overview

A public marketing/informational website for the Insightix college tech club, with a
built-in admin dashboard so non-technical committee members can edit every section
themselves. Ten public sections (Home, About Us, Team, Events & Competitions, Gallery,
Sponsors & Partners, Achievements, Resources, Guest Speakers & Alumni, Contact Us),
built as a single Next.js app deployed to Vercel under a custom domain, backed by
Supabase for data/auth and Cloudinary for media.

Brand: black background with the club's amber/orange lightbulb logo as the accent
color — theme direction is dark and bold/animated (antinomy.studio energy) with a
disciplined grid for content-heavy pages (codapress.co.uk structure), kept fast
despite the motion.

Infra note: the club has its own dedicated GitHub and Supabase accounts, separate
from the user's personal accounts — all repos/projects for this build go there.

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Hosting:** Vercel, custom domain (domain purchase/DNS still pending)
- **Database/Auth:** Supabase Postgres + Supabase Auth (club's own Supabase project, already created)
- **Media:** Cloudinary — photos and the sponsorship brochure PDF (auto-optimized, CDN-served). Videos/reels are YouTube/Instagram embed links (URLs only, no video files stored)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (scroll reveals, hover states, hero motion) — chosen over GSAP for being lighter and more idiomatic in Next.js while still sufficient for the desired motion
- **Forms/validation:** react-hook-form + zod
- **Rich text editor:** Tiptap (for blog posts)

## Content Model (Supabase Tables)

Two kinds of content: **singleton** tables (one row, free-text page content) and
**repeating-item** tables (one row per item, list-style content).

### Singleton tables
- `site_settings` — logo/tagline, contact email, social links, WhatsApp/phone numbers, college address
- `about_content` — vision, mission, history, objectives, faculty/head message
- `home_content` — intro text, banner video/image

### Repeating-item tables
- `team_members` — name, role, photo (Cloudinary URL), LinkedIn URL, category (`core` / `faculty` / `senior` / `junior`), display order
- `events` — title, description, date, type (`upcoming` / `past`), registration URL (external link), cover photo, photo gallery (array of Cloudinary URLs), video embed URL(s)
- `sponsors` — name, logo, tier, current/past flag, blurb
- `sponsorship_tiers` — name, price, benefits — feeds sponsorship packages/benefits content
- `sponsorship_content` (singleton) — brochure PDF (Cloudinary), general sponsorship page copy
- `achievements` — title, description, date, media (photo), category (`competition` / `certification` / `media`)
- `club_stats` — key/value rows or a small singleton (members count, events conducted, participation) for the Achievements page stats
- `blog_posts` — title, rich-text body (Tiptap JSON), cover image, published date
- `newsletters` — title, issue date, PDF (Cloudinary)
- `speakers` — name, photo, bio, role/company, type (`guest_speaker` / `alumni` / `industry_expert`), testimonial text (for alumni)
- `gallery_items` (optional, standalone) — for photos/reels not tied to a specific event; the Gallery page otherwise pulls from `events` and `achievements` media

### Access control
Row-Level Security on every table: public read access for everyone, write access
restricted to authenticated admin users (single shared admin role — no per-section
permission matrix).

### Deletion policy
Soft-delete via an `is_active`/`archived` flag rather than hard `DELETE`, so
historical data (e.g. past sponsors, past team members) isn't destroyed.

## Admin Dashboard

- **Auth:** `/admin/login` via Supabase Auth (email/password). All editors share one
  admin role. Next.js middleware protects every `/admin/*` route, redirecting
  unauthenticated visitors to login.
- **Structure:** One admin section per content type above (list view + create/edit
  form). Fixed-field forms, not a generic page-builder — safer for non-technical
  editors than free-form block editing.
- **Forms:** react-hook-form + zod, with clear inline validation errors.
- **Image uploads:** Direct-to-Cloudinary upload (signed upload preset) from within
  each form; the returned URL is stored in Supabase. Editors never touch Cloudinary's
  own dashboard.
- **Rich text:** Tiptap editor embedded in the blog post form.
- **Publishing model:** Direct-publish — saving a form updates the live site via
  on-demand revalidation (below). No draft/review workflow for v1.

## Public Site Rendering & Performance

- **Rendering:** Static generation (SSG) for every public page. When an admin saves
  a form, an API route triggers `revalidatePath`/`revalidateTag` for the affected
  page(s), so visitors always get instantly-served static HTML from Vercel's CDN,
  and edits go live within seconds.
- **Images:** Cloudinary URLs with automatic format/quality params (`f_auto,q_auto`)
  and responsive sizing, delivered through `next/image` with a Cloudinary loader.
- **Performance budget:** Target Lighthouse ≥90 on mobile despite the animation —
  treated as a real constraint during build.

## Visual Theme

- Near-black background, amber/orange (from the logo) as the single accent color,
  white/off-white text.
- Bold, oversized display type for hero and section headlines.
- Disciplined grid layout underneath for content-heavy pages (team grids, event
  cards, sponsor logos) so the experimental styling doesn't compromise readability.
- Animation: staggered hero text reveal, subtle bulb/glow motif nod to the logo,
  optional desktop-only custom cursor effect, scroll-triggered fade/slide-up reveals
  on section pages, hover micro-interactions on cards.
- All motion uses transform/opacity only (GPU-cheap), honors
  `prefers-reduced-motion`, and disables heavier effects (custom cursor, parallax)
  on mobile.

## Phasing Plan

**Phase 1 — core, launch-ready:**
- Infra setup: Next.js + Supabase wiring, Cloudinary setup, admin auth, Vercel
  deployment under the club's own GitHub/Supabase accounts
- Public pages: Home, About Us, Team, Events & Competitions, Contact Us
- Admin CRUD: site settings, about/home content, team members, events

**Phase 2 — remaining sections:**
- Public pages: Gallery, Sponsors & Partners, Achievements, Resources (blog +
  newsletters), Guest Speakers & Alumni
- Admin CRUD: sponsors/tiers, achievements/stats, blog posts, newsletters, speakers

Each phase is a complete, deployable slice — Phase 1 is a fully usable, fully
editable public site on its own.

## Explicit Non-Goals (v1)

- No built-in event registration/RSVP (registration links point to external forms)
- No per-section/role-based admin permissions (single shared admin role)
- No draft/preview/review workflow for content edits (direct-publish only)
- No self-hosted video (all video is embedded from YouTube/Instagram)
