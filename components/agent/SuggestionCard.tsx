"use client";

import { useState } from "react";
import { ArrowDownUp, Check, Copy, Image as ImageIcon, LayoutTemplate, Palette, Trash2, Type, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAssets } from "@/lib/store/assets";
import { getTemplate } from "@/lib/templates";
import { assetRefs } from "@/lib/agent/context";
import type { AgentToolName } from "@/lib/agent/tools";
import { cn } from "@/lib/cn";
import { format, useLocalizeTemplate, useT } from "@/lib/i18n/app";

const ICONS: Record<AgentToolName, LucideIcon> = {
  reorder_photos: ArrowDownUp,
  set_cover: ImageIcon,
  remove_photo: Trash2,
  apply_template: LayoutTemplate,
  set_background: Palette,
  add_text: Type,
  suggest_caption: Copy,
};

/** Small thumbnails for the photo refs a suggestion mentions. */
function RefThumbs({ refs }: { refs: string[] }) {
  const { assets, order } = useAssets();
  const { toAsset } = assetRefs(order);
  return (
    <div className="flex gap-1">
      {refs.slice(0, 8).map((ref, i) => {
        const asset = assets[toAsset.get(ref) ?? ""];
        return asset ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${ref}-${i}`} src={asset.url} alt={ref} className={cn("size-9 rounded-md object-cover", i === 0 && "ring-2 ring-accent")} />
        ) : null;
      })}
    </div>
  );
}

function Preview({ name, input }: { name: AgentToolName; input: Record<string, unknown> }) {
  const { t } = useT();
  const localize = useLocalizeTemplate();
  const template = name === "apply_template" ? getTemplate(input.templateId as string) : undefined;
  switch (name) {
    case "reorder_photos":
      return <RefThumbs refs={(input.order as string[]) ?? []} />;
    case "set_cover":
    case "remove_photo":
      return <RefThumbs refs={[input.photo as string]} />;
    case "set_background":
      return (
        <span className="flex items-center gap-2 text-xs text-muted">
          <span className="size-6 rounded-full border border-border-strong" style={{ background: input.color as string }} />
          {input.color as string}
        </span>
      );
    case "apply_template":
      return <span className="text-xs text-muted">{template ? localize(template).title : (input.templateId as string)}</span>;
    case "add_text":
      return (
        <span className="text-xs text-muted">
          {format(t.agent.textOnPage, { page: input.page as number, text: input.text as string })}
        </span>
      );
    default:
      return null;
  }
}

function CaptionPicker({ captions, hashtags }: { captions: string[]; hashtags: string[] }) {
  const [copied, setCopied] = useState<number | null>(null);
  const copy = (i: number, text: string) => {
    void navigator.clipboard.writeText(text).then(() => setCopied(i));
  };
  const tags = hashtags.join(" ");
  return (
    <ul className="flex flex-col gap-1.5">
      {captions.map((c, i) => (
        <li key={i}>
          <button
            type="button"
            onClick={() => copy(i, tags ? `${c}\n\n${tags}` : c)}
            className="flex w-full items-start gap-2 rounded-xl bg-card p-2.5 text-left text-xs leading-snug hover:bg-active"
          >
            <span className="flex-1">{c}</span>
            {copied === i ? <Check size={14} className="shrink-0 text-[#34c759]" /> : <Copy size={14} className="shrink-0 text-muted" />}
          </button>
        </li>
      ))}
      {tags && <li className="px-1 text-[11px] leading-relaxed text-accent">{tags}</li>}
    </ul>
  );
}

/** One assistant suggestion: preview + Apply/Dismiss while pending, a compact receipt afterwards. */
export function SuggestionCard({
  name,
  input,
  state,
  output,
  onApply,
  onDismiss,
}: {
  name: AgentToolName;
  input: Record<string, unknown> | undefined;
  state: "pending" | "streaming" | "done";
  output?: { applied?: boolean; message?: string };
  onApply: () => void;
  onDismiss: () => void;
}) {
  const Icon = ICONS[name];
  const a = useT().t.agent;
  if (state === "streaming" || !input) {
    return <div className="h-16 animate-pulse rounded-2xl bg-hover" aria-label={a.preparing} />;
  }

  if (name === "suggest_caption") {
    return (
      <div className="rounded-2xl border border-border bg-hover p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
          <Icon size={14} className="text-accent" /> {a.tools[name]}
          <span className="ml-auto font-normal text-muted">{a.tapToCopy}</span>
        </p>
        <CaptionPicker captions={(input.captions as string[]) ?? []} hashtags={(input.hashtags as string[]) ?? []} />
      </div>
    );
  }

  const reason = input.reason as string | undefined;
  return (
    <div className={cn("rounded-2xl border p-3", state === "pending" ? "border-accent/40 bg-accent-soft" : "border-border bg-hover opacity-80")}>
      <p className="flex items-center gap-1.5 text-xs font-semibold">
        <Icon size={14} className="text-accent" /> {a.tools[name]}
        {state === "done" && (
          <span className={cn("ml-auto font-medium", output?.applied ? "text-[#34c759]" : "text-muted")}>
            {output?.applied ? a.applied : a.dismissed}
          </span>
        )}
      </p>
      {reason && <p className="mt-1 text-xs leading-snug text-fg/80">{reason}</p>}
      <div className="mt-2">
        <Preview name={name} input={input} />
      </div>
      {state === "done" && output?.message && <p className="mt-1.5 text-[11px] text-muted">{output.message}</p>}
      {state === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="accent" onClick={onApply}>
            <Check size={14} /> {a.apply}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDismiss}>
            <X size={14} /> {a.dismiss}
          </Button>
        </div>
      )}
    </div>
  );
}
