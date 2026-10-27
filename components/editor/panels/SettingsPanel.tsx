"use client";

import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ChevronRight,
  Copy,
  Download,
  Film,
  FilePlus2,
  Maximize2,
  Minus,
  Moon,
  Plus,
  Redo2,
  Scaling,
  Trash2,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { useDoc, useDocHistory, pageOf } from "@/lib/store/doc";
import { useUi, type GridKind } from "@/lib/store/ui";
import { PRESETS, presetLabel } from "@/lib/presets";
import { Crown } from "@/components/ui/Crown";
import { IconButton } from "@/components/ui/IconButton";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";
import { GRID_LINES } from "../canvas/GridOverlay";
import { Section } from "../properties/fields";

const ZOOM_STEP = 1.2;
const GRIDS = Object.keys(GRID_LINES) as GridKind[];

type Align = "left" | "centerX" | "right" | "top" | "middle" | "bottom";
const ALIGNS: { id: Align; icon: LucideIcon }[] = [
  { id: "left", icon: AlignStartVertical },
  { id: "centerX", icon: AlignCenterVertical },
  { id: "right", icon: AlignEndVertical },
  { id: "top", icon: AlignStartHorizontal },
  { id: "middle", icon: AlignCenterHorizontal },
  { id: "bottom", icon: AlignEndHorizontal },
];

/** Aligns each selected element to its own page (rotation is ignored: boxes align by their frame). */
function alignSelection(how: Align) {
  const { doc, updateElements } = useDoc.getState();
  const { w, h, pages } = doc.format;
  const ids = useUi.getState().selection;
  updateElements(
    doc.elements
      .filter((el) => ids.includes(el.id) && !el.locked)
      .map((el) => {
        const left = pageOf(el, w, pages) * w;
        const patch =
          how === "left"
            ? { x: left }
            : how === "centerX"
              ? { x: left + (w - el.width) / 2 }
              : how === "right"
                ? { x: left + w - el.width }
                : how === "top"
                  ? { y: 0 }
                  : how === "middle"
                    ? { y: (h - el.height) / 2 }
                    : { y: h - el.height };
        return { id: el.id, patch };
      }),
  );
}

function Row({ icon: Icon, label, onClick, trailing }: { icon: LucideIcon; label: string; onClick?: () => void; trailing?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm hover:bg-card disabled:opacity-60 disabled:hover:bg-transparent"
    >
      <Icon size={16} className="shrink-0 text-muted" aria-hidden />
      <span className="flex-1">{label}</span>
      {trailing ?? <ChevronRight size={15} className="text-muted" aria-hidden />}
    </button>
  );
}

