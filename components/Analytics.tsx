import Script from "next/script";

/**
 * Cookieless Umami analytics (PLAN.md 6), only when configured. Self-hosted or cloud:
 * NEXT_PUBLIC_UMAMI_SRC is the script URL, NEXT_PUBLIC_UMAMI_WEBSITE_ID the site id.
 */
export function Analytics() {
  const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  if (!src || !id) return null;
  return <Script src={src} data-website-id={id} strategy="afterInteractive" />;
}
