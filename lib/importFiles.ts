import { useAssets } from "./store/assets";
import { useDoc } from "./store/doc";
import { useTier } from "./store/tier";
import { useUi } from "./store/ui";
import { placeAssets } from "./placement";
import { TIER_LIMITS } from "./tiers";
import type { Asset } from "./types";
import { at, format } from "./i18n/appDictionary";

/** Puts already-imported assets onto the canvas as one undo step and selects the new images. */
export function placeOnCanvas(assets: Asset[]) {
  const { doc, addElements, updateElements } = useDoc.getState();
  const page = Math.min(useUi.getState().activePage, doc.format.pages - 1);
  const { slotFills, newImages } = placeAssets(doc, assets, page);

  if (slotFills.length && newImages.length) {
    const filled = new Map(slotFills.map((f) => [f.id, f.patch]));
    useDoc.getState().replaceDoc({
      ...doc,
      elements: [
        ...doc.elements.map((el) => (filled.has(el.id) ? { ...el, ...filled.get(el.id) } : el)),
        ...newImages,
      ],
    });
  } else if (slotFills.length) {
    updateElements(slotFills);
  } else {
    addElements(newImages);
  }
  useUi.getState().setSelection(newImages.map((el) => el.id));
}

/** Entry point for drop, paste and the file picker: enforces the tier's photo limit, imports and places. */
export async function importFiles(files: File[], opts: { slotId?: string } = {}) {
  const images = files.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
  if (!images.length) return;

  const ui = useUi.getState();
  const { maxPhotos } = TIER_LIMITS[useTier.getState().tier];
  const room = maxPhotos - useAssets.getState().order.length;
  const accepted = images.slice(0, Math.max(0, room));
  const overLimit = accepted.length < images.length;
  if (overLimit) ui.openPaywall("maxPhotos");
  const t = at().notices;
  const limitNotice = overLimit ? format(t.photoLimit, { n: maxPhotos }) : null;
  if (!accepted.length) {
    ui.showNotice(limitNotice);
    return;
  }

  ui.showNotice(format(t.preparing, { n: accepted.length }));
  const { added, failed } = await useAssets.getState().addFiles(accepted);
  const failedNotice = failed.length
    ? format(t.failed, { files: failed.join(", ") })
    : null;
  ui.showNotice([limitNotice, failedNotice].filter(Boolean).join(" ") || null);
  if (!added.length) return;
  if (opts.slotId) {
    // Double-clicked frame gets the first photo; any others are placed as usual.
    useDoc.getState().updateElement(opts.slotId, { assetId: added[0].id });
    useUi.getState().setSelection([opts.slotId]);
    if (added.length > 1) placeOnCanvas(added.slice(1));
    return;
  }
  placeOnCanvas(added);
}

/** Opens the system file picker; used by empty frames (double-click) and the upload panel. */
export function pickFiles(opts: { slotId?: string; multiple?: boolean } = {}) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,.heic,.heif";
  input.multiple = opts.multiple ?? !opts.slotId;
  input.onchange = () => void importFiles([...(input.files ?? [])], { slotId: opts.slotId });
  input.click();
}
