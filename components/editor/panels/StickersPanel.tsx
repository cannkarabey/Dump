"use client";

import { addSticker } from "@/lib/addElements";
import { stickerSrc, STICKERS } from "@/lib/stickers";

export function StickersPanel() {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {STICKERS.map((s) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => addSticker(stickerSrc(s.id), s.aspect)}
            title={s.label}
            aria-label={`${s.label} sticker'ı ekle`}
            className="grid aspect-square w-full place-items-center rounded-2xl bg-hover p-3 transition hover:scale-[1.03] hover:bg-active"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerSrc(s.id)} alt="" className="max-h-full max-w-full" draggable={false} />
          </button>
        </li>
      ))}
    </ul>
  );
}
