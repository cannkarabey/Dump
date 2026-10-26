import type { Metadata } from "next";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";

export const metadata: Metadata = { title: "Şablonlar — Dump Creator" };

export default function TemplatesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-center font-display text-5xl font-semibold tracking-[-0.04em]">
        <span className="text-accent">dump</span> şablonları.
      </h1>
      <TemplateGallery />
    </main>
  );
}
