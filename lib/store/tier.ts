import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tierAllows, TIER_LIMITS, type Feature } from "@/lib/tiers";
import type { Tier } from "@/lib/types";

interface TierState {
  /** Sprint 1: mock tier persisted in localStorage. Sprint 2: comes from /api/me. */
  tier: Tier;
  setTier: (tier: Tier) => void;
}

export const useTier = create<TierState>()(
  persist(
    (set) => ({
      tier: "free",
      setTier: (tier) => set({ tier }),
    }),
    { name: "dc-tier", skipHydration: true },
  ),
);

export function useCan(feature: Feature): boolean {
  return useTier((s) => tierAllows(s.tier, feature));
}

export function useLimits() {
  return TIER_LIMITS[useTier((s) => s.tier)];
}
