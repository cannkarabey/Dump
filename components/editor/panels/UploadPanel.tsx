"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useAssets } from "@/lib/store/assets";
import { useLimits } from "@/lib/store/tier";
import { importFiles, placeOnCanvas } from "@/lib/importFiles";
import { cn } from "@/lib/cn";

export const ASSET_DRAG_TYPE = "application/x-dump-asset";

export function UploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const order = useAssets((s) => s.order);
  const assets = useAssets((s) => s.assets);
  const { maxPhotos } = useLimits();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void importFiles([...e.dataTransfer.files]);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition",
          dragOver ? "border-accent bg-accent-soft" : "border-transparent bg-hover hover:bg-active",
        )}
      >
        <span className="grid size-14 place-items-center rounded-full bg-border-strong">
          <Plus size={26} />
        </span>
        <span className="text-base font-semibold">Fotoğraf ekle</span>
        <span className="text-sm text-muted">Tıkla, sürükle bırak ya da yapıştır</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        multiple
        hidden
        onChange={(e) => {
          void importFiles([...(e.target.files ?? [])]);
          e.target.value = "";
        }}
      />

      {order.length > 0 && (
        <>
          <p className="flex justify-between text-xs text-muted">
            <span>Yüklenenler</span>
            <span className="tabular-nums">
              {order.length}
              {Number.isFinite(maxPhotos) ? ` / ${maxPhotos}` : ""}
            </span>
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {order.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(ASSET_DRAG_TYPE, id);
                    e.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => placeOnCanvas([assets[id]])}
                  title={`${assets[id].fileName} — canvas'a eklemek için tıkla veya sürükle`}
                  className="block aspect-square w-full overflow-hidden rounded-lg bg-hover"
                >
                  {/* Object URLs aren't optimizable by next/image. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={assets[id].url} alt={assets[id].fileName} className="size-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