export function SettingsPanel() {
  const { t } = useT();
  const s = t.settings;
  const format = useDoc((st) => st.doc.format);
  const zoom = useUi((st) => st.zoom);
  const panMode = useUi((st) => st.panMode);
  const darkMode = useUi((st) => st.darkMode);
  const grid = useUi((st) => st.grid);
  const selection = useUi((st) => st.selection);
  const canUndo = useDocHistory((st) => st.pastStates.length > 0);
  const canRedo = useDocHistory((st) => st.futureStates.length > 0);
  const ui = useUi.getState();
  const doc = useDoc.getState();
  const { undo, redo } = useDoc.temporal.getState();
  const hasSel = selection.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <Section title={s.canvas}>
        <p className="flex justify-between px-2.5 pb-1 text-sm">
          <span className="text-muted">{s.size}</span>
          <span className="tabular-nums">
            {format.w} × {format.h}
          </span>
        </p>
        <label className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm hover:bg-card">
          <Scaling size={16} className="shrink-0 text-muted" aria-hidden />
          <span className="flex-1">{s.resize}</span>
          <select
            aria-label={s.resize}
            value=""
            onChange={(e) => {
              const p = PRESETS.find((x) => x.id === e.target.value);
              if (p) {
                doc.resize(p.w, p.h);
                ui.requestFit();
              }
            }}
            className="h-7 w-24 rounded-lg border border-border bg-panel px-1.5 text-xs"
          >
            <option value="" disabled>
              {presetLabel(format.w, format.h, t)}
            </option>
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {t.presets.labels[p.id] ?? p.label} ({p.w}×{p.h})
              </option>
            ))}
          </select>
        </label>
        <Row icon={FilePlus2} label={s.newDump} onClick={() => ui.openModal("newDump")} />
      </Section>

      <Section title={s.zoom}>
        <div className="flex items-center justify-between rounded-xl bg-card p-1">
          <IconButton label={t.editor.zoomOut} size="sm" onClick={() => ui.setZoom(zoom / ZOOM_STEP)}>
            <Minus size={15} />
          </IconButton>
          <span className="text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
          <IconButton label={t.editor.zoomIn} size="sm" onClick={() => ui.setZoom(zoom * ZOOM_STEP)}>
            <Plus size={15} />
          </IconButton>
          <IconButton label={t.editor.fit} size="sm" onClick={() => ui.requestFit()}>
            <Maximize2 size={15} />
          </IconButton>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-sm">
          <span className="text-muted">{s.tool}</span>
          <div className="flex rounded-full bg-card p-1" role="radiogroup" aria-label={s.tool}>
            {[false, true].map((pan) => (
              <button
                key={String(pan)}
                type="button"
                role="radio"
                aria-checked={panMode === pan}
                onClick={() => ui.setPanMode(pan)}
                className={cn("h-7 rounded-full px-3 text-xs font-medium", panMode === pan ? "bg-fg text-bg" : "text-muted hover:text-fg")}
              >
                {pan ? s.pan : s.select}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-2 flex cursor-pointer items-center justify-between px-1 text-sm">
          <span className="flex items-center gap-2">
            <Moon size={15} className="text-muted" aria-hidden /> {s.darkMode}
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={darkMode}
            onChange={(e) => ui.setDarkMode(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
        </label>
      </Section>

      <Section title={s.grid}>
        <ul className="grid grid-cols-3 gap-1.5">
          {GRIDS.map((g) => {
            const [vs, hs] = GRID_LINES[g];
            return (
              <li key={g}>
                <button
                  type="button"
                  aria-pressed={grid === g}
                  onClick={() => ui.setGrid(g)}
                  className={cn(
                    "w-full rounded-xl border p-1.5 text-center transition",
                    grid === g ? "border-accent bg-accent-soft" : "border-border bg-card hover:border-border-strong",
                  )}
                >
                  <span className="relative mx-auto block aspect-[3/4] w-8 rounded-sm border border-fg/30">
                    {vs.map((f) => (
                      <span key={`v${f}`} className="absolute inset-y-0 w-px bg-fg/60" style={{ left: `${f * 100}%` }} />
                    ))}
                    {hs.map((f) => (
                      <span key={`h${f}`} className="absolute inset-x-0 h-px bg-fg/60" style={{ top: `${f * 100}%` }} />
                    ))}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium">{s.grids[g]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section title={s.edit}>
        <div className="grid grid-cols-4 gap-1 rounded-xl bg-card p-1">
          <IconButton label={t.editor.undo} size="sm" disabled={!canUndo} onClick={() => undo()}>
            <Undo2 size={15} />
          </IconButton>
          <IconButton label={t.editor.redo} size="sm" disabled={!canRedo} onClick={() => redo()}>
            <Redo2 size={15} />
          </IconButton>
          <IconButton label={t.element.duplicate} size="sm" disabled={!hasSel} onClick={() => ui.setSelection(doc.duplicate(selection))}>
            <Copy size={15} />
          </IconButton>
          <IconButton
            label={t.element.delete}
            size="sm"
            disabled={!hasSel}
            onClick={() => {
              doc.removeElements(selection);
              ui.setSelection([]);
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        </div>
        <p className="mt-2 px-1 text-xs text-muted">{s.align}</p>
        <div className="mt-1 grid grid-cols-6 gap-1 rounded-xl bg-card p-1">
          {ALIGNS.map(({ id, icon: Icon }) => (
            <IconButton key={id} label={s.aligns[id]} size="sm" disabled={!hasSel} onClick={() => alignSelection(id)}>
              <Icon size={15} />
            </IconButton>
          ))}
        </div>
        <p className="mt-1.5 px-1 text-[11px] text-muted">{s.alignHint}</p>
      </Section>

      <Section title={s.animate}>
        <Row
          icon={Film}
          label={s.videoMode}
          trailing={
            <span className="flex items-center gap-1.5 text-[11px] text-muted">
              <Crown /> {s.soon}
            </span>
          }
        />
      </Section>

      <Section title={t.editor.export}>
        <Row icon={Download} label={s.export} onClick={() => ui.openModal("export")} />
      </Section>
    </div>
  );
}
