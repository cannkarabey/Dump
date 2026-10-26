import { Suspense } from "react";
import type { Metadata } from "next";
import { EditorRoot } from "@/components/editor/EditorRoot";

export const metadata: Metadata = { title: "Editör — Dump Creator" };

export default function EditorPage({ params }: PageProps<"/app/editor/[id]">) {
  return (
    <Suspense fallback={<div className="grid h-dvh place-items-center text-sm text-muted">Editör yükleniyor…</div>}>
      <EditorRoot params={params} />
    </Suspense>
  );
}
