import { nanoid } from "nanoid";
import { useDoc } from "./store/doc";
import { useUi } from "./store/ui";
import type { FontKey, StickerEl, TextEl } from "./types";

/** Labels and sample texts live in the app dictionary (textPanel.presets). */
export interface TextPreset {
  id: string;
  font: FontKey;
  /** Font size as a fraction of page height. */
  nfs: number;
  fontStyle?: string;
  fill: string;
  bubble?: boolean;
}

export const TEXT_PRESETS: TextPreset[] = [
  { id: "title", font: "playfair", nfs: 0.07, fontStyle: "bold", fill: "#1d1d1f" },
  { id: "caption", font: "inter", nfs: 0.032, fill: "#1d1d1f" },
  { id: "bubble", font: "inter", nfs: 0.03, fontStyle: "600", fill: "#1d1d1f", bubble: true },
  { id: "hand", font: "caveat", nfs: 0.06, fill: "#7c5cff" },
  { id: "pixel", font: "pixelify", nfs: 0.045, fill: "#ff5fa2" },
  { id: "digital", font: "vt323", nfs: 0.05, fill: "#ffa41f" },
];

/** Center of the active page, for placing new elements. */
function pageCenter() {
  const { doc } = useDoc.getState();
  const page = Math.min(useUi.getState().activePage, doc.format.pages - 1);
  return { cx: page * doc.format.w + doc.format.w / 2, cy: doc.format.h / 2, ...doc.format };
}

export function addText(preset: TextPreset, text: string) {
  const { cx, cy, w, h } = pageCenter();
  const fontSize = preset.nfs * h;
  const width = w * 0.7;
  const el: TextEl = {
    id: nanoid(10),
    type: "text",
    text,
    fontFamily: preset.font,
    fontSize,
    fontStyle: preset.fontStyle,
    fill: preset.fill,
    align: "center",
    bubble: preset.bubble,
    x: cx - width / 2,
    y: cy - fontSize / 2,
    width,
    height: fontSize * 1.2,
    rotation: 0,
    opacity: 1,
  };
  useDoc.getState().addElements([el]);
  useUi.getState().setSelection([el.id]);
}

export function addSticker(src: string, aspect = 1) {
  const { cx, cy, w } = pageCenter();
  const width = w * 0.22;
  const height = width / aspect;
  const el: StickerEl = {
    id: nanoid(10),
    type: "sticker",
    src,
    x: cx - width / 2,
    y: cy - height / 2,
    width,
    height,
    rotation: 0,
    opacity: 1,
  };
  useDoc.getState().addElements([el]);
  useUi.getState().setSelection([el.id]);
}
