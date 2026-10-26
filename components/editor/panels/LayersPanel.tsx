"use client";

import { ImageIcon, Lock, Square, Sticker, Type, type LucideIcon } from "lucide-react";
import { useDoc, pageOf } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useUi } from "@/lib/store/ui";
import type { El } from "@/lib/types";
import { cn } from "@/lib/cn";

const ICONS: Record<El["type"], LucideIcon> = {
  image: ImageIcon,
  slot: Square,
  text: Type,
  sticker: Sticker,
  shape: Square,
};

function label(el: El, fileName?: string) {
  switch (el.type) {
    case "text":
      return el.text.split("\n")[0] || "Metin";
    case "image":
      return fileName ?? "Fotoğraf";
    case "slot":
      return el.assetId ? (fileName ?? "Kutu") : "Boş kutu";
    case "sticker":
      return "Sticker";
    case "shape":
      return "Şekil";
  }
}

/** Top-most first, like every design tool. */
export function LayersPanel() {
  const elements = useDoc((s) => s.doc.elements);
  const format = useDoc((s) => s.doc.format);
  const assets = useAssets((s) => s.assets);
  const selection = useUi((s) => s.selection);

  if (!elements.length) {
    return <p className="rounded-2xl bg-hover p-4 text-sm text-muted">Henüz katman yok. Fotoğraf ya da şablon ekle.</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {[...elements].reverse().map((el) => {
        const Icon = ICONS[el.type];
        const asset = "assetId" in el && el.assetId ? assets[el.assetId] : undefined;
        const selected = selection.includes(el.id);
        return (
          <li key={el.id}>
            <button
              type="button"
              onClick={(e) => {
                const ui = useUi.getState();
                ui.setSelection(
                  e.shiftKey ? (selected ? selection.filter((id) => id !== el.id) : [...selection, el.id]) : [el.id],
                );
                ui.setActivePage(pageOf(el, format.w, format.pages));
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2 py-1.5 text-left text-sm transition",
                selected ? "bg-active" : "hover:bg-hover",
              )}
            >
              {asset ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.url} alt="" className="size-8 shrink-0 rounded-md object-cover" />
              ) : (
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-hover text-muted">
                  <Icon size={15} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{label(el, asset?.fileName)}</span>
              <span className="text-[11px] text-muted tabular-nums">s{pageOf(el, format.w, format.pages) + 1}</span>
              {el.locked && <Lock size={13} className="text-muted" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
