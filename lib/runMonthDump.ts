import { buildMonthDump } from "./monthDump";
import { useAssets } from "./store/assets";
import { useDoc } from "./store/doc";
import { useTier } from "./store/tier";
import { useUi } from "./store/ui";
import { tierAllows, TIER_LIMITS } from "./tiers";

/** TopBar "Ayın Dump'ı" button: rebuilds the doc as a month dump in one undo step. */
export function runMonthDump() {
  const ui = useUi.getState();
  const { assets, order } = useAssets.getState();
  if (order.length < 2) {
    ui.setActivePanel("upload");
    ui.showNotice("Ayın dump'ı için en az 2 fotoğraf yükle.");
    return;
  }
  const { doc, replaceDoc } = useDoc.getState();
  if (doc.elements.length && !window.confirm("Mevcut düzen ayın dump'ı ile değişecek. Devam edilsin mi? (⌘Z ile geri alabilirsin)")) {
    return;
  }
  const tier = useTier.getState().tier;
  const result = buildMonthDump(
    doc,
    order.map((id) => assets[id]),
    { maxPages: TIER_LIMITS[tier].maxPages, stamp: tierAllows(tier, "stamp") },
  );
  replaceDoc(result.doc);
  ui.setSelection([]);
  ui.setActivePage(0);
  ui.requestFit();
  ui.showNotice(
    result.dropped
      ? `${result.dropped} fotoğraf sayfa limitine sığmadı. Daha fazla sayfa için planını yükselt.`
      : null,
  );
}
