import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { ROUTES, type RouteKey } from "@/lib/i18n/config";

const PRIORITY: Record<RouteKey, number> = { home: 1, photoDumpMaker: 0.8, privacy: 0.2, terms: 0.2, refund: 0.2 };

/** Every marketing page in both languages, each pointing at its counterpart (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  return (Object.keys(ROUTES) as RouteKey[]).flatMap((key) => {
    const r = ROUTES[key];
    const languages = { "tr-TR": `${siteUrl}${r.tr}`, en: `${siteUrl}${r.en}` };
    return [r.tr, r.en].map((path) => ({
      url: `${siteUrl}${path === "/" ? "" : path}`,
      changeFrequency: key === "home" ? ("weekly" as const) : ("monthly" as const),
      priority: PRIORITY[key],
      alternates: { languages },
    }));
  });
}
