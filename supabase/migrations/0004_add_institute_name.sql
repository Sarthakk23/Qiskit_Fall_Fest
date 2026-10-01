-- =====================================================================
-- 0004 — Add "Institute Name" to registrations (profiles)
-- =====================================================================
-- SAFE FOR LIVE DATA. This migration:
--   * only ADDS a nullable column — no default, no NOT NULL, so every
--     existing row simply has institute_name = NULL (instant, no rewrite)
--   * never updates, deletes or truncates any row
--   * replaces the RPC functions so they accept the new value. The new
--     parameter is LAST and DEFAULTs to NULL, so an old browser tab / cached
--     JS bundle that doesn't send it keeps registering fine.
--
-- Run the whole file once in the Supabase SQL editor. It runs in a single
-- transaction: if anything fails, everything rolls back.
--
-- BEFORE RUNNING (30 seconds, strongly recommended):
--   create table public.profiles_backup_20261001 as select * from public.profiles;
--   create table public.teams_backup_20261001 as select * from public.teams;
--   create table public.team_members_backup_20261001 as select * from public.team_members;
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. The column (nullable on purpose — old rows stay NULL)
-- ---------------------------------------------------------------------
alter table public.profiles
  add column if not exists institute_name text;

-- Sanity bound on new values. NULLs pass a CHECK, so old rows are fine.
alter table public.profiles
  drop constraint if exists profiles_institute_name_len;
alter table public.profiles
  add constraint profiles_institute_name_len
  check (institute_name is null or char_length(institute_name) between 2 and 150);

-- ---------------------------------------------------------------------
-- 2. Drop the old function signatures (NO cascade — functions only,
--    no table data is touched). Changing a function's parameter list
--    would otherwise leave two overloads, which is the exact PostgREST
--    ambiguity that 0003 fixed.
-- ---------------------------------------------------------------------
do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('register_individual', 'create_team', 'join_team',
                        'upgrade_to_team_leader', 'upgrade_join_team')
  loop
    execute format('drop function if exists %s;', r.sig);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Recreate with p_institute_name (bodies = 0003 section 4, all
--    columns still qualified to avoid the 42702 ambiguity bug)
-- ---------------------------------------------------------------------

create function public.register_individual(
  p_full_name text, p_email text, p_phone text, p_experience text,
  p_institute_name text default null
)
returns table (profile_id uuid)
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  insert into public.profiles (full_name, email, phone, experience, institute_name)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone),
          nullif(p_experience, ''), nullif(trim(p_institute_name), ''))
  returning id into v_id;
  return query select v_id;
exception
  when unique_violation then
    raise exception 'This email is already registered' using errcode = '23505';
end;
$$;

create function public.create_team(
  p_full_name text, p_email text, p_phone text, p_experience text,
  p_team_name text, p_track text default null, p_institute_name text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, invite_code text)
language plpgsql security definer set search_path = public as $$
declare v_profile_id uuid; v_team_id uuid; v_code text;
begin
  if p_track is not null and p_track not in ('chemistry', 'optimization', 'simulation') then
    raise exception 'Invalid track' using errcode = '22023';
  end if;
  insert into public.profiles (full_name, email, phone, experience, institute_name)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone),
          nullif(p_experience, ''), nullif(trim(p_institute_name), ''))
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

create function public.join_team(
  p_full_name text, p_email text, p_phone text, p_experience text,
  p_invite_code text, p_institute_name text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, member_count int)
language plpgsql security definer set search_path = public as $$
declare v_profile_id uuid; v_team_id uuid; v_team_name text; v_count int;
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
  insert into public.profiles (full_name, email, phone, experience, institute_name)
  values (trim(p_full_name), lower(trim(p_email)), trim(p_phone),
          nullif(p_experience, ''), nullif(trim(p_institute_name), ''))
  returning id into v_profile_id;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'member');
  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
exception
  when unique_violation then
    raise exception 'This email is already registered' using errcode = '23505';
end;
$$;

-- Upgrade paths: an older registrant (institute_name IS NULL) can supply it
-- now. It only FILLS a blank — it never overwrites an existing value.
create function public.upgrade_to_team_leader(
  p_email text, p_team_name text, p_track text default null, p_institute_name text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, invite_code text)
language plpgsql security definer set search_path = public as $$
declare v_profile_id uuid; v_team_id uuid; v_code text;
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
  update public.profiles pr
     set institute_name = nullif(trim(p_institute_name), '')
   where pr.id = v_profile_id and pr.institute_name is null
     and nullif(trim(p_institute_name), '') is not null;
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

create function public.upgrade_join_team(
  p_email text, p_invite_code text, p_institute_name text default null
)
returns table (profile_id uuid, team_id uuid, team_name text, member_count int)
language plpgsql security definer set search_path = public as $$
declare v_profile_id uuid; v_team_id uuid; v_team_name text; v_count int;
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
  update public.profiles pr
     set institute_name = nullif(trim(p_institute_name), '')
   where pr.id = v_profile_id and pr.institute_name is null
     and nullif(trim(p_institute_name), '') is not null;
  insert into public.team_members (team_id, profile_id, role) values (v_team_id, v_profile_id, 'member');
  return query select v_profile_id, v_team_id, v_team_name, v_count + 1;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Grants (dropped functions lose theirs) + schema cache reload
-- ---------------------------------------------------------------------
grant execute on function public.register_individual(text, text, text, text, text) to anon;
grant execute on function public.create_team(text, text, text, text, text, text, text) to anon;
grant execute on function public.join_team(text, text, text, text, text, text) to anon;
grant execute on function public.upgrade_to_team_leader(text, text, text, text) to anon;
grant execute on function public.upgrade_join_team(text, text, text) to anon;

commit;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- 5. Verify (read-only). Row count must equal what you had before, and
--    each function must appear exactly ONCE.
-- ---------------------------------------------------------------------
-- select count(*) as total, count(institute_name) as with_institute from public.profiles;
-- select proname, pg_get_function_identity_arguments(oid)
--   from pg_proc where pronamespace = 'public'::regnamespace
--   and proname in ('register_individual','create_team','join_team','upgrade_to_team_leader','upgrade_join_team');

-- ---------------------------------------------------------------------
-- ROLLBACK (only if ever needed; loses only the new column's values):
--   alter table public.profiles drop constraint profiles_institute_name_len;
--   alter table public.profiles drop column institute_name;
--   ...then re-run 0003 to restore the old function signatures.
-- ---------------------------------------------------------------------
