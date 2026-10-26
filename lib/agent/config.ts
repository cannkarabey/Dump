/**
 * Server-only AI settings. Model ids can be overridden per environment, since Gemini
 * ids/prices change often (PLAN.md 3.3); defaults follow the plan.
 */
export const AGENT_MODELS = {
  /** Chat, quick chips, captions. */
  chat: process.env.AI_MODEL_CHAT ?? "gemini-3.1-flash-lite",
  /** "Derin yorum" and the vibe score: full visual review. */
  deep: process.env.AI_MODEL_DEEP ?? "gemini-3.8-flash",
};

/** The Gemini key from Google AI Studio (PLAN.md 3.5). Never exposed to the browser. */
export function geminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || undefined;
}

/** Error payload the panel understands; keeps provider details out of the client. */
export type AgentErrorCode = "not_configured" | "auth_required" | "quota" | "bad_request" | "upstream";

export function agentError(code: AgentErrorCode, status: number, extra: Record<string, unknown> = {}) {
  return Response.json({ error: code, ...extra }, { status });
}
