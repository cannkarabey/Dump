export type PresetGroup = "popular" | "instagram" | "tiktok" | "youtube" | "x";

export interface SizePreset {
  id: string;
  label: string;
  groups: PresetGroup[];
  w: number;
  h: number;
}

export const PRESET_GROUPS: { id: PresetGroup; label: string }[] = [
  { id: "popular", label: "Popüler" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
  { id: "x", label: "X" },
];

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

export function presetLabel(w: number, h: number): string {
  return PRESETS.find((p) => p.w === w && p.h === h)?.label ?? "Özel boyut";
}
