import { at } from "./i18n/appDictionary";

export type PresetGroup = "popular" | "instagram" | "tiktok" | "youtube" | "x";

export interface SizePreset {
  id: string;
  label: string;
  groups: PresetGroup[];
  w: number;
  h: number;
}

/** Labels live in the app dictionary (presets.groups). */
export const PRESET_GROUPS: PresetGroup[] = ["popular", "instagram", "tiktok", "youtube", "x"];

export const PRESETS: SizePreset[] = [
  { id: "ig-post", label: "Instagram Post", groups: ["popular", "instagram"], w: 1080, h: 1440 },
  { id: "ig-portrait", label: "Instagram 4:5", groups: ["instagram"], w: 1080, h: 1350 },
  { id: "square", label: "Kare", groups: ["popular", "instagram"], w: 1080, h: 1080 },
  { id: "story", label: "Story / Reels", groups: ["popular", "instagram"], w: 1080, h: 1920 },
  { id: "tiktok", label: "TikTok Slideshow", groups: ["popular", "tiktok"], w: 1080, h: 1920 },
  { id: "pinterest", label: "Pinterest Pin", groups: ["popular"], w: 1000, h: 1500 },
  { id: "yt-thumb", label: "YouTube Kapak", groups: ["youtube"], w: 1280, h: 720 },
  { id: "yt-community", label: "YouTube Topluluk", groups: ["youtube"], w: 1080, h: 1080 },
  { id: "x-post", label: "X Gönderi", groups: ["x"], w: 1600, h: 900 },
];

export function aspectLabel(w: number, h: number): string {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(w, h);
  return `${w / g}:${h / g}`;
}

/** Labels are Turkish/brand names; the dictionary translates the ones that need it. */
export function presetLabel(w: number, h: number, t = at()): string {
  const p = PRESETS.find((x) => x.w === w && x.h === h);
  return p ? (t.presets.labels[p.id] ?? p.label) : t.presets.custom;
}
