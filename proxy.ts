import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, supabaseConfigured } from "@/lib/supabase/env";
import { detectLocale, LANG_COOKIE, ROUTES, TR_REWRITES } from "@/lib/i18n/config";

/**
 * 1. Marketing i18n: Turkish pages keep their unprefixed public URLs ("/", "/gizlilik"…) and are
 *    served from app/(marketing)/[lang] with lang=tr; direct /tr/… hits redirect to the public URL.
 * 2. App i18n: /app/… URLs carry no language; the cookie (or Accept-Language) picks it and the
 *    request is rewritten onto app/app/[lang]. Direct /app/tr|en/… hits redirect and switch language.
 * 3. Supabase: refreshes the session cookie once per navigation for app/API routes, so server code
 *    sees a valid token (refresh tokens are single-use). No-op until configured.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/tr" || pathname.startsWith("/tr/")) {
    const internal = pathname.slice(3);
    const route = Object.values(ROUTES).find((r) => r.internal === internal);
    return NextResponse.redirect(new URL((route?.tr ?? "/") + search, request.url), 308);
  }
  const rewrite = TR_REWRITES[pathname];
  if (rewrite) return NextResponse.rewrite(new URL(rewrite + search, request.url));

  let appRewrite: URL | null = null;
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    const rest = pathname.slice(4);
    const explicit = rest.match(/^\/(tr|en)(?=\/|$)/);
    if (explicit) {
      const res = NextResponse.redirect(new URL(`/app${rest.slice(3)}${search}`, request.url), 307);
      res.cookies.set(LANG_COOKIE, explicit[1], { path: "/", maxAge: 31536000, sameSite: "lax" });
      return res;
    }
    const lang = detectLocale(request.cookies.get(LANG_COOKIE)?.value, request.headers.get("accept-language"));
    appRewrite = new URL(`/app/${lang}${rest}${search}`, request.url);
  }
  const pass = () => (appRewrite ? NextResponse.rewrite(appRewrite, { request }) : NextResponse.next({ request }));

  if (!supabaseConfigured) return pass();

  let response = pass();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = pass();
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  matcher: [
    // Turkish marketing pages (keep in sync with ROUTES in lib/i18n/config.ts).
    "/",
    "/photo-dump-maker",
    "/gizlilik",
    "/kosullar",
    "/iade",
    "/tr",
    "/tr/:path*",
    // Routes that read the Supabase session.
    "/app/:path*",
    "/api/:path*",
    "/auth/:path*",
  ],
};
