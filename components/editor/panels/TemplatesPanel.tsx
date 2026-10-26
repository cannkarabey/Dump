"use client";

import { TEMPLATES } from "@/lib/templates";
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
  const apply = useApplyTemplate();
  const canPremium = useTier((s) => tierAllows(s.tier, "premiumTemplates"));
  const { t: tr } = useT();
  const localize = useLocalizeTemplate();

  return (
    <ul className="grid grid-cols-2 gap-3">
      {TEMPLATES.map((t) => {
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
                <TemplatePreview t={t} />
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
  );
}
