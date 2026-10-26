import { Suspense } from "react";
import { EditorLoading, EditorRoot } from "@/components/editor/EditorRoot";

export default function EditorPage({ params }: PageProps<"/app/[lang]/editor/[id]">) {
  return (
    <Suspense fallback={<EditorLoading />}>
      <EditorRoot params={params} />
    </Suspense>
  );
}
