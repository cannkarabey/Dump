import type { Asset } from "./types";
import { at } from "./i18n/appDictionary";

/** "EKİM '26" / "OCTOBER '26" in the app language. */
export function monthLabel(date: Date, locale = at().locale): string {
  const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(date).toLocaleUpperCase(locale);
  return `${month} '${String(date.getFullYear()).slice(-2)}`;
}

/** The month most photos were taken in; falls back to today. */
export function dominantMonth(assets: Asset[]): Date {
  const counts = new Map<string, number>();
  for (const a of assets) {
    if (a.takenAt == null) continue;
    const d = new Date(a.takenAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let best: string | null = null;
  for (const [key, n] of counts) if (!best || n > counts.get(best)!) best = key;
  if (!best) return new Date();
  const [y, m] = best.split("-").map(Number);
  return new Date(y, m, 1);
}

/** Retro camera date stamp: "'26 10 14". */
export function stampLabel(takenAt: number): string {
  const d = new Date(takenAt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `'${String(d.getFullYear()).slice(-2)} ${pad(d.getMonth() + 1)} ${pad(d.getDate())}`;
}
