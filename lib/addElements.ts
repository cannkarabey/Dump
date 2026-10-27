import { nanoid } from "nanoid";
import { useDoc } from "./store/doc";
import { useUi } from "./store/ui";
import type { FontKey, StickerEl, TextEl } from "./types";
import { buildWidget, defaultProps, svgToSrc, widgetScale } from "./widgets";

export type TextCategory = "essentials" | "display" | "editorial" | "playful" | "luxe" | "tech";

/**
 * Text styles in the Text panel. Translatable labels/samples live in the app dictionary
 * (textPanel.presets); styles named after their font carry a language-neutral `sample`.
 */
export interface TextPreset {
  id: string;
  cat: TextCategory;
  /** Neutral sample text, used when the dictionary has no entry. */
  sample?: string;
  /** Small caption under the sample in the panel (usually the font name). */
  sub?: string;
  /** Letter spacing as a fraction of the font size. */
  ls?: number;
  font: FontKey;
  /** Font size as a fraction of page height. */
  nfs: number;
  fontStyle?: string;
  fill: string;
  bubble?: boolean;
}

export const TEXT_PRESETS: TextPreset[] = [
  // Essentials
  { id: "headline", cat: "essentials", font: "inter", nfs: 0.075, fontStyle: "800", fill: "#1d1d1f", ls: -0.03 },
  { id: "subhead", cat: "essentials", font: "space", nfs: 0.05, fontStyle: "600", fill: "#1d1d1f" },
  { id: "body", cat: "essentials", font: "inter", nfs: 0.03, fill: "#1d1d1f" },
  { id: "caption", cat: "essentials", font: "inter", nfs: 0.032, fill: "#1d1d1f" },
  { id: "tight", cat: "essentials", font: "inter", nfs: 0.055, fontStyle: "800", fill: "#1d1d1f", ls: -0.07 },
  { id: "jakarta", cat: "essentials", sample: "Jakarta", font: "jakarta", nfs: 0.055, fontStyle: "700", fill: "#1d1d1f" },
  { id: "outfit", cat: "essentials", sample: "Outfit", font: "outfit", nfs: 0.055, fontStyle: "600", fill: "#1d1d1f" },
  { id: "modern", cat: "essentials", sample: "Modern", font: "space", nfs: 0.055, fontStyle: "700", fill: "#1d1d1f", ls: -0.02 },
  // Display
  { id: "anton", cat: "display", sample: "BOLD MOVE", sub: "Anton", font: "anton", nfs: 0.09, fill: "#1d1d1f" },
  { id: "bebas", cat: "display", sample: "HEADLINE", sub: "Bebas Neue", font: "bebas", nfs: 0.1, fill: "#1d1d1f", ls: 0.03 },
  { id: "archivo", cat: "display", sample: "Archivo", sub: "Archivo Black", font: "archivo", nfs: 0.07, fill: "#1d1d1f", ls: -0.03 },
  { id: "syne", cat: "display", sample: "Syne", sub: "Syne ExtraBold", font: "syne", nfs: 0.075, fontStyle: "800", fill: "#1d1d1f" },
  { id: "shrikhand", cat: "display", sample: "Groovy", sub: "Shrikhand", font: "shrikhand", nfs: 0.07, fill: "#ff5fa2" },
  { id: "outline-big", cat: "display", sample: "LOUD", sub: "Anton", font: "anton", nfs: 0.12, fill: "#7c5cff", ls: 0.02 },
  // Editorial
  { id: "title", cat: "editorial", font: "playfair", nfs: 0.07, fontStyle: "bold", fill: "#1d1d1f" },
  { id: "playfair-italic", cat: "editorial", sample: "Playfair", sub: "Playfair Italic", font: "playfair", nfs: 0.065, fontStyle: "italic", fill: "#1d1d1f" },
  { id: "dmserif", cat: "editorial", sample: "DM Serif", sub: "DM Serif Display", font: "dmserif", nfs: 0.065, fill: "#1d1d1f" },
  { id: "instrument", cat: "editorial", sample: "Instrument", sub: "Instrument Serif", font: "instrument", nfs: 0.07, fontStyle: "italic", fill: "#1d1d1f" },
  { id: "fraunces", cat: "editorial", sample: "Fraunces", sub: "Fraunces SemiBold", font: "fraunces", nfs: 0.06, fontStyle: "600", fill: "#1d1d1f" },
  { id: "magazine", cat: "editorial", sample: "THE ISSUE", sub: "Playfair", font: "playfair", nfs: 0.045, fontStyle: "bold", fill: "#1d1d1f", ls: 0.25 },
  // Playful
  { id: "hand", cat: "playful", font: "caveat", nfs: 0.06, fill: "#7c5cff" },
  { id: "bubble", cat: "playful", font: "inter", nfs: 0.03, fontStyle: "600", fill: "#1d1d1f", bubble: true },
  { id: "pacifico", cat: "playful", sample: "Pacifico", font: "pacifico", nfs: 0.06, fill: "#ff7a59" },
  { id: "marker", cat: "playful", sample: "Marker", sub: "Permanent Marker", font: "marker", nfs: 0.06, fill: "#1d1d1f" },
  { id: "pixel", cat: "playful", font: "pixelify", nfs: 0.045, fill: "#ff5fa2" },
  { id: "shrikhand-pink", cat: "playful", sample: "yay!", sub: "Shrikhand", font: "shrikhand", nfs: 0.07, fill: "#ff5fa2" },
  // Luxe
  { id: "cinzel", cat: "luxe", sample: "CINZEL", font: "cinzel", nfs: 0.055, fontStyle: "600", fill: "#1d1d1f", ls: 0.12 },
  { id: "cormorant", cat: "luxe", sample: "Cormorant", sub: "Cormorant Italic", font: "cormorant", nfs: 0.065, fontStyle: "italic", fill: "#1d1d1f" },
  { id: "italiana", cat: "luxe", sample: "ITALIANA", font: "italiana", nfs: 0.055, fill: "#1d1d1f", ls: 0.2 },
  { id: "luxe-spaced", cat: "luxe", sample: "L U X E", sub: "Playfair", font: "playfair", nfs: 0.045, fill: "#1d1d1f", ls: 0.35 },
  { id: "gold", cat: "luxe", sample: "Golden", sub: "Cormorant", font: "cormorant", nfs: 0.07, fontStyle: "600", fill: "#b8913a" },
  // Tech
  { id: "code", cat: "tech", sample: "code()", sub: "JetBrains", font: "jetbrains", nfs: 0.045, fill: "#1d1d1f" },
  { id: "typeexe", cat: "tech", sample: "type.exe", sub: "Space Mono", font: "spacemono", nfs: 0.045, fill: "#1d1d1f" },
  { id: "build", cat: "tech", sample: "BUILD", sub: "Mono Bold", font: "jetbrains", nfs: 0.055, fontStyle: "800", fill: "#1d1d1f", ls: 0.08 },
  { id: "digital", cat: "tech", font: "vt323", nfs: 0.05, fill: "#ffa41f" },
  { id: "majormono", cat: "tech", sample: "major mono", font: "majormono", nfs: 0.045, fill: "#1d1d1f" },
  { id: "terminal", cat: "tech", sample: "> ready_", sub: "VT323", font: "vt323", nfs: 0.06, fill: "#34c759" },
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
    letterSpacing: preset.ls ? preset.ls * fontSize : undefined,
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

/** Adds a Tools widget (message bubble, clock…) as an editable sticker on the active page. */
export function addWidget(kind: string) {
  const { cx, cy, w } = pageCenter();
  const props = defaultProps(kind);
  const out = buildWidget(kind, props);
  const width = w * widgetScale(kind);
  const height = (width * out.h) / out.w;
  const el: StickerEl = {
    id: nanoid(10),
    type: "sticker",
    src: svgToSrc(out.svg),
    widget: { kind, props },
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

/** Regenerates a widget after its props change, keeping its on-canvas scale and center. */
export function updateWidget(el: StickerEl, props: Record<string, string>) {
  if (!el.widget) return;
  const before = buildWidget(el.widget.kind, el.widget.props);
  const after = buildWidget(el.widget.kind, props);
  const k = el.width / before.w;
  const width = after.w * k;
  const height = after.h * k;
  useDoc.getState().updateElement(el.id, {
    src: svgToSrc(after.svg),
    widget: { kind: el.widget.kind, props },
    x: el.x + (el.width - width) / 2,
    y: el.y + (el.height - height) / 2,
    width,
    height,
  });
}
