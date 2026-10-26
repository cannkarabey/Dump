"use client";

import { cn } from "@/lib/cn";

export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-hover p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Uncontrolled number input that commits on blur/Enter, so typing doesn't spam undo history. */
export function NumberField({
  label,
  value,
  onCommit,
  suffix,
  min,
  max,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  const rounded = Math.round(value);
  const commit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onCommit(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)));
  };
  return (
    <label className="flex h-9 items-center gap-1.5 rounded-xl bg-card px-2.5 text-sm">
      <span className="w-4 shrink-0 text-xs text-muted">{label}</span>
      <input
        key={rounded}
        type="number"
        defaultValue={rounded}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="w-full min-w-0 bg-transparent tabular-nums outline-none"
      />
      {suffix && <span className="text-xs text-muted">{suffix}</span>}
    </label>
  );
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onCommit,
  format = (v) => String(Math.round(v)),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onCommit: (n: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs">
      <span className="flex justify-between text-muted">
        {label}
        <span className="tabular-nums text-fg">{format(value)}</span>
      </span>
      <input
        key={value}
        type="range"
        min={min}
        max={max}
        step={step}
        defaultValue={value}
        // Commit on release only: one undo step per slider gesture.
        onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
        onKeyUp={(e) => onCommit(Number(e.currentTarget.value))}
        className="accent-[var(--color-accent)]"
      />
    </label>
  );
}

export function ChipGroup<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-8 rounded-full px-3 text-xs font-medium transition",
            value === o.value ? "bg-accent text-white" : "bg-card text-muted hover:text-fg",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
