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
 * DATABASE SETUP — run this once in the Supabase SQL editor
 * ============================================================
 *
 *   create table public.registrations (
 *     id uuid primary key default gen_random_uuid(),
 *     full_name text not null,
 *     email text not null,
 *     phone text not null,
 *     team_name text,
 *     experience text,
 *     created_at timestamptz not null default now(),
 *     -- Case-insensitive uniqueness: the actual source of truth that
 *     -- prevents double registrations at the database level, even if
 *     -- two submissions land at the same instant (a client-side check
 *     -- alone can't fully close that race).
 *     constraint registrations_email_unique unique (email)
 *   );
 *
 *   alter table public.registrations enable row level security;
 *
 *   -- The public anon key may INSERT new rows...
 *   create policy "Anyone can register"
 *     on public.registrations for insert
 *     to anon
 *     with check (true);
 *
 *   -- ...but intentionally has NO SELECT policy, so it can't read the
 *   -- list of registrants back. Instead, duplicate-email checks go
 *   -- through a narrow RPC function below that only ever returns a
 *   -- boolean — never any registrant's actual data.
 *
 *   create or replace function public.email_is_registered(p_email text)
 *   returns boolean
 *   language sql
 *   security definer
 *   set search_path = public
 *   as $$
 *     select exists (
 *       select 1 from public.registrations
 *       where email = lower(trim(p_email))
 *     );
 *   $$;
 *
 *   grant execute on function public.email_is_registered(text) to anon;
 *
 * With this in place, registration is guarded twice: the form calls
 * email_is_registered() before submitting (fast, friendly UX), and the
 * `unique` constraint on the email column rejects any duplicate that
 * slips through anyway (e.g. two tabs submitting within the same
 * instant) — registerAttendee() below treats that Postgres error
 * (code 23505) as the same "already registered" case.
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

// Postgres unique_violation error code — thrown by the `registrations_email_unique`
// constraint if a duplicate somehow reaches the insert despite the pre-check.
const UNIQUE_VIOLATION = "23505";

/**
 * Fast pre-submit check: has this email already registered?
 * Returns a plain boolean. On any unexpected error it fails "open"
 * (returns false) so a Supabase hiccup never blocks a legitimate new
 * registration — the unique constraint on insert is the real backstop.
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
 * Insert a registration row. Returns { data, error, isDuplicate } —
 * never throws — so the calling form can render any state without a
 * try/catch. `isDuplicate` is set on a unique-constraint violation so
 * the UI can show "you've already registered" instead of a generic
 * failure message, even in the race-condition case the pre-check missed.
 */
export async function registerAttendee({ fullName, email, phone, teamName, experience }) {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        "Registration isn't connected yet — missing Supabase environment variables."
      ),
      isDuplicate: false,
    };
  }

  const { data, error } = await supabase.from("registrations").insert([
    {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      team_name: teamName?.trim() || null,
      experience: experience || null,
    },
  ]);

  return { data, error, isDuplicate: error?.code === UNIQUE_VIOLATION };
}
