"use client";

import { useState } from "react";
import { addText, TEXT_PRESETS, type TextCategory, type TextPreset } from "@/lib/addElements";
import { ensureFont, FONT_OPTIONS } from "@/lib/fonts";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";

const CATEGORIES: TextCategory[] = ["essentials", "display", "editorial", "playful", "luxe", "tech"];

export function TextPanel() {
  const { t } = useT();
  const [cat, setCat] = useState<TextCategory>("essentials");
  const copy = (p: TextPreset) => {
    const d = t.textPanel.presets[p.id];
    const font = FONT_OPTIONS.find((f) => f.key === p.font)?.label;
    return { sample: d?.sample ?? p.sample ?? "", sub: d?.label ?? p.sub ?? (p.sample === font ? undefined : font) };
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t.editor.panels.text}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={cat === c}
            onClick={() => setCat(c)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium transition",
              cat === c ? "bg-fg text-bg" : "bg-hover text-muted hover:text-fg",
            )}
          >
            {t.textPanel.categories[c]}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {TEXT_PRESETS.filter((p) => p.cat === cat).map((p) => {
          const cssVar = FONT_OPTIONS.find((f) => f.key === p.font)?.cssVar;
          const { sample, sub } = copy(p);
          const italic = p.fontStyle?.includes("italic");
          const weight = p.fontStyle === "bold" ? 700 : Number(p.fontStyle) || 400;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => {
                  // Load the family first so Konva measures the text with the real font.
                  void ensureFont(p.font).then(() => addText(p, sample));
                }}
                className="flex h-20 w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-2xl bg-hover px-2 text-center transition hover:bg-active"
              >
                <span
                  className={cn("max-w-full truncate leading-tight", p.bubble && "rounded-full bg-white px-3 py-1 text-[#1d1d1f]")}
                  style={{
                    fontFamily: `var(${cssVar})`,
                    fontWeight: weight,
                    fontStyle: italic ? "italic" : undefined,
                    letterSpacing: p.ls ? `${p.ls}em` : undefined,
                    fontSize: Math.max(14, Math.min(24, p.nfs * 330)),
                    color: p.bubble || p.fill === "#1d1d1f" ? undefined : p.fill,
                  }}
                >
                  {sample}
                </span>
                {sub && <span className="text-[10px] text-muted">{sub}</span>}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-1 text-xs text-muted">{t.textPanel.hint}</p>
    </div>
  );
}
