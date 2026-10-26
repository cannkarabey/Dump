/**
 * Marketing-site languages (Faz A). Turkish keeps the unprefixed URLs; English lives under /en.
 * Internally every page sits under app/(marketing)/[lang]; proxy.ts rewrites the Turkish
 * public paths onto /tr/… so existing links keep working.
 */
export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Public path of every marketing page per language. `internal` is the folder under [lang]. */
export const ROUTES = {
  home: { internal: "", tr: "/", en: "/en" },
  photoDumpMaker: { internal: "/photo-dump-maker", tr: "/photo-dump-maker", en: "/en/photo-dump-maker" },
  privacy: { internal: "/privacy", tr: "/gizlilik", en: "/en/privacy" },
  terms: { internal: "/terms", tr: "/kosullar", en: "/en/terms" },
  refund: { internal: "/refund", tr: "/iade", en: "/en/refund" },
} as const;

export type RouteKey = keyof typeof ROUTES;

export function href(lang: Locale, route: RouteKey, hash?: string): string {
  const path = ROUTES[route][lang];
  if (!hash) return path;
  return path === "/" ? `/#${hash}` : `${path}#${hash}`;
}

/** Section anchors shared by both languages. */
export const SECTIONS = ["features", "assistant", "pricing", "faq"] as const;
export type SectionId = (typeof SECTIONS)[number];

/** Turkish public path → internal /tr path (used by proxy.ts). */
export const TR_REWRITES: Record<string, string> = Object.fromEntries(
  Object.values(ROUTES).map((r) => [r.tr, `/tr${r.internal}`]),
);

/** The same page in the other language, for the language switcher. */
export function alternatePath(pathname: string, target: Locale): string {
  for (const r of Object.values(ROUTES)) {
    if (pathname === r.tr || pathname === r.en) return r[target];
  }
  return ROUTES.home[target];
}

/** hreflang alternates for a page's metadata. */
export function languageAlternates(route: RouteKey) {
  const r = ROUTES[route];
  return { "tr-TR": r.tr, en: r.en, "x-default": r.tr };
}
