-- RoadWatch — Supabase schema (idempotent)
-- Apply via Supabase Dashboard → SQL Editor → New query → paste → Run.

-- ============== EXTENSIONS ==============
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============== CHATS ==============
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,                 -- anonymous browser session
  title text,
  locale text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists chats_session_idx on chats (session_id, updated_at desc);

-- ============== MESSAGES ==============
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  text text,
  image_url text,
  lat double precision,
  lng double precision,
  resolved_address jsonb,
  resolved_display text,
  card_kind text,
  variant text,
  created_at timestamptz default now()
);
create index if not exists messages_chat_idx on messages (chat_id, created_at);

-- ============== CONTRACTORS / CONTRACTS / OFFICERS (seedable) ==============
create table if not exists contractors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jurisdiction_city text,
  jurisdiction_state text,
  road_classes text[],
  created_at timestamptz default now()
);
create index if not exists contractors_city_idx on contractors (jurisdiction_city);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references contractors(id) on delete set null,
  tender_id text,
  road_name text,                           -- human-readable road name (for display)
  road_match_pattern text,                  -- regex/ilike fragment to match road name
  road_class text,
  jurisdiction_city text,
  jurisdiction_state text,
  sanctioned_inr bigint,
  spent_inr bigint,
  start_date date,
  end_date date,
  last_relay_date date,
  dlp_months integer default 60,
  dlp_until date,
  status text default 'active',
  tender_url text,
  -- geo + size, for map-pin matching and ₹/km norm checks
  center_lat double precision,
  center_lng double precision,
  match_radius_m integer default 1200,
  length_km double precision,
  work_type text default 'overlay',          -- new/widening/relaying/overlay/maintenance
  terrain text default 'plain',               -- plain/rolling/hilly
  created_at timestamptz default now()
);
create index if not exists contracts_city_idx on contracts (jurisdiction_city);

-- Add the geo/size columns on existing deployments (idempotent).
alter table contracts add column if not exists road_name text;
alter table contracts add column if not exists center_lat double precision;
alter table contracts add column if not exists center_lng double precision;
alter table contracts add column if not exists match_radius_m integer default 1200;
alter table contracts add column if not exists length_km double precision;
alter table contracts add column if not exists work_type text default 'overlay';
alter table contracts add column if not exists terrain text default 'plain';

-- ============== COST NORMS (₹/km benchmark for red-flag detection) ==============
create table if not exists cost_norms (
  id uuid primary key default gen_random_uuid(),
  road_class text not null,
  work_type text not null,
  terrain text not null default 'plain',
  cost_per_km_min bigint not null,
  cost_per_km_max bigint not null,
  source text                                 -- MoRTH circular reference
);
create index if not exists cost_norms_lookup_idx
  on cost_norms (road_class, work_type, terrain);

create table if not exists officers (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid references contractors(id) on delete set null,
  jurisdiction_city text,
  jurisdiction_state text,
  rank integer not null check (rank between 1 and 6),
  role text not null,
  name text not null,
  email text,
  phone text,
  sla_days integer default 30
);
create index if not exists officers_city_rank_idx on officers (jurisdiction_city, rank);

