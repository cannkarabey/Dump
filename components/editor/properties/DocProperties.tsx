"use client";

import { Copy, Plus, Smartphone, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Swatch } from "@/components/ui/Swatch";
import { Crown } from "@/components/ui/Crown";
import { useDoc } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { useLimits } from "@/lib/store/tier";
import { PRESETS, presetLabel } from "@/lib/presets";
import { cn } from "@/lib/cn";
import { Section } from "./fields";
import { format as fill, useT } from "@/lib/i18n/app";

const BACKGROUNDS = ["#ffffff", "#000000", "#f3ece2", "#efe9df", "#e5e7eb", "#ffd6e0", "#d7ecff", "transparent"];

/** Right panel when nothing is selected: canvas size, pages, background. */
export function DocProperties() {
  const format = useDoc((s) => s.doc.format);
  const background = useDoc((s) => s.doc.background);
  const activePage = useUi((s) => s.activePage);
  const { maxPages } = useLimits();
  const { addPage, duplicatePage, removePage, resize, setBackground } = useDoc.getState();
  const atLimit = format.pages >= maxPages;
  const { t } = useT();
  const d = t.doc;

  const guardPages = (fn: () => void) => () => (atLimit ? useUi.getState().openPaywall("maxPages") : fn());

  return (
    <div className="flex flex-col gap-3">
      <Section title={d.canvas}>
        <label className="flex items-center gap-3 rounded-xl bg-card p-3">
          <Smartphone size={18} className="shrink-0 text-muted" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{presetLabel(format.w, format.h, t)}</span>
            <span className="block text-xs text-muted tabular-nums">
              {format.w} × {format.h} px
            </span>
          </span>
          <select
            aria-label={d.resize}
            value=""
            onChange={(e) => {
              const p = PRESETS.find((x) => x.id === e.target.value);
              if (p) {
                resize(p.w, p.h);
                useUi.getState().requestFit();
              }
            }}
            className="h-8 w-28 rounded-lg border border-border bg-panel px-2 text-xs"
          >
            <option value="" disabled>
              {d.resizePlaceholder}
            </option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {t.presets.labels[p.id] ?? p.label} ({p.w}×{p.h})
              </option>
            ))}
          </select>
        </label>
      </Section>

      <Section
        title={d.pages}
        action={
          <span className="text-xs text-muted tabular-nums">
            {format.pages}/{maxPages}
          </span>
        }
      >
        <ul className="flex flex-col gap-1">
          {Array.from({ length: format.pages }, (_, i) => (
            <li
              key={i}
              className={cn(
                "flex items-center gap-2 rounded-xl px-2 py-1.5",
                i === activePage ? "bg-active" : "hover:bg-card",
              )}
            >
              <button
                type="button"
                onClick={() => useUi.getState().setActivePage(i)}
                className="flex flex-1 items-center gap-2 text-left text-sm"
              >
                <span className="grid size-6 place-items-center rounded-full bg-card text-xs tabular-nums">{i + 1}</span>
                {fill(d.page, { n: i + 1 })}
              </button>
              <IconButton label={fill(d.duplicatePage, { n: i + 1 })} size="sm" onClick={guardPages(() => duplicatePage(i))}>
                <Copy size={14} />
              </IconButton>
              <IconButton
                label={fill(d.deletePage, { n: i + 1 })}
                size="sm"
                disabled={format.pages === 1}
                onClick={() => {
                  removePage(i);
                  useUi.getState().setActivePage(Math.max(0, Math.min(i, format.pages - 2)));
                  useUi.getState().requestFit();
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={guardPages(() => {
            addPage();
            useUi.getState().requestFit();
          })}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-muted hover:bg-card hover:text-fg"
        >
          <Plus size={16} /> {d.addPage}
          {atLimit && <Crown className="ml-auto" />}
        </button>
      </Section>

      <Section title={d.background}>
        <div className="flex flex-wrap items-center gap-2">
          {BACKGROUNDS.map((c) => (
            <Swatch
              key={c}
              color={c}
              label={c === "transparent" ? d.transparent : c}
              selected={background === c}
              onClick={() => setBackground(c)}
            />
          ))}
          <label
            className="relative size-8 cursor-pointer overflow-hidden rounded-full border border-border-strong"
            style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
            title={d.customColor}
          >
            <input
              type="color"
              aria-label={d.customBackground}
              value={background === "transparent" ? "#ffffff" : background}
              onChange={(e) => setBackground(e.target.value)}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
      </Section>
    </div>
  );
}
