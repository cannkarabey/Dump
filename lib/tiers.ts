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
export type Feature = "zip" | "stamp" | "brandKit" | "premiumTemplates" | "premiumStickers" | "hiRes";

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
    case "premiumStickers":
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

const FEATURE_COPY = {
  tr: {
    photos: (n: number) => `Dump başına ${n} fotoğraf`,
    unlimited: "Sınırsız fotoğraf",
    pages: (n: number) => `${n} sayfaya kadar carousel`,
    allTemplates: "Tüm şablonlar",
    freeTemplates: "Ücretsiz şablonlar",
    export: (n: number) => `Uzun kenar ${n}px export`,
    watermark: "Küçük filigran",
    noWatermark: "Filigransız",
    zip: "ZIP ile toplu indirme",
    stamp: "Retro tarih damgası",
    brandKit: "Marka kiti & özel fontlar",
  },
  en: {
    photos: (n: number) => `${n} photos per dump`,
    unlimited: "Unlimited photos",
    pages: (n: number) => `Carousels up to ${n} pages`,
    allTemplates: "All templates",
    freeTemplates: "Free templates",
    export: (n: number) => `${n}px long-side export`,
    watermark: "Small watermark",
    noWatermark: "No watermark",
    zip: "ZIP batch download",
    stamp: "Retro date stamps",
    brandKit: "Brand kit & custom fonts",
  },
};

/** Human-readable feature list per tier; shared by the paywall and the pricing section. */
export function tierFeatures(tier: Tier, lang: "tr" | "en" = "tr"): string[] {
  const l = TIER_LIMITS[tier];
  const c = FEATURE_COPY[lang];
  return [
    Number.isFinite(l.maxPhotos) ? c.photos(l.maxPhotos) : c.unlimited,
    c.pages(l.maxPages),
    l.templates === "all" ? c.allTemplates : c.freeTemplates,
    c.export(l.exportLongSide),
    l.watermark ? c.watermark : c.noWatermark,
    ...(l.zip ? [c.zip] : []),
    ...(l.stamp ? [c.stamp] : []),
    ...(l.brandKit ? [c.brandKit] : []),
  ];
}
