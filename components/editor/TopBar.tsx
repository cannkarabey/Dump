"use client";

import { useState } from "react";
import Link from "next/link";
import { Cloud, Download, Minus, Plus, Redo2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUi } from "@/lib/store/ui";
import { useTier } from "@/lib/store/tier";
import { TIER_LABELS } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";

const ZOOM_STEP = 1.2;
const DEV = process.env.NODE_ENV === "development";

export function TopBar() {
  const zoom = useUi((s) => s.zoom);
  const setZoom = useUi((s) => s.setZoom);
  const tier = useTier((s) => s.tier);
  // Moves into the doc store in S1.4.
  const [title, setTitle] = useState("Adsız dump");

  return (
    <header className="col-span-4 flex items-center gap-3 px-2">
      <Link href="/" className="flex items-center gap-2 pr-2" aria-label="Ana sayfa">
        <Logo />
        <span className="font-display text-lg font-bold tracking-tight">dump</span>
      </Link>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        aria-label="Dump adı"
        className="h-8 w-44 rounded-lg bg-transparent px-2 text-sm font-medium outline-none hover:bg-hover focus:bg-hover"
      />
      <Tooltip content="Bu cihazda kaydedildi">
        <span className="text-muted">
          <Cloud size={16} />
        </span>
      </Tooltip>

      <div className="mx-auto flex items-center gap-1">
        <Tooltip content="Geri al (⌘Z)">
          <IconButton label="Geri al" disabled>
            <Undo2 size={17} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Yinele (⇧⌘Z)">
          <IconButton label="Yinele" disabled>
            <Redo2 size={17} />
          </IconButton>
        </Tooltip>

        <div className="mx-2 h-5 w-px bg-border" />

        <IconButton label="Uzaklaştır" onClick={() => setZoom(zoom / ZOOM_STEP)}>
          <Minus size={17} />
        </IconButton>
        <span className="w-12 text-center text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
        <IconButton label="Yakınlaştır" onClick={() => setZoom(zoom * ZOOM_STEP)}>
          <Plus size={17} />
        </IconButton>
      </div>

      {DEV && <DevTierToggle />}
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          tier === "free" ? "bg-hover text-muted" : "bg-accent-soft text-accent",
        )}
      >
        {TIER_LABELS[tier]}
      </span>
      <Button variant="accent" size="sm" disabled title="Export S1.12'de geliyor">
        <Download size={15} />
        Dışa aktar
      </Button>
    </header>
  );
}

function DevTierToggle() {
  const tier = useTier((s) => s.tier);
  const setTier = useTier((s) => s.setTier);
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted">
      dev tier
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value as Tier)}
        className="h-7 rounded-md border border-border bg-card px-1.5 text-xs text-fg"
      >
        {(Object.keys(TIER_LABELS) as Tier[]).map((t) => (
          <option key={t} value={t}>
            {TIER_LABELS[t]}
          </option>
        ))}
      </select>
    </label>
  );
}

function Logo() {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden>
      <rect x="1" y="5" width="18" height="14" rx="3" fill="var(--color-accent)" opacity="0.45" />
      <rect x="9" y="1" width="18" height="14" rx="3" fill="var(--color-accent)" />
    </svg>
  );
}
