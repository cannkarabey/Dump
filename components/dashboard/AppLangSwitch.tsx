"use client";

import { Globe } from "lucide-react";
import { LOCALES, rememberLocale, type Locale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";

/** Switches the app language: stores the cookie proxy.ts reads, then reloads the same URL. */
function switchTo(lang: Locale) {
  rememberLocale(lang);
  window.location.reload();
}

export function AppLangSwitch({ variant = "rail" }: { variant?: "rail" | "segmented" }) {
  const { lang, t } = useT();

  if (variant === "rail") {
    const target: Locale = lang === "tr" ? "en" : "tr";
    return (
      <button
        type="button"
        onClick={() => switchTo(target)}
        lang={target}
        className="flex w-[76px] flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium text-muted transition hover:bg-hover hover:text-fg"
      >
        <Globe size={20} strokeWidth={1.75} aria-hidden />
        <span className="uppercase">{target}</span>
        <span className="sr-only">{t.common.switchTo}</span>
      </button>
    );
  }

  return (
    <div role="radiogroup" aria-label={t.common.language} className="flex rounded-full bg-hover p-1">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={l === lang}
          lang={l}
          onClick={() => l !== lang && switchTo(l)}
          className={cn(
            "h-8 rounded-full px-4 text-sm font-medium uppercase transition",
            l === lang ? "bg-active text-fg shadow-sm" : "text-muted hover:text-fg",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
