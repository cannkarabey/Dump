import { nanoid } from "nanoid";
import type { Asset, DumpDoc, El } from "@/lib/types";
import type { Template, TplEl } from "./schema";

export interface TemplateVars {
  month: string;
  year: string;
}

function fill(text: string, vars: TemplateVars) {
  return text.replaceAll("{{month}}", vars.month).replaceAll("{{year}}", vars.year);
}

/** Converts one normalized template element into a doc element for a w×h page. */
export function materialize(t: TplEl, w: number, h: number, vars: TemplateVars): El {
  const base = {
    id: nanoid(10),
    x: t.page * w + t.nx * w,
    y: t.ny * h,
    width: t.nw * w,
    height: t.nh * h,
    rotation: t.rotation ?? 0,
    opacity: 1,
  };
  switch (t.type) {
    case "slot":
      return { ...base, type: "slot", frame: t.frame, radius: t.nradius ? t.nradius * w : undefined };
    case "shape":
      return { ...base, type: "shape", fill: t.fill, radius: t.nradius ? t.nradius * w : undefined };
    case "text":
      return {
        ...base,
        type: "text",
        text: fill(t.text, vars),
        fontFamily: t.font,
        fontSize: t.nfs * h,
        fontStyle: t.fontStyle,
        fill: t.fill,
        align: t.align,
        bubble: t.bubble,
      };
  }
}

export interface ApplyResult {
  doc: DumpDoc;
  /** Assets that didn't get a slot. */
  unplaced: number;
}

/**
 * Lays the template out on the doc's current page size, keeps the doc's id/title,
 * and fills slots with `assets` in order. Pages beyond `maxPages` are dropped.
 */
export function applyTemplate(
  t: Template,
  doc: DumpDoc,
  assets: Asset[],
  opts: { maxPages: number; vars: TemplateVars },
): ApplyResult {
  const pages = t.mode === "single" ? 1 : Math.min(t.pages, opts.maxPages);
  const { w, h } = doc.format;
  const elements = t.elements
    .filter((e) => e.page < pages)
    .map((e) => materialize(e, w, h, opts.vars));

  let next = 0;
  for (const el of elements) {
    if (el.type === "slot" && next < assets.length) el.assetId = assets[next++].id;
  }

  return {
    doc: {
      ...doc,
      background: t.background,
      format: { ...doc.format, mode: t.mode, pages },
      elements,
    },
    unplaced: Math.max(0, assets.length - next),
  };
}
