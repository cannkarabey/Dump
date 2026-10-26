import { pageOf } from "@/lib/store/doc";
import { presetLabel } from "@/lib/presets";
import type { Asset, DumpDoc, El, ImageEl, SlotEl } from "@/lib/types";

type PhotoEl = (ImageEl | SlotEl) & { assetId: string };

/** Photo elements in carousel reading order: page, then top-to-bottom, then left-to-right. */
export function photosInReadingOrder(doc: DumpDoc): PhotoEl[] {
  const { w, pages } = doc.format;
  return doc.elements
    .filter((el): el is PhotoEl => (el.type === "image" || el.type === "slot") && Boolean(el.assetId))
    .map((el) => ({ el, page: pageOf(el, w, pages) }))
    .sort((a, b) => a.page - b.page || a.el.y - b.el.y || a.el.x - b.el.x)
    .map(({ el }) => el);
}

/**
 * Short refs ("f1", "f2"…) follow upload order, so they stay stable while the assistant
 * reorders photos during a conversation.
 */
export function assetRefs(order: string[]) {
  const toRef = new Map(order.map((id, i) => [id, `f${i + 1}`]));
  const toAsset = new Map(order.map((id, i) => [`f${i + 1}`, id]));
  return { toRef, toAsset };
}

function orientation(a: Asset) {
  const r = a.w / a.h;
  return r > 1.15 ? "yatay" : r < 0.87 ? "dikey" : "kare";
}

function describeText(el: Extract<El, { type: "text" }>, page: number) {
  return { sayfa: page + 1, metin: el.text, stil: el.bubble ? "etiket balonu" : el.fontFamily };
}

/**
 * Compact JSON the model sees with every message. Coordinates are left out on purpose:
 * the model reasons about order and content, and the editor owns geometry.
 */
export function summarizeDump(doc: DumpDoc, assets: Record<string, Asset>, order: string[]): string {
  const { toRef } = assetRefs(order);
  const { w, pages } = doc.format;
  const placed = photosInReadingOrder(doc);
  const placedIds = new Set(placed.map((el) => el.assetId));
  const photo = (id: string) => {
    const a = assets[id];
    return {
      ref: toRef.get(id),
      tarih: a?.takenAt ? new Date(a.takenAt).toISOString().slice(0, 10) : null,
      renk: a?.dominant,
      yon: a ? orientation(a) : undefined,
    };
  };

  return JSON.stringify({
    baslik: doc.title,
    format: `${presetLabel(doc.format.w, doc.format.h)} ${doc.format.w}x${doc.format.h}`,
    tur: doc.format.mode === "carousel" ? "carousel" : "tek post",
    sayfaSayisi: pages,
    arkaPlan: doc.background,
    sayfalar: Array.from({ length: pages }, (_, p) => ({
      sayfa: p + 1,
      fotograflar: placed.filter((el) => pageOf(el, w, pages) === p).map((el) => photo(el.assetId)),
      bosKutu: doc.elements.filter((el) => el.type === "slot" && !el.assetId && pageOf(el, w, pages) === p).length,
    })),
    metinler: doc.elements.flatMap((el) => (el.type === "text" ? [describeText(el, pageOf(el, w, pages))] : [])),
    kullanilmayanFotograflar: order.filter((id) => !placedIds.has(id)).map(photo),
  });
}
