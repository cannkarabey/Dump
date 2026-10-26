import { generateText, Output } from "ai";
import { createGoogle } from "@ai-sdk/google";
import { vibeScoreSchema } from "@/lib/agent/tools";
import { scorePrompt, systemPrompt } from "@/lib/agent/systemPrompt";
import { AGENT_MODELS, agentError, geminiApiKey } from "@/lib/agent/config";
import { checkQuota } from "@/lib/agent/quota";
import { requestIdentity } from "@/lib/agent/identity";

export const maxDuration = 30;

const MAX_IMAGES = 20;

/** Vibe score: one structured request over the page thumbnails; counts as a deep review. */
export async function POST(req: Request) {
  const apiKey = geminiApiKey();
  if (!apiKey) return agentError("not_configured", 503);

  let body: { summary?: string; images?: string[]; lang?: string };
  try {
    body = await req.json();
  } catch {
    return agentError("bad_request", 400);
  }
  const images = (body.images ?? []).filter((u) => typeof u === "string" && u.startsWith("data:image/")).slice(0, MAX_IMAGES);
  if (!body.summary || !images.length) return agentError("bad_request", 400);

  const who = await requestIdentity();
  if (!who.ok) return agentError("auth_required", 401);
  const { id, tier } = who;
  const quota = await checkQuota(id, tier, "deep");
  if (!quota.ok) return agentError("quota", 429, { kind: "deep", reset: quota.reset });

  try {
    const { output } = await generateText({
      model: createGoogle({ apiKey })(AGENT_MODELS.deep),
      system: systemPrompt(body.lang),
      output: Output.object({ schema: vibeScoreSchema }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: scorePrompt(body.lang, body.summary) },
            ...images.map((url) => ({ type: "image" as const, image: url })),
          ],
        },
      ],
    });
    return Response.json({ score: output, remaining: quota.remaining });
  } catch (e) {
    console.error("[agent/score]", e);
    return agentError("upstream", 502);
  }
}
