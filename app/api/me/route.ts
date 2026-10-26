import { connection } from "next/server";
import { getAccount } from "@/lib/account";

/** Current user, plan and which integrations are live; the browser's tier comes from here. */
export async function GET() {
  // Per-request: without a session cookie read (auth not configured) this would otherwise be
  // prerendered once at build time and frozen.
  await connection();
  return Response.json(await getAccount(), { headers: { "cache-control": "no-store" } });
}
