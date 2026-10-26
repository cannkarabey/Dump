"use client";

import { use, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { useTier } from "@/lib/store/tier";
import { TopBar } from "./TopBar";
import { LeftRail } from "./LeftRail";
import { FlyoutPanel } from "./FlyoutPanel";
import { CanvasArea } from "./CanvasArea";
import { RightPanel } from "./RightPanel";

export function EditorRoot({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  // Tier lives in localStorage; rehydrate after mount to avoid a hydration mismatch.
  useEffect(() => {
    void useTier.persist.rehydrate();
  }, []);

  return (
    <TooltipProvider>
      <div
        data-dump-id={id}
        className="grid h-dvh grid-cols-[72px_320px_1fr_340px] grid-rows-[56px_1fr] gap-2 overflow-hidden bg-bg p-2 pt-0"
      >
        <TopBar />
        <LeftRail />
        <FlyoutPanel />
        <CanvasArea />
        <RightPanel />
      </div>
    </TooltipProvider>
  );
}
