import { materialize } from "./templates/applyTemplate";
import type { TplEl } from "./templates/schema";
import { dominantMonth, monthLabel } from "./month";
import { chroma, extractPalette, tint } from "./palette";
import type { Asset, DumpDoc, El } from "./types";

const ACCENT = "#7c5cff";

/** Two photos per content page; layouts alternate so the carousel doesn't feel repetitive. */
const PAGE_LAYOUTS: Omit<Extract<TplEl, { type: "slot" }>, "page">[][] = [
  [
    { type: "slot", nx: 0.06, ny: 0.05, nw: 0.88, nh: 0.43, nradius: 0.02 },
    { type: "slot", nx: 0.06, ny: 0.52, nw: 0.88, nh: 0.43, nradius: 0.02 },
  ],
  [
    { type: "slot", nx: 0.07, ny: 0.06, nw: 0.62, nh: 0.52, rotation: -3, frame: "polaroid" },
    { type: "slot", nx: 0.33, ny: 0.45, nw: 0.58, nh: 0.48, rotation: 4, frame: "polaroid" },
  ],
];
const SINGLE: Omit<Extract<TplEl, { type: "slot" }>, "page"> = {
  type: "slot",
  nx: 0.06,
  ny: 0.06,
  nw: 0.88,
  nh: 0.88,
  nradius: 0.02,
};

export interface MonthDumpResult {
  doc: DumpDoc;
  /** Photos that didn't fit within the tier's page limit. */
  dropped: number;
}

/**
 * "1-click month dump": chronological order, a cover page with the month title and palette,
 * a color-matched background and (when allowed) retro date stamps.
 */
export function buildMonthDump(
  doc: DumpDoc,
  assets: Asset[],
  opts: { maxPages: number; stamp: boolean },
): MonthDumpResult {
  // Chronological; photos without EXIF dates keep their upload order at the end.
  const sorted = [...assets].sort((a, b) => (a.takenAt ?? Infinity) - (b.takenAt ?? Infinity));
  const cover = sorted.reduce((best, a) => (chroma(a.dominant) > chroma(best.dominant) ? a : best), sorted[0]);
  const rest = sorted.filter((a) => a !== cover);

  const contentPages = Math.min(Math.ceil(rest.length / 2), Math.max(0, opts.maxPages - 1));
  const placed = rest.slice(0, contentPages * 2);
  const month = dominantMonth(sorted);
  const palette = extractPalette(cover.img, 5);
  const { w, h } = doc.format;
  const vars = { month: monthLabel(month), year: String(month.getFullYear()) };

  const tpl: TplEl[] = [
    { type: "text", page: 0, nx: 0.06, ny: 0.05, nw: 0.88, nh: 0.13, text: "{{month}}", font: "playfair", nfs: 0.1, fontStyle: "bold", fill: "#1d1d1f", align: "left" },
    { type: "text", page: 0, nx: 0.06, ny: 0.175, nw: 0.6, nh: 0.08, text: "dump", font: "caveat", nfs: 0.075, fill: ACCENT, align: "left" },
    { type: "slot", page: 0, nx: 0.06, ny: 0.28, nw: 0.88, nh: 0.58, nradius: 0.02 },
    ...palette.map((fill, i): TplEl => ({ type: "shape", page: 0, nx: 0.06 + i * 0.1, ny: 0.895, nw: 0.075, nh: 0.075 * (w / h), fill })),
  ];

  for (let p = 0; p < contentPages; p++) {
    const pair = placed.slice(p * 2, p * 2 + 2);
    const layout = pair.length === 1 ? [SINGLE] : PAGE_LAYOUTS[p % PAGE_LAYOUTS.length];
    layout.forEach((slot) => tpl.push({ ...slot, page: p + 1 }));
  }

  const ordered = [cover, ...placed];
  let next = 0;
  const elements: El[] = tpl.map((t) => {
    const el = materialize(t, w, h, vars);
    if (el.type === "slot") {
      el.assetId = ordered[next++]?.id;
      el.stamp = opts.stamp;
    }
    if (el.type === "shape") el.radius = el.height / 2;
    return el;
  });

  const pages = 1 + contentPages;
  return {
    doc: {
      ...doc,
      title: `${vars.month} dump`,
      background: tint(cover.dominant, 0.82),
      format: { ...doc.format, pages, mode: pages > 1 ? "carousel" : "single" },
      elements,
    },
    dropped: rest.length - placed.length,
  };
}
