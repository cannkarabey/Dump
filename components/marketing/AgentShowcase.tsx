"use client";

import { SpotlightCard } from "@/components/ui/SpotlightCard";

import type { Dict } from "@/lib/i18n/dictionary";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "./useScrollProgress";
import { PhotoTile } from "./visuals";

const SCORE_VALUES = [
  { before: 4.2, after: 8.6 },
  { before: 5.5, after: 8.1 },
  { before: 7.0, after: 9.0 },
  { before: 6.1, after: 7.4 },
];

/**
 * Dark section that slides over the previous one; as it scrolls, a scripted conversation with
 * the assistant plays out and the suggested reorder is "applied" to the carousel preview.
 */
export function AgentShowcase({ t }: { t: Dict["agent"] }) {
  const SCORES = SCORE_VALUES.map((v, i) => ({ ...v, label: t.scores[i] }));
  const [ref, p] = useScrollProgress<HTMLElement>();
  const shown = (at: number) => p >= at;
  // The features section starts covering this one at p ≈ 0.55, so the script finishes before that.
  const applied = p >= 0.36;
  // Order of the 4 preview photos before/after the suggestion.
  const order = applied ? [5, 0, 1, 3] : [7, 0, 5, 1];

  return (
    // Cover #2 (accent) slides over the story; its last 100vh is in turn covered by the features.
    <section
      id="assistant"
      ref={ref}
      className="relative z-20 -mt-[100vh] h-[320vh] rounded-t-cover bg-[linear-gradient(180deg,#4b33c9_0%,#2b1c7a_70%)] text-white"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-4">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles size={13} className="text-accent" /> {t.badge}
            </span>
            <h2 className="mt-5 display-2">
              {t.title[0]}
              <br />
              <span className="accent-line">{t.title[1]}</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/75">
              {t.body}
            </p>

            <div className="mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3">
              {SCORES.map((s) => {
                const v = applied ? s.after : s.before;
                return (
                  <div key={s.label} className="text-xs">
                    <div className="flex justify-between text-white/60">
                      <span>{s.label}</span>
                      <span className="tabular-nums text-white">{v.toFixed(1)}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${v * 10}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <SpotlightCard tone="dark" className="rounded-card border border-white/15 bg-white/[0.08] p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-1.5 overflow-hidden rounded-xl">
              {order.map((i, idx) => (
                <PhotoTile key={i} i={i} className={cn("aspect-[3/4] transition-all duration-700", idx === 0 && applied && "ring-2 ring-accent ring-inset")} />
              ))}
            </div>

            <div className="mt-4 flex min-h-[260px] flex-col gap-2.5 text-sm">
              <Bubble from="user" show={shown(0.08)}>
                {t.user}
              </Bubble>
              <Bubble from="agent" show={shown(0.16)}>
                {t.reply}
              </Bubble>
              <div
                className={cn(
                  "flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-500",
                  shown(0.26) ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <span className="text-xs">
                  <span className="block font-semibold">{t.cardTitle}</span>
                  <span className="text-white/60">{t.cardSub}</span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    applied ? "bg-[#34c759] text-black" : "bg-accent text-white",
                  )}
                >
                  {applied ? t.applied : t.apply}
                </span>
              </div>
              <Bubble from="agent" show={shown(0.44)}>
                {t.caption}
              </Bubble>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

function Bubble({ from, show, children }: { from: "user" | "agent"; show: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-snug transition-all duration-500",
        from === "user" ? "self-end bg-white text-accent-ink" : "self-start bg-white/12 text-white",
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {children}
    </div>
  );
}
