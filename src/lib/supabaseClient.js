import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client for the fest's registration flow.
 *
 * Expects two Vite environment variables (create a `.env.local` file at
 * the project root — Vite only exposes variables prefixed with VITE_):
 *
 *   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   VITE_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY
 *
 * Both values are safe to expose client-side — the anon key is meant to
 * be public and relies on Row Level Security (RLS) policies in Supabase
 * to control what it can actually do. Never put a service_role key here.
 *
 * ============================================================
 * DATABASE SETUP
 * ============================================================
 * Run supabase/migrations/0002_teams.sql once in the Supabase SQL
 * editor. It creates `profiles`, `teams`, and `team_members`, migrates
 * any existing rows out of the old `registrations` table, and locks
 * every new table down behind RLS — the anon key can only reach them
 * through the three RPC functions this file calls below
 * (register_individual, create_team, join_team), plus the pre-existing
 * email_is_registered check. See that file for the full schema and an
 * organizer export query.
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Loud only in dev — production just shows the graceful form-level error.
  console.warn(
    "[supabaseClient] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Add a .env.local file — registration will show a friendly error until then."
  );
}

// Guard against createClient throwing on an empty string URL during local
// dev before the env file exists, so the rest of the app can still render.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Postgres error codes the RPC functions raise on purpose, so the UI can
// tell "you're already registered" apart from "that invite code doesn't
// exist" apart from "that team is full", instead of one generic failure.
const ERROR_CODES = {
  DUPLICATE_EMAIL: "23505",
  TEAM_NAME_TAKEN: "23514",
  TEAM_FULL: "P0001",
  INVITE_NOT_FOUND: "P0002",
  INVALID_TRACK: "22023",
  NOT_REGISTERED: "P0003",
  ALREADY_ON_TEAM: "P0004",
};

const NOT_CONFIGURED_ERROR = new Error(
  "Registration isn't connected yet — missing Supabase environment variables."
);

function classifyError(error) {
  if (!error) return null;
  switch (error.code) {
    case ERROR_CODES.DUPLICATE_EMAIL:
      return "duplicate-email";
    case ERROR_CODES.TEAM_NAME_TAKEN:
      return "team-name-taken";
    case ERROR_CODES.TEAM_FULL:
      return "team-full";
    case ERROR_CODES.INVITE_NOT_FOUND:
      return "invite-not-found";
    case ERROR_CODES.INVALID_TRACK:
      return "invalid-track";
    case ERROR_CODES.NOT_REGISTERED:
      return "not-registered";
    case ERROR_CODES.ALREADY_ON_TEAM:
      return "already-on-team";
    default:
      return "unknown";
  }
}

// Postgres/PostgREST functions that write data and RETURN TABLE(...)
// come back as an array of rows, even for a single row. Chaining
// `.single()` onto the rpc() call asks PostgREST to instead enforce
// "exactly one JSON object" via a special Accept header — an extra
// check that has been known to fail the *response* even though the
// underlying write already committed. Pulling the first row out of the
// plain array ourselves avoids that failure mode entirely.
function firstRow(data) {
  return Array.isArray(data) ? data[0] ?? null : data;
}

/**
 * Fast pre-submit check: has this email already registered (as an
 * individual or as part of any team)? Returns a plain boolean. On any
 * unexpected error it fails "open" (returns false) so a Supabase hiccup
 * never blocks a legitimate new registration — the unique constraint on
 * insert is the real backstop.
 */
export async function checkEmailExists(email) {
  if (!supabase) return false;

  const { data, error } = await supabase.rpc("email_is_registered", {
    p_email: email.trim().toLowerCase(),
  });

  if (error) {
    console.error("[supabaseClient] email_is_registered check failed:", error.message);
    return false;
  }

  return Boolean(data);
}

/**
 * Register as an individual — covers both a plain solo hackathon
 * registration and the Qiskit Quest self-paced path (there's no
 * database distinction between the two; Qiskit Quest is just what a
 * profile with no team does during the hacking period).
 */
export async function registerIndividual({ fullName, email, phone, experience }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR, reason: null };

  const { data, error } = await supabase.rpc("register_individual", {
    p_full_name: fullName.trim(),
    p_email: email.trim().toLowerCase(),
    p_phone: phone.trim(),
    p_experience: experience || null,
  });

  if (error) console.error("[supabaseClient] register_individual failed:", error);
  return { data: firstRow(data), error, reason: classifyError(error) };
}

/**
 * Create a team: registers the caller as its leader and returns the
 * generated team_name/invite_code so the UI can show something the
 * leader can copy and share with their 1–3 teammates.
 */
export async function createTeam({ fullName, email, phone, experience, teamName, track }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR, reason: null };

  const { data, error } = await supabase.rpc("create_team", {
    p_full_name: fullName.trim(),
    p_email: email.trim().toLowerCase(),
    p_phone: phone.trim(),
    p_experience: experience || null,
    p_team_name: teamName.trim(),
    p_track: track || null,
  });

  if (error) console.error("[supabaseClient] create_team failed:", error);
  return { data: firstRow(data), error, reason: classifyError(error) };
}

/**
 * Join an existing team by invite code. Fails with reason "team-full"
 * or "invite-not-found" (checked in the RPC, and backstopped in the DB
 * by a trigger) so the UI can give a specific, friendly message.
 */
export async function joinTeam({ fullName, email, phone, experience, inviteCode }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR, reason: null };

  const { data, error } = await supabase.rpc("join_team", {
    p_full_name: fullName.trim(),
    p_email: email.trim().toLowerCase(),
    p_phone: phone.trim(),
    p_experience: experience || null,
    p_invite_code: inviteCode.trim(),
  });

  if (error) console.error("[supabaseClient] join_team failed:", error);
  return { data: firstRow(data), error, reason: classifyError(error) };
}

/**
 * Individual → team leader upgrade. For someone who already has a
 * `profiles` row (registered as an individual earlier) and now wants
 * to lead a team. Reuses their existing profile instead of trying to
 * insert a second one — createTeam() would just bounce this off the
 * email-uniqueness constraint.
 */
export async function upgradeToTeamLeader({ email, teamName, track }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR, reason: null };

  const { data, error } = await supabase.rpc("upgrade_to_team_leader", {
    p_email: email.trim().toLowerCase(),
    p_team_name: teamName.trim(),
    p_track: track || null,
  });

  if (error) console.error("[supabaseClient] upgrade_to_team_leader failed:", error);
  return { data: firstRow(data), error, reason: classifyError(error) };
}

/**
 * Individual → team member upgrade, by invite code. Same idea as
 * upgradeToTeamLeader — reuses the existing profile.
 */
export async function upgradeJoinTeam({ email, inviteCode }) {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR, reason: null };

  const { data, error } = await supabase.rpc("upgrade_join_team", {
    p_email: email.trim().toLowerCase(),
    p_invite_code: inviteCode.trim(),
  });

  if (error) console.error("[supabaseClient] upgrade_join_team failed:", error);
  return { data: firstRow(data), error, reason: classifyError(error) };
}
