"use client";

import { useUi, type LeftPanel } from "@/lib/store/ui";
import { RAIL_ITEMS } from "./LeftRail";
import { UploadPanel } from "./panels/UploadPanel";
import { PlaceholderPanel } from "./panels/PlaceholderPanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { LayersPanel } from "./panels/LayersPanel";

const PANELS: Record<LeftPanel, () => React.ReactNode> = {
  upload: () => <UploadPanel />,
  templates: () => <TemplatesPanel />,
  text: () => <PlaceholderPanel task="S1.13" text="Metin stilleri burada olacak." />,
  stickers: () => <PlaceholderPanel task="S1.13" text="Sticker'lar burada olacak." />,
  layers: () => <LayersPanel />,
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
