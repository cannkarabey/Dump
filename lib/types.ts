export type Tier = "free" | "creator" | "studio";

/** carousel = one wide canvas that is split into pages on export (seamless). */
export type DumpMode = "single" | "carousel";

export interface DumpFormat {
  /** Width of a single page in px, e.g. 1080. */
  w: number;
  h: number;
  /** Always 1 in single mode. */
  pages: number;
  mode: DumpMode;
}

interface BaseEl {
  id: string;
  /** Stage coordinates; the left edge of page i is i * format.w. */
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees. */
  rotation: number;
  /** 0–1. */
  opacity: number;
  locked?: boolean;
}

export type Frame = "none" | "polaroid" | "film";

/** Photo filter id; see lib/filters.ts. */
export type FilterId =
  | "none"
  | "bw"
  | "sepia"
  | "vivid"
  | "fade"
  | "warm"
  | "cool"
  | "invert"
  | "posterize"
  | "threshold"
  | "solarize"
  | "blur"
  | "mosaic"
  | "noise"
  | "emboss";

export interface ImageEl extends BaseEl {
  type: "image";
  assetId: string;
  radius?: number;
  frame?: Frame;
  /** Retro date stamp from the photo's EXIF date (Creator+). */
  stamp?: boolean;
  filter?: FilterId;
}

/** Template placeholder; renders like an image once it has an asset. */
export interface SlotEl extends BaseEl {
  type: "slot";
  assetId?: string;
  radius?: number;
  frame?: Frame;
  stamp?: boolean;
  filter?: FilterId;
}

/** Keys of the fonts loaded in app/fonts.ts; resolved to real family names at render time. */
export type FontKey =
  | "inter"
  | "playfair"
  | "space"
  | "caveat"
  | "pixelify"
  | "vt323"
  | "jakarta"
  | "outfit"
  | "anton"
  | "bebas"
  | "archivo"
  | "syne"
  | "shrikhand"
  | "dmserif"
  | "instrument"
  | "fraunces"
  | "pacifico"
  | "marker"
  | "cinzel"
  | "cormorant"
  | "italiana"
  | "jetbrains"
  | "spacemono"
  | "majormono";

export interface TextEl extends BaseEl {
  type: "text";
  text: string;
  fontFamily: FontKey;
  fontSize: number;
  /** Konva fontStyle: 'normal' | 'bold' | 'italic' | '600' … */
  fontStyle?: string;
  fill: string;
  align: "left" | "center" | "right";
  bubble?: boolean;
  /** Extra space between letters in px (scales with the font size). */
  letterSpacing?: number;
}

/** Editable tool output (message bubble, clock…): `src` is regenerated from kind + props. */
export interface WidgetData {
  kind: string;
  props: Record<string, string>;
}

export interface StickerEl extends BaseEl {
  type: "sticker";
  src: string;
  widget?: WidgetData;
}

export type ShapeKind = "rect" | "rounded" | "ellipse" | "triangle" | "star" | "heart" | "line" | "arrow";

/** Rectangle by default (e.g. palette chips on the month cover); other kinds come from Draw → Shapes. */
export interface ShapeEl extends BaseEl {
  type: "shape";
  fill: string;
  radius?: number;
  kind?: ShapeKind;
  /** Outline instead of fill (lines and arrows are always strokes). */
  outline?: boolean;
  strokeWidth?: number;
}

export type BrushTool = "pen" | "marker" | "highlighter";

/** Freehand stroke; points are relative to x/y. */
export interface DrawEl extends BaseEl {
  type: "draw";
  points: number[];
  stroke: string;
  strokeWidth: number;
  tool: BrushTool;
}

export type El = ImageEl | SlotEl | TextEl | StickerEl | ShapeEl | DrawEl;

export interface DumpDoc {
  id: string;
  title: string;
  format: DumpFormat;
  /** '#rrggbb' or 'transparent'. */
  background: string;
  /** Array order is z-order: later elements render on top. */
  elements: El[];
  updatedAt: number;
}

/** Heavy, non-undoable data kept outside the doc. */
export interface Asset {
  id: string;
  /** objectURL of `blob`. */
  url: string;
  /** Downscaled image; this is what gets persisted. */
  blob: Blob;
  img: HTMLImageElement;
  w: number;
  h: number;
  /** EXIF DateTimeOriginal in ms, or null. */
  takenAt: number | null;
  /** '#rrggbb' */
  dominant: string;
  fileName: string;
}
