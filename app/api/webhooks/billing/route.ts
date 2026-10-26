import { supabaseAdmin } from "@/lib/supabase/server";
import { tierForVariant } from "@/lib/billing";
import { validSignature } from "@/lib/webhookSignature";

/**
 * Lemon Squeezy webhook (S2.12). Every request must carry a valid HMAC-SHA256 signature of the
 * raw body made with LEMONSQUEEZY_WEBHOOK_SECRET; only then is the payload trusted enough to
 * write with the service-role client.
 */
const HANDLED = new Set([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_resumed",
  "subscription_expired",
  "subscription_paused",
  "subscription_unpaused",
]);

interface SubscriptionEvent {
  meta?: { event_name?: string; custom_data?: { user_id?: string } };
  data?: {
    id?: string;
    attributes?: {
      status?: string;
      variant_id?: number | string;
      customer_id?: number | string;
      renews_at?: string | null;
      ends_at?: string | null;
      urls?: { customer_portal?: string };
    };
  };
}

export async function POST(req: Request) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const admin = supabaseAdmin();
  if (!secret || !admin) return Response.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-signature"), secret)) {
    return Response.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: SubscriptionEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }

  const name = event.meta?.event_name ?? "";
  // Acknowledge events we don't act on (orders, payments…) so Lemon Squeezy doesn't retry them.
  if (!HANDLED.has(name)) return Response.json({ ok: true, ignored: name });

  const userId = event.meta?.custom_data?.user_id;
  const attrs = event.data?.attributes;
  if (!userId || !attrs || attrs.variant_id == null) {
    console.error("[billing] subscription event without user_id or variant", name, event.data?.id);
    return Response.json({ error: "missing_fields" }, { status: 422 });
  }

  const tier = tierForVariant(attrs.variant_id);
  if (!tier) {
    console.error("[billing] unknown variant", attrs.variant_id);
    return Response.json({ error: "unknown_variant" }, { status: 422 });
  }

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      tier,
      status: attrs.status ?? null,
      ls_subscription_id: event.data?.id ?? null,
      ls_customer_id: attrs.customer_id != null ? String(attrs.customer_id) : null,
      variant_id: String(attrs.variant_id),
      renews_at: attrs.renews_at ?? null,
      ends_at: attrs.ends_at ?? null,
      portal_url: attrs.urls?.customer_portal ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) {
    console.error("[billing] upsert failed", error.message);
    // 500 makes Lemon Squeezy retry later.
    return Response.json({ error: "db" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
