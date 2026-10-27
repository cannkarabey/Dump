import type { FontKey } from "./types";

/** Brand names; descriptive labels for some come from the app dictionary (fonts). */
export const FONT_OPTIONS: { key: FontKey; label: string; cssVar: string }[] = [
  { key: "inter", label: "Inter", cssVar: "--font-inter" },
  { key: "playfair", label: "Playfair", cssVar: "--font-playfair" },
  { key: "space", label: "Space Grotesk", cssVar: "--font-space-grotesk" },
  { key: "caveat", label: "Caveat", cssVar: "--font-caveat" },
  { key: "pixelify", label: "Pixelify", cssVar: "--font-pixelify" },
  { key: "vt323", label: "VT323", cssVar: "--font-vt323" },
  { key: "jakarta", label: "Jakarta", cssVar: "--font-jakarta" },
  { key: "outfit", label: "Outfit", cssVar: "--font-outfit" },
  { key: "anton", label: "Anton", cssVar: "--font-anton" },
  { key: "bebas", label: "Bebas Neue", cssVar: "--font-bebas" },
  { key: "archivo", label: "Archivo Black", cssVar: "--font-archivo" },
  { key: "syne", label: "Syne", cssVar: "--font-syne" },
  { key: "shrikhand", label: "Shrikhand", cssVar: "--font-shrikhand" },
  { key: "dmserif", label: "DM Serif", cssVar: "--font-dmserif" },
  { key: "instrument", label: "Instrument Serif", cssVar: "--font-instrument" },
  { key: "fraunces", label: "Fraunces", cssVar: "--font-fraunces" },
  { key: "pacifico", label: "Pacifico", cssVar: "--font-pacifico" },
  { key: "marker", label: "Permanent Marker", cssVar: "--font-marker" },
  { key: "cinzel", label: "Cinzel", cssVar: "--font-cinzel" },
  { key: "cormorant", label: "Cormorant", cssVar: "--font-cormorant" },
  { key: "italiana", label: "Italiana", cssVar: "--font-italiana" },
  { key: "jetbrains", label: "JetBrains Mono", cssVar: "--font-jetbrains" },
  { key: "spacemono", label: "Space Mono", cssVar: "--font-spacemono" },
  { key: "majormono", label: "Major Mono", cssVar: "--font-majormono" },
];

/** Loaded with the editor; the rest load on first use (ensureFont). */
const CORE_FONTS: FontKey[] = ["inter", "playfair", "space", "caveat", "pixelify", "vt323"];

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

const ready = new Set<FontKey>();
const pending = new Map<FontKey, Promise<void>>();

export function isFontReady(key: FontKey): boolean {
  return ready.has(key);
}

/**
 * Canvas text doesn't trigger webfont loading the way DOM text does, so fonts are loaded
 * explicitly before Konva measures text. Resolves once regular, bold and italic are in.
 */
export function ensureFont(key: FontKey): Promise<void> {
  if (ready.has(key) || typeof document === "undefined" || !document.fonts) return Promise.resolve();
  let p = pending.get(key);
  if (!p) {
    const family = fontFamilyFor(key);
    p = Promise.allSettled(
      ["400", "700", "italic 400"].map((w) => document.fonts.load(`${w} 40px ${family}`, "AğşİıÖç 0123")),
    ).then(() => {
      ready.add(key);
    });
    pending.set(key, p);
  }
  return p;
}

/** Core editor fonts, loaded up front so the first paint measures text correctly. */
export async function loadEditorFonts(): Promise<void> {
  await Promise.all(CORE_FONTS.map(ensureFont));
}
