"use client";

import { Plus } from "lucide-react";

/** Drop/paste/file-picker logic lands in S1.5. */
export function UploadPanel() {
  return (
    <button
      type="button"
      disabled
      className="flex w-full flex-col items-center gap-3 rounded-2xl bg-hover px-4 py-8 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-border-strong">
        <Plus size={26} />
      </span>
      <span className="text-base font-semibold">Fotoğraf ekle</span>
      <span className="text-sm text-muted">Tıkla, sürükle bırak ya da yapıştır</span>
    </button>
  );
}
