import { cookies } from "next/headers";
import type { Tier } from "@/lib/types";

const COOKIE = "dc_aid";

/**
 * Who is asking, for quota purposes. Until sign-in lands (S2.11) this is an anonymous cookie id,
 * and everyone is treated as Free: the browser's tier can't be trusted.
 */
export async function requestIdentity(): Promise<{ id: string; tier: Tier }> {
  const jar = await cookies();
  let anon = jar.get(COOKIE)?.value;
  if (!anon) {
    anon = crypto.randomUUID();
    jar.set(COOKIE, anon, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  // Keyed by the cookie alone: an IP is shared by many people on mobile networks and campus NATs.
  // Clearing cookies does reset an anonymous allowance; PLAN.md 3.4 closes that by requiring
  // sign-in for the assistant once auth lands (S2.11), when this becomes the user id.
  return { id: anon, tier: "free" };
}
