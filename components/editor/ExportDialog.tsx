"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Segmented";
import { Crown } from "@/components/ui/Crown";
import { useUi } from "@/lib/store/ui";
import { useDoc } from "@/lib/store/doc";
import { useLimits } from "@/lib/store/tier";
import { stageRef } from "@/lib/stageRef";
import {
  downloadEach,
  downloadZip,
  exportPages,
  exportPixelRatio,
  fileNames,
  type ExportMime,
} from "@/lib/export";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/app";

const QUALITIES = [
  { id: "hd", label: "HD", longSide: 1440 },
  { id: "2k", label: "2K", longSide: 2560 },
  { id: "4k", label: "4K", longSide: 3840 },
] as const;

export function ExportDialog() {
  const open = useUi((s) => s.modals.export);
  const close = () => useUi.getState().closeModal("export");
  const doc = useDoc((s) => s.doc);
  const activePage = useUi((s) => s.activePage);
  const limits = useLimits();
  const x = useT().t.exportDialog;

  const [mime, setMime] = useState<ExportMime>("image/png");
  const [quality, setQuality] = useState<(typeof QUALITIES)[number]["id"]>("hd");
  const [scope, setScope] = useState<"all" | "current">("all");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const q = QUALITIES.find((x) => x.id === quality)!;
  // Fall back to the best quality the tier allows if the selection is locked (e.g. after a downgrade).
  const longSide = q.longSide <= limits.exportLongSide ? q.longSide : limits.exportLongSide;
  const ratio = exportPixelRatio(doc, longSide);
  const outW = Math.round(doc.format.w * ratio);
  const outH = Math.round(doc.format.h * ratio);
  const pages = scope === "all" ? Array.from({ length: doc.format.pages }, (_, i) => i) : [activePage];
  const zip = limits.zip && pages.length > 1;

  const run = async () => {
    const stage = stageRef.current;
    if (!stage) return;
    setError(null);
    setProgress({ done: 0, total: pages.length });
    try {
      const blobs = await exportPages(stage, doc, {
        mime,
        longSide,
        pages,
        watermark: limits.watermark,
        onProgress: (done, total) => setProgress({ done, total }),
      });
      const names = fileNames(doc, pages, mime);
      if (zip) await downloadZip(blobs, names, doc.title);
      else await downloadEach(blobs, names);
      close();
      useUi.getState().showNotice(format(x.done, { n: blobs.length, w: outW, h: outH }));
    } catch (e) {
      console.error(e);
      setError(x.failed);
    } finally {
      setProgress(null);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && !progress && close()}
      title={x.title}
      description={x.description}
      className="w-[min(92vw,480px)]"
    >
      <div className="flex flex-col gap-5">
        <Field label={x.format}>
          <Segmented
            aria-label={x.format}
            value={mime}
            onChange={setMime}
            options={[
              { value: "image/png", label: "PNG" },
              { value: "image/jpeg", label: "JPG" },
            ]}
          />
        </Field>

        <Field label={x.quality} hint={`${outW} × ${outH} px`}>
          <div className="flex gap-1.5">
            {QUALITIES.map((opt) => {
              const locked = opt.longSide > limits.exportLongSide;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={quality === opt.id}
                  onClick={() => (locked ? useUi.getState().openPaywall("hiRes") : setQuality(opt.id))}
                  className={cn(
                    "flex h-9 items-center gap-1 rounded-full px-4 text-sm font-medium transition",
                    quality === opt.id && !locked ? "bg-accent text-white" : "bg-hover text-muted hover:text-fg",
                  )}
                >
                  {opt.label}
                  {locked && <Crown />}
                </button>
              );
            })}
          </div>
        </Field>

        {doc.format.pages > 1 && (
          <Field label={x.pages}>
            <Segmented
              aria-label={x.pages}
              value={scope}
              onChange={setScope}
              options={[
                { value: "all", label: format(x.all, { n: doc.format.pages }) },
                { value: "current", label: format(x.page, { n: activePage + 1 }) },
              ]}
            />
          </Field>
        )}

        <ul className="flex flex-col gap-1 rounded-2xl bg-hover p-3 text-xs text-muted">
          {pages.length > 1 && (
            <li className="flex items-center gap-1.5">
              {limits.zip ? (
                x.zipNote
              ) : (
                <>
                  {x.eachNote} <Crown /> Creator.
                </>
              )}
            </li>
          )}
          {limits.watermark && (
            <li>
              {x.watermarkNote}{" "}
              <button type="button" className="text-accent underline" onClick={() => useUi.getState().openPaywall("hiRes")}>
                {x.remove}
              </button>
            </li>
          )}
          {mime === "image/jpeg" && doc.background === "transparent" && <li>{x.jpgNote}</li>}
        </ul>

        {error && <p className="text-sm text-[#ff453a]">{error}</p>}

        <Button variant="accent" size="lg" onClick={run} disabled={Boolean(progress)}>
          {progress ? (
            format(x.preparing, { done: progress.done, total: progress.total })
          ) : (
            <>
              <Download size={17} />
              {zip ? x.zip : pages.length > 1 ? format(x.many, { n: pages.length }) : x.one}
            </>
          )}
        </Button>
        {progress && (
          <div className="-mt-3 h-1 overflow-hidden rounded-full bg-hover" aria-hidden>
            <div className="h-full bg-accent transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        )}
      </div>
    </Modal>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium">
        {label}
        {hint && <span className="block text-xs font-normal text-muted tabular-nums">{hint}</span>}
      </span>
      {children}
    </div>
  );
}
