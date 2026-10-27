"use client";

import { Brush, Eraser, Highlighter, PenLine, Shapes, Trash2, type LucideIcon } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { useUi, type BrushState } from "@/lib/store/ui";
import { addShape, clearDrawings } from "@/lib/draw";
import type { ShapeKind } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";
import { at } from "@/lib/i18n/appDictionary";
import { SliderField } from "../properties/fields";

const COLORS = ["#ff6b35", "#ff3b30", "#ff9f0a", "#ffd60a", "#34c759", "#64d2ff", "#0a84ff", "#5e5ce6", "#bf5af2", "#1d1d1f", "#ffffff"];

const TOOLS: { id: BrushState["tool"]; icon: LucideIcon }[] = [
  { id: "pen", icon: PenLine },
  { id: "marker", icon: Brush },
  { id: "highlighter", icon: Highlighter },
  { id: "eraser", icon: Eraser },
];

const SHAPES: { id: ShapeKind; path: string }[] = [
  { id: "rect", path: "M5 5h14v14H5z" },
  { id: "rounded", path: "M9 5h6a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4z" },
  { id: "ellipse", path: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16z" },
  { id: "triangle", path: "M12 4l8 15H4z" },
  { id: "star", path: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" },
  { id: "heart", path: "M12 20s-7-4.4-9.2-8.7C1.3 8.2 3.1 4.6 6.5 4.6c2 0 3.4 1.1 5.5 3.3 2.1-2.2 3.5-3.3 5.5-3.3 3.4 0 5.2 3.6 3.7 6.7C19 15.6 12 20 12 20z" },
  { id: "line", path: "M4 12h16" },
  { id: "arrow", path: "M4 12h15M14 7l5 5-5 5" },
];

export function DrawPanel() {
  const { t } = useT();
  const d = t.draw;
  const brush = useUi((s) => s.brush);
  const set = useUi.getState().setBrush;
  const tool = TOOLS.find((x) => x.id === brush.tool);

  const colors = (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-6 gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={c}
            aria-pressed={brush.color === c}
            onClick={() => set({ color: c })}
            className={cn(
              "aspect-square rounded-full border border-border-strong transition",
              brush.color === c && "ring-2 ring-accent ring-offset-2 ring-offset-panel",
            )}
            style={{ background: c }}
          />
        ))}
        <label
          className="relative aspect-square cursor-pointer overflow-hidden rounded-full border border-border-strong"
          style={{ background: "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)" }}
          title={d.customColor}
        >
          <input
            type="color"
            aria-label={d.customColor}
            value={brush.color}
            onChange={(e) => set({ color: e.target.value })}
            className="absolute inset-0 cursor-pointer opacity-0"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        aria-label={t.editor.panels.draw}
        value={brush.mode}
        onChange={(mode) => set({ mode })}
        options={[
          { value: "brush", label: <span className="flex items-center gap-1.5"><PenLine size={14} aria-hidden /> {d.brush}</span> },
          { value: "shapes", label: <span className="flex items-center gap-1.5"><Shapes size={14} aria-hidden /> {d.shapes}</span> },
        ]}
        className="self-start"
      />

      {brush.mode === "brush" ? (
        <>
          <div>
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-hover p-1">
              {TOOLS.map(({ id, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-label={d.tools[id]}
                  aria-pressed={brush.tool === id}
                  onClick={() => set({ tool: id })}
                  className={cn(
                    "grid h-10 place-items-center rounded-xl transition",
                    brush.tool === id ? "bg-active text-fg shadow-sm" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon size={18} aria-hidden />
                </button>
              ))}
            </div>
            {tool && (
              <p className="mt-2 text-center text-xs">
                <span className="font-semibold">{d.tools[tool.id]}</span> <span className="text-muted">{d.hints[tool.id]}</span>
              </p>
            )}
          </div>
          {brush.tool !== "eraser" && (
            <>
              {colors}
              <SliderField label={d.size} value={brush.size} min={2} max={60} onCommit={(size) => set({ size })} format={(v) => `${Math.round(v)}px`} />
              <SliderField
                label={d.opacity}
                value={brush.opacity * 100}
                min={10}
                max={100}
                onCommit={(v) => set({ opacity: v / 100 })}
                format={(v) => `${Math.round(v)}%`}
              />
              <div className="grid h-20 place-items-center rounded-2xl bg-white">
                <svg viewBox="0 0 200 60" className="h-full w-full" aria-hidden>
                  <path
                    d="M20 40 C 60 0, 90 60, 130 25 S 175 20, 185 30"
                    fill="none"
                    stroke={brush.color}
                    strokeLinecap="round"
                    strokeWidth={Math.min(28, brush.size * (brush.tool === "pen" ? 1 : brush.tool === "marker" ? 2.2 : 3.5) * 0.5)}
                    opacity={brush.opacity * (brush.tool === "highlighter" ? 0.45 : 1)}
                  />
                </svg>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => window.confirm(at().draw.clearConfirm) && clearDrawings()}
            className="flex items-center justify-center gap-2 rounded-2xl bg-hover py-2.5 text-sm font-medium hover:bg-active"
          >
            <Trash2 size={15} aria-hidden /> {d.clear}
          </button>
          <p className="px-1 text-xs text-muted">{d.hint}</p>
        </>
      ) : (
        <>
          {colors}
          <Segmented
            aria-label={d.fill}
            value={brush.outline ? "outline" : "fill"}
            onChange={(v) => set({ outline: v === "outline" })}
            options={[
              { value: "fill", label: d.fill },
              { value: "outline", label: d.outline },
            ]}
            className="self-start"
          />
          <ul className="grid grid-cols-4 gap-2">
            {SHAPES.map((s) => {
              const stroked = s.id === "line" || s.id === "arrow" || brush.outline;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => addShape(s.id)}
                    aria-label={d.shapeNames[s.id]}
                    title={d.shapeNames[s.id]}
                    className="grid aspect-square w-full place-items-center rounded-2xl bg-hover transition hover:bg-active"
                  >
                    <svg viewBox="0 0 24 24" className="size-7" aria-hidden>
                      <path
                        d={s.path}
                        fill={stroked ? "none" : brush.color}
                        stroke={stroked ? brush.color : "none"}
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="px-1 text-xs text-muted">{d.shapeHint}</p>
        </>
      )}
    </div>
  );
}
