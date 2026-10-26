import { convertToModelMessages, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { createGoogle } from "@ai-sdk/google";
import { agentTools, type AgentUIMessage } from "@/lib/agent/tools";
import { SYSTEM_TR } from "@/lib/agent/systemPrompt";
import { AGENT_MODELS, agentError, geminiApiKey } from "@/lib/agent/config";
import { checkQuota } from "@/lib/agent/quota";
import { requestIdentity } from "@/lib/agent/identity";

export const maxDuration = 30;

const MAX_MESSAGES = 30;

/**
 * Images are expensive and only the latest look matters: keep file parts on the last user
 * message and drop them from history, so long chats don't resend every past screenshot.
 */
function pruneImages(messages: AgentUIMessage[]): AgentUIMessage[] {
  const lastUser = messages.findLastIndex((m) => m.role === "user");
  return messages.map((m, i) =>
    i === lastUser || m.role !== "user" ? m : { ...m, parts: m.parts.filter((p) => p.type !== "file") },
  );
}

export async function POST(req: Request) {
  const apiKey = geminiApiKey();
  if (!apiKey) return agentError("not_configured", 503);

  let body: { messages?: AgentUIMessage[]; deep?: boolean };
  try {
    body = await req.json();
  } catch {
    return agentError("bad_request", 400);
  }
  const messages = body.messages;
  if (!Array.isArray(messages) || !messages.length) return agentError("bad_request", 400);

  const deep = body.deep === true;
  const who = await requestIdentity();
  if (!who.ok) return agentError("auth_required", 401);
  const { id, tier } = who;
  const quota = await checkQuota(id, tier, deep ? "deep" : "chat");
  if (!quota.ok) return agentError("quota", 429, { kind: deep ? "deep" : "chat", reset: quota.reset });

  const google = createGoogle({ apiKey });
  const result = streamText({
    model: google(deep ? AGENT_MODELS.deep : AGENT_MODELS.chat),
    system: SYSTEM_TR,
    messages: await convertToModelMessages(pruneImages(messages.slice(-MAX_MESSAGES))),
    tools: agentTools,
  });

  return createUIMessageStreamResponse({
    headers: { "x-quota-remaining": String(quota.remaining) },
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[agent]", error);
        return "Asistan şu an yanıt veremedi. Birazdan tekrar dene.";
      },
    }),
  });
}
