import type { Tier } from "./types";

export type Period = "monthly" | "yearly";
type PaidTier = Exclude<Tier, "free">;

/**
 * Lemon Squeezy checkout links (public, not secrets) per paid tier and period, from the
 * store's "Share" links. Missing → checkout isn't open yet and the UI says so.
 */
const CHECKOUT: Record<PaidTier, Record<Period, string | undefined>> = {
  creator: {
    monthly: process.env.NEXT_PUBLIC_LS_CHECKOUT_CREATOR_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_LS_CHECKOUT_CREATOR_YEARLY,
  },
  studio: {
    monthly: process.env.NEXT_PUBLIC_LS_CHECKOUT_STUDIO_MONTHLY,
    yearly: process.env.NEXT_PUBLIC_LS_CHECKOUT_STUDIO_YEARLY,
  },
};

export const billingConfigured = Boolean(CHECKOUT.creator.monthly && CHECKOUT.studio.monthly);

/**
 * Checkout URL carrying the user id as custom data, which the webhook uses to know whose
 * subscription changed. Null when checkout isn't configured.
 */
export function checkoutUrl(tier: PaidTier, period: Period, user: { id: string; email?: string | null }): string | null {
  const base = CHECKOUT[tier][period] ?? CHECKOUT[tier].monthly;
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set("checkout[custom][user_id]", user.id);
  if (user.email) url.searchParams.set("checkout[email]", user.email);
  return url.toString();
}

/** Server-side: which tier a Lemon Squeezy variant id unlocks (comma-separated ids per tier). */
export function tierForVariant(variantId: string | number): PaidTier | null {
  const id = String(variantId);
  const list = (v: string | undefined) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (list(process.env.LS_VARIANTS_STUDIO).includes(id)) return "studio";
  if (list(process.env.LS_VARIANTS_CREATOR).includes(id)) return "creator";
  return null;
}

/** A subscription grants its tier while active, trialing, in dunning, or cancelled-but-paid-up. */
export function effectiveTier(sub: { tier: string; status: string | null; ends_at: string | null } | null): Tier {
  if (!sub || (sub.tier !== "creator" && sub.tier !== "studio")) return "free";
  if (["active", "on_trial", "past_due"].includes(sub.status ?? "")) return sub.tier;
  if (sub.status === "cancelled" && sub.ends_at && new Date(sub.ends_at).getTime() > Date.now()) return sub.tier;
  return "free";
}
