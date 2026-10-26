"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { MousePointerClick, Smartphone, Sparkles } from "lucide-react";
import { useUi, type RightTab } from "@/lib/store/ui";
import { useDoc } from "@/lib/store/doc";
import { presetLabel } from "@/lib/presets";
import { cn } from "@/lib/cn";

export function RightPanel() {
  const tab = useUi((s) => s.rightTab);
  const setTab = useUi((s) => s.setRightTab);
  const format = useDoc((s) => s.doc.format);

  return (
    <Tabs.Root
      value={tab}
      onValueChange={(v) => setTab(v as RightTab)}
      className="flex min-h-0 flex-col rounded-[var(--radius-panel)] bg-panel"
    >
      <Tabs.List aria-label="Sağ panel" className="m-3 grid grid-cols-2 rounded-full bg-hover p-1 text-[13px]">
        <TabTrigger value="properties">Özellikler</TabTrigger>
        <TabTrigger value="assistant">
          <Sparkles size={14} className="text-accent" />
          Asistan
        </TabTrigger>
      </Tabs.List>

      <Tabs.Content value="properties" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4">
        <section className="rounded-2xl bg-hover p-3">
          <h3 className="mb-2 text-sm font-semibold">Canvas</h3>
          <div className="flex items-center gap-3 rounded-xl bg-card p-3">
            <Smartphone size={18} className="text-muted" />
            <div>
              <p className="text-sm font-medium">{presetLabel(format.w, format.h)}</p>
              <p className="text-xs text-muted tabular-nums">
                {format.w} × {format.h} px
                {format.mode === "carousel" && ` · ${format.pages} sayfa`}
              </p>
            </div>
          </div>
        </section>

        <div className="mt-auto flex flex-col items-center gap-2 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-hover text-muted">
            <MousePointerClick size={20} />
          </span>
          <p className="text-sm font-semibold">Hiçbir şey seçili değil</p>
          <p className="max-w-56 text-xs text-muted">
            Boyut, döndürme, opaklık ve daha fazlasını düzenlemek için canvas&apos;ta bir öğeye tıkla.
          </p>
        </div>
      </Tabs.Content>

      <Tabs.Content value="assistant" className="flex min-h-0 flex-1 flex-col px-4 pb-4">
        <div className="mt-auto mb-auto flex flex-col items-center gap-2 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
            <Sparkles size={20} />
          </span>
          <p className="text-sm font-semibold">AI Asistan</p>
          <p className="max-w-60 text-xs text-muted">
            Dump&apos;ını yorumlayacak, sıralama ve caption önerecek. Sprint 2&apos;de geliyor.
          </p>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}

function TabTrigger({ value, children }: { value: RightTab; children: React.ReactNode }) {
  return (
    <Tabs.Trigger
      value={value}
      className={cn(
        "flex h-8 items-center justify-center gap-1.5 rounded-full font-medium text-muted transition",
        "data-[state=active]:bg-active data-[state=active]:text-fg data-[state=active]:shadow-sm",
      )}
    >
      {children}
    </Tabs.Trigger>
  );
}
