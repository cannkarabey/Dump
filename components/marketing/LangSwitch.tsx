"use client";

import { useEffect } from "react";
import { Globe } from "lucide-react";
import { alternatePath, rememberLocale, ROUTES, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/cn";

/**
 * Links to the same page in the other language. The href defaults to the other home page
 * (works without JS); on click it resolves the current page's counterpart and keeps the #hash.
 */
export function LangSwitch({ lang, label, className }: { lang: Locale; label: string; className?: string }) {
  const target: Locale = lang === "tr" ? "en" : "tr";
  return (
    <a
      href={ROUTES.home[target]}
      hrefLang={target}
      lang={target}
      onClick={(e) => {
        e.preventDefault();
        rememberLocale(target);
        window.location.assign(alternatePath(window.location.pathname, target) + window.location.hash);
      }}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-fg/75 transition hover:bg-black/5 hover:text-fg",
        className,
      )}
    >
      <Globe size={15} aria-hidden />
      <span className="uppercase">{target}</span>
      <span className="sr-only">{label}</span>
    </a>
  );
}

/** First visit decides the app's language; an explicit switch (here or in the app) overrides it. */
export function LangCookie({ lang }: { lang: Locale }) {
  useEffect(() => rememberLocale(lang, false), [lang]);
  return null;
}
