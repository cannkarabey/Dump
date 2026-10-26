"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowLeftRight, ChevronRight, Minus, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Segmented } from "@/components/ui/Segmented";
import { useUi } from "@/lib/store/ui";
import { useDoc } from "@/lib/store/doc";
import { useLimits } from "@/lib/store/tier";
import { aspectLabel, PRESET_GROUPS, PRESETS, type PresetGroup } from "@/lib/presets";
import type { DumpMode } from "@/lib/types";
import { cn } from "@/lib/cn";

const MIN_SIDE = 320;
const MAX_SIDE = 4096;

export function NewDumpModal() {
  const open = useUi((s) => s.modals.newDump);
  const close = () => useUi.getState().closeModal("newDump");
  const router = useRouter();
  const { maxPages } = useLimits();

  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<DumpMode>("carousel");
  const [group, setGroup] = useState<PresetGroup>("popular");
  const [size, setSize] = useState({ w: 1080, h: 1440 });
  const [pages, setPages] = useState(3);

  const choose = (m: DumpMode) => {
    setMode(m);
    setStep(2);
  };

  const create = () => {
    const w = clampSide(size.w);
    const h = clampSide(size.h);
    const doc = useDoc
      .getState()
      .newDoc({ w, h, mode, pages: mode === "single" ? 1 : Math.min(pages, maxPages) });
    useUi.getState().setSelection([]);
    useUi.getState().setActivePage(0);
    close();
    router.replace(`/app/editor/${doc.id}`);
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
        if (!o) setStep(1);
      }}
      title={step === 1 ? "Yeni dump" : "Boyut seç"}
      description={step === 1 ? "Ne oluşturuyorsun?" : "Hazır bir boyut ya da kendi ölçün"}
    >
      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <ModeCard
            title="Tek post"
            text="Tek canvas, istediğin boyut."
            onClick={() => choose("single")}
            illustration={<div className="h-28 w-22 rotate-[-4deg] rounded-xl bg-gradient-to-br from-[#ffd29d] to-[#ff7a59] shadow-xl" />}
          />
          <ModeCard
            title="Carousel"
            text="Tek geniş canvas, kaydırınca akan slaytlar."
            onClick={() => choose("carousel")}
            illustration={
              <div className="flex gap-1">
                {["from-[#9be7ff] to-[#5b8cff]", "from-[#c9b6ff] to-[#7c5cff]", "from-[#ffc6e5] to-[#ff5fa2]"].map((g) => (
                  <div key={g} className={cn("h-24 w-16 rounded-lg bg-gradient-to-br shadow-xl", g)} />
                ))}
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <IconButton label="Geri" onClick={() => setStep(1)}>
              <ArrowLeft size={18} />
            </IconButton>
            <Segmented
              aria-label="Platform"
              value={group}
              onChange={setGroup}
              options={PRESET_GROUPS.map((g) => ({ value: g.id, label: g.label }))}
            />
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {PRESETS.filter((p) => p.groups.includes(group)).map((p) => {
              const selected = p.w === size.w && p.h === size.h;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setSize({ w: p.w, h: p.h })}
                    aria-pressed={selected}
                    className={cn(
                      "flex w-full flex-col items-center gap-3 rounded-2xl border p-4 transition",
                      selected ? "border-accent bg-accent-soft" : "border-border bg-hover hover:border-border-strong",
                    )}
                  >
                    <span className="grid h-24 place-items-center">
                      <span
                        className="relative rounded-md bg-gradient-to-br from-[#e9e4ff] to-[#b9a9ff]"
                        style={previewBox(p.w, p.h)}
                      >
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] font-semibold text-white">
                          {aspectLabel(p.w, p.h)}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold">{p.label}</span>
                    <span className="-mt-2 text-xs text-muted tabular-nums">
                      {p.w} × {p.h} px
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-hover p-3">
            <span className="text-sm font-semibold">Özel</span>
            <SizeInput label="Genişlik" value={size.w} onChange={(w) => setSize((s) => ({ ...s, w }))} />
            <IconButton label="En ve boyu değiştir" size="sm" onClick={() => setSize((s) => ({ w: s.h, h: s.w }))}>
              <ArrowLeftRight size={15} />
            </IconButton>
            <SizeInput label="Yükseklik" value={size.h} onChange={(h) => setSize((s) => ({ ...s, h }))} />

            {mode === "carousel" && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted">Sayfa</span>
                <IconButton label="Sayfa azalt" size="sm" onClick={() => setPages((n) => Math.max(2, n - 1))}>
                  <Minus size={14} />
                </IconButton>
                <span className="w-5 text-center tabular-nums">{pages}</span>
                <IconButton
                  label="Sayfa artır"
                  size="sm"
                  onClick={() => setPages((n) => Math.min(maxPages, n + 1))}
                  disabled={pages >= maxPages}
                >
                  <Plus size={14} />
                </IconButton>
              </div>
            )}

            <Button variant="accent" className="ml-auto" onClick={create}>
              Dump oluştur
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function clampSide(n: number) {
  return Math.round(Math.min(MAX_SIDE, Math.max(MIN_SIDE, Number.isFinite(n) ? n : 1080)));
}

function previewBox(w: number, h: number) {
  const max = 88;
  const k = max / Math.max(w, h);
  return { width: w * k, height: h * k };
}

function SizeInput({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="flex h-9 items-center gap-1 rounded-full border border-border bg-card px-3 text-sm">
      <span className="sr-only">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={MIN_SIDE}
        max={MAX_SIDE}
        value={value}
        onChange={(e) => onChange(e.target.valueAsNumber)}
        onBlur={(e) => onChange(clampSide(e.target.valueAsNumber))}
        className="w-16 bg-transparent tabular-nums outline-none"
      />
      <span className="text-muted">px</span>
    </label>
  );
}

function ModeCard({
  title,
  text,
  illustration,
  onClick,
}: {
  title: string;
  text: string;
  illustration: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-hover text-left transition hover:border-border-strong"
    >
      <span className="grid h-48 place-items-center bg-gradient-to-b from-transparent to-black/20">{illustration}</span>
      <span className="flex items-center gap-3 p-5">
        <span className="flex-1">
          <span className="block text-base font-semibold">{title}</span>
          <span className="block text-sm text-muted">{text}</span>
        </span>
        <span className="grid size-9 place-items-center rounded-full bg-active transition group-hover:translate-x-0.5">
          <ChevronRight size={18} />
        </span>
      </span>
    </button>
  );
}
