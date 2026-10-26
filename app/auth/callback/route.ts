import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** OAuth redirect target: exchanges the code for a session cookie, then goes back into the app. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Only same-site relative paths, so the callback can't be used as an open redirect.
  const nextParam = url.searchParams.get("next") ?? "/app";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/app";

  const supabase = await supabaseServer();
  if (supabase && code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/app/account?error=auth", url.origin));
}
