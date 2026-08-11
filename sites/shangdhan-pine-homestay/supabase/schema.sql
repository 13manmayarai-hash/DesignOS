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

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'SIGHTSEEING',
  price numeric not null default 0,
  description text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- One row per booking request submitted through /book. Guests never read
-- these back -- there's no login for them -- so RLS below only grants
-- INSERT to anon, never SELECT. Only the admin can list bookings.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_phone text not null,
  guest_email text,
  guest_nationality text not null default 'Indian',
  guest_state_code text,
  check_in date not null,
  check_out date not null,
  accommodation_total numeric not null default 0,
  activities_total numeric not null default 0,
  cgst_amount numeric not null default 0,
  sgst_amount numeric not null default 0,
  igst_amount numeric not null default 0,
  total_amount numeric not null default 0,
  status text not null default 'AWAITING_UPI_RECONCILIATION',
  utr_number text,
  created_at timestamptz not null default now()
);

create table if not exists booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  room_id uuid references rooms(id) on delete set null,
  room_name text not null,
  quantity integer not null default 1,
  price_at_booking numeric not null default 0
);

create table if not exists booking_activities (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  activity_id uuid references activities(id) on delete set null,
  activity_title text not null,
  price_at_booking numeric not null default 0
);

-- FRRO / Form-C fields for foreign guests. Split into its own table (rather
-- than columns on bookings) so it's easy to give it stricter access later
-- if needed -- passport/visa numbers are more sensitive than the rest of a
-- booking row.
create table if not exists booking_compliance (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  passport_number text,
  visa_number text,
  id_proof_storage_path text,
  submitted_frro boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists room_images_room_id_idx on room_images(room_id);
create index if not exists rooms_sort_order_idx on rooms(sort_order);
create index if not exists gallery_images_sort_order_idx on gallery_images(sort_order);
create index if not exists activities_sort_order_idx on activities(sort_order);
create index if not exists bookings_check_in_idx on bookings(check_in);
create index if not exists booking_items_booking_id_idx on booking_items(booking_id);
create index if not exists booking_activities_booking_id_idx on booking_activities(booking_id);

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
alter table activities enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;
alter table booking_activities enable row level security;
alter table booking_compliance enable row level security;

-- RLS policies only filter rows within what a role is already granted at
-- the table level -- they don't grant access themselves. Some Supabase
-- projects don't provision these by default, so make it explicit.
grant usage on schema public to anon, authenticated;
grant select on rooms, room_images, gallery_images, activities to anon, authenticated;
grant insert, update, delete on rooms, room_images, gallery_images, activities to authenticated;
grant insert on bookings, booking_items, booking_activities, booking_compliance to anon, authenticated;
grant select, update, delete on bookings, booking_items, booking_activities, booking_compliance to authenticated;

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

drop policy if exists "public can read published activities" on activities;
create policy "public can read published activities" on activities
  for select using (published = true);

drop policy if exists "admin full access to activities" on activities;
create policy "admin full access to activities" on activities
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Bookings and everything attached to them: anyone can submit one (guests
-- never log in), nobody but the admin can ever read one back. This also
-- stops a guest from browsing other guests' bookings by guessing IDs.
drop policy if exists "anyone can submit a booking" on bookings;
create policy "anyone can submit a booking" on bookings
  for insert with check (true);

drop policy if exists "admin full access to bookings" on bookings;
create policy "admin full access to bookings" on bookings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "anyone can submit booking items" on booking_items;
create policy "anyone can submit booking items" on booking_items
  for insert with check (true);

drop policy if exists "admin full access to booking items" on booking_items;
create policy "admin full access to booking items" on booking_items
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "anyone can submit booking activities" on booking_activities;
create policy "anyone can submit booking activities" on booking_activities
  for insert with check (true);

drop policy if exists "admin full access to booking activities" on booking_activities;
create policy "admin full access to booking activities" on booking_activities
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "anyone can submit booking compliance" on booking_compliance;
create policy "anyone can submit booking compliance" on booking_compliance
  for insert with check (true);

drop policy if exists "admin full access to booking compliance" on booking_compliance;
create policy "admin full access to booking compliance" on booking_compliance
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

-- Guest ID documents (FRRO/Form-C compliance for foreign guests) are
-- private -- unlike the photo buckets above, nobody gets public read.
-- Guests can upload during checkout; only the admin can ever view them
-- (via a signed URL, since the bucket itself is not public).
insert into storage.buckets (id, name, public)
values ('guest-documents', 'guest-documents', false)
on conflict (id) do nothing;

drop policy if exists "anyone can upload a guest document" on storage.objects;
create policy "anyone can upload a guest document" on storage.objects
  for insert with check (bucket_id = 'guest-documents');

drop policy if exists "admin can manage guest documents" on storage.objects;
create policy "admin can manage guest documents" on storage.objects
  for all using (bucket_id = 'guest-documents' and auth.role() = 'authenticated')
  with check (bucket_id = 'guest-documents' and auth.role() = 'authenticated');
