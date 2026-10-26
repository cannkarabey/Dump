import { Reveal, RevealItem } from "./Reveal";
import { RollText } from "@/components/ui/RollText";
import type { Dict } from "@/lib/i18n/dictionary";
import Link from "next/link";
import { PhotoTile } from "./visuals";

export function FinalCta({ t }: { t: Dict["final"] }) {
  return (
    <section className="relative z-10 overflow-hidden rounded-cover bg-[#0b0b0f] px-6 py-32 text-center text-white sm:py-40">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-30">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <PhotoTile
            key={i}
            i={i}
            className="absolute aspect-[3/4] w-32 rounded-xl sm:w-44"
            style={{
              left: `${[4, 80, 14, 70, 44, 88][i]}%`,
              top: `${[10, 6, 64, 70, -12, 40][i]}%`,
              transform: `rotate(${[-8, 6, 5, -4, 3, -10][i]}deg)`,
            }}
          />
        ))}
      </div>
      <Reveal className="relative">
        <RevealItem>
          <h2 className="display-2">
            {t.title[0]}
            <br />
            <span className="accent-line">{t.title[1]}</span>
          </h2>
        </RevealItem>
        <RevealItem>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/75">{t.sub}</p>
        </RevealItem>
        <RevealItem>
          <Link
            href="/app/editor/new"
            className="roll-trigger mt-9 inline-flex rounded-full bg-white px-9 py-4 text-[15px] font-medium text-[#0b0b0f] shadow-[0_18px_36px_-16px_rgb(255_255_255/0.45)] transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
          >
            <RollText>{t.cta}</RollText>
          </Link>
          <p className="mt-4 text-xs text-white/60">{t.note}</p>
        </RevealItem>
      </Reveal>
    </section>
  );
}
