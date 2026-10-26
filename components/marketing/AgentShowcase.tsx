"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "./useScrollProgress";
import { PhotoTile } from "./visuals";

const SCORES = [
  { label: "Hook", before: 4.2, after: 8.6 },
  { label: "Akış", before: 5.5, after: 8.1 },
  { label: "Renk uyumu", before: 7.0, after: 9.0 },
  { label: "Çeşitlilik", before: 6.1, after: 7.4 },
];

/**
 * Dark section that slides over the previous one; as it scrolls, a scripted conversation with
 * the assistant plays out and the suggested reorder is "applied" to the carousel preview.
 */
export function AgentShowcase() {
  const [ref, p] = useScrollProgress<HTMLElement>();
  const shown = (at: number) => p >= at;
  const applied = p >= 0.62;
  // Order of the 4 preview photos before/after the suggestion.
  const order = applied ? [5, 0, 1, 3] : [7, 0, 5, 1];

  return (
    <section
      id="asistan"
      ref={ref}
      className="relative z-20 -mt-[30vh] h-[260vh] scroll-mt-0 rounded-t-[56px] bg-[#0b0b0f] text-white"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-4">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles size={13} className="text-accent" /> AI Asistan
            </span>
            <h2 className="mt-5 font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[52px]">
              Dump&apos;ına ikinci
              <br />
              <span className="text-accent">bir göz.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg text-white/60">
              Asistan slaytlarına bakar; zayıf kapağı, birbirine benzeyen kareleri ve kopuk renk akışını söyler. Önerisini beğenirsen tek tıkla uygulanır.
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

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="grid grid-cols-4 gap-1.5 overflow-hidden rounded-xl">
              {order.map((i, idx) => (
                <PhotoTile key={i} i={i} className={cn("aspect-[3/4] transition-all duration-700", idx === 0 && applied && "ring-2 ring-accent ring-inset")} />
              ))}
            </div>

            <div className="mt-4 flex min-h-[260px] flex-col gap-2.5 text-sm">
              <Bubble from="user" show={shown(0.12)}>
                Bu ayki dump&apos;ımı yorumlar mısın?
              </Bubble>
              <Bubble from="agent" show={shown(0.28)}>
                Kapak biraz sönük kalıyor; en canlı fotoğrafın 3. sırada. Onu kapağa alıp benzer iki kareyi ayırırsak kaydırma ritmi düzelir.
              </Bubble>
              <div
                className={cn(
                  "flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-500",
                  shown(0.42) ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                )}
              >
                <span className="text-xs">
                  <span className="block font-semibold">Sıralamayı düzelt</span>
                  <span className="text-white/50">4 fotoğraf · kapak değişir</span>
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    applied ? "bg-[#34c759] text-black" : "bg-accent text-white",
                  )}
                >
                  {applied ? "Uygulandı ✓" : "Uygula"}
                </span>
              </div>
              <Bubble from="agent" show={shown(0.75)}>
                Caption önerisi: &quot;ekim böyle geçti ☕🍂&quot; · #photodump #ekimdump
              </Bubble>
            </div>
          </div>
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
        from === "user" ? "self-end bg-accent text-white" : "self-start bg-white/10 text-white/90",
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {children}
    </div>
  );
}
