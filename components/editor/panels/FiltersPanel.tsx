"use client";

import { useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { useAssets } from "@/lib/store/assets";
import { FILTERS, type FilterDef } from "@/lib/filters";
import type { FilterId, ImageEl, SlotEl } from "@/lib/types";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/app";

const GROUPS: FilterDef["group"][] = ["basic", "color", "effect"];

export function FiltersPanel() {
  const { t } = useT();
  const f = t.filters;
  const selection = useUi((s) => s.selection);
  const elements = useDoc((s) => s.doc.elements);
  const assets = useAssets((s) => s.assets);
  const photos = elements.filter(
    (el): el is ImageEl | SlotEl => selection.includes(el.id) && (el.type === "image" || el.type === "slot") && Boolean(el.assetId),
  );
  const current = photos[0]?.filter ?? "none";
  const thumb = photos[0]?.assetId ? assets[photos[0].assetId]?.url : undefined;

  const apply = (id: FilterId) =>
    useDoc.getState().updateElements(photos.map((p) => ({ id: p.id, patch: { filter: id === "none" ? undefined : id } })));

  return (
    <div className="flex flex-col gap-4">
      {photos.length ? (
        <p className="px-1 text-xs text-muted">{format(f.applied, { n: photos.length })}</p>
      ) : (
        <p className="rounded-2xl bg-hover p-3 text-sm text-muted">{f.selectPhoto}</p>
      )}
      {GROUPS.map((g) => (
        <section key={g} className="flex flex-col gap-2">
          <h3 className="px-1 text-sm font-semibold">{f.groups[g]}</h3>
          <ul className="grid grid-cols-3 gap-2">
            {FILTERS.filter((x) => x.group === g).map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  disabled={!photos.length}
                  aria-pressed={photos.length > 0 && current === x.id}
                  onClick={() => apply(x.id)}
                  className={cn(
                    "w-full rounded-2xl bg-hover p-1.5 text-center transition hover:bg-active disabled:opacity-50",
                    photos.length > 0 && current === x.id && "ring-2 ring-accent",
                  )}
                >
                  <span
                    className="block aspect-square overflow-hidden rounded-xl bg-[linear-gradient(135deg,#ffb36b,#ff5fa2_45%,#7c5cff)] bg-cover bg-center"
                    style={{ filter: x.css, backgroundImage: thumb ? `url(${thumb})` : undefined }}
                  />
                  <span className="mt-1 block text-[11px] font-medium">{f.names[x.id]}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
