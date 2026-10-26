import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Dict } from "@/lib/i18n/dictionary";
import { EFFECTS } from "@/lib/motion";
import { RollText } from "@/components/ui/RollText";
import { EditorMock } from "./EditorMock";
import { Bezel } from "@/components/ui/Bezel";
import { FocusIn } from "./FocusIn";

/** Splits a line into 3D-revealing words; `start` continues the stagger across lines. */
function Words({ text, start = 0 }: { text: string; start?: number }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      <span className="word3d">
        <span style={{ ["--i" as string]: start + i }}>{word}</span>
      </span>{" "}
    </span>
  ));
}

export function Hero({ t, mock }: { t: Dict["hero"]; mock: Dict["mock"] }) {
  const line1Words = t.line1.split(" ").length;
  return (
    <section className="relative overflow-x-clip px-4 pt-16 pb-24 sm:pt-24">
      {EFFECTS.meshBackground && (
        <div aria-hidden className="mesh">
          <i />
          <i />
          <i />
        </div>
      )}
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <span
          className="hero-fade mb-6 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/70 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur"
          style={{ ["--d" as string]: "0s" }}
        >
          <Sparkles size={13} className="text-accent-ink" aria-hidden />
          {t.badge}
        </span>
        <h1 className="display">
          <Words text={t.line1} />
          <br />
          <span className="accent-line">
            <Words text={t.line2} start={line1Words} />
          </span>
        </h1>
        <p
          className="hero-fade mt-6 max-w-[580px] text-lg leading-[1.4] font-medium tracking-[-0.01em] text-muted sm:text-[21px]"
          style={{ ["--d" as string]: "0.55s" }}
        >
          {t.sub}
        </p>
        <div className="hero-fade mt-9 flex flex-wrap justify-center gap-3" style={{ ["--d" as string]: "0.7s" }}>
          <Link
            href="/app/editor/new"
            className="roll-trigger inline-flex rounded-full bg-fg px-9 py-4 text-[15px] font-medium text-white shadow-ink transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98]"
          >
            <RollText>{t.primary}</RollText>
          </Link>
          <a
            href="#features"
            className="roll-trigger inline-flex rounded-full px-6 py-4 text-[15px] font-medium text-fg/75 transition duration-150 hover:scale-[1.03] hover:bg-black/5 hover:text-fg active:scale-[0.98]"
          >
            <RollText>{t.secondary}</RollText>
          </a>
        </div>
        <p className="hero-fade mt-4 text-xs text-muted" style={{ ["--d" as string]: "0.8s" }}>
          {t.note}
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-5xl">
        <FocusIn>
          <Bezel>
            <EditorMock t={mock} />
          </Bezel>
        </FocusIn>
        {/* floating stickers around the mock */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/sparkle.svg" alt="" width={80} height={80} className="floaty absolute -top-8 -left-4 w-14 sm:-left-10 sm:w-20" style={{ ["--r" as string]: "-12deg" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/heart.svg" alt="" width={80} height={80} className="floaty absolute -right-3 -bottom-8 w-14 [animation-delay:1.2s] sm:-right-8 sm:w-20" style={{ ["--r" as string]: "10deg" }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stickers/burst.svg" alt="" width={80} height={80} className="floaty absolute -top-10 right-10 hidden w-20 [animation-delay:2.4s] sm:block" style={{ ["--r" as string]: "8deg" }} />
      </div>
    </section>
  );
}
