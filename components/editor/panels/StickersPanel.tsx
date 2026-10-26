"use client";

import { addSticker } from "@/lib/addElements";
import { stickerSrc, STICKERS } from "@/lib/stickers";
import { format, useT } from "@/lib/i18n/app";

export function StickersPanel() {
  const s = useT().t.stickers;
  return (
    <ul className="grid grid-cols-3 gap-2">
      {STICKERS.map(({ id, aspect }) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => addSticker(stickerSrc(id), aspect)}
            title={s.names[id]}
            aria-label={format(s.add, { name: s.names[id] })}
            className="grid aspect-square w-full place-items-center rounded-2xl bg-hover p-3 transition hover:scale-[1.03] hover:bg-active"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerSrc(id)} alt="" className="max-h-full max-w-full" draggable={false} />
          </button>
        </li>
      ))}
    </ul>
  );
}
