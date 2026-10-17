-- =====================================================================
-- Football legends: full Supabase schema
-- Retired legends from around the world: players and head coaches.
-- Run once in the Supabase SQL Editor, or keep it as your first migration:
--   supabase migration new init     (then paste this file into the new file)
-- =====================================================================

-- ---------- Enums ----------
create type position_code as enum (
  'GK', 'LB', 'RB', 'CB', 'LWB', 'RWB', 'DM', 'CM', 'LM', 'RM', 'AM', 'LW', 'RW', 'ST'
);
create type preferred_foot   as enum ('left', 'right', 'both');
create type attribute_entity as enum ('player', 'coach');
create type app_role         as enum ('admin', 'editor');

-- ---------- Helper: keep updated_at current ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Countries ----------
-- One consistent list used by nationality, birth country, clubs and national teams.
-- Historical states (South Vietnam, USSR, Yugoslavia ...) are rows too, with iso_code null.
create table countries (
  id             bigint generated always as identity primary key,
  slug           text not null unique,
  name           text not null,
  iso_code       text unique,            -- ISO 3166-1 alpha-2, e.g. 'VN'; null if historical
  flag_url       text,
  is_historical  boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ---------- Dashboard users ----------
-- If your project already has a profiles table, adapt this to match it.
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  role          app_role not null default 'editor',
  created_at    timestamptz not null default now()
);

-- ---------- People (one shared profile per human) ----------
-- A person can be a player, a head coach, or both. The details that belong to the
-- person (name, birth, photo, bio) live here once.
-- created_by / updated_by are set by the dashboard's server actions: it writes with the
-- service role key, so the database cannot work out the editor by itself.
create table people (
  id                bigint generated always as identity primary key,
  slug              text not null unique,
  full_name         text not null,
  display_name      text,
  date_of_birth     date,
  date_of_death     date,
  birthplace        text,                 -- city or town
  birth_country_id  bigint references countries(id) on delete restrict,
  nationality_id    bigint references countries(id) on delete restrict,
  photo_url         text,
  photo_credit      text,                 -- who took it
  photo_license     text,                 -- e.g. 'CC BY-SA 4.0'
  photo_source_url  text,                 -- page the image came from
  bio               text,
  created_by        uuid references profiles(id) on delete set null,
  updated_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (date_of_death is null or date_of_birth is null or date_of_death >= date_of_birth)
);

