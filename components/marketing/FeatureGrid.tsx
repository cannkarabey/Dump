import { Download, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { DateStamp, PhotoTile, Polaroid } from "./visuals";

const FEATURES = [
  {
    title: "Kesintisiz carousel",
    text: "Tek geniş canvas; fotoğraflar sayfa sınırlarını aşar, Instagram'da kaydırınca akar.",
    demo: (
      <div className="relative flex h-full items-center px-4">
        <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg bg-white shadow">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("aspect-[3/4]", i < 2 && "border-r border-dashed border-accent/50")} />
          ))}
        </div>
        <PhotoTile i={1} className="absolute top-1/2 left-[22%] aspect-[16/10] w-[56%] -translate-y-1/2 rounded shadow-lg" />
      </div>
    ),
  },
  {
    title: "Ayın dump'ı",
    text: "EXIF tarihine göre sıralama, ay kapağı, renk paleti ve retro tarih damgası — tek tıkla.",
    demo: (
      <div className="grid h-full place-items-center">
        <PhotoTile i={3} className="aspect-[4/3] w-[70%] rounded-lg shadow-lg">
          <DateStamp className="text-base">&apos;26 10 18</DateStamp>
        </PhotoTile>
      </div>
    ),
  },
  {
    title: "AI asistan",
    text: "Kapağı, sıralamayı ve renk uyumunu yorumlar; Türkçe caption ve hashtag önerir.",
    demo: (
      <div className="flex h-full flex-col justify-center gap-2 px-6 text-[11px]">
        <span className="self-end rounded-2xl bg-accent px-3 py-1.5 text-white">Yorumla</span>
        <span className="flex items-start gap-1.5 self-start rounded-2xl bg-white px-3 py-1.5 shadow">
          <Sparkles size={12} className="mt-0.5 shrink-0 text-accent" /> Kapağa en canlı fotoğrafı al.
        </span>
      </div>
    ),
  },
  {
    title: "Şablon gibi durmayan şablonlar",
    text: "Polaroid, film şeridi, panorama ve ay kapağı; fotoğrafları kutulara sürükle bırak.",
    demo: (
      <div className="relative h-full">
        <Polaroid i={0} rotate={-6} className="absolute top-[14%] left-[18%] w-[34%]" />
        <Polaroid i={5} rotate={5} className="absolute top-[22%] left-[46%] w-[34%]" />
      </div>
    ),
  },
  {
    title: "4K'ya kadar export",
    text: "PNG ya da JPG, sayfa sayfa ya da tek ZIP. Studio'da uzun kenar 3840px.",
    demo: (
      <div className="grid h-full place-items-center">
        <span className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          <Download size={16} /> 2880 × 3840
        </span>
      </div>
    ),
  },
  {
    title: "Kayıt yok, kurulum yok",
    text: "Tarayıcıda açılır; fotoğrafların sunucuya yüklenmeden cihazında işlenir.",
    demo: (
      <div className="grid h-full place-items-center">
        <Smartphone size={56} strokeWidth={1.2} className="text-fg/70" />
      </div>
    ),
  },
];

export function FeatureGrid() {
  return (
    <section id="ozellikler" className="relative z-30 -mt-14 scroll-mt-20 rounded-t-[56px] bg-bg px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[52px]">
          Daha çok paylaş.
          <br />
          <span className="text-accent">Daha az uğraş.</span>
        </h2>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex flex-col overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_1px_2px_#0f172a0a,0_8px_28px_#0f172a0f]">
              <div className="h-44 bg-[linear-gradient(180deg,#f5f3ff,#ffffff)]">{f.demo}</div>
              <div className="p-6">
                <h3 className="text-lg font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
