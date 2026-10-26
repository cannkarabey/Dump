"use client";

import { addText, TEXT_PRESETS } from "@/lib/addElements";
import { FONT_OPTIONS } from "@/lib/fonts";
import { cn } from "@/lib/cn";

export function TextPanel() {
  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {TEXT_PRESETS.map((p) => {
          const cssVar = FONT_OPTIONS.find((f) => f.key === p.font)?.cssVar;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => addText(p)}
                className="flex w-full flex-col items-start gap-1 rounded-2xl bg-hover px-4 py-3 text-left transition hover:bg-active"
              >
                <span className="text-xs text-muted">{p.label}</span>
                <span
                  className={cn("truncate", p.bubble && "rounded-full bg-white px-3 py-1 text-[#1d1d1f]")}
                  style={{
                    fontFamily: `var(${cssVar})`,
                    fontWeight: p.fontStyle === "bold" ? 700 : p.fontStyle ? Number(p.fontStyle) : 400,
                    fontSize: Math.max(14, Math.min(30, p.nfs * 420)),
                    color: p.bubble ? undefined : p.fill === "#1d1d1f" ? undefined : p.fill,
                  }}
                >
                  {p.sample}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="px-1 text-xs text-muted">Metni düzenlemek için canvas&apos;ta çift tıkla.</p>
    </div>
  );
}
