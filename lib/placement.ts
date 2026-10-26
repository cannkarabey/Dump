import { nanoid } from "nanoid";
import { fitInside } from "./geometry";
import type { Asset, DumpDoc, El, ImageEl, SlotEl } from "./types";

const STAGGER = 24;

export interface Placement {
  /** Patches for empty slots that received an asset. */
  slotFills: { id: string; patch: Pick<SlotEl, "assetId"> }[];
  /** New image elements for assets that didn't fit into slots. */
  newImages: ImageEl[];
}

/** Fills empty slots in document order first, then drops the rest onto `page`, centered and staggered. */
export function placeAssets(doc: DumpDoc, assets: Asset[], page: number): Placement {
  const emptySlots = doc.elements.filter((el): el is SlotEl => el.type === "slot" && !el.assetId);
  const slotFills = emptySlots
    .slice(0, assets.length)
    .map((slot, i) => ({ id: slot.id, patch: { assetId: assets[i].id } }));

  const { w, h } = doc.format;
  const newImages = assets.slice(slotFills.length).map((asset, i): ImageEl => {
    const size = fitInside(asset.w, asset.h, w * 0.6, h * 0.6);
    return {
      id: nanoid(10),
      type: "image",
      assetId: asset.id,
      x: page * w + (w - size.width) / 2 + i * STAGGER,
      y: (h - size.height) / 2 + i * STAGGER,
      width: size.width,
      height: size.height,
      rotation: 0,
      opacity: 1,
    };
  });

  return { slotFills, newImages };
}

/** Asset ids referenced by the doc; used to count photos against the tier limit. */
export function usedAssetIds(elements: El[]): Set<string> {
  const ids = new Set<string>();
  for (const el of elements) {
    if ((el.type === "image" || el.type === "slot") && el.assetId) ids.add(el.assetId);
  }
  return ids;
}
