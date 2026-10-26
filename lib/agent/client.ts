"use client";

import { DefaultChatTransport, type FileUIPart } from "ai";
import { useDoc } from "@/lib/store/doc";
import { useAssets } from "@/lib/store/assets";
import { stageRef } from "@/lib/stageRef";
import { renderPageThumbs } from "@/lib/export";
import type { AgentErrorCode } from "./config";
import { summarizeDump } from "./context";
import type { AgentUIMessage, VibeScore } from "./tools";
import type { Locale } from "@/lib/i18n/config";
import { at, format } from "@/lib/i18n/appDictionary";

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

/** `lang` picks the reply language (system prompt) on the server. */
export function createAgentTransport(lang: Locale) {
  return new DefaultChatTransport<AgentUIMessage>({ api: "/api/agent", fetch: agentFetch, body: { lang } });
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
    filename: `page-${i + 1}.jpg`,
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

export async function requestVibeScore(lang: Locale): Promise<{ score: VibeScore; remaining: number }> {
  const res = await fetch("/api/agent/score", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ summary: currentSummary(), images: pageImages().map((f) => f.url), lang }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new AgentRequestError(body.error ?? "upstream", body);
  return body;
}

/** User-facing copy (app language) for every failure the panel can show. */
export function errorMessage(error: unknown): string {
  const { locale, agent } = at();
  const e = agent.errors;
  const code = error instanceof AgentRequestError ? error.code : "upstream";
  switch (code) {
    case "not_configured":
      return process.env.NODE_ENV === "development" ? e.notConfiguredDev : e.notConfigured;
    case "auth_required":
      return e.authRequired;
    case "quota": {
      const info = (error as AgentRequestError).info;
      const when = info.reset ? new Date(info.reset).toLocaleString(locale, { weekday: "long", hour: "2-digit", minute: "2-digit" }) : null;
      return `${info.kind === "deep" ? e.quotaDeep : e.quotaChat}${when ? format(e.quotaReset, { when }) : ""}${e.quotaUpgrade}`;
    }
    case "bad_request":
      return e.badRequest;
    default:
      return e.upstream;
  }
}
