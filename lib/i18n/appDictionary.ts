import { appTr, type AppDict } from "@/messages/app/tr";
import { appEn } from "@/messages/app/en";
import type { Locale } from "./config";

export { format } from "./format";
export type { AppDict };

const APP_DICTS: Record<Locale, AppDict> = { tr: appTr, en: appEn };

/** Plain data: safe on the server (metadata, page headings) and in the browser. */
export function getAppDictionary(lang: Locale): AppDict {
  return APP_DICTS[lang];
}

/**
 * The app's language for code outside React (stores, event handlers, export helpers).
 * <AppI18nProvider> sets it in the browser before its children render; a language switch
 * reloads the page, so it never changes mid-session. Components should use useT() instead,
 * which is also correct during server rendering.
 */
let current: Locale = "tr";

export function setAppLocale(lang: Locale) {
  current = lang;
}

export function appLocale(): Locale {
  return current;
}

/** Dictionary for the current app language (browser-side code only). */
export function at(): AppDict {
  return APP_DICTS[current];
}
