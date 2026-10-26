"use client";

import { ArrowDown, ArrowUp, Copy, Lock, LockOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDoc, type ElPatch } from "@/lib/store/doc";
import { useUi } from "@/lib/store/ui";
import { FONT_OPTIONS } from "@/lib/fonts";
import type { FontKey, Frame, ImageEl, SlotEl, TextEl } from "@/lib/types";
import { Locked } from "../Locked";
import { ChipGroup, NumberField, Section, SliderField } from "./fields";
import { format, useT } from "@/lib/i18n/app";

/** Right panel when one or more elements are selected. */
export function ElementProperties({ ids }: { ids: string[] }) {
  const elements = useDoc((s) => s.doc.elements);
  const selected = elements.filter((el) => ids.includes(el.id));
  const x = useT().t.element;
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
      <Tooltip content={allLocked ? x.unlock : x.lock}>
        <IconButton label={allLocked ? x.unlock : x.lock} size="sm" onClick={toggleLock}>
          {allLocked ? <Lock size={15} /> : <LockOpen size={15} />}
        </IconButton>
      </Tooltip>
      <Tooltip content={x.duplicateHint}>
        <IconButton label={x.duplicate} size="sm" onClick={() => ui.setSelection(doc.duplicate(ids))}>
          <Copy size={15} />
        </IconButton>
      </Tooltip>
      <Tooltip content={x.deleteHint}>
        <IconButton label={x.delete} size="sm" onClick={remove}>
          <Trash2 size={15} />
        </IconButton>
      </Tooltip>
    </div>
  );

  if (selected.length > 1) {
    return (
      <Section title={format(x.selected, { n: selected.length })} action={actions}>
        <p className="text-xs text-muted">{x.multiHint}</p>
      </Section>
    );
  }

  const el = selected[0];
  const patch = (p: ElPatch) => doc.updateElement(el.id, p);

  return (
    <div className="flex flex-col gap-3">
      <Section title={x.types[el.type]} action={actions}>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="X" value={el.x} onCommit={(x) => patch({ x })} />
          <NumberField label="Y" value={el.y} onCommit={(y) => patch({ y })} />
          <NumberField label={x.w} value={el.width} min={20} onCommit={(width) => patch({ width })} />
          {el.type !== "text" && <NumberField label={x.h} value={el.height} min={20} onCommit={(height) => patch({ height })} />}
          <NumberField label="↻" value={el.rotation} suffix="°" onCommit={(rotation) => patch({ rotation })} />
        </div>
        <div className="mt-3">
          <SliderField
            label={x.opacity}
            value={el.opacity * 100}
            min={0}
            max={100}
            onCommit={(v) => patch({ opacity: v / 100 })}
            format={(v) => `${Math.round(v)}%`}
          />
        </div>
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => doc.bringForward(el.id)}>
            <ArrowUp size={14} /> {x.forward}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => doc.sendBackward(el.id)}>
            <ArrowDown size={14} /> {x.backward}
          </Button>
        </div>
      </Section>

      {(el.type === "image" || el.type === "slot") && <PhotoSection el={el} patch={patch} />}
      {el.type === "text" && <TextSection el={el} patch={patch} />}
    </div>
  );
}

function PhotoSection({ el, patch }: { el: ImageEl | SlotEl; patch: (p: ElPatch) => void }) {
  const x = useT().t.element;
  return (
    <Section title={x.photo}>
      <p className="mb-1.5 text-xs text-muted">{x.frame}</p>
      <ChipGroup<Frame>
        value={el.frame ?? "none"}
        onChange={(frame) => patch({ frame })}
        options={[
          { value: "none", label: x.frames.none },
          { value: "polaroid", label: x.frames.polaroid },
          { value: "film", label: x.frames.film },
        ]}
      />
      {(!el.frame || el.frame === "none") && (
        <div className="mt-3">
          <SliderField
            label={x.radius}
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
            {x.stamp}
            <span className="block text-xs text-muted">{x.stampHint}</span>
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
          {x.removeFromSlot}
        </Button>
      )}
    </Section>
  );
}

function TextSection({ el, patch }: { el: TextEl; patch: (p: ElPatch) => void }) {
  const { t } = useT();
  const x = t.element;
  return (
    <Section title={x.text}>
      <textarea
        key={el.text}
        defaultValue={el.text}
        rows={2}
        onBlur={(e) => e.target.value !== el.text && patch({ text: e.target.value })}
        className="w-full resize-none rounded-xl bg-card p-2.5 text-sm outline-none"
        aria-label={x.textContent}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        <select
          aria-label={x.font}
          value={el.fontFamily}
          onChange={(e) => patch({ fontFamily: e.target.value as FontKey })}
          className="h-9 rounded-xl bg-card px-2 text-sm"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.key} value={f.key}>
              {t.fonts[f.key] ?? f.label}
            </option>
          ))}
        </select>
        <NumberField label="pt" value={el.fontSize} min={8} onCommit={(fontSize) => patch({ fontSize })} />
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="color"
          aria-label={x.textColor}
          value={el.fill}
          onChange={(e) => patch({ fill: e.target.value })}
          className="size-9 cursor-pointer rounded-xl bg-card p-1"
        />
        <ChipGroup<TextEl["align"]>
          value={el.align}
          onChange={(align) => patch({ align })}
          options={[
            { value: "left", label: x.align.left },
            { value: "center", label: x.align.center },
            { value: "right", label: x.align.right },
          ]}
        />
      </div>
    </Section>
  );
}
