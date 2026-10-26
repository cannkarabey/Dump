import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/** Request-scoped client acting as the signed-in user (RLS applies). Null when unconfigured. */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  if (!supabaseConfigured) return null;
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only; proxy.ts refreshes them.
        }
      },
    },
  });
}

/**
 * Privileged client for trusted server code only (billing webhook). Bypasses RLS,
 * so it must never run on input that hasn't been authenticated (e.g. a verified signature).
 */
export function supabaseAdmin(): SupabaseClient | null {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseConfigured || !secret) return null;
  return createClient(SUPABASE_URL, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}
