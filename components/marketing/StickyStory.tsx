"use client";

import { format, type Dict } from "@/lib/i18n/dictionary";
import { Bezel } from "@/components/ui/Bezel";
import { cn } from "@/lib/cn";
import { useScrollProgress } from "./useScrollProgress";
import { DateStamp, PhotoTile, Polaroid } from "./visuals";

/** 220vh section with a sticky stage; scroll progress drives the copy and the phone carousel. */
export function StickyStory({ t }: { t: Dict["story"] }) {
  const STEPS = t.steps;
  const [ref, p] = useScrollProgress<HTMLElement>();
  // The assistant section starts covering this one at p ≈ 0.58, so all steps show before that.
  const step = p < 0.2 ? 0 : p < 0.4 ? 1 : 2;
  // One slide per step; the CSS transition animates the swipe so the phone never rests between slides.
  const slide = step;
  // Line fill across the part of the scroll where steps change (0 → 0.5).
  const fill = Math.min(1, p / 0.5);

  return (
    <section ref={ref} className="relative h-[340vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-4">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
          <div className="relative min-h-[260px] sm:min-h-[320px]">
            {STEPS.map((s, i) => (
              <div
                key={i}
                aria-hidden={i !== step}
                className={cn(
                  "absolute inset-0 transition-[transform,opacity] duration-500",
                  i === step ? "translate-y-0 opacity-100" : i < step ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0",
                )}
              >
                <h2 className="display-2">
                  {s.title[0]}
                  <br />
                  <span className="accent-line">{s.title[1]}</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-muted">{s.text}</p>
              </div>
            ))}
            {/* Timeline: the line fills with scroll, reached steps light up. */}
            <div className="absolute -bottom-14 left-0 w-full max-w-xs" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label={format(t.progress, { n: step + 1, total: STEPS.length })}>
              <div className="relative h-1 rounded-full bg-black/10">
                <div className="absolute inset-0 origin-left rounded-full bg-accent" style={{ transform: `scaleX(${fill})` }} />
              </div>
              <ol className="mt-3 flex justify-between text-xs font-semibold tabular-nums">
                {STEPS.map((_, i) => (
                  <li key={i} className={cn("transition-colors duration-300", i <= step ? "text-accent-ink" : "text-muted")}>
                    0{i + 1}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <Phone handle={t.handle}>
            <div className="flex h-full bg-[#f6efe4] transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]" style={{ transform: `translateX(${-slide * 100}%)` }}>
              {/* Three slides of one continuous canvas; the background sits on the strip so a photo can straddle slides 2–3. */}
              <div className="relative h-full w-full shrink-0 p-[8%]">
                <p className="font-serif text-2xl font-bold">{t.month}</p>
                <p className="font-hand text-lg text-accent">dump</p>
                <PhotoTile i={3} className="mt-3 aspect-[4/4.4] rounded">
                  <DateStamp className="text-xs">&apos;26 10 18</DateStamp>
                </PhotoTile>
              </div>
              <div className="relative h-full w-full shrink-0 p-[8%]">
                <Polaroid i={0} rotate={-5} className="w-[70%]" stamp="'26 10 03" />
                <Polaroid i={1} rotate={4} className="absolute top-[38%] -right-[30%] w-[64%]" stamp="'26 10 07" />
              </div>
              <div className="relative h-full w-full shrink-0 p-[8%]">
                <Polaroid i={5} rotate={3} className="mt-[45%] ml-[20%] w-[68%]" stamp="'26 10 22" />
              </div>
            </div>
            <span className="absolute top-3 right-3 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white tabular-nums">
              {slide + 1}/3
            </span>
          </Phone>
        </div>
      </div>
    </section>
  );
}

function Phone({ children, handle }: { children: React.ReactNode; handle: string }) {
  return (
    <Bezel className="mx-auto w-fit [--bezel-radius:54px]">
      <div className="w-[260px] rounded-[44px] bg-[#1d1d1f] p-2.5 sm:w-[300px]">
        <div className="overflow-hidden rounded-[36px] bg-white">
          <div className="flex items-center gap-2 px-4 py-3 text-xs">
            <span className="size-7 rounded-full bg-gradient-to-br from-[#ffb199] to-[#8e6cff]" />
            <span className="font-semibold">{handle}</span>
            <span className="ml-auto text-muted">•••</span>
          </div>
          <div className="relative aspect-[3/4] overflow-hidden">{children}</div>
          <div aria-hidden className="flex gap-3 px-4 py-3 text-lg">♡ ◯ ➤</div>
        </div>
      </div>
    </Bezel>
  );
}
