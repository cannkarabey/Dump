import { tr, type Dict } from "@/messages/tr";
import { en } from "@/messages/en";
import type { Locale } from "./config";

const DICTS: Record<Locale, Dict> = { tr, en };

/** Plain data only, so slices can be passed to client components as props. */
export function getDictionary(lang: Locale): Dict {
  return DICTS[lang];
}

/** Fills "{name}" placeholders: format("Try {tier}", { tier: "Studio" }). */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? `{${k}}`));
}

export type { Dict };
