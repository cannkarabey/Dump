"use client";

import dynamic from "next/dynamic";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUi } from "@/lib/store/ui";
import { useDoc } from "@/lib/store/doc";
import { useT } from "@/lib/i18n/app";

function CanvasLoading() {
  return <div className="grid size-full place-items-center text-sm text-muted">{useT().t.editor.loadingCanvas}</div>;
}

// Konva touches `window`, so the stage only ever renders in the browser.
const CanvasStage = dynamic(() => import("./canvas/CanvasStage"), { ssr: false, loading: () => <CanvasLoading /> });

export function CanvasArea() {
  const notice = useUi((s) => s.notice);
  const showNotice = useUi((s) => s.showNotice);
  const empty = useDoc((s) => s.doc.elements.length === 0);
  const { t } = useT();

  return (
    <main className="relative min-h-0 overflow-hidden rounded-[var(--radius-panel)] bg-canvas">
      <CanvasStage />
      {empty && (
        // The whole canvas is already a drop target; this only explains it.
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 rounded-3xl bg-card/90 px-8 py-6 text-center shadow-xl backdrop-blur">
            <span className="grid size-12 place-items-center rounded-full bg-accent-soft text-accent">
              <ImagePlus size={22} />
            </span>
            <p className="text-base font-semibold">{t.editor.dropTitle}</p>
            <p className="max-w-60 text-sm text-muted">{t.editor.dropText}</p>
            <div className="pointer-events-auto flex gap-2">
              <Button size="sm" variant="accent" onClick={() => useUi.getState().setActivePanel("upload")}>
                {t.editor.addPhotos}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => useUi.getState().setActivePanel("templates")}>
                {t.editor.templates}
              </Button>
            </div>
          </div>
        </div>
      )}
      {notice && (
        <div
          role="status"
          className="absolute bottom-4 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-full bg-card px-4 py-2 text-sm shadow-lg"
        >
          {notice}
          <button type="button" onClick={() => showNotice(null)} className="text-muted hover:text-fg">
            {t.common.close}
          </button>
        </div>
      )}
    </main>
  );
}
