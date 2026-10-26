"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Crown } from "@/components/ui/Crown";
import { TemplatePreview } from "@/components/editor/TemplatePreview";
import { photoCount, similarTemplates, templatePages, TEMPLATES } from "@/lib/templates";
import type { Template } from "@/lib/templates/schema";
import { cn } from "@/lib/cn";
import { format, useLocalizeTemplate, useT } from "@/lib/i18n/app";
import type { AppDict } from "@/lib/i18n/appDictionary";

type Filter = "all" | "single" | "carousel" | "free" | "premium";

const FILTERS: { id: Filter; test: (t: Template) => boolean }[] = [
  { id: "all", test: () => true },
  { id: "single", test: (t) => t.mode === "single" },
  { id: "carousel", test: (t) => t.mode === "carousel" },
  { id: "free", test: (t) => t.tier === "free" },
  { id: "premium", test: (t) => t.tier === "creator" },
];

function formatLine(t: Template, g: AppDict["gallery"], long = false) {
  const pages = templatePages(t);
  const kind = pages > 1 ? format(g.carouselPages, { n: pages }) : g.singlePost;
  return `${kind} · ${format(long ? g.photosLong : g.photosShort, { n: photoCount(t) })}`;
}

/** Turkish-aware, accent-insensitive match ("şablon" finds "sablon"). */
function normalize(s: string) {
  return s
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ı/g, "i");
}

export function TemplateGallery() {
  const { t: tr } = useT();
  const localize = useLocalizeTemplate();
  const templates = useMemo(() => TEMPLATES.map(localize), [localize]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Template | null>(null);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    const test = FILTERS.find((f) => f.id === filter)!.test;
    // Search both the localized and the original title, so "polaroid" and "Polaroid Dağınık" both match.
    return templates.filter(
      (t, i) => test(t) && (!q || normalize([t.title, TEMPLATES[i].title, ...t.tags].join(" ")).includes(q)),
    );
  }, [templates, query, filter]);

  return (
    <>
      <label className="mx-auto mt-8 flex h-14 max-w-2xl items-center gap-3 rounded-2xl bg-panel px-5 ring-1 ring-border focus-within:ring-accent">
        <Search size={18} className="text-muted" />
        <span className="sr-only">{tr.gallery.search}</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={tr.gallery.searchPlaceholder}
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted"
        />
      </label>

      <div className="mt-5 flex flex-wrap justify-center gap-2" role="radiogroup" aria-label={tr.gallery.filter}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "h-9 rounded-full px-4 text-sm font-medium transition",
              filter === f.id ? "bg-fg text-bg" : "bg-panel text-muted hover:text-fg",
            )}
          >
            {tr.gallery.filters[f.id]}
          </button>
        ))}
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
        {filter === "all" && !query && (
          <li>
            <Link
              href="/app/editor/new"
              className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-2xl bg-panel text-sm font-medium ring-1 ring-border transition hover:ring-accent"
            >
              <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
                <Plus size={22} />
              </span>
              {tr.gallery.blank}
            </Link>
          </li>
        )}
        {results.map((t) => (
          <li key={t.id}>
            <TemplateCard t={t} onOpen={() => setOpen(t)} />
          </li>
        ))}
      </ul>
      {!results.length && <p className="mt-10 text-center text-sm text-muted">{tr.gallery.noResults}</p>}

      <TemplateDetail t={open} templates={templates} onClose={() => setOpen(null)} onOpenOther={setOpen} />
    </>
  );
}

function TemplateCard({ t, onOpen }: { t: Template; onOpen: () => void }) {
  const { t: tr } = useT();
  const pages = templatePages(t);
  return (
    <button type="button" onClick={onOpen} className="group block w-full text-left">
      <span className="relative grid aspect-[3/4] place-items-center overflow-hidden rounded-2xl bg-panel p-4 ring-1 ring-border transition group-hover:ring-accent">
        {/* Carousels show the first page large with the rest peeking behind. */}
        <span className="relative block w-full overflow-hidden rounded-md shadow-lg" style={{ aspectRatio: "3 / 4" }}>
          <span className="absolute inset-0" style={{ width: `${pages * 100}%` }}>
            <TemplatePreview t={t} colorful />
          </span>
        </span>
        {pages > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
            1/{pages}
          </span>
        )}
      </span>
      <span className="mt-2 flex items-center gap-1.5 text-sm font-medium">
        {t.title}
        {t.tier === "creator" && <Crown />}
      </span>
      <span className="block text-xs text-muted">
        {formatLine(t, tr.gallery)}
      </span>
    </button>
  );
}

function TemplateDetail({
  t,
  templates,
  onClose,
  onOpenOther,
}: {
  t: Template | null;
  templates: Template[];
  onClose: () => void;
  onOpenOther: (t: Template) => void;
}) {
  const { t: tr } = useT();
  const router = useRouter();
  if (!t) return null;
  const pages = templatePages(t);
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={t.title} className="w-[min(94vw,980px)]">
      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="overflow-x-auto rounded-2xl bg-hover p-4">
          <div className="mx-auto overflow-hidden rounded-lg shadow-xl" style={{ aspectRatio: `${3 * pages} / 4`, maxWidth: pages > 1 ? "none" : 340, width: pages > 2 ? `${pages * 170}px` : "100%" }}>
            <TemplatePreview t={t} colorful />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            {formatLine(t, tr.gallery, true)} · 3:4
          </p>
          <div className="flex flex-wrap gap-1.5">
            {t.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-hover px-2.5 py-1 text-xs text-muted">
                #{tag}
              </span>
            ))}
          </div>
          {t.tier === "creator" && (
            <p className="flex items-center gap-1.5 text-sm">
              <Crown /> {tr.gallery.premiumPlans}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              // Next keeps this page mounted (hidden) after navigating; close the portal'd modal first.
              onClose();
              router.push(`/app/editor/new?template=${t.id}`);
            }}
            className="mt-2 rounded-full bg-accent py-3.5 text-sm font-medium text-white shadow-[0_12px_30px_-10px_var(--color-accent)] transition hover:bg-accent-strong"
          >
            {tr.gallery.use}
          </button>
          <p className="text-xs text-muted">{tr.gallery.useHint}</p>
        </div>
      </div>

      <h3 className="mt-8 mb-3 text-sm font-semibold">{tr.gallery.similar}</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {similarTemplates(t).map((s) => templates.find((x) => x.id === s.id) ?? s).map((x) => (
          <li key={x.id}>
            <button type="button" onClick={() => onOpenOther(x)} className="w-full text-left">
              <span className="block aspect-[3/4] overflow-hidden rounded-xl bg-hover p-2 ring-1 ring-border hover:ring-accent">
                <span className="relative block h-full overflow-hidden rounded">
                  <span className="absolute inset-0" style={{ width: `${templatePages(x) * 100}%` }}>
                    <TemplatePreview t={x} colorful />
                  </span>
                </span>
              </span>
              <span className="mt-1.5 block truncate text-xs font-medium">{x.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
