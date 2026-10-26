import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountView } from "@/components/dashboard/AccountView";

export const metadata: Metadata = { title: "Hesap — Dump Creator" };

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-[-0.04em]">Hesap</h1>
      {/* AccountView reads ?error= from the URL, which is request-time data under Cache Components. */}
      <Suspense fallback={<p className="mt-8 text-sm text-muted">Yükleniyor…</p>}>
        <AccountView />
      </Suspense>
    </main>
  );
}
