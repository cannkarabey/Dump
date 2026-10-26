import type { Tier } from "./types";

export const TIER_LIMITS = {
  free: {
    maxPhotos: 6,
    maxPages: 4,
    exportLongSide: 1440,
    watermark: true,
    zip: false,
    templates: "free",
    stamp: false,
    brandKit: false,
  },
  creator: {
    maxPhotos: 20,
    maxPages: 10,
    exportLongSide: 2560,
    watermark: false,
    zip: true,
    templates: "all",
    stamp: true,
    brandKit: false,
  },
  studio: {
    maxPhotos: Infinity,
    maxPages: 20,
    exportLongSide: 3840,
    watermark: false,
    zip: true,
    templates: "all",
    stamp: true,
    brandKit: true,
  },
} as const satisfies Record<Tier, unknown>;

export type TierLimits = (typeof TIER_LIMITS)[Tier];

/** Boolean features that can be gated with <Locked feature="...">. */
export type Feature = "zip" | "stamp" | "brandKit" | "premiumTemplates" | "hiRes";

export function tierAllows(tier: Tier, feature: Feature): boolean {
  const limits = TIER_LIMITS[tier];
  switch (feature) {
    case "zip":
      return limits.zip;
    case "stamp":
      return limits.stamp;
    case "brandKit":
      return limits.brandKit;
    case "premiumTemplates":
      return limits.templates === "all";
    case "hiRes":
      return limits.exportLongSide > TIER_LIMITS.free.exportLongSide;
  }
}

export const TIER_LABELS: Record<Tier, string> = {
  free: "Free",
  creator: "Creator",
  studio: "Studio",
};

export const TIER_PRICES: Record<Tier, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  creator: { monthly: 5, yearly: 42 },
  studio: { monthly: 10, yearly: 84 },
};
