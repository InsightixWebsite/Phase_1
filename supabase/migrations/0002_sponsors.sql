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
