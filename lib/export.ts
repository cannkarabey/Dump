import Konva from "konva";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { fontFamilyFor } from "./fonts";
import type { DumpDoc } from "./types";

export type ExportMime = "image/png" | "image/jpeg";

export interface ExportOptions {
  mime: ExportMime;
  /** Target long side in px. Never exports below the doc's native size. */
  longSide: number;
  /** 0-based page indices. */
  pages: number[];
  watermark: boolean;
  onProgress?: (done: number, total: number) => void;
}

/**
 * Pixel ratio for a target long side. "4K" is capped at a 3840px long side, which keeps
 * every preset under Safari's ~16.7M pixel canvas limit (e.g. 2880×3840 ≈ 11M).
 */
export function exportPixelRatio(doc: DumpDoc, longSide: number) {
  return Math.max(1, longSide / Math.max(doc.format.w, doc.format.h));
}

/**
 * Renders one page synchronously: switch the stage to an unscaled export view, draw, and restore
 * before returning, so the editor never paints the temporary view (no flicker, even mid-edit).
 */
function renderPageCanvas(
  stage: Konva.Stage,
  doc: DumpDoc,
  page: number,
  opts: { pixelRatio: number; mime: ExportMime; watermark: boolean },
): HTMLCanvasElement {
  const { w, h } = doc.format;
  const saved = { scale: stage.scale(), position: stage.position() };
  const ui = stage.findOne<Konva.Layer>(".ui");
  const content = stage.findOne<Konva.Layer>(".content");
  const artboard = stage.findOne<Konva.Rect>(".artboard");
  const artboardFill = artboard?.fill();
  let mark: Konva.Label | null = null;

  try {
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    ui?.hide();
    if (artboard && doc.background === "transparent") {
      // PNG keeps alpha; JPEG has none, so it gets white.
      artboard.fill(opts.mime === "image/png" ? "" : "#ffffff");
    }
    if (opts.watermark && content) {
      // Dark pill so the mark stays legible on both light and dark backgrounds.
      const fontSize = h * 0.018;
      mark = new Konva.Label({ opacity: 0.85, listening: false });
      mark.add(new Konva.Tag({ fill: "#000000", opacity: 0.45, cornerRadius: fontSize }));
      mark.add(
        new Konva.Text({
          text: "made with dump",
          fontFamily: fontFamilyFor("space"),
          fontStyle: "600",
          fontSize,
          fill: "#ffffff",
          padding: fontSize * 0.5,
        }),
      );
      mark.position({ x: page * w + w - mark.width() - w * 0.03, y: h - mark.height() - h * 0.02 });
      content.add(mark);
    }
    return stage.toCanvas({ x: page * w, y: 0, width: w, height: h, pixelRatio: opts.pixelRatio });
  } finally {
    mark?.destroy();
    if (artboard) artboard.fill(artboardFill ?? "#ffffff");
    ui?.show();
    stage.scale(saved.scale);
    stage.position(saved.position);
    stage.batchDraw();
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: ExportMime, quality = 0.92) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas encoding failed"))), mime, quality),
  );
}

/** Renders each requested page to a Blob, one page in memory at a time. */
export async function exportPages(stage: Konva.Stage, doc: DumpDoc, opts: ExportOptions): Promise<Blob[]> {
  const pixelRatio = exportPixelRatio(doc, opts.longSide);
  const blobs: Blob[] = [];
  for (const [i, page] of opts.pages.entries()) {
    const canvas = renderPageCanvas(stage, doc, page, { pixelRatio, mime: opts.mime, watermark: opts.watermark });
    blobs.push(await canvasToBlob(canvas, opts.mime));
    opts.onProgress?.(i + 1, opts.pages.length);
  }
  return blobs;
}

/**
 * Every page as a small JPEG data URL for the AI assistant. A long side of 384px keeps each
 * image at Gemini's minimum cost of 258 tokens (PLAN.md 3.3).
 */
export function renderPageThumbs(stage: Konva.Stage, doc: DumpDoc, longSide = 384): string[] {
  const pixelRatio = longSide / Math.max(doc.format.w, doc.format.h);
  return Array.from({ length: doc.format.pages }, (_, page) =>
    renderPageCanvas(stage, doc, page, { pixelRatio, mime: "image/jpeg", watermark: false }).toDataURL("image/jpeg", 0.7),
  );
}

/** Small JPEG data URL of the first page, for the dashboard. */
export function renderThumbnail(stage: Konva.Stage, doc: DumpDoc, longSide = 360): string {
  const pixelRatio = longSide / Math.max(doc.format.w, doc.format.h);
  const canvas = renderPageCanvas(stage, doc, 0, { pixelRatio, mime: "image/jpeg", watermark: false });
  return canvas.toDataURL("image/jpeg", 0.75);
}

function slug(title: string) {
  const base = title
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "dump";
}

export function fileNames(doc: DumpDoc, pages: number[], mime: ExportMime) {
  const ext = mime === "image/png" ? "png" : "jpg";
  return pages.map((p) => `${slug(doc.title)}-${String(p + 1).padStart(2, "0")}.${ext}`);
}

export async function downloadZip(blobs: Blob[], names: string[], title: string) {
  const zip = new JSZip();
  blobs.forEach((b, i) => zip.file(names[i], b));
  const archive = await zip.generateAsync({ type: "blob" });
  saveAs(archive, `${slug(title)}.zip`);
}

/** Without ZIP, files are saved one by one; a short gap keeps browsers from dropping them. */
export async function downloadEach(blobs: Blob[], names: string[]) {
  for (const [i, blob] of blobs.entries()) {
    saveAs(blob, names[i]);
    if (i < blobs.length - 1) await new Promise((r) => setTimeout(r, 350));
  }
}
