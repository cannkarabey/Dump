import Konva from "konva";
import type { FilterId } from "./types";

export interface FilterDef {
  id: FilterId;
  group: "basic" | "color" | "effect";
  /** Konva filters plus the node attrs they read. */
  filters: Konva.Filter[];
  /** Attrs in source-image pixels where size matters; `scaleAttrs` lists those. */
  attrs: Record<string, number | boolean>;
  scaleAttrs?: string[];
  /** CSS filter for the panel thumbnail. */
  css: string;
}

const F = Konva.Filters;

export const FILTERS: FilterDef[] = [
  { id: "none", group: "basic", filters: [], attrs: {}, css: "none" },
  { id: "bw", group: "basic", filters: [F.Grayscale], attrs: {}, css: "grayscale(1)" },
  { id: "sepia", group: "basic", filters: [F.Sepia], attrs: {}, css: "sepia(1)" },
  { id: "vivid", group: "basic", filters: [F.HSL, F.Contrast], attrs: { saturation: 0.6, contrast: 12 }, css: "saturate(1.6) contrast(1.1)" },
  { id: "fade", group: "basic", filters: [F.HSL, F.Brighten, F.Contrast], attrs: { saturation: -0.35, brightness: 0.08, contrast: -22 }, css: "saturate(0.65) brightness(1.08) contrast(0.8)" },
  { id: "warm", group: "color", filters: [F.RGB], attrs: { red: 255, green: 228, blue: 196 }, css: "sepia(0.3) saturate(1.3)" },
  { id: "cool", group: "color", filters: [F.RGB], attrs: { red: 200, green: 226, blue: 255 }, css: "hue-rotate(-12deg) saturate(0.9) brightness(1.03)" },
  { id: "invert", group: "color", filters: [F.Invert], attrs: {}, css: "invert(1)" },
  { id: "posterize", group: "color", filters: [F.Posterize], attrs: { levels: 0.35 }, css: "contrast(1.6) saturate(1.4)" },
  { id: "threshold", group: "color", filters: [F.Threshold], attrs: { threshold: 0.5 }, css: "grayscale(1) contrast(8)" },
  { id: "solarize", group: "color", filters: [F.Solarize], attrs: {}, css: "invert(0.55) hue-rotate(180deg) contrast(1.2)" },
  { id: "blur", group: "effect", filters: [F.Blur], attrs: { blurRadius: 0.012 }, scaleAttrs: ["blurRadius"], css: "blur(2px)" },
  { id: "mosaic", group: "effect", filters: [F.Pixelate], attrs: { pixelSize: 0.025 }, scaleAttrs: ["pixelSize"], css: "contrast(1.05)" },
  { id: "noise", group: "effect", filters: [F.Noise], attrs: { noise: 0.35 }, css: "contrast(1.1) brightness(0.97)" },
  { id: "emboss", group: "effect", filters: [F.Emboss], attrs: { embossStrength: 0.6, embossWhiteLevel: 0.3, embossBlend: true }, css: "grayscale(0.6) contrast(1.3)" },
];

export function filterDef(id: FilterId | undefined): FilterDef | undefined {
  return id && id !== "none" ? FILTERS.find((f) => f.id === id) : undefined;
}

/**
 * Node attrs for a filter. Size-dependent attrs are fractions of the drawn width, turned into
 * pixels of the cached bitmap (`cacheWidth` px wide), so the look doesn't depend on resolution.
 */
export function filterAttrs(def: FilterDef, cacheWidth: number): Record<string, number | boolean> {
  const attrs: Record<string, number | boolean> = { ...def.attrs };
  for (const key of def.scaleAttrs ?? []) attrs[key] = Math.max(1, Math.round((def.attrs[key] as number) * cacheWidth));
  return attrs;
}
