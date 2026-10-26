import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/photo-dump-maker`, changeFrequency: "monthly", priority: 0.8 },
    ...["gizlilik", "kosullar", "iade"].map((p) => ({ url: `${siteUrl}/${p}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
