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

/** Renders each requested page of the editor stage to a Blob, then restores the editor view. */
export async function exportPages(stage: Konva.Stage, doc: DumpDoc, opts: ExportOptions): Promise<Blob[]> {
  const { w, h } = doc.format;
  const pixelRatio = exportPixelRatio(doc, opts.longSide);
  const saved = { scale: stage.scale(), position: stage.position() };
  const ui = stage.findOne<Konva.Layer>(".ui");
  const content = stage.findOne<Konva.Layer>(".content");
  const artboard = stage.findOne<Konva.Rect>(".artboard");
  const artboardFill = artboard?.fill();
  const temp: Konva.Node[] = [];

  try {
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    ui?.hide();
    if (artboard && doc.background === "transparent") {
      // PNG keeps alpha; JPEG has none, so it gets white.
      artboard.fill(opts.mime === "image/png" ? "" : "#ffffff");
    }
    if (opts.watermark && content) {
      for (const page of opts.pages) {
        // Dark pill so the mark stays legible on both light and dark backgrounds.
        const fontSize = h * 0.018;
        const mark = new Konva.Label({ opacity: 0.85, listening: false });
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
        mark.position({
          x: page * w + w - mark.width() - w * 0.03,
          y: h - mark.height() - h * 0.02,
        });
        content.add(mark);
        temp.push(mark);
      }
    }

    const blobs: Blob[] = [];
    for (const [i, page] of opts.pages.entries()) {
      blobs.push(
        await stage.toBlob({
          x: page * w,
          y: 0,
          width: w,
          height: h,
          pixelRatio,
          mimeType: opts.mime,
          quality: 0.92,
        }),
      );
      opts.onProgress?.(i + 1, opts.pages.length);
    }
    return blobs;
  } finally {
    temp.forEach((n) => n.destroy());
    if (artboard) artboard.fill(artboardFill ?? "#ffffff");
    ui?.show();
    stage.scale(saved.scale);
    stage.position(saved.position);
    stage.batchDraw();
  }
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
