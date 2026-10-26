import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tierAllows, TIER_LIMITS, type Feature } from "@/lib/tiers";
import type { Account } from "@/lib/account";
import type { Tier } from "@/lib/types";

interface TierState {
  /**
   * Effective tier for gating the UI. Comes from /api/me once sign-in is configured;
   * until then it's a mock persisted in localStorage (dev tier toggle).
   */
  tier: Tier;
  setTier: (tier: Tier) => void;
  account: Account | null;
  /** Fetches /api/me; call on load and when returning from checkout. */
  refreshAccount: () => Promise<void>;
}

const DEV = process.env.NODE_ENV === "development";

export const useTier = create<TierState>()(
  persist(
    (set) => ({
      tier: "free",
      setTier: (tier) => set({ tier }),
      account: null,
      refreshAccount: async () => {
        try {
          const res = await fetch("/api/me", { cache: "no-store" });
          if (!res.ok) return;
          const account: Account = await res.json();
          // The server is the source of truth whenever auth exists, and always in production.
          set(account.authEnabled || !DEV ? { account, tier: account.tier } : { account });
        } catch {
          // Offline: keep the last known tier.
        }
      },
    }),
    { name: "dc-tier", skipHydration: true, partialize: (s) => ({ tier: s.tier }) },
  ),
);

/** The dev tier toggle only makes sense while there's no real account system. */
export function useMockTiers(): boolean {
  return useTier((s) => DEV && !s.account?.authEnabled);
}

export function useCan(feature: Feature): boolean {
  return useTier((s) => tierAllows(s.tier, feature));
}

export function useLimits() {
  return TIER_LIMITS[useTier((s) => s.tier)];
}
