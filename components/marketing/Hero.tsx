import Link from "next/link";
import { Sparkles } from "lucide-react";
import { EditorMock } from "./EditorMock";

export function Hero({
  line1 = "Ayın fotoğrafları,",
  line2 = "tek tıkla dump.",
  sub = "Instagram carousel, TikTok slideshow ve story'ler için kaydırınca akan dump'lar hazırla. AI asistanın yorumlasın, sen paylaş.",
}: {
  line1?: string;
  line2?: string;
  sub?: string;
}) {
  return (
    <section className="relative overflow-x-clip px-4 pt-16 pb-24 sm:pt-24">
      {/* soft wash behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[620px] bg-[radial-gradient(60%_50%_at_50%_0%,#7c5cff26,transparent_70%)]"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
          <Sparkles size={13} className="text-accent" />
          Yeni: dump&apos;ını yorumlayan AI asistan
        </span>
        <h1 className="font-display text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-7xl">
          {line1}
          <br />
          <span className="text-accent">{line2}</span>
        </h1>
        <p className="mt-6 max-w-[580px] text-lg leading-[1.4] font-medium tracking-[-0.01em] text-fg/60 sm:text-[21px]">
          {sub}
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/app/editor/new"
            className="rounded-full bg-fg px-9 py-4 text-[15px] font-medium text-white shadow-[0_12px_30px_-12px_#1d1d1f99] transition hover:-translate-y-0.5"
          >
            Dump&apos;lamaya başla
          </Link>
          <a href="#ozellikler" className="rounded-full px-6 py-4 text-[15px] font-medium text-fg/70 transition hover:bg-black/5 hover:text-fg">
            Nasıl çalışır?
          </a>
        </div>
        <p className="mt-4 text-xs text-muted">Ücretsiz · kayıt gerekmez · fotoğrafların cihazında kalır</p>
      </div>

      <div className="relative mx-auto mt-16 max-w-5xl">
        <EditorMock />
        {/* floating stickers around the mock */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/sparkle.svg" alt="" className="floaty absolute -top-8 -left-4 w-14 sm:-left-10 sm:w-20" style={{ ["--r" as string]: "-12deg" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/heart.svg" alt="" className="floaty absolute -right-3 -bottom-8 w-14 [animation-delay:1.2s] sm:-right-8 sm:w-20" style={{ ["--r" as string]: "10deg" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/burst.svg" alt="" className="floaty absolute -top-10 right-10 hidden w-20 [animation-delay:2.4s] sm:block" style={{ ["--r" as string]: "8deg" }} />
      </div>
    </section>
  );
}
