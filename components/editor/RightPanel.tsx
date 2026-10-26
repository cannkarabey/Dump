"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { MousePointerClick, Sparkles } from "lucide-react";
import { useUi, type RightTab } from "@/lib/store/ui";
import { cn } from "@/lib/cn";
import { DocProperties } from "./properties/DocProperties";
import { ElementProperties } from "./properties/ElementProperties";
import { AgentPanel } from "@/components/agent/AgentPanel";

export function RightPanel() {
  const tab = useUi((s) => s.rightTab);
  const setTab = useUi((s) => s.setRightTab);
  const selection = useUi((s) => s.selection);

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

      <Tabs.Content value="properties" className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 pb-4">
        {selection.length ? (
          <ElementProperties ids={selection} />
        ) : (
          <>
            <DocProperties />
            <div className="mt-auto flex flex-col items-center gap-2 pt-8 text-center">
              <span className="grid size-10 place-items-center rounded-2xl bg-hover text-muted">
                <MousePointerClick size={18} />
              </span>
              <p className="max-w-56 text-xs text-muted">
                Boyut, döndürme, opaklık ve çerçeve için canvas&apos;ta bir öğeye tıkla.
              </p>
            </div>
          </>
        )}
      </Tabs.Content>

      <Tabs.Content value="assistant" className="flex min-h-0 flex-1 flex-col px-3 pb-3">
        <AgentPanel />
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
