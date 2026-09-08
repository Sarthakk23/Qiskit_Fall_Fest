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
 * Expected table (create in the Supabase SQL editor):
 *
 *   create table public.registrations (
 *     id uuid primary key default gen_random_uuid(),
 *     full_name text not null,
 *     email text not null,
 *     team_name text,
 *     experience text,
 *     created_at timestamptz not null default now()
 *   );
 *
 *   alter table public.registrations enable row level security;
 *
 *   create policy "Anyone can register"
 *     on public.registrations for insert
 *     to anon
 *     with check (true);
 *
 * (Intentionally no SELECT policy for `anon` — the public key can write
 * new rows but can't read the list back, so entries stay private.)
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

/**
 * Insert a registration row. Returns { data, error } — never throws —
 * so the calling form can render either state without a try/catch.
 */
export async function registerAttendee({ fullName, email, teamName, experience }) {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        "Registration isn't connected yet — missing Supabase environment variables."
      ),
    };
  }

  return supabase.from("registrations").insert([
    {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      team_name: teamName?.trim() || null,
      experience: experience || null,
    },
  ]);
}
