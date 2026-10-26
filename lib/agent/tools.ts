import { z } from "zod";
import type { InferUITools, UIDataTypes, UIMessage } from "ai";

/**
 * Editor tools the assistant can propose. They have no `execute`: calls stream to the browser,
 * where the user sees a suggestion card and decides (PLAN.md 3.6). Photos are referenced by the
 * short refs from the doc summary ("f1", "f2"…), never by internal ids.
 */
const photoRef = z.string().regex(/^f\d+$/).describe('Fotoğraf referansı, ör. "f3"');
const reason = z.string().max(240).describe("Kullanıcıya gösterilecek kısa gerekçe");

export const agentTools = {
  reorder_photos: {
    description:
      "Fotoğrafların carousel'deki okuma sırasını değiştirmeyi öner (sayfa sayfa, yukarıdan aşağı). Listedeki ilk fotoğraf kapak olur.",
    inputSchema: z.object({ order: z.array(photoRef).min(2), reason }),
  },
  set_cover: {
    description: "Belirli bir fotoğrafı kapak (ilk kare) yapmayı öner.",
    inputSchema: z.object({ photo: photoRef, reason }),
  },
  remove_photo: {
    description: "Tekrar eden, bulanık ya da dump'ın akışını bozan bir fotoğrafı çıkarmayı öner.",
    inputSchema: z.object({ photo: photoRef, reason }),
  },
  apply_template: {
    description: "Fotoğrafları verilen şablon kimliklerinden birine yerleştirmeyi öner.",
    inputSchema: z.object({ templateId: z.string(), reason }),
  },
  set_background: {
    description: "Arka plan rengini değiştirmeyi öner (fotoğrafların tonlarıyla uyumlu).",
    inputSchema: z.object({ color: z.string().regex(/^#[0-9a-fA-F]{6}$/), reason }),
  },
  add_text: {
    description: "Bir sayfaya kısa bir metin eklemeyi öner (başlık, etiket balonu, el yazısı…).",
    inputSchema: z.object({
      page: z.number().int().min(1).describe("1'den başlayan sayfa numarası"),
      text: z.string().min(1).max(80),
      style: z.enum(["title", "caption", "bubble", "hand"]),
      reason,
    }),
  },
  suggest_caption: {
    description: "Paylaşım için 3 caption seçeneği ve en fazla 12 hashtag öner.",
    inputSchema: z.object({
      captions: z.array(z.string().max(220)).min(1).max(3),
      hashtags: z.array(z.string().regex(/^#\S+$/)).max(12),
    }),
  },
};

export type AgentToolName = keyof typeof agentTools;
export type AgentUIMessage = UIMessage<never, UIDataTypes, InferUITools<typeof agentTools>>;

/** Vibe score (separate structured request). */
export const vibeScoreSchema = z.object({
  hook: z.number().min(1).max(10).describe("İlk karenin kaydırmayı durdurma gücü"),
  flow: z.number().min(1).max(10).describe("Sıralama ve ritim"),
  color: z.number().min(1).max(10).describe("Renk uyumu"),
  variety: z.number().min(1).max(10).describe("Çeşitlilik, tekrar etmeyen kareler"),
  summary: z.string().max(200).describe("Tek cümlelik Türkçe özet"),
});

export type VibeScore = z.infer<typeof vibeScoreSchema>;
