"use client";

import { cn } from "@/lib/cn";
import { useScrollProgress } from "./useScrollProgress";
import { DateStamp, PhotoTile, Polaroid } from "./visuals";

const STEPS = [
  { title: ["Tek canvas.", "Bütün carousel."], text: "Dump'ını tek parça tasarla; her slayt ayrı görsel olarak iner, kaydırınca kesintisiz akar." },
  { title: ["Fotoğrafların.", "Senin tarzın."], text: "Polaroid, film şeridi, panorama… Şablon gibi durmayan şablonlarla fotoğrafların öne çıksın." },
  { title: ["Ayın dump'ı.", "Tek tıkla."], text: "Çekim tarihine göre sıralar, ay kapağını ve renk paletini çıkarır, retro tarih damgası basar." },
];

/** 220vh section with a sticky stage; scroll progress drives the copy and the phone carousel. */
export function StickyStory() {
  const [ref, p] = useScrollProgress<HTMLElement>();
  const step = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
  // One slide per step; the CSS transition animates the swipe so the phone never rests between slides.
  const slide = step;

  return (
    <section ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden px-4">
        <div className="mx-auto grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
          <div className="relative min-h-[220px]">
            {STEPS.map((s, i) => (
              <div
                key={i}
                aria-hidden={i !== step}
                className={cn(
                  "absolute inset-0 transition-all duration-500",
                  i === step ? "translate-y-0 opacity-100" : i < step ? "-translate-y-6 opacity-0" : "translate-y-6 opacity-0",
                )}
              >
                <h2 className="font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[52px]">
                  {s.title[0]}
                  <br />
                  <span className="text-accent">{s.title[1]}</span>
                </h2>
                <p className="mt-5 max-w-md text-lg text-fg/60">{s.text}</p>
              </div>
            ))}
            <div className="absolute -bottom-10 left-0 flex gap-1.5">
              {STEPS.map((_, i) => (
                <span key={i} className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-accent" : "w-1.5 bg-black/15")} />
              ))}
            </div>
          </div>

          <Phone>
            <div className="flex h-full bg-[#f6efe4] transition-transform duration-700 ease-[cubic-bezier(0.2,0.7,0.2,1)]" style={{ transform: `translateX(${-slide * 100}%)` }}>
              {/* Three slides of one continuous canvas; the background sits on the strip so a photo can straddle slides 2–3. */}
              <div className="relative h-full w-full shrink-0 p-[8%]">
                <p className="font-serif text-2xl font-bold">EKİM &apos;26</p>
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

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[260px] rounded-[44px] bg-[#1d1d1f] p-2.5 shadow-[0_40px_80px_-30px_#0f172a80] sm:w-[300px]">
      <div className="overflow-hidden rounded-[36px] bg-white">
        <div className="flex items-center gap-2 px-4 py-3 text-xs">
          <span className="size-7 rounded-full bg-gradient-to-br from-[#ffb199] to-[#8e6cff]" />
          <span className="font-semibold">ekim.dump</span>
          <span className="ml-auto text-muted">•••</span>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden">{children}</div>
        <div className="flex gap-3 px-4 py-3 text-lg">♡ ◯ ➤</div>
      </div>
    </div>
  );
}
