"use client";

import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { addWidget } from "@/lib/addElements";
import { buildWidget, defaultProps, svgToSrc, TOOLS } from "@/lib/widgets";
import { useT } from "@/lib/i18n/app";
import { normalizeQuery, SearchField } from "./SearchField";

/** Rendered preview of a widget kind with default props (built once per language). */
function WidgetPreview({ kind }: { kind: string }) {
  const { lang } = useT();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- lang changes the default copy.
  const src = useMemo(() => svgToSrc(buildWidget(kind, defaultProps(kind)).svg), [kind, lang]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="max-h-full max-w-full object-contain" draggable={false} />;
}

export function ToolsPanel() {
  const { t } = useT();
  const x = t.tools;
  const [open, setOpen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const tool = TOOLS.find((tl) => tl.id === open);

  const q = normalizeQuery(query.trim());
  const match = (s: string) => !q || normalizeQuery(s).includes(q);

  if (tool) {
    return (
      <div className="flex flex-col gap-3">
        <button type="button" onClick={() => setOpen(null)} className="flex items-center gap-2 text-left">
          <span className="grid size-8 place-items-center rounded-full bg-hover">
            <ChevronLeft size={16} aria-hidden />
          </span>
          <span className="text-sm font-semibold">{x.names[tool.id]}</span>
          <span className="sr-only">{x.back}</span>
        </button>
        {tool.groups.map((g) => (
          <section key={g.id} className="flex flex-col gap-2">
            {tool.groups.length > 1 && <h3 className="px-1 text-xs font-semibold text-muted">{x.groups[g.id]}</h3>}
            <ul className="grid grid-cols-2 gap-2">
              {g.kinds.map((kind) => (
                <li key={kind}>
                  <VariantButton kind={kind} label={x.variants[kind]} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  // Search spans tools and their variants, so "whatsapp" jumps straight to the bubble.
  const variantHits = q
    ? TOOLS.flatMap((tl) => tl.groups.flatMap((g) => g.kinds)).filter((k) => match(x.variants[k]))
    : [];
  const tools = TOOLS.filter((tl) => match(x.names[tl.id]));

  return (
    <div className="flex flex-col gap-3">
      <SearchField value={query} onChange={setQuery} placeholder={x.search} />
      {q && !tools.length && !variantHits.length && <p className="px-1 text-sm text-muted">{x.noResults}</p>}
      {variantHits.length > 0 && (
        <ul className="grid grid-cols-2 gap-2">
          {variantHits.map((kind) => (
            <li key={kind}>
              <VariantButton kind={kind} label={x.variants[kind]} />
            </li>
          ))}
        </ul>
      )}
      <ul className="grid grid-cols-2 gap-2">
        {tools.map((tl) => (
          <li key={tl.id}>
            <button type="button" onClick={() => setOpen(tl.id)} className="group w-full text-left">
              <span className="grid h-24 place-items-center rounded-2xl bg-hover p-3 transition group-hover:bg-active">
                <WidgetPreview kind={tl.preview} />
              </span>
              <span className="mt-1.5 block px-1 text-xs font-semibold">{x.names[tl.id]}</span>
            </button>
          </li>
        ))}
        {!q && (
          <li>
            <span className="grid h-24 place-items-center rounded-2xl border border-dashed border-border-strong text-muted">•••</span>
            <span className="mt-1.5 flex items-center gap-1.5 px-1 text-xs text-muted">
              {x.more}
              <span className="rounded bg-hover px-1 text-[9px] font-semibold">{x.soon}</span>
            </span>
          </li>
        )}
      </ul>
    </div>
  );
}

function VariantButton({ kind, label }: { kind: string; label: string }) {
  return (
    <button type="button" onClick={() => addWidget(kind)} className="group w-full text-left">
      <span className="grid h-24 place-items-center rounded-2xl bg-hover p-2.5 transition group-hover:bg-active">
        <WidgetPreview kind={kind} />
      </span>
      <span className="mt-1.5 block px-1 text-[11px] leading-tight font-medium">{label}</span>
    </button>
  );
}
