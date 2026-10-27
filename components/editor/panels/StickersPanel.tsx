"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { addSticker } from "@/lib/addElements";
import { STICKER_PACKS, type StickerPack } from "@/lib/stickers";
import { useTier } from "@/lib/store/tier";
import { useUi } from "@/lib/store/ui";
import { tierAllows } from "@/lib/tiers";
import { Crown } from "@/components/ui/Crown";
import { format, useT } from "@/lib/i18n/app";
import { normalizeQuery, SearchField } from "./SearchField";

export function StickersPanel() {
  const { t } = useT();
  const s = t.stickers;
  const canPro = useTier((st) => tierAllows(st.tier, "premiumStickers"));
  const [open, setOpen] = useState<StickerPack | null>(null);
  const [query, setQuery] = useState("");

  const packs = useMemo(() => {
    const q = normalizeQuery(query.trim());
    return STICKER_PACKS.filter((p) => !q || normalizeQuery(`${s.packs[p.id]} ${s.tags[p.id]}`).includes(q));
  }, [query, s]);

  const choose = (pack: StickerPack) => {
    if (pack.pro && !canPro) useUi.getState().openPaywall("premiumStickers");
    else setOpen(pack);
  };

  if (open) {
    return (
      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => setOpen(null)} className="flex items-center gap-2 text-left">
          <span className="grid size-8 place-items-center rounded-full bg-hover">
            <ChevronLeft size={16} aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold">{s.packs[open.id]}</span>
            <span className="block text-xs text-muted">{format(s.count, { n: open.items.length })}</span>
          </span>
          <span className="sr-only">{s.back}</span>
        </button>
        <ul className="grid grid-cols-3 gap-2">
          {open.items.map((item) => (
            <li key={item.src}>
              <button
                type="button"
                onClick={() => addSticker(item.src, item.aspect)}
                aria-label={format(s.add, { name: s.packs[open.id] })}
                className="grid aspect-square w-full place-items-center rounded-2xl bg-hover p-2.5 transition hover:scale-[1.03] hover:bg-active"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.src} alt="" loading="lazy" className="max-h-full max-w-full" draggable={false} />
              </button>
            </li>
          ))}
        </ul>
        {open.id !== "doodles" && <p className="px-1 text-[11px] text-muted">{s.credit}</p>}
      </div>
    );
  }

  const section = (title: React.ReactNode, list: StickerPack[]) =>
    list.length > 0 && (
      <section className="flex flex-col gap-2">
        <h3 className="flex items-center gap-1.5 px-1 text-sm font-semibold">{title}</h3>
        <ul className="grid grid-cols-2 gap-2">
          {list.map((p) => (
            <li key={p.id}>
              <button type="button" onClick={() => choose(p)} className="relative w-full rounded-2xl bg-hover p-3 text-left transition hover:bg-active">
                {p.pro && !canPro && <Crown className="absolute top-2.5 right-2.5" />}
                <span className="flex h-14 items-center -space-x-3">
                  {p.items.slice(0, 3).map((item, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={item.src} alt="" loading="lazy" className="size-12 object-contain drop-shadow" style={{ rotate: `${(i - 1) * 8}deg` }} />
                  ))}
                </span>
                <span className="mt-2 block text-[13px] leading-tight font-semibold">{s.packs[p.id]}</span>
                <span className="block text-[11px] text-muted">{format(s.count, { n: p.items.length })}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="flex flex-col gap-4">
      <SearchField value={query} onChange={setQuery} placeholder={s.search} />
      {!packs.length && <p className="px-1 text-sm text-muted">{s.noResults}</p>}
      {section(s.free, packs.filter((p) => !p.pro))}
      {section(
        <>
          {s.pro} <Crown />
        </>,
        packs.filter((p) => p.pro),
      )}
    </div>
  );
}
