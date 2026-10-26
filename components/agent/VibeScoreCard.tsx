"use client";

import { useState } from "react";
import { Gauge, Loader2 } from "lucide-react";
import { requestVibeScore, errorMessage } from "@/lib/agent/client";
import type { VibeScore } from "@/lib/agent/tools";
import { useT } from "@/lib/i18n/app";

const METRICS: (keyof Omit<VibeScore, "summary">)[] = ["hook", "flow", "color", "variety"];

/** Vibe score: a separate structured request; counts as one deep review. */
export function VibeScoreCard({ disabled }: { disabled: boolean }) {
  const { lang, t } = useT();
  const v = t.agent.vibe;
  const [score, setScore] = useState<VibeScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setScore((await requestVibeScore(lang)).score);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl bg-hover p-3">
      <div className="flex items-center gap-2">
        <Gauge size={16} className="text-accent" />
        <h3 className="text-sm font-semibold">{v.title}</h3>
        <button
          type="button"
          onClick={run}
          disabled={disabled || loading}
          className="ml-auto flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-medium hover:bg-active disabled:opacity-40"
        >
          {loading && <Loader2 size={12} className="animate-spin" />}
          {score ? v.rescore : v.score}
        </button>
      </div>
      {score ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {METRICS.map((key) => (
              <div key={key} className="text-[11px]">
                <div className="flex justify-between text-muted">
                  <span>{v.metrics[key]}</span>
                  <span className="text-fg tabular-nums">{score[key].toFixed(1)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-card">
                  <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${score[key] * 10}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-xs leading-snug text-fg/80">{score.summary}</p>
        </>
      ) : (
        <p className="mt-1.5 text-xs text-muted">{v.hint}</p>
      )}
      {error && <p className="mt-2 text-xs text-[#ff6b61]">{error}</p>}
    </section>
  );
}
