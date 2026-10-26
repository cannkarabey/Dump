import { tr, type Dict } from "@/messages/tr";
import { en } from "@/messages/en";
import type { Locale } from "./config";

const DICTS: Record<Locale, Dict> = { tr, en };

/** Plain data only, so slices can be passed to client components as props. */
export function getDictionary(lang: Locale): Dict {
  return DICTS[lang];
}

export { format } from "./format";

export type { Dict };
