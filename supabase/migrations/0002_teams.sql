-- =====================================================================
-- Qiskit Fall Fest 2026 — Team Registration Migration
-- =====================================================================
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New
-- query). It is written to be safe to run against a database that
-- already has the original `public.registrations` table with live
-- rows in it — nothing here drops or mutates that table. It:
--
--   1. Creates three new tables: profiles, teams, team_members.
--   2. Migrates the 4 (or however many) existing rows from
--      `registrations` into the new tables, grouping any rows that
--      share a team_name into one team.
--   3. Locks all three new tables down with RLS, and exposes writes
--      only through three SECURITY DEFINER RPC functions — the same
--      pattern the original `email_is_registered` function used — so
--      the anon key can never SELECT participant PII directly.
--   4. Points the existing `email_is_registered` function at the new
--      `profiles` table so old and new registration code paths agree
--      on "is this email already registered".
--
-- The old `registrations` table is left in place, untouched, as a
-- historical record. The app stops writing to it after this migration
-- ships (see supabaseClient.js) but nothing here deletes it — drop it
-- yourself once you've confirmed the migration looks right.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  experience text,
  created_at timestamptz not null default now(),
  constraint profiles_email_unique unique (email)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  invite_code text not null,
  track text,                          -- 'chemistry' | 'optimization' | 'simulation' | null (undecided)
  leader_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint teams_team_name_unique unique (team_name),
  constraint teams_invite_code_unique unique (invite_code),
  constraint teams_track_check check (track is null or track in ('chemistry', 'optimization', 'simulation'))
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('leader', 'member')),
  joined_at timestamptz not null default now(),
  -- A profile can only belong to one team, and only once within it.
  -- An individual registrant simply has no row here at all.
  constraint team_members_profile_unique unique (profile_id),
  constraint team_members_team_profile_unique unique (team_id, profile_id)
);

create index if not exists team_members_team_id_idx on public.team_members (team_id);

-- Enforce the "capped at 4 members total" rule at the database level,
-- not just in the RPC function below, so it holds even if something
-- else ever writes to this table.
create or replace function public.enforce_team_capacity()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.team_members where team_id = new.team_id) >= 4 then
    raise exception 'Team is full (max 4 members)' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists team_capacity_check on public.team_members;
create trigger team_capacity_check
  before insert on public.team_members
  for each row execute function public.enforce_team_capacity();


-- ---------------------------------------------------------------------
-- 2. Migrate existing `registrations` rows
-- ---------------------------------------------------------------------
-- Every existing registrant becomes a profile. Where several existing
-- rows share the same (trimmed, case-insensitive) team_name, they're
-- grouped into one team — the earliest registrant in that group becomes
-- the leader. Rows with no team_name become individual profiles with
-- no team_members row at all.

do $$
declare
  r record;
  new_profile_id uuid;
  existing_team_id uuid;
  generated_code text;
begin
  for r in
    select
      full_name, email, phone, experience, created_at,
      nullif(trim(team_name), '') as team_name
    from public.registrations
    order by created_at asc
  loop
    -- Insert (or reuse) the profile for this registrant.
    insert into public.profiles (full_name, email, phone, experience, created_at)
    values (r.full_name, lower(trim(r.email)), r.phone, r.experience, r.created_at)
    on conflict (email) do update set full_name = excluded.full_name
    returning id into new_profile_id;

    if r.team_name is not null then
      select id into existing_team_id from public.teams where team_name = r.team_name;

      if existing_team_id is null then
        -- First registrant with this team name becomes the leader and
        -- gets a fresh, unique invite code.
        loop
          generated_code := upper(substr(md5(random()::text), 1, 6));
          exit when not exists (select 1 from public.teams where invite_code = generated_code);
        end loop;

        insert into public.teams (team_name, invite_code, leader_id, created_at)
        values (r.team_name, generated_code, new_profile_id, r.created_at)
        returning id into existing_team_id;

        insert into public.team_members (team_id, profile_id, role, joined_at)
        values (existing_team_id, new_profile_id, 'leader', r.created_at)
        on conflict (profile_id) do nothing;
      else
        insert into public.team_members (team_id, profile_id, role, joined_at)
        values (existing_team_id, new_profile_id, 'member', r.created_at)
        on conflict (profile_id) do nothing;
      end if;
    end if;
  end loop;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. Row Level Security — lock the tables, expose only RPCs
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- No insert/select/update/delete policies are created for `anon` on any
-- of the three tables above. All writes happen through the SECURITY
-- DEFINER functions below, which run with the privileges of the
-- function owner and bypass RLS — exactly like the original
-- `email_is_registered` function did for `registrations`. This means
-- the anon key can register people and check invite codes, but can
-- never run a raw SELECT and pull the participant list.


