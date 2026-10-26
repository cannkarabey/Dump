import { nanoid } from "nanoid";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { useTier } from "@/lib/store/tier";
import { useUi } from "@/lib/store/ui";
import { getTemplate } from "@/lib/templates";
import { applyTemplate } from "@/lib/templates/applyTemplate";
import { dominantMonth, monthLabel } from "@/lib/month";
import { TEXT_PRESETS } from "@/lib/addElements";
import { tierAllows, TIER_LIMITS } from "@/lib/tiers";
import type { TextEl } from "@/lib/types";
import { agentTools, type AgentToolName } from "./tools";
import { assetRefs, photosInReadingOrder } from "./context";

export interface ApplyResult {
  applied: boolean;
  /** Shown to the user when the suggestion couldn't be applied. */
  message?: string;
}

const STYLE_TO_PRESET = { title: "title", caption: "caption", bubble: "bubble", hand: "hand" } as const;

/**
 * Applies an assistant suggestion to the editor as one undo step. Inputs are re-validated here:
 * the model's arguments are untrusted, and refs/ids must exist in the dump the user has open now.
 */
export function applyToolCall(name: AgentToolName, rawInput: unknown): ApplyResult {
  const parsed = agentTools[name].inputSchema.safeParse(rawInput);
  if (!parsed.success) return { applied: false, message: "Bu öneri geçersiz görünüyor." };
  const input = parsed.data as Record<string, unknown>;

  const docStore = useDoc.getState();
  const { doc } = docStore;
  const { assets, order } = useAssets.getState();
  const { toAsset } = assetRefs(order);
  const photos = photosInReadingOrder(doc);
  const resolve = (ref: unknown) => (typeof ref === "string" ? toAsset.get(ref) : undefined);

  switch (name) {
    case "reorder_photos": {
      const current = photos.map((p) => p.assetId);
      const wanted = [...new Set((input.order as string[]).map(resolve))].filter(
        (id): id is string => Boolean(id) && current.includes(id!),
      );
      if (wanted.length < 2) return { applied: false, message: "Önerilen fotoğraflar artık dump'ta değil." };
      const sequence = [...wanted, ...current.filter((id) => !wanted.includes(id))];
      docStore.updateElements(photos.map((p, i) => ({ id: p.id, patch: { assetId: sequence[i] } })));
      return { applied: true };
    }

    case "set_cover": {
      const target = resolve(input.photo);
      if (!target || !assets[target] || !photos.length) return { applied: false, message: "Bu fotoğraf bulunamadı." };
      const cover = photos[0];
      const holder = photos.find((p) => p.assetId === target);
      docStore.updateElements([
        { id: cover.id, patch: { assetId: target } },
        ...(holder && holder.id !== cover.id ? [{ id: holder.id, patch: { assetId: cover.assetId } }] : []),
      ]);
      return { applied: true };
    }

    case "remove_photo": {
      const target = resolve(input.photo);
      const hits = doc.elements.filter((el) => (el.type === "image" || el.type === "slot") && el.assetId === target);
      if (!target || !hits.length) return { applied: false, message: "Bu fotoğraf zaten dump'ta değil." };
      docStore.replaceDoc({
        ...doc,
        elements: doc.elements.flatMap((el) => {
          if (el.type === "image" && el.assetId === target) return [];
          if (el.type === "slot" && el.assetId === target) return [{ ...el, assetId: undefined }];
          return [el];
        }),
      });
      useUi.getState().setSelection([]);
      return { applied: true };
    }

    case "apply_template": {
      const t = getTemplate(input.templateId as string);
      if (!t) return { applied: false, message: "Bu şablon bulunamadı." };
      const tier = useTier.getState().tier;
      if (t.tier === "creator" && !tierAllows(tier, "premiumTemplates")) {
        useUi.getState().openPaywall("premiumTemplates");
        return { applied: false, message: "Bu şablon Creator planında." };
      }
      // Keep the current story order: placed photos first, then the unused ones.
      const placedIds = photos.map((p) => p.assetId);
      const list = [...placedIds, ...order.filter((id) => !placedIds.includes(id))].map((id) => assets[id]).filter(Boolean);
      const month = dominantMonth(list);
      const result = applyTemplate(t, doc, list, {
        maxPages: TIER_LIMITS[tier].maxPages,
        vars: { month: monthLabel(month), year: String(month.getFullYear()) },
      });
      docStore.replaceDoc(result.doc);
      useUi.getState().setSelection([]);
      useUi.getState().requestFit();
      return { applied: true };
    }

    case "set_background": {
      docStore.setBackground((input.color as string).toLowerCase());
      return { applied: true };
    }

    case "add_text": {
      const preset = TEXT_PRESETS.find((p) => p.id === STYLE_TO_PRESET[input.style as keyof typeof STYLE_TO_PRESET])!;
      const { w, h, pages } = doc.format;
      const page = Math.min(pages, Math.max(1, input.page as number)) - 1;
      const fontSize = preset.nfs * h;
      const width = w * 0.7;
      const el: TextEl = {
        id: nanoid(10),
        type: "text",
        text: input.text as string,
        fontFamily: preset.font,
        fontSize,
        fontStyle: preset.fontStyle,
        fill: preset.fill,
        align: "center",
        bubble: preset.bubble,
        x: page * w + (w - width) / 2,
        y: h * 0.08,
        width,
        height: fontSize * 1.2,
        rotation: 0,
        opacity: 1,
      };
      docStore.addElements([el]);
      useUi.getState().setSelection([el.id]);
      return { applied: true };
    }

    case "suggest_caption":
      // Nothing to change in the editor; the card offers copy buttons.
      return { applied: true };
  }
}

/** Human labels for suggestion cards. */
export const TOOL_LABELS: Record<AgentToolName, string> = {
  reorder_photos: "Sıralamayı düzelt",
  set_cover: "Kapağı değiştir",
  remove_photo: "Fotoğrafı çıkar",
  apply_template: "Şablon uygula",
  set_background: "Arka planı değiştir",
  add_text: "Metin ekle",
  suggest_caption: "Caption önerisi",
};
