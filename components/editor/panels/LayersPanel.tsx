"use client";

import { ImageIcon, Lock, PenLine, Square, Sticker, Type, type LucideIcon } from "lucide-react";
import { useDoc, pageOf } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useUi } from "@/lib/store/ui";
import type { El } from "@/lib/types";
import { cn } from "@/lib/cn";
import { format as fill, useT } from "@/lib/i18n/app";
import type { AppDict } from "@/lib/i18n/appDictionary";

const ICONS: Record<El["type"], LucideIcon> = {
  image: ImageIcon,
  slot: Square,
  text: Type,
  sticker: Sticker,
  shape: Square,
  draw: PenLine,
};

function label(el: El, l: AppDict["layers"], fileName?: string) {
  switch (el.type) {
    case "text":
      return el.text.split("\n")[0] || l.text;
    case "image":
      return fileName ?? l.photo;
    case "slot":
      return el.assetId ? (fileName ?? l.slot) : l.emptySlot;
    case "sticker":
      return el.widget ? l.widget : l.sticker;
    case "draw":
      return l.drawing;
    case "shape":
      return l.shape;
  }
}

/** Top-most first, like every design tool. */
export function LayersPanel() {
  const elements = useDoc((s) => s.doc.elements);
  const format = useDoc((s) => s.doc.format);
  const assets = useAssets((s) => s.assets);
  const selection = useUi((s) => s.selection);
  const l = useT().t.layers;

  if (!elements.length) {
    return <p className="rounded-2xl bg-hover p-4 text-sm text-muted">{l.empty}</p>;
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
              <span className="min-w-0 flex-1 truncate">{label(el, l, asset?.fileName)}</span>
              <span className="text-[11px] text-muted tabular-nums">{fill(l.pageShort, { n: pageOf(el, format.w, format.pages) + 1 })}</span>
              {el.locked && <Lock size={13} className="text-muted" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
