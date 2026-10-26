"use client";

import type { Dict } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/cn";
import { useInView } from "./useScrollProgress";

/** Dictionary-style definition whose words rise into place when scrolled into view. */
export function WordReveal({ t }: { t: Dict["define"] }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const words = t.definition.split(" ");

  return (
    <section className="px-4 py-28 sm:py-40">
      <div ref={ref} className={cn("word-reveal mx-auto max-w-3xl", inView && "is-in")}>
        <p className="flex items-baseline gap-3 font-display">
          <span className="text-3xl font-semibold tracking-tight">dump</span>
          <span className="text-lg text-muted">/dʌmp/</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold tracking-widest text-muted uppercase">{t.pos}</span>
        </p>
        <p className="mt-6 display-2 !leading-[1.08]">
          {words.map((w, i) => (
            <span key={i} className="word inline-block overflow-hidden pr-[0.25em] align-bottom">
              <span style={{ ["--i" as string]: i }}>{w}</span>
            </span>
          ))}
        </p>
        <p className="mt-8 text-lg text-muted">{t.tagline}</p>
      </div>
    </section>
  );
}
