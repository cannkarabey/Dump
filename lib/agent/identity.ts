import { cookies } from "next/headers";
import { getAccount } from "@/lib/account";
import type { Tier } from "@/lib/types";

const COOKIE = "dc_aid";

export type Identity = { ok: true; id: string; tier: Tier } | { ok: false; reason: "auth_required" };

/**
 * Who is asking, for quota purposes. With sign-in configured, the assistant requires an account
 * (PLAN.md 3.4) and quotas follow the user's real plan. Without it (local development), an
 * anonymous cookie id on the Free limits keeps the assistant usable.
 */
export async function requestIdentity(): Promise<Identity> {
  const account = await getAccount();
  if (account.authEnabled) {
    return account.user ? { ok: true, id: account.user.id, tier: account.tier } : { ok: false, reason: "auth_required" };
  }

  const jar = await cookies();
  let anon = jar.get(COOKIE)?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    jar.set(COOKIE, anon, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  return { ok: true, id: anon, tier: "free" };
}
