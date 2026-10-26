"use client";

import Link from "next/link";
import { Cloud, CloudCheck, CloudOff, Download, FileJson, Loader2, Minus, Plus, Redo2, Sparkles, Undo2 } from "lucide-react";
import { saveAs } from "file-saver";
import { runMonthDump } from "@/lib/runMonthDump";
import { templateFromDoc } from "@/lib/templates/fromDoc";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUi } from "@/lib/store/ui";
import { useMockTiers, useTier } from "@/lib/store/tier";
import { useDoc, useDocHistory } from "@/lib/store/doc";
import { TIER_LABELS } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";

const ZOOM_STEP = 1.2;
const DEV = process.env.NODE_ENV === "development";

export function TopBar() {
  const zoom = useUi((s) => s.zoom);
  const setZoom = useUi((s) => s.setZoom);
  const tier = useTier((s) => s.tier);
  const mockTiers = useMockTiers();
  const title = useDoc((s) => s.doc.title);
  const setTitle = useDoc((s) => s.setTitle);
  const canUndo = useDocHistory((s) => s.pastStates.length > 0);
  const canRedo = useDocHistory((s) => s.futureStates.length > 0);
  const { undo, redo } = useDoc.temporal.getState();

  return (
    <header className="col-span-4 flex items-center gap-3 px-2">
      <Link href="/app" className="flex items-center gap-2 pr-2" aria-label="Dump'larım">
        <Logo />
        <span className="font-display text-lg font-bold tracking-tight">dump</span>
      </Link>

      <input
        // Uncontrolled + commit on blur, so typing doesn't create one undo step per keystroke.
        key={title}
        defaultValue={title}
        onBlur={(e) => setTitle(e.target.value.trim() || "Adsız dump")}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label="Dump adı"
        className="h-8 w-44 rounded-lg bg-transparent px-2 text-sm font-medium outline-none hover:bg-hover focus:bg-hover"
      />
      <SaveIndicator />

      <div className="mx-auto flex items-center gap-1">
        <Tooltip content="Geri al (⌘Z)">
          <IconButton label="Geri al" disabled={!canUndo} onClick={() => undo()}>
            <Undo2 size={17} />
          </IconButton>
        </Tooltip>
        <Tooltip content="Yinele (⇧⌘Z)">
          <IconButton label="Yinele" disabled={!canRedo} onClick={() => redo()}>
            <Redo2 size={17} />
          </IconButton>
        </Tooltip>

        <div className="mx-2 h-5 w-px bg-border" />

        <IconButton label="Uzaklaştır" onClick={() => setZoom(zoom / ZOOM_STEP)}>
          <Minus size={17} />
        </IconButton>
        <Tooltip content="Ekrana sığdır">
          <button
            type="button"
            onClick={() => useUi.getState().requestFit()}
            className="h-8 w-14 rounded-lg text-center text-sm tabular-nums hover:bg-hover"
          >
            {Math.round(zoom * 100)}%
          </button>
        </Tooltip>
        <IconButton label="Yakınlaştır" onClick={() => setZoom(zoom * ZOOM_STEP)}>
          <Plus size={17} />
        </IconButton>
      </div>

      <Tooltip content="Fotoğrafları tarihe göre sırala, ay kapağı ve renk paleti oluştur">
        <Button variant="secondary" size="sm" onClick={runMonthDump}>
          <Sparkles size={15} className="text-accent" />
          Ayın Dump&apos;ı
        </Button>
      </Tooltip>
      {DEV && <DevTemplateExport />}
      {mockTiers && <DevTierToggle />}
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-semibold",
          tier === "free" ? "bg-hover text-muted" : "bg-accent-soft text-accent",
        )}
      >
        {TIER_LABELS[tier]}
      </span>
      <Button variant="accent" size="sm" onClick={() => useUi.getState().openModal("export")}>
        <Download size={15} />
        Dışa aktar
      </Button>
    </header>
  );
}

const SAVE_LABELS = {
  idle: "Değişiklikler bu cihazda otomatik kaydedilir",
  saving: "Kaydediliyor…",
  saved: "Bu cihazda kaydedildi",
  error: "Kaydedilemedi — tarayıcı depolaması dolu ya da kapalı olabilir",
} as const;

function SaveIndicator() {
  const state = useUi((s) => s.saveState);
  const Icon = state === "saving" ? Loader2 : state === "error" ? CloudOff : state === "saved" ? CloudCheck : Cloud;
  return (
    <Tooltip content={SAVE_LABELS[state]}>
      <span role="status" aria-label={SAVE_LABELS[state]} className={cn("text-muted", state === "error" && "text-[#ff453a]")}>
        <Icon size={16} className={state === "saving" ? "animate-spin" : undefined} />
      </span>
    </Tooltip>
  );
}

/** Dev-only: download the open doc as a template JSON for lib/templates/data. */
function DevTemplateExport() {
  return (
    <Tooltip content="Şablon olarak dışa aktar (dev)">
      <IconButton
        label="Şablon olarak dışa aktar"
        size="sm"
        onClick={() => {
          const t = templateFromDoc(useDoc.getState().doc);
          saveAs(new Blob([JSON.stringify(t, null, 1)], { type: "application/json" }), `${t.id}.json`);
        }}
      >
        <FileJson size={15} />
      </IconButton>
    </Tooltip>
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
