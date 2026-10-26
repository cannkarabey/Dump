"use client";

import dynamic from "next/dynamic";
import { useUi } from "@/lib/store/ui";

// Konva touches `window`, so the stage only ever renders in the browser.
const CanvasStage = dynamic(() => import("./canvas/CanvasStage"), {
  ssr: false,
  loading: () => <div className="grid size-full place-items-center text-sm text-muted">Canvas yükleniyor…</div>,
});

export function CanvasArea() {
  const notice = useUi((s) => s.notice);
  const showNotice = useUi((s) => s.showNotice);

  return (
    <main className="relative min-h-0 overflow-hidden rounded-[var(--radius-panel)] bg-canvas">
      <CanvasStage />
      {notice && (
        <div
          role="status"
          className="absolute bottom-4 left-1/2 flex max-w-[90%] -translate-x-1/2 items-center gap-3 rounded-full bg-card px-4 py-2 text-sm shadow-lg"
        >
          {notice}
          <button type="button" onClick={() => showNotice(null)} className="text-muted hover:text-fg">
            Kapat
          </button>
        </div>
      )}
    </main>
  );
}
