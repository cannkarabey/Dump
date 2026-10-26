"use client";

import { createContext, useCallback, useContext } from "react";
import { localizeTemplate } from "@/lib/templates/i18n";
import type { Template } from "@/lib/templates/schema";
import type { Locale } from "./config";
import { getAppDictionary, setAppLocale, type AppDict } from "./appDictionary";

export { format } from "./format";

const Ctx = createContext<{ lang: Locale; t: AppDict }>({ lang: "tr", t: getAppDictionary("tr") });

export function AppI18nProvider({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  // Module state for non-React code; only the browser has a single, stable app language.
  if (typeof window !== "undefined") setAppLocale(lang);
  return <Ctx.Provider value={{ lang, t: getAppDictionary(lang) }}>{children}</Ctx.Provider>;
}

export function useT() {
  return useContext(Ctx);
}

/** Localizes a template (title and baked-in texts) for the current language. */
export function useLocalizeTemplate() {
  const { lang } = useT();
  return useCallback((t: Template) => localizeTemplate(t, lang), [lang]);
}
