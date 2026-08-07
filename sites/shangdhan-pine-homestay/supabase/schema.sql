-- Shangdhan Pine Homestay -- backend schema
--
-- Run this once in your Supabase project: Dashboard -> SQL Editor -> New query
-- -> paste this whole file -> Run. Safe to re-run (uses IF NOT EXISTS / OR REPLACE
-- throughout), so re-running after a partial failure won't duplicate anything.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rent_amount numeric,
  rent_unit text not null default 'per night',
  size_sqft integer,
  max_guests integer,
  description text,
  amenities text[] not null default '{}',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references rooms(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  caption text,
  category text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists room_images_room_id_idx on room_images(room_id);
create index if not exists rooms_sort_order_idx on rooms(sort_order);
create index if not exists gallery_images_sort_order_idx on gallery_images(sort_order);

-- Keep updated_at current on every room edit.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rooms_set_updated_at on rooms;
create trigger rooms_set_updated_at
  before update on rooms
  for each row execute function set_updated_at();

-- ============================================================================
-- Row Level Security
--
-- Public site visitors (the "anon" role) can only read published rooms and
-- can always read gallery/room photos. Only a logged-in admin (any row in
-- Supabase Auth -- see setup notes in the README) can write. This is a
-- single-owner site: every authenticated account is treated as the admin,
-- so only ever create a login for the property owner.
-- ============================================================================

alter table rooms enable row level security;
alter table room_images enable row level security;
alter table gallery_images enable row level security;

drop policy if exists "public can read published rooms" on rooms;
create policy "public can read published rooms" on rooms
  for select using (published = true);

drop policy if exists "admin full access to rooms" on rooms;
create policy "admin full access to rooms" on rooms
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public can read room images" on room_images;
create policy "public can read room images" on room_images
  for select using (true);

drop policy if exists "admin full access to room images" on room_images;
create policy "admin full access to room images" on room_images
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public can read gallery images" on gallery_images;
create policy "public can read gallery images" on gallery_images
  for select using (true);

drop policy if exists "admin full access to gallery images" on gallery_images;
create policy "admin full access to gallery images" on gallery_images
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- Storage buckets
--
-- Public read (so <img> tags and next/image can load photos directly from
-- the CDN URL), admin-only write.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('room-photos', 'room-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

drop policy if exists "public can read room photos" on storage.objects;
create policy "public can read room photos" on storage.objects
  for select using (bucket_id = 'room-photos');

drop policy if exists "admin can manage room photos" on storage.objects;
create policy "admin can manage room photos" on storage.objects
  for all using (bucket_id = 'room-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'room-photos' and auth.role() = 'authenticated');

drop policy if exists "public can read gallery photos" on storage.objects;
create policy "public can read gallery photos" on storage.objects
  for select using (bucket_id = 'gallery-photos');

drop policy if exists "admin can manage gallery photos" on storage.objects;
create policy "admin can manage gallery photos" on storage.objects
  for all using (bucket_id = 'gallery-photos' and auth.role() = 'authenticated')
  with check (bucket_id = 'gallery-photos' and auth.role() = 'authenticated');
