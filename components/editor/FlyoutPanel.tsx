"use client";

import { useUi, type LeftPanel } from "@/lib/store/ui";
import { useT } from "@/lib/i18n/app";
import { UploadPanel } from "./panels/UploadPanel";
import { TextPanel } from "./panels/TextPanel";
import { StickersPanel } from "./panels/StickersPanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { LayersPanel } from "./panels/LayersPanel";
import { ToolsPanel } from "./panels/ToolsPanel";
import { FiltersPanel } from "./panels/FiltersPanel";
import { DrawPanel } from "./panels/DrawPanel";
import { SettingsPanel } from "./panels/SettingsPanel";

const PANELS: Record<LeftPanel, () => React.ReactNode> = {
  upload: () => <UploadPanel />,
  templates: () => <TemplatesPanel />,
  text: () => <TextPanel />,
  stickers: () => <StickersPanel />,
  layers: () => <LayersPanel />,
  tools: () => <ToolsPanel />,
  filters: () => <FiltersPanel />,
  draw: () => <DrawPanel />,
  settings: () => <SettingsPanel />,
};

export function FlyoutPanel() {
  const active = useUi((s) => s.activePanel);
  const label = useT().t.editor.panels[active];

  return (
    <aside className="flex min-h-0 flex-col rounded-[var(--radius-panel)] bg-panel">
      <h2 className="px-5 pt-5 pb-3 text-xl font-semibold tracking-tight">{label}</h2>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{PANELS[active]()}</div>
    </aside>
  );
}
