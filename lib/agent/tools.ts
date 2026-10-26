import { z } from "zod";
import type { InferUITools, UIDataTypes, UIMessage } from "ai";

/**
 * Editor tools the assistant can propose. They have no `execute`: calls stream to the browser,
 * where the user sees a suggestion card and decides (PLAN.md 3.6). Photos are referenced by the
 * short refs from the doc summary ("f1", "f2"…), never by internal ids. Descriptions are in
 * English for both app languages; the system prompt sets the language of user-facing text.
 */
const photoRef = z.string().regex(/^f\d+$/).describe('Photo ref, e.g. "f3"');
const reason = z.string().max(240).describe("Short reason shown to the user, in the user's language");

export const agentTools = {
  reorder_photos: {
    description:
      "Suggest a new reading order for the photos in the carousel (page by page, top to bottom). The first photo in the list becomes the cover.",
    inputSchema: z.object({ order: z.array(photoRef).min(2), reason }),
  },
  set_cover: {
    description: "Suggest making a specific photo the cover (first frame).",
    inputSchema: z.object({ photo: photoRef, reason }),
  },
  remove_photo: {
    description: "Suggest removing a photo that repeats another, is blurry, or breaks the dump's flow.",
    inputSchema: z.object({ photo: photoRef, reason }),
  },
  apply_template: {
    description: "Suggest laying the photos out with one of the listed template ids.",
    inputSchema: z.object({ templateId: z.string(), reason }),
  },
  set_background: {
    description: "Suggest a background color that matches the photos' tones.",
    inputSchema: z.object({ color: z.string().regex(/^#[0-9a-fA-F]{6}$/), reason }),
  },
  add_text: {
    description: "Suggest adding a short text to a page (title, label bubble, handwriting…), in the user's language.",
    inputSchema: z.object({
      page: z.number().int().min(1).describe("1-based page number"),
      text: z.string().min(1).max(80),
      style: z.enum(["title", "caption", "bubble", "hand"]),
      reason,
    }),
  },
  suggest_caption: {
    description: "Suggest 3 caption options and up to 12 hashtags for posting.",
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
  hook: z.number().min(1).max(10).describe("How strongly the first frame stops the scroll"),
  flow: z.number().min(1).max(10).describe("Order and rhythm"),
  color: z.number().min(1).max(10).describe("Color harmony"),
  variety: z.number().min(1).max(10).describe("Variety, no repeated shots"),
  summary: z.string().max(200).describe("One-sentence summary in the user's language"),
});

export type VibeScore = z.infer<typeof vibeScoreSchema>;
