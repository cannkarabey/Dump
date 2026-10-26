"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { useTier } from "@/lib/store/tier";
import { createDoc, useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { useAssets } from "@/lib/store/assets";
import { loadDump } from "@/lib/persist";
import { getTemplate } from "@/lib/templates";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { monthLabel } from "@/lib/month";
import { TIER_LIMITS } from "@/lib/tiers";
import { useEditorHotkeys } from "@/hooks/useEditorHotkeys";
import { useAutosave } from "@/hooks/useAutosave";
import { useAccountSync } from "@/hooks/useAccountSync";
import { TopBar } from "./TopBar";
import { LeftRail } from "./LeftRail";
import { FlyoutPanel } from "./FlyoutPanel";
import { CanvasArea } from "./CanvasArea";
import { RightPanel } from "./RightPanel";
import { NewDumpModal } from "./NewDumpModal";
import { PaywallModal } from "./PaywallModal";
import { ExportDialog } from "./ExportDialog";

/** Starts a fresh doc laid out from a gallery template; slots stay empty for the user's photos. */
function startFromTemplate(templateId: string): boolean {
  const t = getTemplate(templateId);
  if (!t) return false;
  const tier = useTier.getState().tier;
  const now = new Date();
  const { doc } = applyTemplate(t, createDoc(), [], {
    maxPages: TIER_LIMITS[tier].maxPages,
    vars: { month: monthLabel(now), year: String(now.getFullYear()) },
  });
  useDoc.getState().loadDoc({ ...doc, title: t.title });
  useAssets.getState().replaceAll([]);
  const ui = useUi.getState();
  ui.setSelection([]);
  ui.setActivePage(0);
  ui.setActivePanel("upload");
  ui.requestFit();
  return true;
}

export function EditorRoot({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const templateId = useSearchParams().get("template");
  // Only a saved dump that isn't already in memory needs a loading state.
  const [loading, setLoading] = useState(() => id !== "new" && useDoc.getState().doc.id !== id);
  useEditorHotkeys();
  useAutosave(id);
  useAccountSync();

  // Resolve what to show: the doc already in memory, a saved dump, a template start, or the format picker.
  useEffect(() => {
    const ui = useUi.getState();
    if (id === "new") {
      if (!(templateId && startFromTemplate(templateId))) ui.openModal("newDump");
      return;
    }
    if (useDoc.getState().doc.id === id) return;
    let cancelled = false;
    void loadDump(id)
      .then((saved) => {
        if (cancelled) return;
        if (saved) {
          useDoc.getState().loadDoc(saved.doc);
          useAssets.getState().replaceAll(saved.assets);
          ui.setSelection([]);
          ui.setActivePage(0);
          ui.requestFit();
        } else {
          ui.openModal("newDump");
        }
      })
      .catch((e) => {
        console.error(e);
        if (!cancelled) ui.openModal("newDump");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, templateId]);

  return (
    <TooltipProvider>
      <div
        data-dump-id={id}
        className="grid h-dvh grid-cols-[72px_minmax(220px,320px)_minmax(0,1fr)_minmax(260px,340px)] grid-rows-[56px_1fr] gap-2 overflow-hidden bg-bg p-2 pt-0"
      >
        <TopBar />
        <LeftRail />
        <FlyoutPanel />
        {loading ? (
          <div className="grid place-items-center rounded-[var(--radius-panel)] bg-canvas text-sm text-muted">
            Dump yükleniyor…
          </div>
        ) : (
          <CanvasArea />
        )}
        <RightPanel />
      </div>
      <NewDumpModal />
      <PaywallModal />
      <ExportDialog />
    </TooltipProvider>
  );
}
