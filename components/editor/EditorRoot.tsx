"use client";

import { use, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { useTier } from "@/lib/store/tier";
import { useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { useEditorHotkeys } from "@/hooks/useEditorHotkeys";
import { TopBar } from "./TopBar";
import { LeftRail } from "./LeftRail";
import { FlyoutPanel } from "./FlyoutPanel";
import { CanvasArea } from "./CanvasArea";
import { RightPanel } from "./RightPanel";
import { NewDumpModal } from "./NewDumpModal";
import { PaywallModal } from "./PaywallModal";

export function EditorRoot({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  useEditorHotkeys();

  // Tier lives in localStorage; rehydrate after mount to avoid a hydration mismatch.
  useEffect(() => {
    void useTier.persist.rehydrate();
  }, []);

  // `/app/editor/new`, or an id this tab doesn't have in memory (persistence lands in S2.4): ask for a format.
  useEffect(() => {
    if (id === "new" || useDoc.getState().doc.id !== id) useUi.getState().openModal("newDump");
  }, [id]);

  return (
    <TooltipProvider>
      <div
        data-dump-id={id}
        className="grid h-dvh grid-cols-[72px_minmax(220px,320px)_minmax(0,1fr)_minmax(260px,340px)] grid-rows-[56px_1fr] gap-2 overflow-hidden bg-bg p-2 pt-0"
      >
        <TopBar />
        <LeftRail />
        <FlyoutPanel />
        <CanvasArea />
        <RightPanel />
      </div>
      <NewDumpModal />
      <PaywallModal />
    </TooltipProvider>
  );
}