-- ---------------------------------------------------------------------
-- 4. RPC functions — the only way the client talks to these tables
-- ---------------------------------------------------------------------

-- Is this email already registered (as an individual OR inside a team)?
create or replace function public.email_is_registered(p_email text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where email = lower(trim(p_email))
  );
$$;

grant execute on function public.email_is_registered(text) to anon;


-- Register as an individual (includes the Qiskit Quest solo path).
create or replace function public.register_individual(
  p_full_name text,
  p_email text,
  p_phone text,
  p_experience text
)
returns table (profile_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  insert into public.profiles (full_name, email, phone, experience)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone), nullif(p_experience, ''))
  returning id into v_id;

  return query select v_id;
exception
  when unique_violation then
    raise exception 'This email is already registered' using errcode = '23505';
end;
$$;

grant execute on function public.register_individual(text, text, text, text) to anon;


-- Register as a team leader: creates the profile, the team, and the
-- leader's team_members row, generating a unique invite code.
create or replace function public.create_team(
  p_full_name text,
  p_email text,
  p_phone text,
  p_experience text,
  p_team_name text,
  p_track text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, invite_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_team_id uuid;
  v_code text;
begin
  if p_track is not null and p_track not in ('chemistry', 'optimization', 'simulation') then
    raise exception 'Invalid track' using errcode = '22023';
  end if;

  insert into public.profiles (full_name, email, phone, experience)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone), nullif(p_experience, ''))
  returning id into v_profile_id;

  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.teams where invite_code = v_code);
  end loop;

  insert into public.teams (team_name, invite_code, track, leader_id)
  values (trim(p_team_name), v_code, p_track, v_profile_id)
  returning id into v_team_id;

  insert into public.team_members (team_id, profile_id, role)
  values (v_team_id, v_profile_id, 'leader');

  return query select v_profile_id, v_team_id, trim(p_team_name), v_code;
exception
  when unique_violation then
    -- Could be the email (already registered) or the team name (taken).
    if exists (select 1 from public.profiles where email = lower(trim(p_email))) then
      raise exception 'This email is already registered' using errcode = '23505';
    else
      raise exception 'That team name is already taken — try another' using errcode = '23514';
    end if;
end;
$$;

grant execute on function public.create_team(text, text, text, text, text, text) to anon;


-- Join an existing team by invite code. Fails clearly if the code is
-- unknown or the team is already full (the capacity trigger is the
-- final backstop, but this gives a friendlier error message first).
create or replace function public.join_team(
  p_full_name text,
  p_email text,
  p_phone text,
  p_experience text,
  p_invite_code text
)
returns table (profile_id uuid, team_id uuid, team_name text, member_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_team_id uuid;
  v_team_name text;
  v_count int;
begin
  select id, team_name into v_team_id, v_team_name
  from public.teams
  where invite_code = upper(trim(p_invite_code));

  if v_team_id is null then
    raise exception 'No team found for that invite code' using errcode = 'P0002';
  end if;

  select count(*) into v_count from public.team_members where team_id = v_team_id;
  if v_count >= 4 then
    raise exception 'That team is already full (4/4 members)' using errcode = 'P0001';
  end if;

  insert into public.profiles (full_name, email, phone, experience)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone), nullif(p_experience, ''))
  returning id into v_profile_id;

  insert into public.team_members (team_id, profile_id, role)
  values (v_team_id, v_profile_id, 'member');

  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
exception
  when unique_violation then
    raise exception 'This email is already registered' using errcode = '23505';
end;
$$;

grant execute on function public.join_team(text, text, text, text, text) to anon;


-- ---------------------------------------------------------------------
-- 5. Organizer export (run with the service_role key, e.g. in the SQL
--    editor or an admin script — never with the public anon key).
-- ---------------------------------------------------------------------
-- select
--   t.team_name,
--   t.invite_code,
--   t.track,
--   p.full_name,
--   p.email,
--   p.phone,
--   p.experience,
--   tm.role,
--   tm.joined_at
-- from public.team_members tm
-- join public.profiles p on p.id = tm.profile_id
-- join public.teams t on t.id = tm.team_id
-- order by t.team_name, tm.role desc, tm.joined_at;
--
-- -- Individuals (including Qiskit Quest solo registrants):
-- select p.*
-- from public.profiles p
-- left join public.team_members tm on tm.profile_id = p.id
-- where tm.id is null
-- order by p.created_at;
