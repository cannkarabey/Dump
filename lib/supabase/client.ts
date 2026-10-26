"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

let client: SupabaseClient | null = null;

/** Browser client, or null while Supabase isn't configured. */
export function supabaseBrowser(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}

export async function signInWithGoogle(next = "/app") {
  const supabase = supabaseBrowser();
  if (!supabase) return;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
}

export async function signOut() {
  await supabaseBrowser()?.auth.signOut();
}
