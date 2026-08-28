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
