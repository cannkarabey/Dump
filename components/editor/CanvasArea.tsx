"use client";

import { useUi } from "@/lib/store/ui";

// Placeholder format until the doc store lands in S1.4; Konva replaces the artboard in S1.6.
const FORMAT = { w: 1080, h: 1440 };

export function CanvasArea() {
  const zoom = useUi((s) => s.zoom);

  return (
    // flex + m-auto (not place-items-center) so an artboard taller than the viewport scrolls instead of clipping.
    <main className="relative flex min-h-0 overflow-auto rounded-[var(--radius-panel)] bg-canvas p-8">
      <div
        className="m-auto shrink-0 bg-white shadow-[0_8px_24px_-8px_#0000004d]"
        style={{ width: FORMAT.w * zoom, height: FORMAT.h * zoom }}
        aria-label="Çalışma alanı"
      />
    </main>
  );
}
