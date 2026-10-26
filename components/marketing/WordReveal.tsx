"use client";

import { cn } from "@/lib/cn";
import { useInView } from "./useScrollProgress";

/** Dictionary-style definition whose words rise into place when scrolled into view. */
export function WordReveal() {
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const definition = "Bir yığın fotoğrafı, takipçilerinin kaydırmayı bırakıp baktığı bir içeriğe dönüştürmek.";
  const words = definition.split(" ");

  return (
    <section className="px-4 py-28 sm:py-40">
      <div ref={ref} className={cn("word-reveal mx-auto max-w-3xl", inView && "is-in")}>
        <p className="flex items-baseline gap-3 font-display">
          <span className="text-3xl font-semibold tracking-tight">dump</span>
          <span className="text-lg text-muted">/dʌmp/</span>
          <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] font-semibold tracking-widest text-muted uppercase">fiil</span>
        </p>
        <p className="mt-6 font-display text-[34px] leading-[1.08] font-semibold tracking-[-0.035em] sm:text-[52px]">
          {words.map((w, i) => (
            <span key={i} className="word inline-block overflow-hidden pr-[0.25em] align-bottom">
              <span style={{ ["--i" as string]: i }}>{w}</span>
            </span>
          ))}
        </p>
        <p className="mt-8 text-lg text-fg/60">Daha çok paylaş. Daha az düşün.</p>
      </div>
    </section>
  );
}
