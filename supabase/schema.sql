-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.cars (
  id           uuid primary key default gen_random_uuid(),
  qr_code      text not null unique,          -- the exact text encoded in the car's QR code
  plate_number text not null,
  make         text not null,
  model        text not null,
  year         int,
  color        text,
  owner_name   text,
  status       text not null default 'active'
               check (status in ('active', 'expired', 'suspended')),
  notes        text,
  created_at   timestamptz not null default now()
);

-- Lock the table down: only signed-in users may read. Nobody can write from the app
-- (add / edit cars in the Supabase Table Editor instead).
alter table public.cars enable row level security;

drop policy if exists "Signed-in users can read cars" on public.cars;
create policy "Signed-in users can read cars"
  on public.cars for select
  to authenticated
  using (true);

-- Sample data so you can test right away.
insert into public.cars (qr_code, plate_number, make, model, year, color, owner_name, status, notes) values
  ('CAR-0001', 'ABC 1234', 'Toyota', 'Fortuner', 2022, 'Pearl White', 'Juan Dela Cruz',  'active',    'Parking pass B-12'),
  ('CAR-0002', 'XYZ 5678', 'Honda',  'Civic',    2020, 'Midnight Blue', 'Maria Santos',  'expired',   'Registration expired 2026-06'),
  ('CAR-0003', 'DEF 9012', 'Ford',   'Ranger',   2019, 'Black',        'Pedro Reyes',    'suspended', 'Contact security office')
on conflict (qr_code) do nothing;
