"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { normalizeQuery, SearchField } from "./SearchField";
import { TEMPLATES } from "@/lib/templates";
import { insertEmptyFrame, LAYOUTS, stampLayout } from "@/lib/layouts";
import { Segmented } from "@/components/ui/Segmented";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import type { Template } from "@/lib/templates/schema";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useTier } from "@/lib/store/tier";
import { useUi } from "@/lib/store/ui";
import { tierAllows, TIER_LIMITS } from "@/lib/tiers";
import { dominantMonth, monthLabel } from "@/lib/month";
import { Crown } from "@/components/ui/Crown";
import { TemplatePreview } from "../TemplatePreview";
import { format, useLocalizeTemplate, useT } from "@/lib/i18n/app";
import { at } from "@/lib/i18n/appDictionary";

export function useApplyTemplate() {
  const localize = useLocalizeTemplate();
  return (original: Template) => {
    const t = localize(original);
    const tier = useTier.getState().tier;
    if (t.tier === "creator" && !tierAllows(tier, "premiumTemplates")) {
      useUi.getState().openPaywall("premiumTemplates");
      return;
    }
    const { doc, replaceDoc } = useDoc.getState();
    if (doc.elements.length && !window.confirm(at().templatesPanel.confirmReplace)) {
      return;
    }
    const { assets, order } = useAssets.getState();
    const list = order.map((id) => assets[id]);
    const month = dominantMonth(list);
    const result = applyTemplate(t, doc, list, {
      maxPages: TIER_LIMITS[tier].maxPages,
      vars: { month: monthLabel(month), year: String(month.getFullYear()) },
    });
    replaceDoc(result.doc);
    useUi.getState().setSelection([]);
    useUi.getState().requestFit();
    useUi
      .getState()
      .showNotice(
        result.unplaced
          ? format(at().templatesPanel.unplaced, { n: result.unplaced })
          : null,
      );
  };
}

export function TemplatesPanel() {
  const { t } = useT();
  const [tab, setTab] = useState<"view" | "create">("view");
  return (
    <div className="flex flex-col gap-3">
      <Segmented
        aria-label={t.editor.panels.templates}
        value={tab}
        onChange={setTab}
        options={[
          { value: "view", label: t.templatesPanel.view },
          { value: "create", label: t.templatesPanel.create },
        ]}
        className="self-start"
      />
      {tab === "view" ? <TemplateList /> : <CreateLayouts />}
    </div>
  );
}

function TemplateList() {
  const apply = useApplyTemplate();
  const canPremium = useTier((s) => tierAllows(s.tier, "premiumTemplates"));
  const { t: tr } = useT();
  const localize = useLocalizeTemplate();
  const [query, setQuery] = useState("");
  const list = useMemo(() => {
    const q = normalizeQuery(query.trim());
    return TEMPLATES.filter((t) => !q || normalizeQuery([localize(t).title, t.title, ...t.tags].join(" ")).includes(q));
  }, [query, localize]);

  return (
    <>
      <SearchField value={query} onChange={setQuery} placeholder={tr.templatesPanel.search} />
      {!list.length && <p className="px-1 text-sm text-muted">{tr.templatesPanel.noResults}</p>}
      <ul className="grid grid-cols-2 gap-3">
        {list.map((t) => {
          const pages = t.mode === "single" ? 1 : t.pages;
          return (
            <li key={t.id} className={pages > 1 ? "col-span-2" : undefined}>
              <button
                type="button"
                onClick={() => apply(t)}
                className="group w-full rounded-2xl bg-hover p-2 text-left transition hover:bg-active"
              >
                <span
                  className="block overflow-hidden rounded-lg ring-1 ring-border"
                  style={{ aspectRatio: `${3 * pages} / 4` }}
                >
                  <TemplatePreview t={t} colorful />
                </span>
                <span className="mt-2 flex items-center gap-1.5 px-1 text-[13px] font-medium">
                  {localize(t).title}
                  {t.tier === "creator" && !canPremium && <Crown />}
                  <span className="ml-auto text-xs text-muted">
                    {pages > 1 ? format(tr.templatesPanel.pages, { n: pages }) : tr.templatesPanel.single}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function CreateLayouts() {
  const { t } = useT();
  const p = t.templatesPanel;
  return (
    <>
      <p className="px-1 text-xs leading-relaxed text-muted">{p.createHint}</p>
      <div className="flex items-center gap-3 rounded-2xl bg-hover p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-active">
          <Plus size={18} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">{p.insertFrame}</span>
          <span className="block text-xs text-muted">{p.insertFrameHint}</span>
        </span>
        <button type="button" onClick={insertEmptyFrame} className="rounded-full bg-active px-3 py-1.5 text-xs font-semibold hover:bg-accent hover:text-white">
          {p.add}
        </button>
      </div>
      <p className="flex justify-between px-1 pt-1 text-sm font-semibold">
        {p.layouts}
        <span className="text-xs font-normal text-muted">{format(p.ready, { n: LAYOUTS.length })}</span>
      </p>
      <ul className="grid grid-cols-2 gap-3">
        {LAYOUTS.map((l) => (
          <li key={l.id}>
            <button type="button" onClick={() => stampLayout(l.cells)} className="group w-full text-center">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-hover ring-1 ring-border transition group-hover:ring-accent">
                {l.cells.map(([x, y, w, h], i) => (
                  <span
                    key={i}
                    className="absolute border border-fg/25 bg-fg/[0.04]"
                    style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }}
                  />
                ))}
              </span>
              <span className="mt-1.5 block text-xs font-medium">{p.layoutNames[l.id]}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
