import { supabaseServer } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";
import { billingConfigured, effectiveTier } from "./billing";
import type { Tier } from "./types";

export interface Account {
  /** Whether sign-in exists at all on this deployment. */
  authEnabled: boolean;
  billingEnabled: boolean;
  user: { id: string; email: string | null; name: string | null; avatar: string | null } | null;
  tier: Tier;
  subscription: { status: string | null; renewsAt: string | null; endsAt: string | null; portalUrl: string | null } | null;
}

/** The current visitor as the server sees it; the only trustworthy source of their tier. */
export async function getAccount(): Promise<Account> {
  const base: Account = { authEnabled: supabaseConfigured, billingEnabled: billingConfigured, user: null, tier: "free", subscription: null };
  const supabase = await supabaseServer();
  if (!supabase) return base;

  // getClaims verifies the JWT; getSession alone would trust the cookie blindly.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return base;

  const meta = (claims.user_metadata ?? {}) as Record<string, unknown>;
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier, status, renews_at, ends_at, portal_url")
    .eq("user_id", claims.sub)
    .maybeSingle();

  return {
    ...base,
    user: {
      id: claims.sub,
      email: (claims.email as string | undefined) ?? null,
      name: (meta.full_name as string | undefined) ?? (meta.name as string | undefined) ?? null,
      avatar: (meta.avatar_url as string | undefined) ?? null,
    },
    tier: effectiveTier(sub),
    subscription: sub
      ? { status: sub.status, renewsAt: sub.renews_at, endsAt: sub.ends_at, portalUrl: sub.portal_url }
      : null,
  };
}
