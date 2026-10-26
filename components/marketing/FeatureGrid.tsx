import { Reveal, RevealItem } from "./Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { Dict } from "@/lib/i18n/dictionary";
import { Download, Smartphone, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { DateStamp, PhotoTile, Polaroid } from "./visuals";

/** Visual demo per feature card; copy comes from the dictionary in the same order. */
function demos(t: Dict["features"]): { demo: React.ReactNode }[] {
  return [
    {
      demo: (
        <div className="relative flex h-full items-center px-4">
          <div className="grid w-full grid-cols-3 overflow-hidden rounded-lg bg-white shadow">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("aspect-[3/4]", i < 2 && "border-r border-dashed border-accent/50")} />
            ))}
          </div>
          <PhotoTile
            i={1}
            className="absolute top-1/2 left-[22%] aspect-[16/10] w-[56%] -translate-y-1/2 rounded shadow-lg"
          />
        </div>
      ),
    },
    {
      demo: (
        <div className="grid h-full place-items-center">
          <PhotoTile i={3} className="aspect-[4/3] w-[70%] rounded-lg shadow-lg">
            <DateStamp className="text-base">&apos;26 10 18</DateStamp>
          </PhotoTile>
        </div>
      ),
    },
    {
      demo: (
        <div className="flex h-full flex-col justify-center gap-2 px-6 text-[11px]">
          <span className="self-end rounded-2xl bg-accent px-3 py-1.5 text-white">{t.demoAsk}</span>
          <span className="flex items-start gap-1.5 self-start rounded-2xl bg-white px-3 py-1.5 shadow">
            <Sparkles size={12} className="mt-0.5 shrink-0 text-accent" /> {t.demoTip}
          </span>
        </div>
      ),
    },
    {
      demo: (
        <div className="relative h-full">
          <Polaroid i={0} rotate={-6} className="absolute top-[14%] left-[18%] w-[34%]" />
          <Polaroid i={5} rotate={5} className="absolute top-[22%] left-[46%] w-[34%]" />
        </div>
      ),
    },
    {
      demo: (
        <div className="grid h-full place-items-center">
          <span className="flex items-center gap-2 rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-white shadow-lg">
            <Download size={16} /> 2880 × 3840
          </span>
        </div>
      ),
    },
    {
      demo: (
        <div className="grid h-full place-items-center">
          <Smartphone size={56} strokeWidth={1.2} className="text-fg/70" />
        </div>
      ),
    },
  ];
}

export function FeatureGrid({ t }: { t: Dict["features"] }) {
  const cards = demos(t).map((d, i) => ({ ...d, ...t.items[i] }));
  return (
    <section id="features" className="relative z-30 -mt-[100vh] rounded-t-cover bg-bg px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center display-2">
          {t.title[0]}
          <br />
          <span className="accent-line">{t.title[1]}</span>
        </h2>
        <Reveal as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((f) => (
            <RevealItem as="li" key={f.title} className="flex">
              <SpotlightCard className="flex w-full flex-col overflow-hidden rounded-card border border-black/5 bg-white shadow-card">
                <div className="h-44 bg-[linear-gradient(180deg,#f5f3ff,#ffffff)]">{f.demo}</div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold tracking-[-0.02em]">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              </SpotlightCard>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
