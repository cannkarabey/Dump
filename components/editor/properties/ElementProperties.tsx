"use client";

import { ArrowDown, ArrowUp, Copy, Lock, LockOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDoc, type ElPatch } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { FONT_OPTIONS } from "@/lib/fonts";
import type { El, FontKey, Frame, ImageEl, SlotEl, TextEl } from "@/lib/types";
import { Locked } from "../Locked";
import { ChipGroup, NumberField, Section, SliderField } from "./fields";

const ELEMENT_LABELS: Record<El["type"], string> = {
  image: "Fotoğraf",
  slot: "Şablon kutusu",
  text: "Metin",
  sticker: "Sticker",
  shape: "Şekil",
};

/** Right panel when one or more elements are selected. */
export function ElementProperties({ ids }: { ids: string[] }) {
  const elements = useDoc((s) => s.doc.elements);
  const selected = elements.filter((el) => ids.includes(el.id));
  const doc = useDoc.getState();
  const ui = useUi.getState();

  if (!selected.length) return null;

  const remove = () => {
    doc.removeElements(ids);
    ui.setSelection([]);
  };
  const allLocked = selected.every((el) => el.locked);
  const toggleLock = () => doc.updateElements(selected.map((el) => ({ id: el.id, patch: { locked: !allLocked } })));

  const actions = (
    <div className="flex gap-1">
      <Tooltip content={allLocked ? "Kilidi aç" : "Kilitle"}>
        <IconButton label={allLocked ? "Kilidi aç" : "Kilitle"} size="sm" onClick={toggleLock}>
          {allLocked ? <Lock size={15} /> : <LockOpen size={15} />}
        </IconButton>
      </Tooltip>
      <Tooltip content="Çoğalt (⌘D)">
        <IconButton label="Çoğalt" size="sm" onClick={() => ui.setSelection(doc.duplicate(ids))}>
          <Copy size={15} />
        </IconButton>
      </Tooltip>
      <Tooltip content="Sil (Delete)">
        <IconButton label="Sil" size="sm" onClick={remove}>
          <Trash2 size={15} />
        </IconButton>
      </Tooltip>
    </div>
  );

  if (selected.length > 1) {
    return (
      <Section title={`${selected.length} öğe seçili`} action={actions}>
        <p className="text-xs text-muted">Shift ile tıklayarak seçime ekle/çıkar. Birlikte taşı, döndür ya da boyutlandır.</p>
      </Section>
    );
  }

  const el = selected[0];
  const patch = (p: ElPatch) => doc.updateElement(el.id, p);

  return (
    <div className="flex flex-col gap-3">
      <Section title={ELEMENT_LABELS[el.type]} action={actions}>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={el.x} onCommit={(x) => patch({ x })} />
          <NumberField label="Y" value={el.y} onCommit={(y) => patch({ y })} />
          <NumberField label="G" value={el.width} min={20} onCommit={(width) => patch({ width })} />
          {el.type !== "text" && <NumberField label="Yk" value={el.height} min={20} onCommit={(height) => patch({ height })} />}
          <NumberField label="↻" value={el.rotation} suffix="°" onCommit={(rotation) => patch({ rotation })} />
        </div>
        <div className="mt-3">
          <SliderField
            label="Opaklık"
            value={el.opacity * 100}
            min={0}
            max={100}
            onCommit={(v) => patch({ opacity: v / 100 })}
            format={(v) => `${Math.round(v)}%`}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => doc.bringForward(el.id)}>
            <ArrowUp size={14} /> Öne
          </Button>
          <Button size="sm" variant="secondary" onClick={() => doc.sendBackward(el.id)}>
            <ArrowDown size={14} /> Arkaya
          </Button>
        </div>
      </Section>

      {(el.type === "image" || el.type === "slot") && <PhotoSection el={el} patch={patch} />}
      {el.type === "text" && <TextSection el={el} patch={patch} />}
    </div>
  );
}

function PhotoSection({ el, patch }: { el: ImageEl | SlotEl; patch: (p: ElPatch) => void }) {
  return (
    <Section title="Fotoğraf">
      <p className="mb-1.5 text-xs text-muted">Çerçeve</p>
      <ChipGroup<Frame>
        value={el.frame ?? "none"}
        onChange={(frame) => patch({ frame })}
        options={[
          { value: "none", label: "Yok" },
          { value: "polaroid", label: "Polaroid" },
          { value: "film", label: "Film" },
        ]}
      />
      {(!el.frame || el.frame === "none") && (
        <div className="mt-3">
          <SliderField
            label="Köşe yuvarlaklığı"
            value={el.radius ?? 0}
            min={0}
            max={Math.round(Math.min(el.width, el.height) / 2)}
            onCommit={(radius) => patch({ radius })}
          />
        </div>
      )}
      <Locked feature="stamp" className="mt-3">
        <label className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-2 text-sm">
          <span>
            Tarih damgası
            <span className="block text-xs text-muted">Fotoğrafın çekim tarihi, retro kamera stilinde</span>
          </span>
          <input
            type="checkbox"
            checked={Boolean(el.stamp)}
            onChange={(e) => patch({ stamp: e.target.checked })}
            className="size-4 accent-[var(--color-accent)]"
          />
        </label>
      </Locked>
      {el.type === "slot" && el.assetId && (
        <Button size="sm" variant="ghost" className="mt-2" onClick={() => patch({ assetId: undefined })}>
          Fotoğrafı kutudan çıkar
        </Button>
      )}
    </Section>
  );
}

function TextSection({ el, patch }: { el: TextEl; patch: (p: ElPatch) => void }) {
  return (
    <Section title="Metin">
      <textarea
        key={el.text}
        defaultValue={el.text}
        rows={2}
        onBlur={(e) => e.target.value !== el.text && patch({ text: e.target.value })}
        className="w-full resize-none rounded-xl bg-card p-2.5 text-sm outline-none"
        aria-label="Metin içeriği"
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          aria-label="Font"
          value={el.fontFamily}
          onChange={(e) => patch({ fontFamily: e.target.value as FontKey })}
          className="h-9 rounded-xl bg-card px-2 text-sm"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
        <NumberField label="pt" value={el.fontSize} min={8} onCommit={(fontSize) => patch({ fontSize })} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label="Metin rengi"
          value={el.fill}
          onChange={(e) => patch({ fill: e.target.value })}
          className="size-9 cursor-pointer rounded-xl bg-card p-1"
        />
        <ChipGroup<TextEl["align"]>
          value={el.align}
          onChange={(align) => patch({ align })}
          options={[
            { value: "left", label: "Sol" },
            { value: "center", label: "Orta" },
            { value: "right", label: "Sağ" },
          ]}
        />
      </div>
    </Section>
  );
}
