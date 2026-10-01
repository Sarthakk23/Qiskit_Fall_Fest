-- =====================================================================
-- Qiskit Fall Fest 2026 — Fix Create/Join "something went wrong",
-- add the individual → team upgrade path
-- =====================================================================
-- Safe to run against production as-is. It does NOT touch any data in
-- `registrations`, `profiles`, `teams`, or `team_members` — it only
-- drops and recreates functions, then adds two new ones.
--
-- Run this whole file once in the Supabase SQL editor.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. Diagnose (informational — the fix below runs regardless).
-- ---------------------------------------------------------------------
-- If create_team / join_team show up more than once in this result,
-- that confirms Bug 2: PostgREST has multiple overloads registered
-- (e.g. a stale signature from before `p_track` was added) and can't
-- pick one, so every call to it fails with a generic error.
select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as args
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('create_team', 'join_team', 'register_individual')
order by p.proname;


-- ---------------------------------------------------------------------
-- 1. Drop EVERY overload of these three functions, whatever their
--    signature, then recreate exactly one version of each.
-- ---------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('create_team', 'join_team', 'register_individual',
                         'upgrade_to_team_leader', 'upgrade_join_team')
  loop
    execute format('drop function if exists %s cascade;', r.sig);
  end loop;
end;
$$;


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
    if exists (select 1 from public.profiles where email = lower(trim(p_email))) then
      raise exception 'This email is already registered' using errcode = '23505';
    else
      raise exception 'That team name is already taken — try another' using errcode = '23514';
    end if;
end;
$$;

grant execute on function public.create_team(text, text, text, text, text, text) to anon;


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
-- 2. NEW FEATURE — individual → team upgrade path.
-- ---------------------------------------------------------------------
-- An "individual" is just a profile with no team_members row. These
-- two functions let that SAME profile become a leader or a member,
-- reusing its existing profile_id — unlike create_team/join_team,
-- which always try to INSERT a brand-new profile (and would correctly
-- reject an already-registered email with "duplicate-email").

create or replace function public.upgrade_to_team_leader(
  p_email text,
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

  select id into v_profile_id from public.profiles where email = lower(trim(p_email));
  if v_profile_id is null then
    raise exception 'No registration found for that email — register first' using errcode = 'P0003';
  end if;

  if exists (select 1 from public.team_members where profile_id = v_profile_id) then
    raise exception 'This email is already on a team' using errcode = 'P0004';
  end if;

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
    raise exception 'That team name is already taken — try another' using errcode = '23514';
end;
$$;

grant execute on function public.upgrade_to_team_leader(text, text, text) to anon;


create or replace function public.upgrade_join_team(
  p_email text,
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
  select id into v_profile_id from public.profiles where email = lower(trim(p_email));
  if v_profile_id is null then
    raise exception 'No registration found for that email — register first' using errcode = 'P0003';
  end if;

  if exists (select 1 from public.team_members where profile_id = v_profile_id) then
    raise exception 'This email is already on a team' using errcode = 'P0004';
  end if;

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

  insert into public.team_members (team_id, profile_id, role)
  values (v_team_id, v_profile_id, 'member');

  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
end;
$$;

grant execute on function public.upgrade_join_team(text, text) to anon;


-- ---------------------------------------------------------------------
-- 3. Force PostgREST to pick up the changes immediately instead of
--    waiting for its next automatic schema-cache reload. This one
--    line is very likely the actual fix for Bug 2 by itself, even if
--    step 0 showed no duplicate overloads — a stale cache after any
--    function edit produces the identical symptom.
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- 4. ACTUAL Bug 2 root cause (found after live DB inspection): every
--    RETURNS TABLE(...) above names its output columns the same as
--    real table columns (profile_id, team_id, team_name, invite_code).
--    PL/pgSQL treats those names as in-scope variables, so any
--    unqualified column reference of the same name inside the
--    function body is ambiguous (error 42702) and the call fails —
--    this is what "Something went wrong" actually was. Re-apply all
--    four functions below with every table aliased and every column
--    qualified. This supersedes the bodies defined above.
-- ---------------------------------------------------------------------

create or replace function public.create_team(
  p_full_name text, p_email text, p_phone text, p_experience text,
  p_team_name text, p_track text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, invite_code text)
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid; v_team_id uuid; v_code text;
begin
  if p_track is not null and p_track not in ('chemistry', 'optimization', 'simulation') then
    raise exception 'Invalid track' using errcode = '22023';
  end if;
  insert into public.profiles (full_name, email, phone, experience)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone), nullif(p_experience, ''))
  returning id into v_profile_id;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.teams t where t.invite_code = v_code);
  end loop;
  insert into public.teams (team_name, invite_code, track, leader_id)
  values (trim(p_team_name), v_code, p_track, v_profile_id) returning id into v_team_id;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'leader');
  return query select v_profile_id, v_team_id, trim(p_team_name), v_code;
