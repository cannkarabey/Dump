"use client";

import { DefaultChatTransport, type FileUIPart } from "ai";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { stageRef } from "@/lib/stageRef";
import { renderPageThumbs } from "@/lib/export";
import type { AgentErrorCode } from "./config";
import { summarizeDump } from "./context";
import type { AgentUIMessage, VibeScore } from "./tools";

export class AgentRequestError extends Error {
  constructor(
    public code: AgentErrorCode,
    public info: { kind?: "chat" | "deep"; reset?: number } = {},
  ) {
    super(code);
  }
}

/** Remaining requests reported by the last response, for the panel's counter. */
export const quotaListeners = new Set<(remaining: number) => void>();

/** fetch that turns our JSON error payloads into typed errors and reads the quota header. */
const agentFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new AgentRequestError(body.error ?? "upstream", body);
  }
  const remaining = Number(res.headers.get("x-quota-remaining"));
  if (Number.isFinite(remaining)) quotaListeners.forEach((fn) => fn(remaining));
  return res;
};

export function createAgentTransport() {
  return new DefaultChatTransport<AgentUIMessage>({ api: "/api/agent", fetch: agentFetch });
}

/** Marker separating what the user typed from the context the editor attaches. */
export const CONTEXT_MARKER = "[DUMP ÖZETİ]";

export function currentSummary(): string {
  const { doc } = useDoc.getState();
  const { assets, order } = useAssets.getState();
  return summarizeDump(doc, assets, order);
}

export function pageImages(): FileUIPart[] {
  const stage = stageRef.current;
  if (!stage) return [];
  const { doc } = useDoc.getState();
  return renderPageThumbs(stage, doc).map((url, i) => ({
    type: "file",
    mediaType: "image/jpeg",
    filename: `sayfa-${i + 1}.jpg`,
    url,
  }));
}

/** Builds a user message: visible text + attached dump summary (+ page images when asked). */
export function buildUserParts(text: string, withImages: boolean): AgentUIMessage["parts"] {
  return [
    { type: "text", text },
    { type: "text", text: `${CONTEXT_MARKER}\n${currentSummary()}` },
    ...(withImages ? pageImages() : []),
  ];
}

export async function requestVibeScore(): Promise<{ score: VibeScore; remaining: number }> {
  const res = await fetch("/api/agent/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ summary: currentSummary(), images: pageImages().map((f) => f.url) }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new AgentRequestError(body.error ?? "upstream", body);
  return body;
}

/** Turkish copy for every failure the panel can show. */
export function errorMessage(error: unknown): string {
  const code = error instanceof AgentRequestError ? error.code : "upstream";
  switch (code) {
    case "not_configured":
      return process.env.NODE_ENV === "development"
        ? "Asistan henüz bağlı değil: .env.local dosyasına GEMINI_API_KEY ekleyip geliştirme sunucusunu yeniden başlat."
        : "Asistan şu an kullanılamıyor. Biraz sonra tekrar dene.";
    case "quota": {
      const info = (error as AgentRequestError).info;
      const when = info.reset ? new Date(info.reset).toLocaleString("tr-TR", { weekday: "long", hour: "2-digit", minute: "2-digit" }) : null;
      return `${info.kind === "deep" ? "Derin yorum" : "Asistan"} hakkın doldu${when ? `; ${when} yenilenir` : ""}. Daha fazlası için planını yükselt.`;
    }
    case "bad_request":
      return "İstek eksik görünüyor. Sayfayı yenileyip tekrar dene.";
    default:
      return "Asistan şu an yanıt veremedi. Birazdan tekrar dene.";
  }
}
