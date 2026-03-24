-- TripDripGoGo — Supabase Schema v1
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Waitlist ─────────────────────────────────────────────────────────────────
create table if not exists waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  source     text default 'landing_page',
  created_at timestamptz default now()
);

-- ── Profiles (extends auth.users) ────────────────────────────────────────────
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text,
  home_country   text,
  currency       text default 'EUR',
  traveler_type  text default 'backpacker', -- backpacker | budget | comfort | flashpacker
  onboarding_done boolean default false,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Trips ─────────────────────────────────────────────────────────────────────
create table if not exists trips (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references profiles(id) on delete cascade,
  name           text not null,
  emoji          text default '✈️',
  total_budget   numeric(10,2) not null default 0,
  start_date     date,
  end_date       date,
  region         text,
  duration_weeks integer,
  is_active      boolean default true,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ── Stops ─────────────────────────────────────────────────────────────────────
create table if not exists stops (
  id               uuid primary key default uuid_generate_v4(),
  trip_id          uuid references trips(id) on delete cascade,
  city             text not null,
  country          text not null,
  country_code     text,
  days             integer default 3,
  budget_per_day   numeric(8,2) default 40,
  neighborhood     text,
  character        text, -- chill | party | culture | nature | city
  arrival_date     date,
  is_active        boolean default false,
  is_completed     boolean default false,
  sort_order       integer default 0,
  created_at       timestamptz default now()
);

-- ── Flights ───────────────────────────────────────────────────────────────────
create table if not exists flights (
  id             uuid primary key default uuid_generate_v4(),
  trip_id        uuid references trips(id) on delete cascade,
  from_stop_id   uuid references stops(id),
  to_stop_id     uuid references stops(id),
  airline        text,
  flight_number  text,
  status         text default 'searching', -- searching | booked | cancelled
  price          numeric(8,2),
  departure_at   timestamptz,
  arrival_at     timestamptz,
  created_at     timestamptz default now()
);

-- ── Expenses ──────────────────────────────────────────────────────────────────
create table if not exists expenses (
  id          uuid primary key default uuid_generate_v4(),
  trip_id     uuid references trips(id) on delete cascade,
  stop_id     uuid references stops(id),
  raw         text,                -- original OCR / voice input
  amount      numeric(10,2) not null,
  currency    text default 'EUR',
  amount_eur  numeric(10,2),       -- converted amount
  category    text not null,       -- food|transport|stay|activities|drinks|shopping|health|loan|other
  label       text,
  note        text,
  date        date default current_date,
  created_at  timestamptz default now()
);

-- ── Documents ─────────────────────────────────────────────────────────────────
create table if not exists documents (
  id             uuid primary key default uuid_generate_v4(),
  trip_id        uuid references trips(id) on delete cascade,
  stop_id        uuid references stops(id),
  type           text not null, -- flight|hotel|visa|insurance|activity|transport|other
  title          text not null,
  file_url       text,
  extracted_data jsonb,
  parsed_at      timestamptz,
  created_at     timestamptz default now()
);

-- ── Events (analytics) ────────────────────────────────────────────────────────
create table if not exists events (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references profiles(id),
  name       text not null,
  properties jsonb,
  created_at timestamptz default now()
);

-- ── RLS Policies ─────────────────────────────────────────────────────────────

-- Enable RLS on all user tables
alter table profiles  enable row level security;
alter table trips     enable row level security;
alter table stops     enable row level security;
alter table flights   enable row level security;
alter table expenses  enable row level security;
alter table documents enable row level security;
alter table events    enable row level security;
alter table waitlist  enable row level security;

-- Profiles: users can only see/edit their own
create policy "profiles: own row" on profiles
  for all using (auth.uid() = id);

-- Trips: users can only see/edit their own
create policy "trips: own" on trips
  for all using (auth.uid() = user_id);

-- Stops: via trip ownership
create policy "stops: via trip" on stops
  for all using (
    exists (
      select 1 from trips where trips.id = stops.trip_id and trips.user_id = auth.uid()
    )
  );

-- Flights: via trip ownership
create policy "flights: via trip" on flights
  for all using (
    exists (
      select 1 from trips where trips.id = flights.trip_id and trips.user_id = auth.uid()
    )
  );

-- Expenses: via trip ownership
create policy "expenses: via trip" on expenses
  for all using (
    exists (
      select 1 from trips where trips.id = expenses.trip_id and trips.user_id = auth.uid()
    )
  );

-- Documents: via trip ownership
create policy "documents: via trip" on documents
  for all using (
    exists (
      select 1 from trips where trips.id = documents.trip_id and trips.user_id = auth.uid()
    )
  );

-- Events: own only
create policy "events: own" on events
  for all using (auth.uid() = user_id);

-- Waitlist: insert-only (anonymous allowed), no read
create policy "waitlist: insert" on waitlist
  for insert with check (true);

-- ── Trigger: auto-create profile on signup ────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Trigger: update updated_at ────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trips_updated_at    before update on trips    for each row execute procedure set_updated_at();
create trigger profiles_updated_at before update on profiles for each row execute procedure set_updated_at();
