import Link from "next/link";
import { PhotoTile } from "./visuals";

export function FinalCta() {
  return (
    <section className="relative z-10 overflow-hidden rounded-[56px] bg-[#0b0b0f] px-6 py-32 text-center text-white sm:py-40">
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
      <div className="relative">
        <h2 className="font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[56px]">
          Bir sonraki postun
          <br />
          <span className="text-accent">burada başlıyor.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-white/60">Bir şablon seç, fotoğraflarını bırak, bugün paylaş.</p>
        <Link
          href="/app/editor/new"
          className="mt-9 inline-block rounded-full bg-white px-9 py-4 text-[15px] font-medium text-[#0b0b0f] transition hover:-translate-y-0.5"
        >
          Dump&apos;lamaya başla
        </Link>
        <p className="mt-4 text-xs text-white/40">Ücretsiz · telefonda da çalışır</p>
      </div>
    </section>
  );
}
