import type { FontKey } from "./types";

/** Brand names; descriptive labels for some come from the app dictionary (fonts). */
export const FONT_OPTIONS: { key: FontKey; label: string; cssVar: string }[] = [
  { key: "inter", label: "Inter", cssVar: "--font-inter" },
  { key: "playfair", label: "Playfair", cssVar: "--font-playfair" },
  { key: "space", label: "Space Grotesk", cssVar: "--font-space-grotesk" },
  { key: "caveat", label: "Caveat", cssVar: "--font-caveat" },
  { key: "pixelify", label: "Pixelify", cssVar: "--font-pixelify" },
  { key: "vt323", label: "VT323", cssVar: "--font-vt323" },
];

const cache = new Map<FontKey, string>();

/** next/font exposes each family through a CSS variable; canvas needs the resolved family string. */
export function fontFamilyFor(key: FontKey): string {
  const hit = cache.get(key);
  if (hit) return hit;
  const option = FONT_OPTIONS.find((f) => f.key === key) ?? FONT_OPTIONS[0];
  const value =
    typeof document === "undefined"
      ? ""
      : getComputedStyle(document.documentElement).getPropertyValue(option.cssVar).trim();
  const family = value || "sans-serif";
  if (value) cache.set(key, family);
  return family;
}

/**
 * Canvas text doesn't trigger webfont loading the way DOM text does,
 * so load every editor font up front and report when they're ready.
 */
export async function loadEditorFonts(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.allSettled(
    FONT_OPTIONS.flatMap(({ key }) => {
      const family = fontFamilyFor(key);
      return ["400", "700"].map((w) => document.fonts.load(`${w} 40px ${family}`, "AğşİıÖç 0123"));
    }),
  );
}
