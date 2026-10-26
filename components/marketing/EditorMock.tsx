import { Download, Layers, LayoutTemplate, Sparkles, Sticker, Type, Upload } from "lucide-react";
import { LogoMark } from "./Logo";
import { DateStamp, Polaroid, PhotoTile } from "./visuals";

/** Static, illustrative replica of the editor for the hero (no screenshot asset needed). */
export function EditorMock() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-[#101010] text-[#fafafa] shadow-[0_40px_80px_-30px_#0f172a66]">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto rounded-full bg-white/5 px-4 py-1 text-[11px] text-white/50">dumpcreator.app/editor</span>
      </div>
      {/* top bar */}
      <div className="flex items-center gap-3 px-4 py-2 text-[11px]">
        <LogoMark />
        <span className="font-semibold">EKİM &apos;26 dump</span>
        <span className="ml-auto hidden items-center gap-1 rounded-full bg-white/5 px-2.5 py-1 sm:flex">
          <Sparkles size={11} className="text-accent" /> Ayın Dump&apos;ı
        </span>
        <span className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1">
          <Download size={11} /> Dışa aktar
        </span>
      </div>
      <div className="grid grid-cols-[44px_1fr] gap-2 p-2 pt-0 sm:grid-cols-[44px_120px_1fr_150px]">
        {/* rail */}
        <div className="flex flex-col items-center gap-3 rounded-xl bg-[#161618] py-3 text-white/50">
          {[Upload, LayoutTemplate, Type, Sticker, Layers].map((Icon, i) => (
            <Icon key={i} size={15} className={i === 1 ? "text-white" : undefined} />
          ))}
        </div>
        {/* flyout */}
        <div className="hidden flex-col gap-2 rounded-xl bg-[#161618] p-2 sm:flex">
          <span className="text-[10px] font-semibold">Şablonlar</span>
          <div className="grid grid-cols-2 gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <PhotoTile key={i} i={i + 2} className="aspect-[3/4] rounded-md opacity-80" />
            ))}
          </div>
        </div>
        {/* canvas */}
        <div className="grid place-items-center rounded-xl bg-[#0b0b0c] px-3 py-6">
          <div className="grid w-full max-w-[560px] grid-cols-3 bg-[#f6efe4] shadow-2xl">
            <div className="relative aspect-[3/4] border-r border-dashed border-accent/60 p-[6%]">
              <p className="font-serif text-[clamp(10px,2.2vw,22px)] leading-none font-bold text-[#1d1d1f]">EKİM &apos;26</p>
              <p className="font-hand text-[clamp(9px,1.6vw,16px)] text-accent">dump</p>
              <PhotoTile i={3} className="mt-[6%] aspect-[4/3.6] rounded-sm">
                <DateStamp className="text-[clamp(6px,0.9vw,10px)]">&apos;26 10 18</DateStamp>
              </PhotoTile>
              <div className="mt-[6%] flex gap-[4%]">
                {["#ffb067", "#ffd29d", "#ff7a59"].map((c) => (
                  <span key={c} className="aspect-square w-[12%] rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="relative flex aspect-[3/4] flex-col gap-[5%] border-r border-dashed border-accent/60 p-[6%]">
              <PhotoTile i={0} className="flex-1 rounded-sm" />
              <PhotoTile i={1} className="flex-1 rounded-sm" />
            </div>
            <div className="relative aspect-[3/4] overflow-visible p-[6%]">
              <Polaroid i={2} rotate={-4} className="w-[70%]" />
              <Polaroid i={5} rotate={5} className="-mt-[20%] ml-[28%] w-[66%]" stamp="'26 10 27" />
            </div>
          </div>
        </div>
        {/* assistant */}
        <div className="hidden flex-col gap-2 rounded-xl bg-[#161618] p-2 text-[10px] sm:flex">
          <span className="flex items-center gap-1 font-semibold">
            <Sparkles size={11} className="text-accent" /> Asistan
          </span>
          <div className="rounded-lg bg-white/5 p-2 leading-snug text-white/80">
            Kapak güçlü! 2. sayfadaki iki fotoğraf çok benzer, birini 3. sayfaya taşıyalım mı?
          </div>
          <span className="self-start rounded-full bg-accent px-2 py-0.5 text-[9px]">Uygula</span>
          <div className="mt-auto flex flex-col gap-1">
            {[["Hook", 82], ["Akış", 64], ["Renk", 90]].map(([k, v]) => (
              <div key={k as string}>
                <div className="flex justify-between text-white/50">
                  <span>{k}</span>
                  <span>{(v as number) / 10}</span>
                </div>
                <div className="h-1 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