exception
  when unique_violation then
    if exists (select 1 from public.profiles pr where pr.email = lower(trim(p_email))) then
      raise exception 'This email is already registered' using errcode = '23505';
    else
      raise exception 'That team name is already taken — try another' using errcode = '23514';
    end if;
end;
$$;

create or replace function public.join_team(
  p_full_name text, p_email text, p_phone text, p_experience text, p_invite_code text
)
returns table (profile_id uuid, team_id uuid, team_name text, member_count int)
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid; v_team_id uuid; v_team_name text; v_count int;
begin
  select t.id, t.team_name into v_team_id, v_team_name from public.teams t
  where t.invite_code = upper(trim(p_invite_code));
  if v_team_id is null then
    raise exception 'No team found for that invite code' using errcode = 'P0002';
  end if;
  select count(*) into v_count from public.team_members tm where tm.team_id = v_team_id;
  if v_count >= 4 then
    raise exception 'That team is already full (4/4 members)' using errcode = 'P0001';
  end if;
  insert into public.profiles (full_name, email, phone, experience)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone), nullif(p_experience, ''))
  returning id into v_profile_id;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'member');
  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
exception
  when unique_violation then
    raise exception 'This email is already registered' using errcode = '23505';
end;
$$;

create or replace function public.upgrade_to_team_leader(
  p_email text, p_team_name text, p_track text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, invite_code text)
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid; v_team_id uuid; v_code text;
begin
  if p_track is not null and p_track not in ('chemistry', 'optimization', 'simulation') then
    raise exception 'Invalid track' using errcode = '22023';
  end if;
  select pr.id into v_profile_id from public.profiles pr where pr.email = lower(trim(p_email));
  if v_profile_id is null then
    raise exception 'No registration found for that email — register first' using errcode = 'P0003';
  end if;
  if exists (select 1 from public.team_members tm where tm.profile_id = v_profile_id) then
    raise exception 'This email is already on a team' using errcode = 'P0004';
  end if;
  loop
    v_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.teams t where t.invite_code = v_code);
  end loop;
  insert into public.teams (team_name, invite_code, track, leader_id)
  values (trim(p_team_name), v_code, p_track, v_profile_id) returning id into v_team_id;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'leader');
  return query select v_profile_id, v_team_id, trim(p_team_name), v_code;
exception
  when unique_violation then
    raise exception 'That team name is already taken — try another' using errcode = '23514';
end;
$$;

create or replace function public.upgrade_join_team(
  p_email text, p_invite_code text
)
returns table (profile_id uuid, team_id uuid, team_name text, member_count int)
language plpgsql security definer set search_path = public as $$
declare
  v_profile_id uuid; v_team_id uuid; v_team_name text; v_count int;
begin
  select pr.id into v_profile_id from public.profiles pr where pr.email = lower(trim(p_email));
  if v_profile_id is null then
    raise exception 'No registration found for that email — register first' using errcode = 'P0003';
  end if;
  if exists (select 1 from public.team_members tm where tm.profile_id = v_profile_id) then
    raise exception 'This email is already on a team' using errcode = 'P0004';
  end if;
  select t.id, t.team_name into v_team_id, v_team_name from public.teams t
  where t.invite_code = upper(trim(p_invite_code));
  if v_team_id is null then
    raise exception 'No team found for that invite code' using errcode = 'P0002';
  end if;
  select count(*) into v_count from public.team_members tm where tm.team_id = v_team_id;
  if v_count >= 4 then
    raise exception 'That team is already full (4/4 members)' using errcode = 'P0001';
  end if;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'member');
  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
end;
$$;

notify pgrst, 'reload schema';
