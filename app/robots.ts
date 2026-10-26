import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The editor and dev pages have nothing to index.
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/dev/", "/api/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
