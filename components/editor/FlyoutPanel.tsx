"use client";

import { useUi, type LeftPanel } from "@/lib/store/ui";
import { RAIL_ITEMS } from "./LeftRail";
import { UploadPanel } from "./panels/UploadPanel";
import { PlaceholderPanel } from "./panels/PlaceholderPanel";

const PANELS: Record<LeftPanel, () => React.ReactNode> = {
  upload: () => <UploadPanel />,
  templates: () => <PlaceholderPanel task="S1.8" text="Şablonlar burada listelenecek." />,
  text: () => <PlaceholderPanel task="S1.13" text="Metin stilleri burada olacak." />,
  stickers: () => <PlaceholderPanel task="S1.13" text="Sticker'lar burada olacak." />,
  layers: () => <PlaceholderPanel task="S1.9" text="Katman listesi burada olacak." />,
};

export function FlyoutPanel() {
  const active = useUi((s) => s.activePanel);
  const label = RAIL_ITEMS.find((i) => i.id === active)?.label;

  return (
    <aside className="flex min-h-0 flex-col rounded-[var(--radius-panel)] bg-panel">
      <h2 className="px-5 pt-5 pb-3 text-xl font-semibold tracking-tight">{label}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{PANELS[active]()}</div>
    </aside>
  );
}
