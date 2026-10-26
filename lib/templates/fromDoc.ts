import { pageOf } from "@/lib/store/doc";
import type { DumpDoc } from "@/lib/types";
import type { Template, TplEl } from "./schema";

const round = (n: number) => Math.round(n * 1000) / 1000;

/**
 * Dev tool (S2.6): turns the open doc into a template JSON. Photos become empty slots;
 * stickers aren't part of the template schema yet and are skipped.
 */
export function templateFromDoc(doc: DumpDoc): Template {
  const { w, h, pages, mode } = doc.format;
  const elements = doc.elements.flatMap((el): TplEl[] => {
    const page = pageOf(el, w, pages);
    const base = {
      page,
      nx: round((el.x - page * w) / w),
      ny: round(el.y / h),
      nw: round(el.width / w),
      nh: round(el.height / h),
      ...(el.rotation ? { rotation: round(el.rotation) } : {}),
    };
    switch (el.type) {
      case "image":
      case "slot":
        return [
          {
            ...base,
            type: "slot",
            ...(el.frame && el.frame !== "none" ? { frame: el.frame } : {}),
            ...(el.radius ? { nradius: round(el.radius / w) } : {}),
          },
        ];
      case "text":
        return [
          {
            ...base,
            type: "text",
            text: el.text,
            font: el.fontFamily,
            nfs: round(el.fontSize / h),
            ...(el.fontStyle ? { fontStyle: el.fontStyle } : {}),
            fill: el.fill,
            align: el.align,
            ...(el.bubble ? { bubble: true } : {}),
          },
        ];
      case "shape":
        return [{ ...base, type: "shape", fill: el.fill, ...(el.radius ? { nradius: round(el.radius / w) } : {}) }];
      case "sticker":
        return [];
    }
  });

  const id = doc.title
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    id: id || "template",
    title: doc.title,
    tier: "free",
    mode,
    pages,
    background: doc.background,
    tags: [],
    elements,
  };
}
