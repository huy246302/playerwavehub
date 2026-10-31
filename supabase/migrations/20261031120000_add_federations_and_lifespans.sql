-- Step 1 (additive): federations + lifespans for countries, national teams and clubs.
-- Copy this file into supabase/migrations/ and run it on STAGING first.
-- Nothing is dropped or rewritten; existing rows keep working (new columns start empty).

-- ---------- Countries: start / end year ----------
-- end_year null = the country still exists. is_historical stays for now (see step 2).
alter table countries
  add column start_year smallint,
  add column end_year   smallint;

alter table countries
  add constraint countries_years_chk
  check (
    (start_year is null or start_year between 1800 and 2100)
    and (end_year is null or end_year between 1800 and 2100)
    and (end_year is null or start_year is null or end_year >= start_year)
  );

-- ---------- Federations ----------
-- A federation has one continuous existence. A successor federation is a new row.
-- National teams take their lifespan from their federation.
create table federations (
  id               bigint generated always as identity primary key,
  slug             text not null unique,
  name             text not null,
  short_name       text,
  country_id       bigint not null references countries(id) on delete restrict,
  confederation    text check (confederation in ('AFC','CAF','CONCACAF','CONMEBOL','OFC','UEFA')),
  founded_year     smallint not null check (founded_year between 1800 and 2100),
  ended_year       smallint check (ended_year between 1800 and 2100),  -- null = still active
  logo_url         text,
  logo_credit      text,
  logo_license     text,
  logo_source_url  text,
  description      text,
  created_by       uuid references profiles(id) on delete set null,
  updated_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint federations_years_chk check (ended_year is null or ended_year >= founded_year),
  -- lets national_teams guarantee "same country as its federation"
  constraint federations_id_country_uniq unique (id, country_id)
);

create index on federations (country_id);

create trigger federations_updated_at before update on federations
  for each row execute function set_updated_at();

-- The dashboard writes with the service role key (bypasses RLS), so like your other
-- tables only a public read policy is needed.
alter table federations enable row level security;
create policy "public read federations" on federations for select using (true);

-- ---------- National teams: link to a federation ----------
-- Nullable for now so existing rows stay valid. Step 2 makes it required.
alter table national_teams add column federation_id bigint;

-- Composite FK: a team cannot point at a federation from a different country.
-- (Not enforced while federation_id is null.)
alter table national_teams
  add constraint national_teams_federation_fk
  foreign key (federation_id, country_id)
  references federations (id, country_id) on delete restrict;

create index on national_teams (federation_id);

-- ---------- Clubs: ended year + optional federation ----------
alter table clubs
  add column ended_year    smallint,
  add column federation_id bigint references federations(id) on delete set null;

alter table clubs
  add constraint clubs_years_chk
  check (
    (founded_year is null or founded_year between 1800 and 2100)
    and (ended_year is null or ended_year between 1800 and 2100)
    and (ended_year is null or founded_year is null or ended_year >= founded_year)
  );

create index on clubs (federation_id);