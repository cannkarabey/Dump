import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { Tier } from "@/lib/types";

export type QuotaKind = "chat" | "deep";
type Duration = `${number} ${"m" | "h" | "d"}`;

/** PLAN.md 3.4: limits sized so worst-case AI cost stays below the subscription price. */
const LIMITS: Record<Tier, Record<QuotaKind, { tokens: number; window: Duration }>> = {
  free: { chat: { tokens: 5, window: "1 d" }, deep: { tokens: 3, window: "7 d" } },
  creator: { chat: { tokens: 300, window: "30 d" }, deep: { tokens: 30, window: "30 d" } },
  studio: { chat: { tokens: 1000, window: "30 d" }, deep: { tokens: 100, window: "30 d" } },
};

/** Generous limits while developing locally so the assistant can be exercised freely. */
const DEV_LIMIT = { tokens: 200, window: "1 d" as Duration };

export interface QuotaResult {
  ok: boolean;
  remaining: number;
  /** Epoch ms when the window resets. */
  reset: number;
}

const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
const limiters = new Map<string, Ratelimit>();

function limiterFor(tier: Tier, kind: QuotaKind): Ratelimit {
  const key = `${tier}:${kind}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    const { tokens, window } = process.env.NODE_ENV === "development" ? DEV_LIMIT : LIMITS[tier][kind];
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(tokens, window),
      prefix: `dc:ai:${key}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

// Fallback when Upstash isn't configured: per-process counters. Fine for local development,
// not for production (resets on restart, not shared across instances).
const memory = new Map<string, { count: number; reset: number }>();
const WINDOW_MS: Record<string, number> = { m: 60_000, h: 3_600_000, d: 86_400_000 };

function memoryLimit(id: string, tier: Tier, kind: QuotaKind): QuotaResult {
  const { tokens, window } = process.env.NODE_ENV === "development" ? DEV_LIMIT : LIMITS[tier][kind];
  const [n, unit] = window.split(" ");
  const span = Number(n) * WINDOW_MS[unit];
  const key = `${tier}:${kind}:${id}`;
  const now = Date.now();
  const entry = memory.get(key);
  const fresh = !entry || entry.reset <= now ? { count: 0, reset: now + span } : entry;
  if (fresh.count >= tokens) return { ok: false, remaining: 0, reset: fresh.reset };
  fresh.count++;
  memory.set(key, fresh);
  return { ok: true, remaining: tokens - fresh.count, reset: fresh.reset };
}

let warned = false;

export async function checkQuota(id: string, tier: Tier, kind: QuotaKind): Promise<QuotaResult> {
  if (!hasUpstash) {
    if (!warned && process.env.NODE_ENV === "production") {
      console.warn("[agent] UPSTASH_REDIS_REST_URL/TOKEN missing: using in-memory AI quota.");
      warned = true;
    }
    return memoryLimit(id, tier, kind);
  }
  const r = await limiterFor(tier, kind).limit(id);
  return { ok: r.success, remaining: r.remaining, reset: r.reset };
}
