import { useAssets } from "./store/assets";
import { useDoc } from "./store/doc";
import { useTier } from "./store/tier";
import { useUi } from "./store/ui";
import { placeAssets } from "./placement";
import { TIER_LIMITS } from "./tiers";
import type { Asset } from "./types";

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
export async function importFiles(files: File[]) {
  const images = files.filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
  if (!images.length) return;

  const ui = useUi.getState();
  const { maxPhotos } = TIER_LIMITS[useTier.getState().tier];
  const room = maxPhotos - useAssets.getState().order.length;
  const accepted = images.slice(0, Math.max(0, room));
  const overLimit = accepted.length < images.length;
  if (overLimit) ui.openPaywall("maxPhotos");
  const limitNotice = overLimit ? `Planında en fazla ${maxPhotos} fotoğraf var; fazlası eklenmedi.` : null;
  if (!accepted.length) {
    ui.showNotice(limitNotice);
    return;
  }

  ui.showNotice(`${accepted.length} fotoğraf hazırlanıyor…`);
  const { added, failed } = await useAssets.getState().addFiles(accepted);
  const failedNotice = failed.length
    ? `Açılamayan dosyalar: ${failed.join(", ")}. HEIC dosyalarını JPEG olarak dışa aktarıp tekrar dene.`
    : null;
  ui.showNotice([limitNotice, failedNotice].filter(Boolean).join(" ") || null);
  if (added.length) placeOnCanvas(added);
}
