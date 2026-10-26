import type { Metadata } from "next";
import { MyDumps } from "@/components/dashboard/MyDumps";

export const metadata: Metadata = { title: "Dump'larım — Dump Creator" };

export default function MyDumpsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-center font-display text-5xl font-semibold tracking-[-0.04em]">
        Dump<span className="text-accent">&apos;larım.</span>
      </h1>
      <p className="mt-3 text-center text-sm text-muted">Bu cihazda kaydedilir. Hesap ve bulut senkronu yakında.</p>
      <MyDumps />
    </main>
  );
}