-- ============== COMPLAINTS ==============
create table if not exists complaints (
  id text primary key,                      -- "CP-XXXXX" human-readable
  chat_id uuid references chats(id) on delete set null,
  session_id text not null,
  subject text,
  description text,
  original_text text,
  status text not null default 'filed' check (status in ('filed','acknowledged','in_progress','escalated','resolved','reopened')),
  -- raw + snapped location
  lat double precision,
  lng double precision,
  snapped_lat double precision,
  snapped_lng double precision,
  -- enriched address
  road_name text,
  road_class text,
  neighbourhood text,
  city text,
  state text,
  pincode text,
  -- contract / officer attribution
  contractor_id uuid references contractors(id) on delete set null,
  contract_id uuid references contracts(id) on delete set null,
  current_rank integer default 2,
  sla_days integer default 30,
  filed_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists complaints_session_idx on complaints (session_id, filed_at desc);
create index if not exists complaints_status_idx on complaints (status);
create index if not exists complaints_city_idx on complaints (city);

-- ============== COMPLAINT PHOTOS ==============
create table if not exists complaint_photos (
  id uuid primary key default gen_random_uuid(),
  complaint_id text not null references complaints(id) on delete cascade,
  url text not null,
  source text default 'gallery' check (source in ('camera','gallery')),
  created_at timestamptz default now()
);

-- ============== TIMELINE EVENTS (for tracking card) ==============
create table if not exists complaint_events (
  id uuid primary key default gen_random_uuid(),
  complaint_id text not null references complaints(id) on delete cascade,
  label text not null,
  occurred_at timestamptz default now(),
  done boolean default true
);

-- ============== ROW-LEVEL SECURITY ==============
-- For the hackathon: open policies. Tighten later.
alter table chats               enable row level security;
alter table messages            enable row level security;
alter table complaints          enable row level security;
alter table complaint_photos    enable row level security;
alter table complaint_events    enable row level security;
alter table contractors         enable row level security;
alter table contracts           enable row level security;
alter table officers            enable row level security;
alter table cost_norms          enable row level security;

-- DROP existing policies (idempotent re-run). Explicit per-table drops avoid
-- the loop-variable plpgsql pitfall and are simpler to read.
drop policy if exists "anon read"  on chats;
drop policy if exists "anon write" on chats;
drop policy if exists "anon read"  on messages;
drop policy if exists "anon write" on messages;
drop policy if exists "anon read"  on complaints;
drop policy if exists "anon write" on complaints;
drop policy if exists "anon read"  on complaint_photos;
drop policy if exists "anon write" on complaint_photos;
drop policy if exists "anon read"  on complaint_events;
drop policy if exists "anon write" on complaint_events;
drop policy if exists "anon read"  on contractors;
drop policy if exists "anon write" on contractors;
drop policy if exists "anon read"  on contracts;
drop policy if exists "anon write" on contracts;
drop policy if exists "anon read"  on officers;
drop policy if exists "anon write" on officers;
drop policy if exists "anon read"  on cost_norms;
drop policy if exists "anon write" on cost_norms;

-- Open read for everyone, open write for anon (demo).
create policy "anon read"  on chats             for select using (true);
create policy "anon write" on chats             for all    using (true) with check (true);
create policy "anon read"  on messages          for select using (true);
create policy "anon write" on messages          for all    using (true) with check (true);
create policy "anon read"  on complaints        for select using (true);
create policy "anon write" on complaints        for all    using (true) with check (true);
create policy "anon read"  on complaint_photos  for select using (true);
create policy "anon write" on complaint_photos  for all    using (true) with check (true);
create policy "anon read"  on complaint_events  for select using (true);
create policy "anon write" on complaint_events  for all    using (true) with check (true);
create policy "anon read"  on contractors       for select using (true);
create policy "anon write" on contractors       for all    using (true) with check (true);
create policy "anon read"  on contracts         for select using (true);
create policy "anon write" on contracts         for all    using (true) with check (true);
create policy "anon read"  on officers          for select using (true);
create policy "anon write" on officers          for all    using (true) with check (true);
create policy "anon read"  on cost_norms        for select using (true);
create policy "anon write" on cost_norms        for all    using (true) with check (true);

-- ============== STORAGE BUCKET ==============
-- Public-read bucket for complaint photos.
insert into storage.buckets (id, name, public)
  values ('roadwatch-photos', 'roadwatch-photos', true)
  on conflict (id) do nothing;

drop policy if exists "anon upload photos"      on storage.objects;
drop policy if exists "anon read photos"        on storage.objects;
create policy "anon upload photos" on storage.objects
  for insert to anon with check (bucket_id = 'roadwatch-photos');
create policy "anon read photos" on storage.objects
  for select using (bucket_id = 'roadwatch-photos');

-- ============== SEED — cost norms (₹/km bands, MoRTH-style) ==============
-- Idempotent: clear and re-insert the benchmark bands.
delete from cost_norms;
insert into cost_norms (road_class, work_type, terrain, cost_per_km_min, cost_per_km_max, source) values
  ('NH',  'overlay',    'plain',   25000000, 32000000, 'MoRTH Cost Norms 2023 (BT overlay, plain)'),
  ('NH',  'widening',   'plain',   80000000,120000000, 'MoRTH Cost Norms 2023 (4-lane widening)'),
  ('SH',  'overlay',    'plain',   18000000, 22000000, 'State PWD SoR 2023 (BT overlay, plain)'),
  ('SH',  'relaying',   'plain',   20000000, 26000000, 'State PWD SoR 2023 (BT relaying, plain)'),
  ('SH',  'overlay',    'rolling', 22000000, 28000000, 'State PWD SoR 2023 (BT overlay, rolling)'),
  ('MDR', 'overlay',    'plain',   12000000, 16000000, 'State PWD SoR 2023 (MDR overlay)'),
  ('MDR', 'maintenance','plain',    4000000,  7000000, 'State PWD SoR 2023 (periodic maintenance)'),
  ('ODR', 'overlay',    'plain',    8000000, 12000000, 'State PWD SoR 2023 (ODR overlay)'),
  ('MUN', 'overlay',    'plain',   10000000, 15000000, 'Municipal SoR 2023 (city road overlay)'),
  ('PMGSY','new',       'plain',    6000000,  9000000, 'PMGSY OMMAS unit cost (new rural road)');

-- ============== SEED — contractors / contracts / officers ==============
-- Demo road data lives in scripts/seed.mjs (~25 segments/city for Ahmedabad +
-- Chennai, with GPS centres so map pins resolve). Run AFTER this schema:
--     cd app && node scripts/seed.mjs
-- (Kept out of this file so re-running the schema never wipes the seeded roads.)

-- DONE. Rerun this file anytime — it's idempotent.
