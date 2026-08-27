# Insightix Club Website — Phase 0 & Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fast, fully-editable Insightix club website slice — Home, About, Team, Events, Contact, an admin dashboard for those sections, and the de-risked hero animation — deployable on its own per the spec.

**Architecture:** Single Next.js (App Router, TypeScript) app. Public pages are statically generated and revalidated on-demand when an admin saves a form via a Server Action. Supabase Postgres holds content behind Row-Level Security (public read, authenticated-admin write); Supabase Auth gates `/admin/*` via middleware. Cloudinary stores images/PDFs; uploads go straight from the browser to Cloudinary using a server-signed request.

**Tech Stack:** Next.js 14+ (App Router, TS), Tailwind CSS, Supabase (Postgres + Auth), Cloudinary, Framer Motion, react-hook-form + zod, `@vercel/og`, Vitest.

## Global Constraints

- Row-Level Security on every table: public read, write restricted to authenticated admin users; single shared admin role, no per-section permissions (spec: Access control).
- Soft-delete via `is_active`/`archived` flag, never hard `DELETE` (spec: Deletion policy).
- Direct-publish only — no draft/review workflow (spec: Publishing model).
- Cloudinary signed upload preset limited to JPEG/PNG/WebP (+ PDF where relevant), max 10MB images / 20MB PDFs, folder-scoped per content type (spec: Image uploads).
- All animation uses transform/opacity only, honors `prefers-reduced-motion`, disables heavier effects (custom cursor, parallax) on mobile (spec: Visual Theme).
- Target Lighthouse ≥90 on mobile despite the animation (spec: Performance budget) — the hero animation is the top execution risk and must be measured before the rest of the site is built around it (spec: Top execution risk).
- All repos and the Supabase project live under the club's own GitHub/Supabase accounts, not the user's personal accounts (spec: Infra note).
- `events` and future `blog_posts` need URL-safe, unique, editable `slug` fields — never route on `title` (spec: Content Model, `events`).

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.eslintrc.json`, `vitest.config.ts`, `.gitignore`, `.env.local.example`
- Create: `app/layout.tsx` (placeholder), `app/page.tsx` (placeholder), `app/globals.css` (empty)

**Interfaces:**
- Produces: a runnable Next.js App Router project with `npm run dev`, `npm run build`, `npm run lint`, `npm test` all working; Vitest configured for `lib/**/*.test.ts`.

- [ ] **Step 1: Scaffold the Next.js app**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

Answer prompts: use App Router (yes), no `src/` directory, import alias `@/*`.

- [ ] **Step 2: Install remaining dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers framer-motion @vercel/og
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

Add to `package.json` scripts: `"test": "vitest run"`.

- [ ] **Step 4: Create `.env.local.example`**

```bash
# Supabase (club's dedicated project)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- [ ] **Step 5: Verify the scaffold builds**

Run: `npm run build`
Expected: build succeeds with the default Next.js starter page.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, Vitest, and core dependencies"
```

---

## Task 2: Supabase Schema & RLS (Phase 1 tables)

**Files:**
- Create: `supabase/migrations/0001_phase1_schema.sql`

**Interfaces:**
- Produces: tables `site_settings`, `about_content`, `home_content`, `team_members`, `events`, each with RLS enabled (public `SELECT`, authenticated `INSERT`/`UPDATE`/`DELETE`... note: per Deletion policy, no hard delete path is used by the app, but the policy still exists so an admin could recover via SQL if ever needed).

- [ ] **Step 1: Link the Supabase CLI to the club's project**

```bash
npx supabase login
npx supabase link --project-ref <club-project-ref>
```

(`<club-project-ref>` comes from the club's Supabase project settings — the project already exists per the spec.)

- [ ] **Step 2: Write the migration**

Create `supabase/migrations/0001_phase1_schema.sql`:

```sql
create extension if not exists "pgcrypto";

-- Singleton content tables (enforced to exactly one row via a fixed id)
create table site_settings (
  id boolean primary key default true,
  constraint site_settings_singleton check (id),
  logo_url text,
  tagline text,
  contact_email text,
  social_links jsonb not null default '{}'::jsonb,
  whatsapp_number text,
  phone_number text,
  college_address text,
  updated_at timestamptz not null default now()
);

create table about_content (
  id boolean primary key default true,
  constraint about_content_singleton check (id),
  vision text,
  mission text,
  history text,
  objectives text,
  faculty_message text,
  updated_at timestamptz not null default now()
);

create table home_content (
  id boolean primary key default true,
  constraint home_content_singleton check (id),
  intro_text text,
  banner_media_url text,
  banner_media_type text check (banner_media_type in ('image', 'video')),
  updated_at timestamptz not null default now()
);

-- Repeating-item tables
create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  photo_url text,
  linkedin_url text,
  category text not null check (category in ('core', 'faculty', 'senior', 'junior')),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  event_date date not null,
  type text not null check (type in ('upcoming', 'past')),
  registration_url text,
  cover_photo_url text,
  gallery_urls text[] not null default '{}',
  video_embed_urls text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS
alter table site_settings enable row level security;
alter table about_content enable row level security;
alter table home_content enable row level security;
alter table team_members enable row level security;
alter table events enable row level security;

create policy "public read" on site_settings for select using (true);
create policy "public read" on about_content for select using (true);
create policy "public read" on home_content for select using (true);
create policy "public read" on team_members for select using (true);
create policy "public read" on events for select using (true);

create policy "admin write" on site_settings for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on about_content for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on home_content for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on team_members for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin write" on events for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

insert into site_settings (id) values (true);
insert into about_content (id) values (true);
insert into home_content (id) values (true);
```

- [ ] **Step 3: Apply the migration**

Run: `npx supabase db push`
Expected: CLI reports the migration applied with no errors.

- [ ] **Step 4: Verify the tables and policies exist**

Run: `npx supabase db diff` (should report no drift), then in the Supabase Dashboard's SQL Editor run `select * from site_settings;` and confirm it returns exactly one row.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0001_phase1_schema.sql
git commit -m "feat: add Phase 1 Supabase schema and RLS policies"
```

---

## Task 3: Supabase Clients & Shared Types

**Files:**
- Create: `lib/supabase/types.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/browser.ts`
- Test: `lib/supabase/types.test.ts`

**Interfaces:**
- Consumes: `.env.local` values `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Task 1).
- Produces: `createServerSupabaseClient()` (server components/actions, uses the user's session cookies), `createServiceSupabaseClient()` (server actions that must bypass RLS for admin writes, uses the service role key), `createBrowserSupabaseClient()` (client components), and types `SiteSettings`, `AboutContent`, `HomeContent`, `TeamMember`, `Event`.

- [ ] **Step 1: Write the failing type-shape test**

Create `lib/supabase/types.test.ts`:

```ts
import { describe, it, expect, expectTypeOf } from 'vitest'
import type { Event, TeamMember } from './types'

describe('shared Supabase types', () => {
  it('Event has a required unique slug field', () => {
    const event: Event = {
      id: '1', title: 'Hack Night', slug: 'hack-night', description: null,
      event_date: '2026-09-01', type: 'upcoming', registration_url: null,
      cover_photo_url: null, gallery_urls: [], video_embed_urls: [],
      is_active: true, created_at: '2026-08-27T00:00:00Z',
    }
    expect(event.slug).toBe('hack-night')
  })

  it('TeamMember category is restricted to the four known values', () => {
    expectTypeOf<TeamMember['category']>().toEqualTypeOf<'core' | 'faculty' | 'senior' | 'junior'>()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/supabase/types.test.ts`
Expected: FAIL — `Cannot find module './types'`.

- [ ] **Step 3: Write the types**

Create `lib/supabase/types.ts`:

```ts
export interface SiteSettings {
  logo_url: string | null
  tagline: string | null
  contact_email: string | null
  social_links: Record<string, string>
  whatsapp_number: string | null
  phone_number: string | null
  college_address: string | null
}

export interface AboutContent {
  vision: string | null
  mission: string | null
  history: string | null
  objectives: string | null
  faculty_message: string | null
}

export interface HomeContent {
  intro_text: string | null
  banner_media_url: string | null
  banner_media_type: 'image' | 'video' | null
}

export interface TeamMember {
  id: string
  name: string
  role: string
  photo_url: string | null
  linkedin_url: string | null
  category: 'core' | 'faculty' | 'senior' | 'junior'
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  event_date: string
  type: 'upcoming' | 'past'
  registration_url: string | null
  cover_photo_url: string | null
  gallery_urls: string[]
  video_embed_urls: string[]
  is_active: boolean
  created_at: string
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/supabase/types.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the Supabase client factories**

Create `lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

export function createServiceSupabaseClient() {
  const { createClient } = require('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
```

Create `lib/supabase/browser.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Verify the project still builds and lints**

Run: `npm run lint && npm run build`
Expected: both succeed with no errors.

- [ ] **Step 7: Commit**

```bash
git add lib/supabase
git commit -m "feat: add Supabase client factories and shared content types"
```

---

## Task 4: Admin Auth (login, middleware, logout)

**Files:**
- Create: `middleware.ts`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/login/actions.ts`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/actions.ts`
- Test: `lib/auth/isAdminRoute.test.ts`
- Create: `lib/auth/isAdminRoute.ts`

**Interfaces:**
- Consumes: `createServerSupabaseClient()` (Task 3).
- Produces: `isAdminRoute(pathname: string): boolean` (used by middleware and reusable in tests), `signIn(formData: FormData)` and `signOut()` server actions.

- [ ] **Step 1: Write the failing test for the route-matching helper**

Create `lib/auth/isAdminRoute.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { isAdminRoute } from './isAdminRoute'

describe('isAdminRoute', () => {
  it('matches admin routes other than the login page', () => {
    expect(isAdminRoute('/admin/team')).toBe(true)
    expect(isAdminRoute('/admin')).toBe(true)
  })

  it('does not match the login page or public routes', () => {
    expect(isAdminRoute('/admin/login')).toBe(false)
    expect(isAdminRoute('/events')).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/auth/isAdminRoute.test.ts`
Expected: FAIL — `Cannot find module './isAdminRoute'`.

- [ ] **Step 3: Implement the helper**

Create `lib/auth/isAdminRoute.ts`:

```ts
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin') && pathname !== '/admin/login'
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/auth/isAdminRoute.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the middleware**

Create `middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isAdminRoute } from '@/lib/auth/isAdminRoute'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  if (!isAdminRoute(request.nextUrl.pathname)) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 6: Write the login page and server action**

Create `app/admin/login/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    redirect('/admin/login?error=' + encodeURIComponent(error.message))
  }
  redirect('/admin')
}
```

Create `app/admin/login/page.tsx`:

```tsx
import { signIn } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-white">Admin Login</h1>
      {searchParams.error && (
        <p className="text-sm text-red-400">{searchParams.error}</p>
      )}
      <form action={signIn} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
        <input name="password" type="password" required placeholder="Password" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
        <button type="submit" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">
          Log in
        </button>
      </form>
    </main>
  )
}
```

- [ ] **Step 7: Write the logout action and admin shell layout**

Create `app/admin/actions.ts`:

```ts
'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function signOut() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
```

Create `app/admin/layout.tsx`:

```tsx
import Link from 'next/link'
import { signOut } from './actions'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <nav className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
        <div className="flex gap-4 text-sm">
          <Link href="/admin/site-settings">Site Settings</Link>
          <Link href="/admin/home">Home</Link>
          <Link href="/admin/about">About</Link>
          <Link href="/admin/team">Team</Link>
          <Link href="/admin/events">Events</Link>
        </div>
        <form action={signOut}>
          <button type="submit" className="text-sm text-neutral-400">Log out</button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
```

Note: `app/admin/login/page.tsx` renders outside this shell — Next.js route groups aren't required here since the login page is the only excluded route and it already has its own full-page layout; `app/admin/layout.tsx` wraps every other `/admin/*` page including `app/admin/page.tsx`, which Task 7 will add as a simple redirect/dashboard landing.

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, visit `/admin/team` while logged out — confirm it redirects to `/admin/login`. Create a user in the Supabase Dashboard (Authentication → Users → Add user) with a real email/password for a trusted committee member, then log in at `/admin/login` and confirm it redirects to `/admin` without looping back to login.

- [ ] **Step 9: Commit**

```bash
git add middleware.ts app/admin lib/auth
git commit -m "feat: add admin authentication (login, middleware, logout)"
```

---

## Task 5: Theme, Fonts & Root Layout

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Tailwind theme tokens `brand-bg` (#0a0a0a), `brand-accent` (#f5820c, the logo's amber/orange), `brand-text` (#f5f5f5); `next/font` variables `--font-display` (bold headline font) and `--font-body` (body font) applied globally.

- [ ] **Step 1: Configure the Tailwind theme**

Modify `tailwind.config.ts` — extend `theme.extend.colors` and `theme.extend.fontFamily`:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#0a0a0a',
        'brand-accent': '#f5820c',
        'brand-text': '#f5f5f5',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 2: Wire up fonts and the root layout**

Modify `app/layout.tsx`:

```tsx
import { Space_Grotesk, Inter } from 'next/font/google'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: { default: 'Insightix', template: '%s | Insightix' },
  description: 'The Insightix tech club',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-brand-bg font-body text-brand-text">{children}</body>
    </html>
  )
}
```

(Header/Footer are added in Task 11 once `site_settings` queries exist — this task only establishes the visual base.)

- [ ] **Step 3: Set base global styles**

Modify `app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, open `/` and `/admin/login` — confirm both render on the near-black background with the amber accent color available (spot-check by temporarily adding `className="text-brand-accent"` to any visible element, then remove it).

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/layout.tsx app/globals.css
git commit -m "feat: establish dark theme, brand colors, and fonts"
```

---

## Task 6: Cloudinary Signed Uploads

**Files:**
- Create: `lib/cloudinary.ts`
- Create: `app/api/cloudinary-sign/route.ts`
- Create: `components/admin/ImageUpload.tsx`
- Test: `lib/cloudinary.test.ts`

**Interfaces:**
- Consumes: `.env.local` Cloudinary vars (Task 1).
- Produces: `buildCloudinaryUrl(url: string, opts?: { width?: number }): string` (delivery-side transform helper), `POST /api/cloudinary-sign` returning `{ signature: string, timestamp: number, apiKey: string, cloudName: string, folder: string }`, and `<ImageUpload value={string|null} onChange={(url: string) => void} folder={string} accept="image" | "pdf" />` client component used by every admin form with a media field.

- [ ] **Step 1: Manual Cloudinary dashboard setup (one-time, not automatable)**

In the club's Cloudinary account, create an upload preset named `insightix_admin`, mode **Signed**, with: allowed formats `jpg,png,webp,pdf`; max file size 10MB for images / 20MB for PDFs (Cloudinary enforces this per-format via the preset's "Max file size" plus an eager/incoming transformation rule — set 10485760 bytes as the preset default and override to 20971520 for the `newsletters`/`sponsorship` folders in Phase 2); folder set dynamically per upload (see Step 3). Record the cloud name and this preset name into `.env.local`.

- [ ] **Step 2: Write the failing test for the delivery URL helper**

Create `lib/cloudinary.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { buildCloudinaryUrl } from './cloudinary'

describe('buildCloudinaryUrl', () => {
  it('inserts f_auto,q_auto into a Cloudinary delivery URL', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    expect(buildCloudinaryUrl(input)).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto/v1/sample.jpg'
    )
  })

  it('adds a width transform when provided', () => {
    const input = 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    expect(buildCloudinaryUrl(input, { width: 400 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_400/v1/sample.jpg'
    )
  })

  it('returns non-Cloudinary URLs unchanged', () => {
    expect(buildCloudinaryUrl('https://example.com/x.jpg')).toBe('https://example.com/x.jpg')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- lib/cloudinary.test.ts`
Expected: FAIL — `Cannot find module './cloudinary'`.

- [ ] **Step 4: Implement the helper**

Create `lib/cloudinary.ts`:

```ts
export function buildCloudinaryUrl(url: string, opts?: { width?: number }): string {
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (!url.includes('res.cloudinary.com') || idx === -1) return url

  const transforms = ['f_auto', 'q_auto']
  if (opts?.width) transforms.push(`w_${opts.width}`)

  const before = url.slice(0, idx + marker.length)
  const after = url.slice(idx + marker.length)
  return `${before}${transforms.join(',')}/${after}`
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- lib/cloudinary.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Write the signing route**

Create `app/api/cloudinary-sign/route.ts`:

```ts
import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  const { folder } = await request.json()
  const timestamp = Math.round(Date.now() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder, upload_preset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET },
    process.env.CLOUDINARY_API_SECRET!
  )

  return NextResponse.json({
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    folder,
  })
}
```

Note: this route is only reachable from admin pages, which `middleware.ts` (Task 4) already gates — no additional auth check is needed here since `/api/cloudinary-sign` is called exclusively from client components rendered inside `/admin/*`.

Install the Cloudinary SDK: `npm install cloudinary`.

- [ ] **Step 7: Write the ImageUpload component**

Create `components/admin/ImageUpload.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string) => void
  folder: string
  accept?: 'image' | 'pdf'
}

export function ImageUpload({ value, onChange, folder, accept = 'image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const signRes = await fetch('/api/cloudinary-sign', {
        method: 'POST',
        body: JSON.stringify({ folder }),
      })
      const { signature, timestamp, apiKey, cloudName } = await signRes.json()

      const body = new FormData()
      body.append('file', file)
      body.append('api_key', apiKey)
      body.append('timestamp', String(timestamp))
      body.append('signature', signature)
      body.append('folder', folder)
      body.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

      const resourceType = accept === 'pdf' ? 'raw' : 'image'
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body }
      )
      const data = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(data.error?.message ?? 'Upload failed')
      onChange(data.secure_url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value && accept === 'image' && (
        <img src={buildCloudinaryUrl(value, { width: 200 })} alt="" className="h-24 w-24 rounded object-cover" />
      )}
      <input
        type="file"
        accept={accept === 'pdf' ? 'application/pdf' : 'image/jpeg,image/png,image/webp'}
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-neutral-400">Uploading…</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, temporarily render `<ImageUpload value={null} onChange={console.log} folder="test" />` on any admin page, upload a JPEG, and confirm a `secure_url` is logged and the preview thumbnail appears. Remove the temporary render afterward.

- [ ] **Step 9: Commit**

```bash
git add lib/cloudinary.ts app/api/cloudinary-sign components/admin/ImageUpload.tsx package.json package-lock.json
git commit -m "feat: add signed Cloudinary uploads and delivery URL helper"
```

---

## Task 7: Admin — Site Settings (and the shared validation pattern)

Every admin form from this task onward follows the same pattern: a **zod schema** (validation rules, shared with the server action), **react-hook-form** (client-side inline errors, per the spec's Admin Dashboard requirement), and a server action that receives a **typed object** — called directly from the client's `onSubmit`, not via the native `<form action>` prop — and re-validates with the same schema before writing to Supabase.

**Files:**
- Create: `lib/schemas.ts`
- Test: `lib/schemas.test.ts`
- Create: `app/admin/site-settings/page.tsx`
- Create: `app/admin/site-settings/actions.ts`
- Create: `app/admin/site-settings/SiteSettingsForm.tsx`
- Create: `lib/queries/siteSettings.ts`
- Create: `app/admin/page.tsx`

**Interfaces:**
- Consumes: `createServerSupabaseClient()`, `createServiceSupabaseClient()` (Task 3), `SiteSettings` type (Task 3), `<ImageUpload>` (Task 6).
- Produces: `lib/schemas.ts` exporting `siteSettingsSchema`/`SiteSettingsInput`, `homeContentSchema`/`HomeContentInput`, `aboutContentSchema`/`AboutContentInput`, `teamMemberSchema`/`TeamMemberInput`, `eventSchema`/`EventInput` (all consumed by Tasks 8–10); `getSiteSettings(): Promise<SiteSettings>` (used by Task 11's Header/Footer and Task 16's Contact page); `updateSiteSettings(input: SiteSettingsInput): Promise<{ error?: string }>` server action.

- [ ] **Step 1: Write the failing test for the shared schemas**

Create `lib/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { siteSettingsSchema, teamMemberSchema, eventSchema } from './schemas'

describe('siteSettingsSchema', () => {
  it('rejects an invalid contact email', () => {
    const result = siteSettingsSchema.safeParse({
      logo_url: null, tagline: 'Club', contact_email: 'not-an-email',
      social_links: {}, whatsapp_number: null, phone_number: null, college_address: null,
    })
    expect(result.success).toBe(false)
  })
})

describe('teamMemberSchema', () => {
  it('requires a name and a valid category', () => {
    const result = teamMemberSchema.safeParse({
      name: '', role: 'President', photo_url: null, linkedin_url: '',
      category: 'core', display_order: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('eventSchema', () => {
  it('requires a title and a valid type', () => {
    const result = eventSchema.safeParse({
      title: 'Hack Night', description: null, event_date: '2026-09-01', type: 'upcoming',
      registration_url: '', cover_photo_url: null, gallery_urls: [], video_embed_urls: [],
    })
    expect(result.success).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/schemas.test.ts`
Expected: FAIL — `Cannot find module './schemas'`.

- [ ] **Step 3: Write the shared schemas**

Create `lib/schemas.ts`:

```ts
import { z } from 'zod'

export const siteSettingsSchema = z.object({
  logo_url: z.string().url().nullable(),
  tagline: z.string().min(1, 'Tagline is required').nullable(),
  contact_email: z.string().email('Enter a valid email').nullable(),
  social_links: z.object({
    instagram: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
    linkedin: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  }),
  whatsapp_number: z.string().nullable(),
  phone_number: z.string().nullable(),
  college_address: z.string().nullable(),
})
export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>

export const homeContentSchema = z.object({
  intro_text: z.string().nullable(),
  banner_media_url: z.string().url().nullable(),
  banner_media_type: z.enum(['image', 'video']).nullable(),
})
export type HomeContentInput = z.infer<typeof homeContentSchema>

export const aboutContentSchema = z.object({
  vision: z.string().nullable(),
  mission: z.string().nullable(),
  history: z.string().nullable(),
  objectives: z.string().nullable(),
  faculty_message: z.string().nullable(),
})
export type AboutContentInput = z.infer<typeof aboutContentSchema>

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  photo_url: z.string().url().nullable(),
  linkedin_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  category: z.enum(['core', 'faculty', 'senior', 'junior']),
  display_order: z.coerce.number().int(),
})
export type TeamMemberInput = z.infer<typeof teamMemberSchema>

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1).optional(),
  description: z.string().nullable(),
  event_date: z.string().min(1, 'Date is required'),
  type: z.enum(['upcoming', 'past']),
  registration_url: z.string().url('Enter a valid URL').or(z.literal('')).nullable(),
  cover_photo_url: z.string().url().nullable(),
  gallery_urls: z.array(z.string().url()),
  video_embed_urls: z.array(z.string().url()),
})
export type EventInput = z.infer<typeof eventSchema>
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/schemas.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the query function**

Create `lib/queries/siteSettings.ts`:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { SiteSettings } from '@/lib/supabase/types'

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('site_settings').select('*').single()
  if (error) throw error
  return data as SiteSettings
}
```

- [ ] **Step 6: Write the server action**

Create `app/admin/site-settings/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/schemas'

export async function updateSiteSettings(input: SiteSettingsInput): Promise<{ error?: string }> {
  const parsed = siteSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('site_settings')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/contact')
  return {}
}
```

- [ ] **Step 7: Write the form component and page**

Create `app/admin/site-settings/SiteSettingsForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateSiteSettings } from './actions'
import { siteSettingsSchema, type SiteSettingsInput } from '@/lib/schemas'
import type { SiteSettings } from '@/lib/supabase/types'

export function SiteSettingsForm({ initial }: { initial: SiteSettings }) {
  const [logoUrl, setLogoUrl] = useState(initial.logo_url)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: {
      logo_url: initial.logo_url,
      tagline: initial.tagline,
      contact_email: initial.contact_email,
      social_links: initial.social_links ?? {},
      whatsapp_number: initial.whatsapp_number,
      phone_number: initial.phone_number,
      college_address: initial.college_address,
    },
  })

  async function onSubmit(values: SiteSettingsInput) {
    setServerError(null)
    const result = await updateSiteSettings({ ...values, logo_url: logoUrl })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Logo
        <ImageUpload
          value={logoUrl}
          onChange={(url) => { setLogoUrl(url); setValue('logo_url', url) }}
          folder="site-settings"
        />
      </label>
      <label className="flex flex-col gap-1">
        Tagline
        <input {...register('tagline')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.tagline && <span className="text-sm text-red-400">{errors.tagline.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Contact email
        <input {...register('contact_email')} type="email" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.contact_email && <span className="text-sm text-red-400">{errors.contact_email.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Instagram URL
        <input {...register('social_links.instagram')} placeholder="https://instagram.com/insightix" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.social_links?.instagram && <span className="text-sm text-red-400">{errors.social_links.instagram.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        LinkedIn URL
        <input {...register('social_links.linkedin')} placeholder="https://linkedin.com/company/insightix" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.social_links?.linkedin && <span className="text-sm text-red-400">{errors.social_links.linkedin.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        WhatsApp number
        <input {...register('whatsapp_number')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Phone number
        <input {...register('phone_number')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        College address
        <textarea {...register('college_address')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

Create `app/admin/site-settings/page.tsx`:

```tsx
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { SiteSettingsForm } from './SiteSettingsForm'

export default async function SiteSettingsPage() {
  const settings = await getSiteSettings()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Site Settings</h1>
      <SiteSettingsForm initial={settings} />
    </div>
  )
}
```

Create `app/admin/page.tsx` (simple landing so `/admin` doesn't 404):

```tsx
import Link from 'next/link'

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-neutral-400">
        Choose a section from the nav above, or start with <Link href="/admin/site-settings" className="text-brand-accent">Site Settings</Link>.
      </p>
    </div>
  )
}
```

- [ ] **Step 8: Manual verification**

Run: `npm run dev`, log in, visit `/admin/site-settings`, upload a logo, submit with an invalid email and confirm the inline error appears without a page reload, then fix it and save — confirm the page reloads with the saved values persisted (re-fetch from `site_settings` on reload proves the write worked).

- [ ] **Step 9: Commit**

```bash
git add lib/schemas.ts lib/schemas.test.ts app/admin/site-settings app/admin/page.tsx lib/queries/siteSettings.ts
git commit -m "feat: add Site Settings admin form with shared zod/react-hook-form validation pattern"
```

---

## Task 8: Admin — Home & About Content

**Files:**
- Create: `lib/queries/homeContent.ts`
- Create: `lib/queries/aboutContent.ts`
- Create: `app/admin/home/page.tsx`
- Create: `app/admin/home/actions.ts`
- Create: `app/admin/home/HomeContentForm.tsx`
- Create: `app/admin/about/page.tsx`
- Create: `app/admin/about/actions.ts`
- Create: `app/admin/about/AboutContentForm.tsx`

**Interfaces:**
- Consumes: `createServerSupabaseClient()`, `createServiceSupabaseClient()`, `HomeContent`/`AboutContent` types (Task 3), `<ImageUpload>` (Task 6), `homeContentSchema`/`HomeContentInput`, `aboutContentSchema`/`AboutContentInput` (Task 7).
- Produces: `getHomeContent(): Promise<HomeContent>` and `getAboutContent(): Promise<AboutContent>` (used by Task 12 and Task 13's public pages).

- [ ] **Step 1: Write the query functions**

Create `lib/queries/homeContent.ts`:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { HomeContent } from '@/lib/supabase/types'

export async function getHomeContent(): Promise<HomeContent> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('home_content').select('*').single()
  if (error) throw error
  return data as HomeContent
}
```

Create `lib/queries/aboutContent.ts`:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { AboutContent } from '@/lib/supabase/types'

export async function getAboutContent(): Promise<AboutContent> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('about_content').select('*').single()
  if (error) throw error
  return data as AboutContent
}
```

- [ ] **Step 2: Write the Home content admin action, form, and page**

Create `app/admin/home/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { homeContentSchema, type HomeContentInput } from '@/lib/schemas'

export async function updateHomeContent(input: HomeContentInput): Promise<{ error?: string }> {
  const parsed = homeContentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('home_content')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }
  revalidatePath('/')
  return {}
}
```

Create `app/admin/home/HomeContentForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { updateHomeContent } from './actions'
import { homeContentSchema, type HomeContentInput } from '@/lib/schemas'
import type { HomeContent } from '@/lib/supabase/types'

export function HomeContentForm({ initial }: { initial: HomeContent }) {
  const [bannerUrl, setBannerUrl] = useState(initial.banner_media_url)
  const [bannerType, setBannerType] = useState(initial.banner_media_type ?? 'image')
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<HomeContentInput>({
    resolver: zodResolver(homeContentSchema),
    defaultValues: {
      intro_text: initial.intro_text,
      banner_media_url: initial.banner_media_url,
      banner_media_type: initial.banner_media_type,
    },
  })

  async function onSubmit(values: HomeContentInput) {
    setServerError(null)
    const result = await updateHomeContent({ ...values, banner_media_url: bannerUrl, banner_media_type: bannerType })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Intro text
        <textarea {...register('intro_text')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Banner media type
        <select
          value={bannerType ?? 'image'}
          onChange={(e) => {
            const type = e.target.value as 'image' | 'video'
            setBannerType(type)
            setValue('banner_media_type', type)
            setBannerUrl(null)
            setValue('banner_media_url', null)
          }}
          className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
        >
          <option value="image">Image</option>
          <option value="video">Video (YouTube/Instagram embed link)</option>
        </select>
      </label>
      {bannerType === 'video' ? (
        <label className="flex flex-col gap-1">
          Banner video embed URL
          <input
            value={bannerUrl ?? ''}
            onChange={(e) => { setBannerUrl(e.target.value); setValue('banner_media_url', e.target.value) }}
            placeholder="https://www.youtube.com/embed/..."
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1">
          Banner image
          <ImageUpload
            value={bannerUrl}
            onChange={(url) => { setBannerUrl(url); setValue('banner_media_url', url) }}
            folder="home"
          />
        </label>
      )}
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

Create `app/admin/home/page.tsx`:

```tsx
import { getHomeContent } from '@/lib/queries/homeContent'
import { HomeContentForm } from './HomeContentForm'

export default async function HomeContentPage() {
  const content = await getHomeContent()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Home Page Content</h1>
      <HomeContentForm initial={content} />
    </div>
  )
}
```

- [ ] **Step 3: Write the About content admin action, form, and page**

Create `app/admin/about/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { aboutContentSchema, type AboutContentInput } from '@/lib/schemas'

export async function updateAboutContent(input: AboutContentInput): Promise<{ error?: string }> {
  const parsed = aboutContentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase
    .from('about_content')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', true)

  if (error) return { error: error.message }
  revalidatePath('/about')
  return {}
}
```

Create `app/admin/about/AboutContentForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateAboutContent } from './actions'
import { aboutContentSchema, type AboutContentInput } from '@/lib/schemas'
import type { AboutContent } from '@/lib/supabase/types'

const FIELDS = ['vision', 'mission', 'history', 'objectives', 'faculty_message'] as const

export function AboutContentForm({ initial }: { initial: AboutContent }) {
  const [serverError, setServerError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<AboutContentInput>({
    resolver: zodResolver(aboutContentSchema),
    defaultValues: initial,
  })

  async function onSubmit(values: AboutContentInput) {
    setServerError(null)
    const result = await updateAboutContent(values)
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      {FIELDS.map((field) => (
        <label key={field} className="flex flex-col gap-1 capitalize">
          {field.replace('_', ' ')}
          <textarea {...register(field)} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </label>
      ))}
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

Create `app/admin/about/page.tsx`:

```tsx
import { getAboutContent } from '@/lib/queries/aboutContent'
import { AboutContentForm } from './AboutContentForm'

export default async function AboutContentPage() {
  const content = await getAboutContent()
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">About Page Content</h1>
      <AboutContentForm initial={content} />
    </div>
  )
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, log in, edit and save both `/admin/home` and `/admin/about`, reload each page and confirm the saved values persist.

- [ ] **Step 5: Commit**

```bash
git add app/admin/home app/admin/about lib/queries/homeContent.ts lib/queries/aboutContent.ts
git commit -m "feat: add Home and About content admin forms"
```

---

## Task 9: Admin — Team Members CRUD

**Files:**
- Create: `lib/queries/teamMembers.ts`
- Create: `app/admin/team/page.tsx`
- Create: `app/admin/team/actions.ts`
- Create: `app/admin/team/TeamMemberForm.tsx`
- Create: `app/admin/team/new/page.tsx`
- Create: `app/admin/team/[id]/page.tsx`

**Interfaces:**
- Consumes: `createServerSupabaseClient()`, `createServiceSupabaseClient()`, `TeamMember` type (Task 3), `<ImageUpload>` (Task 6), `teamMemberSchema`/`TeamMemberInput` (Task 7).
- Produces: `getActiveTeamMembers(): Promise<TeamMember[]>` (used by Task 14's public Team page), `getAllTeamMembers(): Promise<TeamMember[]>` (admin list, includes archived), `createTeamMember(input: TeamMemberInput)`, `updateTeamMember(id: string, input: TeamMemberInput)`, `archiveTeamMember(id: string)` server actions — all returning `Promise<{ error?: string }>`.

- [ ] **Step 1: Write the query functions**

Create `lib/queries/teamMembers.ts`:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { TeamMember } from '@/lib/supabase/types'

export async function getActiveTeamMembers(): Promise<TeamMember[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('category')
    .order('display_order')
  if (error) throw error
  return data as TeamMember[]
}

export async function getAllTeamMembers(): Promise<TeamMember[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('category')
    .order('display_order')
  if (error) throw error
  return data as TeamMember[]
}

export async function getTeamMemberById(id: string): Promise<TeamMember> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('team_members').select('*').eq('id', id).single()
  if (error) throw error
  return data as TeamMember
}
```

- [ ] **Step 2: Write the server actions**

Create `app/admin/team/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { teamMemberSchema, type TeamMemberInput } from '@/lib/schemas'

export async function createTeamMember(input: TeamMemberInput): Promise<{ error?: string }> {
  const parsed = teamMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/team')
  redirect('/admin/team')
}

export async function updateTeamMember(id: string, input: TeamMemberInput): Promise<{ error?: string }> {
  const parsed = teamMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/team')
  redirect('/admin/team')
}

export async function archiveTeamMember(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('team_members').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/team')
  redirect('/admin/team')
}
```

- [ ] **Step 3: Write the shared form component**

Create `app/admin/team/TeamMemberForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { teamMemberSchema, type TeamMemberInput } from '@/lib/schemas'
import type { TeamMember } from '@/lib/supabase/types'

interface TeamMemberFormProps {
  initial?: TeamMember
  action: (input: TeamMemberInput) => Promise<{ error?: string }>
}

export function TeamMemberForm({ initial, action }: TeamMemberFormProps) {
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: {
      name: initial?.name ?? '',
      role: initial?.role ?? '',
      photo_url: initial?.photo_url ?? null,
      linkedin_url: initial?.linkedin_url ?? '',
      category: initial?.category ?? 'core',
      display_order: initial?.display_order ?? 0,
    },
  })

  async function onSubmit(values: TeamMemberInput) {
    setServerError(null)
    const result = await action({ ...values, photo_url: photoUrl })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Name
        <input {...register('name')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.name && <span className="text-sm text-red-400">{errors.name.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Role
        <input {...register('role')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.role && <span className="text-sm text-red-400">{errors.role.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Photo
        <ImageUpload
          value={photoUrl}
          onChange={(url) => { setPhotoUrl(url); setValue('photo_url', url) }}
          folder="team"
        />
      </label>
      <label className="flex flex-col gap-1">
        LinkedIn URL
        <input {...register('linkedin_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.linkedin_url && <span className="text-sm text-red-400">{errors.linkedin_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Category
        <select {...register('category')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="core">Core Committee</option>
          <option value="faculty">Faculty Coordinator</option>
          <option value="senior">Senior Team</option>
          <option value="junior">Junior Team</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Display order
        <input {...register('display_order')} type="number" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

- [ ] **Step 4: Write the list, create, and edit pages**

Create `app/admin/team/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllTeamMembers } from '@/lib/queries/teamMembers'
import { archiveTeamMember } from './actions'

export default async function TeamListPage() {
  const members = await getAllTeamMembers()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Team Members</h1>
        <Link href="/admin/team/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add member</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={m.is_active ? '' : 'text-neutral-500 line-through'}>
              {m.name} — {m.role} ({m.category})
            </span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/team/${m.id}`} className="text-brand-accent">Edit</Link>
              {m.is_active && (
                <form action={archiveTeamMember.bind(null, m.id)}>
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

Create `app/admin/team/new/page.tsx`:

```tsx
import { TeamMemberForm } from '../TeamMemberForm'
import { createTeamMember } from '../actions'

export default function NewTeamMemberPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Team Member</h1>
      <TeamMemberForm action={createTeamMember} />
    </div>
  )
}
```

Create `app/admin/team/[id]/page.tsx`:

```tsx
import { getTeamMemberById } from '@/lib/queries/teamMembers'
import { TeamMemberForm } from '../TeamMemberForm'
import { updateTeamMember } from '../actions'

export default async function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const member = await getTeamMemberById(params.id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Team Member</h1>
      <TeamMemberForm initial={member} action={updateTeamMember.bind(null, params.id)} />
    </div>
  )
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`, log in, create a team member with a photo, verify it appears in `/admin/team`, edit it, then archive it and confirm it shows struck-through with no archive button left.

- [ ] **Step 6: Commit**

```bash
git add app/admin/team lib/queries/teamMembers.ts
git commit -m "feat: add Team Members admin CRUD"
```

---

## Task 10: Admin — Events CRUD (with slug generation)

**Files:**
- Create: `lib/slugify.ts`
- Test: `lib/slugify.test.ts`
- Create: `lib/queries/events.ts`
- Create: `app/admin/events/page.tsx`
- Create: `app/admin/events/actions.ts`
- Create: `app/admin/events/EventForm.tsx`
- Create: `app/admin/events/new/page.tsx`
- Create: `app/admin/events/[id]/page.tsx`

**Interfaces:**
- Consumes: `createServerSupabaseClient()`, `createServiceSupabaseClient()`, `Event` type (Task 3), `<ImageUpload>` (Task 6), `eventSchema`/`EventInput` (Task 7).
- Produces: `slugify(title: string): string`, `getUpcomingEvents()`, `getPastEvents()`, `getRecentEvents(limit: number)`, `getEventBySlug(slug: string)`, `getAllEventsForAdmin()`, `getEventById(id: string)` (used by Task 12's Home highlights and Task 15's public Events pages), `createEvent(input: EventInput)`, `updateEvent(id: string, input: EventInput)`, `archiveEvent(id: string)` server actions — all returning `Promise<{ error?: string }>`.

- [ ] **Step 1: Write the failing test for slugify**

Create `lib/slugify.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { slugify } from './slugify'

describe('slugify', () => {
  it('lowercases, trims, and hyphenates spaces', () => {
    expect(slugify('Hack Night 2026')).toBe('hack-night-2026')
  })

  it('strips punctuation', () => {
    expect(slugify("Founder's Day: Kickoff!")).toBe('founders-day-kickoff')
  })

  it('collapses repeated whitespace/hyphens', () => {
    expect(slugify('  Too   Many   Spaces  ')).toBe('too-many-spaces')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/slugify.test.ts`
Expected: FAIL — `Cannot find module './slugify'`.

- [ ] **Step 3: Implement slugify**

Create `lib/slugify.ts`:

```ts
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/slugify.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the query functions**

Create `lib/queries/events.ts`:

```ts
import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/supabase/types'

export async function getUpcomingEvents(): Promise<Event[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'upcoming')
    .order('event_date', { ascending: true })
  if (error) throw error
  return data as Event[]
}

export async function getPastEvents(): Promise<Event[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'past')
    .order('event_date', { ascending: false })
  if (error) throw error
  return data as Event[]
}

export async function getRecentEvents(limit: number): Promise<Event[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .order('event_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as Event[]
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data as Event | null
}

export async function getAllEventsForAdmin(): Promise<Event[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false })
  if (error) throw error
  return data as Event[]
}

export async function getEventById(id: string): Promise<Event> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('events').select('*').eq('id', id).single()
  if (error) throw error
  return data as Event
}
```

- [ ] **Step 6: Write the server actions with unique-slug handling**

Create `app/admin/events/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'
import { eventSchema, type EventInput } from '@/lib/schemas'

async function uniqueSlug(supabase: ReturnType<typeof createServiceSupabaseClient>, base: string, excludeId?: string) {
  let slug = base
  let suffix = 2
  while (true) {
    let query = supabase.from('events').select('id').eq('slug', slug)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return slug
    slug = `${base}-${suffix}`
    suffix += 1
  }
}

export async function createEvent(input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const slug = await uniqueSlug(supabase, slugify(parsed.data.title))

  const { error } = await supabase.from('events').insert({ ...parsed.data, slug })
  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath('/')
  redirect('/admin/events')
}

export async function updateEvent(id: string, input: EventInput): Promise<{ error?: string }> {
  const parsed = eventSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }

  const supabase = createServiceSupabaseClient()
  const requestedSlug = parsed.data.slug || slugify(parsed.data.title)
  const slug = await uniqueSlug(supabase, slugify(requestedSlug), id)

  const { error } = await supabase.from('events').update({ ...parsed.data, slug }).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/events')
  revalidatePath(`/events/${slug}`)
  revalidatePath('/')
  redirect('/admin/events')
}

export async function archiveEvent(id: string) {
  const supabase = createServiceSupabaseClient()
  const { error } = await supabase.from('events').update({ is_active: false }).eq('id', id)
  if (error) throw error
  revalidatePath('/events')
  revalidatePath('/')
  redirect('/admin/events')
}
```

- [ ] **Step 7: Write the shared form component**

Create `app/admin/events/EventForm.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { eventSchema, type EventInput } from '@/lib/schemas'
import type { Event } from '@/lib/supabase/types'

const eventFormSchema = eventSchema.extend({
  gallery_urls: z.string(),
  video_embed_urls: z.string(),
})
type EventFormValues = z.infer<typeof eventFormSchema>

interface EventFormProps {
  initial?: Event
  action: (input: EventInput) => Promise<{ error?: string }>
}

export function EventForm({ initial, action }: EventFormProps) {
  const [coverUrl, setCoverUrl] = useState(initial?.cover_photo_url ?? null)
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initial?.title ?? '',
      slug: initial?.slug,
      description: initial?.description ?? '',
      event_date: initial?.event_date ?? '',
      type: initial?.type ?? 'upcoming',
      registration_url: initial?.registration_url ?? '',
      cover_photo_url: initial?.cover_photo_url ?? null,
      gallery_urls: initial?.gallery_urls?.join(', ') ?? '',
      video_embed_urls: initial?.video_embed_urls?.join(', ') ?? '',
    },
  })

  async function onSubmit(values: EventFormValues) {
    setServerError(null)
    const result = await action({
      ...values,
      cover_photo_url: coverUrl,
      gallery_urls: values.gallery_urls.split(',').map((s) => s.trim()).filter(Boolean),
      video_embed_urls: values.video_embed_urls.split(',').map((s) => s.trim()).filter(Boolean),
    })
    if (result?.error) setServerError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      {serverError && <p className="text-sm text-red-400">{serverError}</p>}
      <label className="flex flex-col gap-1">
        Title
        <input {...register('title')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.title && <span className="text-sm text-red-400">{errors.title.message}</span>}
      </label>
      {initial && (
        <label className="flex flex-col gap-1">
          Slug (edit with care — changes the public URL)
          <input {...register('slug')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </label>
      )}
      <label className="flex flex-col gap-1">
        Description
        <textarea {...register('description')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Date
        <input {...register('event_date')} type="date" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.event_date && <span className="text-sm text-red-400">{errors.event_date.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Type
        <select {...register('type')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Registration URL
        <input {...register('registration_url')} type="url" className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
        {errors.registration_url && <span className="text-sm text-red-400">{errors.registration_url.message}</span>}
      </label>
      <label className="flex flex-col gap-1">
        Cover photo
        <ImageUpload
          value={coverUrl}
          onChange={(url) => { setCoverUrl(url); setValue('cover_photo_url', url) }}
          folder="events"
        />
      </label>
      <label className="flex flex-col gap-1">
        Gallery photo URLs (comma-separated Cloudinary URLs)
        <textarea {...register('gallery_urls')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        Video embed URLs (comma-separated YouTube/Instagram links)
        <textarea {...register('video_embed_urls')} className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2" />
      </label>
      <button type="submit" disabled={isSubmitting} className="rounded bg-amber-500 px-3 py-2 font-semibold text-black disabled:opacity-50">
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
```

- [ ] **Step 8: Write the list, create, and edit pages**

Create `app/admin/events/page.tsx`:

```tsx
import Link from 'next/link'
import { getAllEventsForAdmin } from '@/lib/queries/events'
import { archiveEvent } from './actions'

export default async function EventsListPage() {
  const events = await getAllEventsForAdmin()
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Events</h1>
        <Link href="/admin/events/new" className="rounded bg-amber-500 px-3 py-2 font-semibold text-black">Add event</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {events.map((e) => (
          <li key={e.id} className="flex items-center justify-between border-b border-neutral-800 py-2">
            <span className={e.is_active ? '' : 'text-neutral-500 line-through'}>
              {e.title} — {e.event_date} ({e.type})
            </span>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/events/${e.id}`} className="text-brand-accent">Edit</Link>
              {e.is_active && (
                <form action={archiveEvent.bind(null, e.id)}>
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

Create `app/admin/events/new/page.tsx`:

```tsx
import { EventForm } from '../EventForm'
import { createEvent } from '../actions'

export default function NewEventPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Add Event</h1>
      <EventForm action={createEvent} />
    </div>
  )
}
```

Create `app/admin/events/[id]/page.tsx`:

```tsx
import { getEventById } from '@/lib/queries/events'
import { EventForm } from '../EventForm'
import { updateEvent } from '../actions'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await getEventById(params.id)
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">Edit Event</h1>
      <EventForm initial={event} action={updateEvent.bind(null, params.id)} />
    </div>
  )
}
```

- [ ] **Step 9: Manual verification**

Run: `npm run dev`, log in, create two events titled identically (e.g. "Hack Night") and confirm the second gets slug `hack-night-2` (check via the Supabase Dashboard table view since the slug field isn't shown on create). Edit an event's title and confirm the slug field on the edit form still shows the original slug (title changes don't silently break the URL).

- [ ] **Step 10: Commit**

```bash
git add app/admin/events lib/queries/events.ts lib/slugify.ts lib/slugify.test.ts
git commit -m "feat: add Events admin CRUD with unique slug generation"
```

---

## Task 11: Public Header & Footer

**Files:**
- Create: `components/layout/Header.tsx`
- Create: `components/layout/Footer.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (Task 7), `buildCloudinaryUrl()` (Task 6).
- Produces: `<Header>` and `<Footer>` rendered on every public page via the root layout.

- [ ] **Step 1: Write the Header**

Create `components/layout/Header.tsx`:

```tsx
import Link from 'next/link'
import { getSiteSettings } from '@/lib/queries/siteSettings'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

export async function Header() {
  const settings = await getSiteSettings()
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        {settings.logo_url && (
          <img src={buildCloudinaryUrl(settings.logo_url, { width: 48 })} alt="Insightix logo" className="h-10 w-10 rounded-full" />
        )}
        <span className="font-display text-lg font-bold">Insightix</span>
      </Link>
      <nav className="flex gap-6 text-sm">
        <Link href="/about">About</Link>
        <Link href="/team">Team</Link>
        <Link href="/events">Events</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  )
}
```

- [ ] **Step 2: Write the Footer**

Create `components/layout/Footer.tsx`:

```tsx
import { getSiteSettings } from '@/lib/queries/siteSettings'

export async function Footer() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <footer className="border-t border-neutral-800 px-6 py-8 text-sm text-neutral-400">
      <p>{settings.tagline}</p>
      {settings.contact_email && <p className="mt-2">{settings.contact_email}</p>}
      {settings.college_address && <p className="mt-1">{settings.college_address}</p>}
      {socialEntries.length > 0 && (
        <div className="mt-3 flex gap-4">
          {socialEntries.map(([platform, url]) => (
            <a key={platform} href={url} className="capitalize hover:text-brand-accent">{platform}</a>
          ))}
        </div>
      )}
    </footer>
  )
}
```

- [ ] **Step 3: Wire them into the root layout**

Modify `app/layout.tsx` — add the imports and wrap `children`:

```tsx
import { Space_Grotesk, Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const body = Inter({ subsets: ['latin'], variable: '--font-body' })

export const metadata = {
  title: { default: 'Insightix', template: '%s | Insightix' },
  description: 'The Insightix tech club',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="bg-brand-bg font-body text-brand-text">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
```

Note: `/admin/*` pages already render their own `AdminLayout` (Task 4) nested inside this root layout, so the public Header/Footer will also wrap admin pages. Accept this for Phase 1 (admin pages get an extra nav bar above/below their own shell); if this proves visually confusing during manual verification, move `Header`/`Footer` into a `(public)` route group instead — see Step 4.

- [ ] **Step 4: Manual verification and route-group fix if needed**

Run: `npm run dev`, visit `/` and `/admin/team`. If the public Header/Footer visibly clash with the admin shell, restructure: move `app/page.tsx`, `app/about`, `app/team`, `app/events`, `app/contact` into `app/(public)/...` and create `app/(public)/layout.tsx` containing the `<Header>`/`<Footer>` wrapper instead of putting it in the root layout; keep `app/layout.tsx` minimal (just `<html>`/`<body>` with fonts). Route groups don't affect URLs, so `/about` still resolves the same way. Confirm both `/` and `/admin/team` render cleanly after whichever approach is used.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx components/layout
git commit -m "feat: add public Header and Footer driven by site settings"
```

---

## Task 12: Home Page & Hero Animation (Phase 0 de-risk spike)

This task is the spec's "top execution risk" — the hero is built and measured against the Lighthouse ≥90 mobile budget before any later public page copies its animation patterns.

**Files:**
- Create: `components/home/Hero.tsx`
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `getHomeContent()` (Task 8), `getRecentEvents()` (Task 10), `buildCloudinaryUrl()` (Task 6).
- Produces: the Home route at `/`; establishes the animation pattern (`whileInView` + transform/opacity variants) that Tasks 13–15 reuse for their own scroll reveals.

- [ ] **Step 1: Build the Hero component**

Create `components/home/Hero.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

interface HeroProps {
  introText: string | null
  bannerUrl: string | null
  bannerType: 'image' | 'video' | null
}

export function Hero({ introText, bannerUrl, bannerType }: HeroProps) {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      {bannerUrl && bannerType === 'image' && (
        <img
          src={buildCloudinaryUrl(bannerUrl, { width: 1600 })}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-30"
        />
      )}
      <motion.div variants={container} initial="hidden" animate="show" className="flex max-w-2xl flex-col items-center gap-4">
        <motion.h1 variants={item} className="font-display text-5xl font-bold sm:text-7xl">
          Insight<span className="text-brand-accent">ix</span>
        </motion.h1>
        {introText && (
          <motion.p variants={item} className="text-lg text-neutral-300">
            {introText}
          </motion.p>
        )}
        {bannerUrl && bannerType === 'video' && (
          <motion.iframe
            variants={item}
            src={bannerUrl}
            className="aspect-video w-full max-w-xl rounded"
            allowFullScreen
          />
        )}
      </motion.div>
    </section>
  )
}
```

Deliberately excluded from this first pass: the custom cursor effect and parallax mentioned in the spec's Visual Theme section. Ship the staggered text reveal first, measure it (Step 3), and only layer in the heavier desktop-only effects afterward if the budget has headroom — this is the de-risking order the spec calls for.

- [ ] **Step 2: Build the Home page**

Create `app/page.tsx`:

```tsx
import Link from 'next/link'
import { getHomeContent } from '@/lib/queries/homeContent'
import { getRecentEvents } from '@/lib/queries/events'
import { Hero } from '@/components/home/Hero'

export default async function HomePage() {
  const [content, recentEvents] = await Promise.all([getHomeContent(), getRecentEvents(3)])

  return (
    <main>
      <Hero introText={content.intro_text} bannerUrl={content.banner_media_url} bannerType={content.banner_media_type} />
      <section className="px-6 py-16">
        <h2 className="font-display text-2xl font-bold">Recent Events</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-3">
          {recentEvents.map((event) => (
            <li key={event.id}>
              <Link href={`/events/${event.slug}`} className="block rounded border border-neutral-800 p-4 hover:border-brand-accent">
                <p className="font-semibold">{event.title}</p>
                <p className="text-sm text-neutral-400">{event.event_date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
```

Note: the spec's Home page also calls for "achievements" highlights — the `achievements` table doesn't exist until Phase 2, so this section is scoped to recent events only for now; Phase 2 adds an achievements strip alongside it.

- [ ] **Step 3: Measure the hero against the performance budget**

Run:

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --preset=mobile --only-categories=performance --view
```

Expected: Performance score ≥90. If it scores below 90, inspect the report's opportunities (commonly: unoptimized banner image, render-blocking font loading, or excessive JS from Framer Motion's bundle) and simplify the Hero — e.g. drop the banner image for a solid/gradient background, or reduce the stagger/duration — then re-run Lighthouse until the budget is met. Do not proceed to Task 13 until this passes; every later page reuses this same animation pattern, so a fix here is cheaper than a fix repeated four times over.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx components/home
git commit -m "feat: add Home page with hero animation, verified against Lighthouse mobile budget"
```

---

## Task 13: About Page

**Files:**
- Create: `app/about/page.tsx`
- Create: `components/RevealSection.tsx`

**Interfaces:**
- Consumes: `getAboutContent()` (Task 8).
- Produces: `<RevealSection>` (a `whileInView` fade/slide-up wrapper reused by Tasks 14–16 for their own scroll reveals).

- [ ] **Step 1: Extract the reusable scroll-reveal wrapper**

Create `components/RevealSection.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

export function RevealSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  )
}
```

- [ ] **Step 2: Build the About page**

Create `app/about/page.tsx`:

```tsx
import { getAboutContent } from '@/lib/queries/aboutContent'
import { RevealSection } from '@/components/RevealSection'

export const metadata = { title: 'About Us' }

export default async function AboutPage() {
  const content = await getAboutContent()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">About Insightix</h1>
      {content.vision && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Vision</h2>
          <p className="mt-2 text-neutral-300">{content.vision}</p>
        </RevealSection>
      )}
      {content.mission && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Mission</h2>
          <p className="mt-2 text-neutral-300">{content.mission}</p>
        </RevealSection>
      )}
      {content.history && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">History</h2>
          <p className="mt-2 text-neutral-300">{content.history}</p>
        </RevealSection>
      )}
      {content.objectives && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">Objectives</h2>
          <p className="mt-2 text-neutral-300">{content.objectives}</p>
        </RevealSection>
      )}
      {content.faculty_message && (
        <RevealSection className="mt-10">
          <h2 className="font-display text-xl font-bold text-brand-accent">A Message from Our Faculty Mentor</h2>
          <p className="mt-2 text-neutral-300">{content.faculty_message}</p>
        </RevealSection>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, fill in all five fields via `/admin/about`, visit `/about`, scroll down, and confirm each section fades/slides up as it enters the viewport (and that with OS-level "reduce motion" enabled, sections appear instantly instead per the global CSS from Task 5).

- [ ] **Step 4: Commit**

```bash
git add app/about components/RevealSection.tsx
git commit -m "feat: add About page with scroll-reveal sections"
```

---

## Task 14: Team Page

**Files:**
- Create: `app/team/page.tsx`
- Create: `components/team/TeamGrid.tsx`

**Interfaces:**
- Consumes: `getActiveTeamMembers()` (Task 9), `buildCloudinaryUrl()` (Task 6), `<RevealSection>` (Task 13).
- Produces: the `/team` route.

- [ ] **Step 1: Build the TeamGrid component**

Create `components/team/TeamGrid.tsx`:

```tsx
import { buildCloudinaryUrl } from '@/lib/cloudinary'
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
    <>
      {grouped.map(({ category, members }) =>
        members.length > 0 ? (
          <div key={category} className="mt-12">
            <h2 className="font-display text-2xl font-bold">{CATEGORY_LABELS[category]}</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {members.map((member) => (
                <div key={member.id} className="rounded border border-neutral-800 p-4 text-center">
                  {member.photo_url && (
                    <img
                      src={buildCloudinaryUrl(member.photo_url, { width: 200 })}
                      alt={member.name}
                      className="mx-auto h-24 w-24 rounded-full object-cover"
                    />
                  )}
                  <p className="mt-3 font-semibold">{member.name}</p>
                  <p className="text-sm text-neutral-400">{member.role}</p>
                  {member.linkedin_url && (
                    <a href={member.linkedin_url} className="mt-2 inline-block text-sm text-brand-accent">
                      LinkedIn
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}
    </>
  )
}
```

- [ ] **Step 2: Build the Team page**

Create `app/team/page.tsx`:

```tsx
import { getActiveTeamMembers } from '@/lib/queries/teamMembers'
import { TeamGrid } from '@/components/team/TeamGrid'

export const metadata = { title: 'Team' }

export default async function TeamPage() {
  const members = await getActiveTeamMembers()
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Our Team</h1>
      <TeamGrid members={members} />
    </main>
  )
}
```

- [ ] **Step 3: Manual verification**

Run: `npm run dev`, add at least one team member per category via `/admin/team`, visit `/team`, and confirm all four category headings appear with the right members and LinkedIn links, and that a category with zero members doesn't render an empty heading.

- [ ] **Step 4: Commit**

```bash
git add app/team components/team
git commit -m "feat: add Team page grouped by category"
```

---

## Task 15: Events Pages (list, detail, per-event OG image)

**Files:**
- Create: `app/events/page.tsx`
- Create: `app/events/[slug]/page.tsx`
- Create: `app/events/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getUpcomingEvents()`, `getPastEvents()`, `getEventBySlug()` (Task 10), `buildCloudinaryUrl()` (Task 6).
- Produces: `/events` and `/events/[slug]` routes with working OG images (used by Task 17's sitemap).

- [ ] **Step 1: Build the Events list page**

Create `app/events/page.tsx`:

```tsx
import Link from 'next/link'
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'

export const metadata = { title: 'Events & Competitions' }

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Events & Competitions</h1>

      <h2 className="mt-10 font-display text-2xl font-bold text-brand-accent">Upcoming</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {upcoming.map((event) => (
          <li key={event.id} className="rounded border border-neutral-800 p-4">
            <Link href={`/events/${event.slug}`} className="font-semibold hover:text-brand-accent">{event.title}</Link>
            <p className="text-sm text-neutral-400">{event.event_date}</p>
            {event.registration_url && (
              <a href={event.registration_url} className="mt-2 inline-block rounded bg-amber-500 px-3 py-1 text-sm font-semibold text-black">
                Register
              </a>
            )}
          </li>
        ))}
        {upcoming.length === 0 && <p className="text-neutral-500">No upcoming events right now — check back soon.</p>}
      </ul>

      <h2 className="mt-12 font-display text-2xl font-bold text-brand-accent">Past</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {past.map((event) => (
          <li key={event.id} className="rounded border border-neutral-800 p-4">
            <Link href={`/events/${event.slug}`} className="font-semibold hover:text-brand-accent">{event.title}</Link>
            <p className="text-sm text-neutral-400">{event.event_date}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

- [ ] **Step 2: Build the Event detail page**

Create `app/events/[slug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { getEventBySlug } from '@/lib/queries/events'
import { buildCloudinaryUrl } from '@/lib/cloudinary'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  if (!event) return {}
  return { title: event.title, description: event.description ?? undefined }
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)
  if (!event || !event.is_active) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      {event.cover_photo_url && (
        <img src={buildCloudinaryUrl(event.cover_photo_url, { width: 1200 })} alt={event.title} className="w-full rounded" />
      )}
      <h1 className="mt-6 font-display text-4xl font-bold">{event.title}</h1>
      <p className="mt-1 text-neutral-400">{event.event_date}</p>
      {event.description && <p className="mt-6 text-neutral-300">{event.description}</p>}
      {event.registration_url && (
        <a href={event.registration_url} className="mt-6 inline-block rounded bg-amber-500 px-4 py-2 font-semibold text-black">
          Register
        </a>
      )}
      {event.gallery_urls.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {event.gallery_urls.map((url) => (
            <img key={url} src={buildCloudinaryUrl(url, { width: 400 })} alt="" className="rounded object-cover" />
          ))}
        </div>
      )}
      {event.video_embed_urls.length > 0 && (
        <div className="mt-10 flex flex-col gap-4">
          {event.video_embed_urls.map((url) => (
            <iframe key={url} src={url} className="aspect-video w-full rounded" allowFullScreen />
          ))}
        </div>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Build the per-event OG image route**

Create `app/events/[slug]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'
import { getEventBySlug } from '@/lib/queries/events'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function EventOgImage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        <div style={{ color: '#f5820c' }}>Insightix</div>
        <div style={{ fontSize: 40, marginTop: 20, textAlign: 'center', padding: '0 60px' }}>
          {event?.title ?? 'Event'}
        </div>
      </div>
    ),
    size
  )
}
```

Note: this covers the spec's "templated OG image if no cover photo is set" requirement generically — Next.js serves this `opengraph-image.tsx` route automatically as the event's OG image regardless of whether a cover photo exists. A future refinement (not required for Phase 1) could prefer the cover photo when present; for now every event gets a consistent branded card, which satisfies "links shared to socials/WhatsApp render properly."

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, visit `/events`, confirm upcoming/past sections render correctly, click into an event detail page, and confirm the registration button, gallery grid, and video embeds render when present. Visit `/events/[slug]/opengraph-image` directly in the browser and confirm a 1200×630 branded PNG renders.

- [ ] **Step 5: Commit**

```bash
git add app/events
git commit -m "feat: add Events list, detail, and per-event OG image pages"
```

---

## Task 16: Contact Page

**Files:**
- Create: `app/contact/page.tsx`

**Interfaces:**
- Consumes: `getSiteSettings()` (Task 7).
- Produces: the `/contact` route.

- [ ] **Step 1: Build the Contact page**

Create `app/contact/page.tsx`:

```tsx
import { getSiteSettings } from '@/lib/queries/siteSettings'

export const metadata = { title: 'Contact Us' }

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const socialEntries = Object.entries(settings.social_links ?? {})

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-4xl font-bold">Contact Us</h1>
      <dl className="mt-8 flex flex-col gap-6">
        {settings.contact_email && (
          <div>
            <dt className="text-sm text-neutral-500">Email</dt>
            <dd><a href={`mailto:${settings.contact_email}`} className="text-brand-accent">{settings.contact_email}</a></dd>
          </div>
        )}
        {settings.whatsapp_number && (
          <div>
            <dt className="text-sm text-neutral-500">WhatsApp</dt>
            <dd>{settings.whatsapp_number}</dd>
          </div>
        )}
        {settings.phone_number && (
          <div>
            <dt className="text-sm text-neutral-500">Phone</dt>
            <dd>{settings.phone_number}</dd>
          </div>
        )}
        {settings.college_address && (
          <div>
            <dt className="text-sm text-neutral-500">Address</dt>
            <dd>{settings.college_address}</dd>
          </div>
        )}
        {socialEntries.length > 0 && (
          <div>
            <dt className="text-sm text-neutral-500">Social</dt>
            <dd className="flex gap-4">
              {socialEntries.map(([platform, url]) => (
                <a key={platform} href={url} className="capitalize text-brand-accent">{platform}</a>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </main>
  )
}
```

- [ ] **Step 2: Manual verification**

Run: `npm run dev`, fill in all Site Settings fields via `/admin/site-settings`, visit `/contact`, and confirm every field renders (and that a field left blank simply doesn't show its `<dt>`/`<dd>` pair rather than rendering "null" or an empty row).

- [ ] **Step 3: Commit**

```bash
git add app/contact
git commit -m "feat: add Contact page"
```

---

## Task 17: Sitemap, Robots, and Static Home OG Image

Per-page `<title>` metadata was already added alongside each page in Tasks 13–16 (About, Team, Events, Contact) and via `generateMetadata` for event detail pages in Task 15. This task adds the remaining site-wide SEO pieces named in the spec: `sitemap.xml`, `robots.txt`, and Home's static OG image.

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `app/opengraph-image.tsx`
- Test: `app/sitemap.test.ts`

**Interfaces:**
- Consumes: `getUpcomingEvents()`, `getPastEvents()` (Task 10).
- Produces: `GET /sitemap.xml`, `GET /robots.txt`, `GET /opengraph-image` (Home's static OG image).

- [ ] **Step 1: Write the failing test for the sitemap's static-route coverage**

Create `app/sitemap.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/queries/events', () => ({
  getUpcomingEvents: vi.fn().mockResolvedValue([]),
  getPastEvents: vi.fn().mockResolvedValue([{ slug: 'hack-night', event_date: '2026-01-01' } as any]),
}))

import sitemap from './sitemap'

describe('sitemap', () => {
  it('includes every static top-level page', async () => {
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).toEqual(
      expect.arrayContaining([
        'https://insightix.example.com',
        'https://insightix.example.com/about',
        'https://insightix.example.com/team',
        'https://insightix.example.com/events',
        'https://insightix.example.com/contact',
      ])
    )
  })

  it('includes a URL for each event slug', async () => {
    const entries = await sitemap()
    expect(entries.map((e) => e.url)).toContain('https://insightix.example.com/events/hack-night')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- app/sitemap.test.ts`
Expected: FAIL — `Cannot find module './sitemap'`.

- [ ] **Step 3: Implement the sitemap**

Create `app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next'
import { getUpcomingEvents, getPastEvents } from '@/lib/queries/events'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightix.example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [upcoming, past] = await Promise.all([getUpcomingEvents(), getPastEvents()])
  const events = [...upcoming, ...past]

  const staticRoutes: MetadataRoute.Sitemap = ['', '/about', '/team', '/events', '/contact'].map((path) => ({
    url: `${BASE_URL}${path}`,
  }))

  const eventRoutes: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    lastModified: event.event_date,
  }))

  return [...staticRoutes, ...eventRoutes]
}
```

Add `NEXT_PUBLIC_SITE_URL=` to `.env.local.example` (left blank until the custom domain is live; falls back to the placeholder above until then).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- app/sitemap.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Add robots.txt**

Create `app/robots.ts`:

```ts
import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://insightix.example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin' },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

- [ ] **Step 6: Add the static Home OG image**

Create `app/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function HomeOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0a0a0a',
          color: '#f5f5f5',
          fontSize: 80,
          fontWeight: 700,
        }}
      >
        <div>
          Insight<span style={{ color: '#f5820c' }}>ix</span>
        </div>
        <div style={{ fontSize: 32, marginTop: 16, color: '#a3a3a3' }}>Tech Club</div>
      </div>
    ),
    size
  )
}
```

- [ ] **Step 7: Manual verification**

Run: `npm run dev`, visit `/sitemap.xml`, `/robots.txt`, and `/opengraph-image`, and confirm each renders correctly (sitemap lists all static routes plus every event slug; robots disallows `/admin`; the OG image shows the branded card).

- [ ] **Step 8: Commit**

```bash
git add app/sitemap.ts app/sitemap.test.ts app/robots.ts app/opengraph-image.tsx .env.local.example
git commit -m "feat: add sitemap, robots.txt, and static Home OG image"
```

---

## Task 18: Deployment to Vercel

**Files:** none (infrastructure/configuration task, no application code changes).

**Interfaces:**
- Consumes: every env var accumulated in `.env.local.example` across Tasks 1, 3, 6, and 17.
- Produces: a live production deployment of everything built in Tasks 1–17.

- [ ] **Step 1: Push the repository to the club's GitHub account**

```bash
git remote add origin <club-github-repo-url>
git push -u origin master
```

Confirm this is pushed under the club's dedicated GitHub account, not the user's personal one, per the spec's Infra note.

- [ ] **Step 2: Create the Vercel project**

In the Vercel dashboard (signed in under, or with access granted to, the club's account): "Add New Project" → import the GitHub repo just pushed → framework preset auto-detects Next.js → do not deploy yet, first add environment variables (Step 3).

- [ ] **Step 3: Set environment variables in Vercel**

Add every variable from `.env.local.example` (Supabase URL/anon key/service role key, Cloudinary cloud name/API key/API secret/upload preset, `NEXT_PUBLIC_SITE_URL`) to the Vercel project's Environment Variables settings, scoped to Production, Preview, and Development.

- [ ] **Step 4: Deploy and verify**

Trigger the deployment (push already did, or click "Deploy"). Once live at the `*.vercel.app` URL, verify: `/` loads with the hero animation, `/admin/login` requires credentials and `/admin/team` redirects when logged out, `/sitemap.xml` and `/robots.txt` resolve, and a test edit made in `/admin/site-settings` shows up on `/contact` within a few seconds (confirming on-demand revalidation works in production, not just locally).

- [ ] **Step 5: Document the pending custom domain step**

The custom domain purchase/DNS setup is still pending per the spec — this is a manual, external step (domain registrar + Vercel's "Domains" settings) that can't be scripted here. Note in the repo's `README.md` (create if it doesn't exist) that the production site currently lives at the `*.vercel.app` URL until the domain is connected, plus the steps: buy the domain, add it under the Vercel project's Domains tab, and update the DNS records Vercel provides at the registrar.

- [ ] **Step 6: Commit the README note**

```bash
git add README.md
git commit -m "docs: note pending custom domain setup and current deployment URL"
git push
```
