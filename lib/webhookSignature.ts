import { createHmac, timingSafeEqual } from "node:crypto";

/** Lemon Squeezy signs the raw request body with HMAC-SHA256 (hex) in the X-Signature header. */
export function validSignature(raw: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(raw).digest("hex"), "utf8");
  const given = Buffer.from(signature, "utf8");
  // Length check first: timingSafeEqual throws on different lengths.
  return expected.length === given.length && timingSafeEqual(expected, given);
}