-- ---------- Clubs ----------
create table clubs (
  id               bigint generated always as identity primary key,
  slug             text not null unique,
  name             text not null,
  short_name       text,
  city             text,
  country_id       bigint references countries(id) on delete restrict,
  founded_year     smallint,
  logo_url         text,
  logo_credit      text,
  logo_license     text,
  logo_source_url  text,
  description      text,
  created_by       uuid references profiles(id) on delete set null,
  updated_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------- National teams (one level only, no age groups) ----------
create table national_teams (
  id          bigint generated always as identity primary key,
  slug        text not null unique,
  name        text not null,              -- 'Vietnam'
  country_id  bigint not null references countries(id) on delete restrict,
  crest_url   text,
  description text,
  created_by  uuid references profiles(id) on delete set null,
  updated_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------- Sources (where a fact came from) ----------
create table sources (
  id            bigint generated always as identity primary key,
  title         text not null,
  url           text,
  publisher     text,
  author        text,
  published_on  date,
  accessed_on   date,
  notes         text,
  created_at    timestamptz not null default now()
);

create table person_sources (
  person_id  bigint not null references people(id)  on delete cascade,
  source_id  bigint not null references sources(id) on delete cascade,
  note       text,
  primary key (person_id, source_id)
);

create table club_sources (
  club_id    bigint not null references clubs(id)   on delete cascade,
  source_id  bigint not null references sources(id) on delete cascade,
  note       text,
  primary key (club_id, source_id)
);

-- ---------- Players ----------
-- Profile details (name, birth, photo, bio) are on the linked people row.
create table players (
  id                bigint generated always as identity primary key,
  person_id         bigint not null unique references people(id) on delete cascade,
  height_cm         smallint check (height_cm between 120 and 230),
  legacy_summary    text,                 -- short "why he is a legend" blurb
  career_start_year smallint,
  retired_year      smallint,
  is_published      boolean not null default false,
  created_by        uuid references profiles(id) on delete set null,
  updated_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (retired_year is null or career_start_year is null
         or retired_year >= career_start_year)
);

-- ---------- Club career (many stints per player) ----------
create table player_club_stints (
  id          bigint generated always as identity primary key,
  player_id   bigint not null references players(id) on delete cascade,
  club_id     bigint not null references clubs(id)   on delete restrict,
  start_year  smallint not null,
  end_year    smallint,                   -- null = unknown / still at club
  is_loan     boolean not null default false,
  appearances smallint,
  goals       smallint,
  check (end_year is null or end_year >= start_year),
  unique (player_id, club_id, start_year)
);

-- ---------- National team career ----------
create table player_national_stints (
  id               bigint generated always as identity primary key,
  player_id        bigint not null references players(id)        on delete cascade,
  national_team_id bigint not null references national_teams(id) on delete restrict,
  debut_date       date,
  last_cap_date    date,
  caps             smallint,
  goals            smallint,
  check (last_cap_date is null or debut_date is null or last_cap_date >= debut_date),
  -- a player may represent several teams, but gets one row per team
  unique (player_id, national_team_id)
);

-- ---------- Player positions (1-100 rating per position he can play) ----------
-- rating = how comfortable he is in that position. At most one row per player is the
-- primary position (shown on cards and lists).
create table player_positions (
  player_id   bigint        not null references players(id) on delete cascade,
  position    position_code not null,
  rating      smallint      not null check (rating between 1 and 100),
  is_primary  boolean       not null default false,
  primary key (player_id, position)
);
create unique index one_primary_position_per_player
  on player_positions (player_id) where is_primary;

-- ---------- Head coaches ----------
create table coaches (
  id                bigint generated always as identity primary key,
  person_id         bigint not null unique references people(id) on delete cascade,
  legacy_summary    text,
  career_start_year smallint,
  retired_year      smallint,
  is_published      boolean not null default false,
  created_by        uuid references profiles(id) on delete set null,
  updated_by        uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (retired_year is null or career_start_year is null
         or retired_year >= career_start_year)
);

-- Club spells as head coach (a coach can return to a club, so one row per spell)
create table coach_club_stints (
  id           bigint generated always as identity primary key,
  coach_id     bigint not null references coaches(id) on delete cascade,
  club_id      bigint not null references clubs(id)   on delete restrict,
  start_year   smallint not null,
  end_year     smallint,
  is_caretaker boolean not null default false,
  matches      smallint,
  wins         smallint,
  draws        smallint,
  losses       smallint,
  check (end_year is null or end_year >= start_year),
  unique (coach_id, club_id, start_year)
);

-- National team spells as head coach
create table coach_national_stints (
  id               bigint generated always as identity primary key,
  coach_id         bigint not null references coaches(id)        on delete cascade,
  national_team_id bigint not null references national_teams(id) on delete restrict,
  start_year       smallint not null,
  end_year         smallint,
  is_caretaker     boolean not null default false,
  matches          smallint,
  wins             smallint,
  draws            smallint,
  losses           smallint,
  check (end_year is null or end_year >= start_year),
  unique (coach_id, national_team_id, start_year)
);

-- =====================================================================
-- Attributes (1-100 scale): one column per attribute, one row per person.
-- Football Manager attributes plus a few custom ones (marked "custom").
-- =====================================================================

-- ---------- Player attributes (visible) ----------
-- Every player, goalkeeper or not, has every column. The goalkeeping columns default
-- to 1 (the minimum), so an outfielder does not need to be rated on them.
-- Custom: acrobat, penalty_stopping.
create table player_attributes (
  player_id                            bigint primary key references players(id) on delete cascade,
  -- technical
  acrobat                              smallint not null check (acrobat between 1 and 100),
  corners                              smallint not null check (corners between 1 and 100),
  crossing                             smallint not null check (crossing between 1 and 100),
  dribbling                            smallint not null check (dribbling between 1 and 100),
  finishing                            smallint not null check (finishing between 1 and 100),
  first_touch                          smallint not null check (first_touch between 1 and 100),
  free_kick_taking                     smallint not null check (free_kick_taking between 1 and 100),
  heading                              smallint not null check (heading between 1 and 100),
  long_shots                           smallint not null check (long_shots between 1 and 100),
  long_throws                          smallint not null check (long_throws between 1 and 100),
  marking                              smallint not null check (marking between 1 and 100),
  passing                              smallint not null check (passing between 1 and 100),
  penalty_taking                       smallint not null check (penalty_taking between 1 and 100),
  tackling                             smallint not null check (tackling between 1 and 100),
  technique                            smallint not null check (technique between 1 and 100),
  -- mental
  aggression                           smallint not null check (aggression between 1 and 100),
  anticipation                         smallint not null check (anticipation between 1 and 100),
  bravery                              smallint not null check (bravery between 1 and 100),
  composure                            smallint not null check (composure between 1 and 100),
  concentration                        smallint not null check (concentration between 1 and 100),
  decisions                            smallint not null check (decisions between 1 and 100),
  determination                        smallint not null check (determination between 1 and 100),
  flair                                smallint not null check (flair between 1 and 100),
  leadership                           smallint not null check (leadership between 1 and 100),
  off_the_ball                         smallint not null check (off_the_ball between 1 and 100),
  positioning                          smallint not null check (positioning between 1 and 100),
  teamwork                             smallint not null check (teamwork between 1 and 100),
  vision                               smallint not null check (vision between 1 and 100),
  work_rate                            smallint not null check (work_rate between 1 and 100),
  -- physical
  acceleration                         smallint not null check (acceleration between 1 and 100),
  agility                              smallint not null check (agility between 1 and 100),
  balance                              smallint not null check (balance between 1 and 100),
  jumping_reach                        smallint not null check (jumping_reach between 1 and 100),
  natural_fitness                      smallint not null check (natural_fitness between 1 and 100),
  pace                                 smallint not null check (pace between 1 and 100),
  stamina                              smallint not null check (stamina between 1 and 100),
  strength                             smallint not null check (strength between 1 and 100),
  -- goalkeeping
  aerial_reach                         smallint not null default 1 check (aerial_reach between 1 and 100),
  command_of_area                      smallint not null default 1 check (command_of_area between 1 and 100),
  communication                        smallint not null default 1 check (communication between 1 and 100),
  eccentricity                         smallint not null default 1 check (eccentricity between 1 and 100),
  handling                             smallint not null default 1 check (handling between 1 and 100),
  kicking                              smallint not null default 1 check (kicking between 1 and 100),
  one_on_ones                          smallint not null default 1 check (one_on_ones between 1 and 100),
  penalty_stopping                     smallint not null default 1 check (penalty_stopping between 1 and 100),
  punching                             smallint not null default 1 check (punching between 1 and 100),
  reflexes                             smallint not null default 1 check (reflexes between 1 and 100),
  rushing_out                          smallint not null default 1 check (rushing_out between 1 and 100),
  throwing                             smallint not null default 1 check (throwing between 1 and 100),
  -- foot ability
  left_foot                            smallint not null check (left_foot between 1 and 100),
  right_foot                           smallint not null check (right_foot between 1 and 100)
);

-- ---------- Player hidden attributes ----------
-- FM's hidden attributes plus custom ones, shown publicly like the visible attributes.
create table player_hidden_attributes (
  player_id                            bigint primary key references players(id) on delete cascade,
  -- FM hidden attributes
  consistency                          smallint check (consistency between 1 and 100),
  dirtiness                            smallint check (dirtiness between 1 and 100),
  important_matches                    smallint check (important_matches between 1 and 100),
  injury_proneness                     smallint check (injury_proneness between 1 and 100),
  versatility                          smallint check (versatility between 1 and 100),
  adaptability                         smallint check (adaptability between 1 and 100),
  ambition                             smallint check (ambition between 1 and 100),
  controversy                          smallint check (controversy between 1 and 100),
  loyalty                              smallint check (loyalty between 1 and 100),
  pressure                             smallint check (pressure between 1 and 100),
  professionalism                      smallint check (professionalism between 1 and 100),
  sportsmanship                        smallint check (sportsmanship between 1 and 100),
  temperament                          smallint check (temperament between 1 and 100),
  -- custom
  ego                                  smallint check (ego between 1 and 100),
  charisma                             smallint check (charisma between 1 and 100),
  resilience                           smallint check (resilience between 1 and 100),
  mentoring                            smallint check (mentoring between 1 and 100),
  media_skill                          smallint check (media_skill between 1 and 100),
  media_openness                       smallint check (media_openness between 1 and 100),
  patriotism                           smallint check (patriotism between 1 and 100),
  financial_motivation                 smallint check (financial_motivation between 1 and 100),
  -- overall peak rating
  current_ability                      smallint check (current_ability between 1 and 100)
);

-- ---------- Head coach attributes (visible) ----------
-- coaching_* = how well he coaches that area; mental = his own qualities;
-- the last group is custom (not in FM).
create table coach_attributes (
  coach_id                             bigint primary key references coaches(id) on delete cascade,
  -- coaching
  coaching_attacking                   smallint check (coaching_attacking between 1 and 100),
  coaching_defending                   smallint check (coaching_defending between 1 and 100),
  coaching_fitness                     smallint check (coaching_fitness between 1 and 100),
  coaching_goalkeeper_distribution     smallint check (coaching_goalkeeper_distribution between 1 and 100),
  coaching_goalkeeper_handling         smallint check (coaching_goalkeeper_handling between 1 and 100),
  coaching_goalkeeper_shot_stopping    smallint check (coaching_goalkeeper_shot_stopping between 1 and 100),
  coaching_mental                      smallint check (coaching_mental between 1 and 100),
  coaching_tactical                    smallint check (coaching_tactical between 1 and 100),
  coaching_technical                   smallint check (coaching_technical between 1 and 100),
  coaching_working_with_youngsters     smallint check (coaching_working_with_youngsters between 1 and 100),
  coaching_set_pieces                  smallint check (coaching_set_pieces between 1 and 100),
  -- mental
  adaptability                         smallint check (adaptability between 1 and 100),
  determination                        smallint check (determination between 1 and 100),
  player_knowledge                     smallint check (player_knowledge between 1 and 100),
  youngster_knowledge                  smallint check (youngster_knowledge between 1 and 100),
  level_of_discipline                  smallint check (level_of_discipline between 1 and 100),
  people_management                    smallint check (people_management between 1 and 100),
  motivating                           smallint check (motivating between 1 and 100),
  -- custom
  tactical_innovation                  smallint check (tactical_innovation between 1 and 100),
  tactical_flexibility                 smallint check (tactical_flexibility between 1 and 100),
  big_match_management                 smallint check (big_match_management between 1 and 100),
  crisis_management                    smallint check (crisis_management between 1 and 100),
  recruitment                          smallint check (recruitment between 1 and 100),
  charisma                             smallint check (charisma between 1 and 100),
  media_skill                          smallint check (media_skill between 1 and 100),
  media_openness                       smallint check (media_openness between 1 and 100)
);

-- ---------- Head coach hidden attributes ----------
-- FM rates reputation on a much larger scale; here it is 1-100 like everything else.
create table coach_hidden_attributes (
  coach_id                             bigint primary key references coaches(id) on delete cascade,
  -- FM hidden attributes
  home_reputation                      smallint check (home_reputation between 1 and 100),
  world_reputation                     smallint check (world_reputation between 1 and 100),
  ambition                             smallint check (ambition between 1 and 100),
  loyalty                              smallint check (loyalty between 1 and 100),
  pressure                             smallint check (pressure between 1 and 100),
  professionalism                      smallint check (professionalism between 1 and 100),
  sportsmanship                        smallint check (sportsmanship between 1 and 100),
  temperament                          smallint check (temperament between 1 and 100),
  controversy                          smallint check (controversy between 1 and 100),
  -- custom
  ego                                  smallint check (ego between 1 and 100),
  resilience                           smallint check (resilience between 1 and 100),
  patriotism                           smallint check (patriotism between 1 and 100),
  financial_motivation                 smallint check (financial_motivation between 1 and 100),
  youth_trust                          smallint check (youth_trust between 1 and 100)
);

-- Columns where "higher" does not simply mean "better"
comment on column player_hidden_attributes.dirtiness is 'Higher = more likely to bend or break the rules.';
comment on column player_hidden_attributes.injury_proneness is 'Higher = more injury-prone.';
comment on column player_hidden_attributes.controversy is 'Higher = more bold or confrontational behaviour.';
comment on column player_hidden_attributes.ego is 'Higher = bigger need to be the star.';
comment on column player_hidden_attributes.media_skill is 'How effective with the press: low = gaffe-prone, high = polished.';
comment on column player_hidden_attributes.media_openness is 'How forthcoming with the press: low = guarded, high = outspoken.';
comment on column player_hidden_attributes.financial_motivation is 'Higher = money weighed more in his career choices.';
comment on column player_hidden_attributes.current_ability is 'Overall peak rating.';
comment on column coach_hidden_attributes.controversy is 'Higher = more bold or confrontational behaviour.';
comment on column coach_hidden_attributes.ego is 'Higher = bigger need to be the star.';
comment on column coach_hidden_attributes.financial_motivation is 'Higher = money weighed more in his career choices.';
comment on column coach_hidden_attributes.youth_trust is 'How willing he was to give young players a real chance.';
comment on column coach_attributes.media_skill is 'How effective with the press: low = gaffe-prone, high = polished.';
comment on column coach_attributes.media_openness is 'How forthcoming with the press: low = guarded, high = outspoken.';

-- A player can only be published once he has an attributes row (every column in it is
-- required, so a row means a complete set of ratings).
create or replace function require_player_attributes() returns trigger
language plpgsql as $$
begin
  if new.is_published
     and not exists (select 1 from player_attributes where player_id = new.id) then
    raise exception 'cannot publish: this player has no attributes row yet';
  end if;
  return new;
end $$;

create trigger players_require_attributes before insert or update of is_published on players
  for each row execute function require_player_attributes();

-- Foot ability as 1-5 levels, like a weak-foot star rating.
-- level = ceil(rating / 20): 1-20 very weak, 21-40 weak, 41-60 reasonable,
--                            61-80 strong, 81-100 very strong
create or replace function foot_level(v smallint) returns smallint
language sql immutable as $$ select ceil(v / 20.0)::smallint $$;

create or replace function foot_label(level smallint) returns text
language sql immutable as $$
  select case level
    when 1 then 'very weak' when 2 then 'weak' when 3 then 'reasonable'
    when 4 then 'strong'    else 'very strong' end $$;

-- player_feet works out the preferred foot and both feet as levels from the two foot
-- ratings, so it can never disagree with them. Both feet on the same level = 'both'.
-- foot_summary reads weak-strong, e.g. '2-5' = weak foot level 2, strong foot level 5.
-- security_invoker makes the view respect the same row level security as the tables.
create view player_feet with (security_invoker = true) as
with f as (
  select player_id,
         foot_level(left_foot)  as left_level,
         foot_level(right_foot) as right_level
  from player_attributes
)
select player_id,
       case when left_level = right_level then 'both'::preferred_foot
            when left_level > right_level  then 'left'::preferred_foot
            else 'right'::preferred_foot end            as preferred_foot,
       left_level                                        as left_foot_level,
       foot_label(left_level)                            as left_foot_label,
       right_level                                       as right_foot_level,
       foot_label(right_level)                           as right_foot_label,
       least(left_level, right_level)                    as weak_foot_level,
       foot_label(least(left_level, right_level))        as weak_foot_label,
       greatest(left_level, right_level)                 as strong_foot_level,
       least(left_level, right_level)::text || '-' || greatest(left_level, right_level)::text
                                                         as foot_summary
from f;

-- ---------- Indexes ----------
create index on people (nationality_id);
create index on people (birth_country_id);
create index on clubs (country_id);
create index on national_teams (country_id);
create index on person_sources (source_id);
create index on club_sources (source_id);
create index on players (is_published);
create index on coaches (is_published);
create index on player_club_stints (player_id);
create index on player_club_stints (club_id);
create index on player_national_stints (player_id);
create index on player_national_stints (national_team_id);
create index on player_positions (position);
create index on coach_club_stints (coach_id);
create index on coach_club_stints (club_id);
create index on coach_national_stints (coach_id);
create index on coach_national_stints (national_team_id);

-- ---------- updated_at triggers ----------
create trigger people_updated_at          before update on people
  for each row execute function set_updated_at();
create trigger clubs_updated_at           before update on clubs
  for each row execute function set_updated_at();
create trigger national_teams_updated_at  before update on national_teams
  for each row execute function set_updated_at();
create trigger players_updated_at         before update on players
  for each row execute function set_updated_at();
create trigger coaches_updated_at         before update on coaches
  for each row execute function set_updated_at();

-- ---------- Row level security ----------
-- The public site reads with the anon key. The dashboard writes with the service role
-- key, which bypasses RLS, so no write policies are needed.
alter table countries               enable row level security;
alter table profiles                enable row level security;
alter table people                  enable row level security;
alter table clubs                   enable row level security;
alter table national_teams          enable row level security;
alter table sources                 enable row level security;
alter table person_sources          enable row level security;
alter table club_sources            enable row level security;
alter table players                 enable row level security;
alter table player_club_stints      enable row level security;
alter table player_national_stints  enable row level security;
alter table player_positions        enable row level security;
alter table coaches                 enable row level security;
alter table coach_club_stints       enable row level security;
alter table coach_national_stints   enable row level security;
alter table player_attributes        enable row level security;
alter table player_hidden_attributes enable row level security;
alter table coach_attributes         enable row level security;
alter table coach_hidden_attributes  enable row level security;

create policy "public read countries"           on countries           for select using (true);
create policy "public read clubs"               on clubs               for select using (true);
create policy "public read national teams"      on national_teams      for select using (true);
create policy "public read club sources"        on club_sources        for select using (true);

create policy "read own profile" on profiles
  for select using (id = auth.uid());

-- a person is public once they are a published player or a published coach
create policy "public read published people" on people
  for select using (
    exists (select 1 from players p where p.person_id = people.id and p.is_published)
    or exists (select 1 from coaches c where c.person_id = people.id and c.is_published));

-- the people policy above also applies inside this subquery
create policy "public read person sources" on person_sources
  for select using (exists (select 1 from people p where p.id = person_id));

create policy "public read sources" on sources
  for select using (
    exists (select 1 from person_sources ps where ps.source_id = sources.id)
    or exists (select 1 from club_sources cs where cs.source_id = sources.id));

create policy "public read published players" on players
  for select using (is_published);
create policy "public read club stints" on player_club_stints
  for select using (exists (
    select 1 from players p where p.id = player_id and p.is_published));
create policy "public read national stints" on player_national_stints
  for select using (exists (
    select 1 from players p where p.id = player_id and p.is_published));
create policy "public read player positions" on player_positions
  for select using (exists (
    select 1 from players p where p.id = player_id and p.is_published));

create policy "public read published coaches" on coaches
  for select using (is_published);
create policy "public read coach club stints" on coach_club_stints
  for select using (exists (
    select 1 from coaches c where c.id = coach_id and c.is_published));
create policy "public read coach national stints" on coach_national_stints
  for select using (exists (
    select 1 from coaches c where c.id = coach_id and c.is_published));

create policy "public read player attributes" on player_attributes
  for select using (exists (
    select 1 from players p where p.id = player_id and p.is_published));
create policy "public read player hidden attributes" on player_hidden_attributes
  for select using (exists (
    select 1 from players p where p.id = player_id and p.is_published));
create policy "public read coach attributes" on coach_attributes
  for select using (exists (
    select 1 from coaches c where c.id = coach_id and c.is_published));
create policy "public read coach hidden attributes" on coach_hidden_attributes
  for select using (exists (
    select 1 from coaches c where c.id = coach_id and c.is_published));