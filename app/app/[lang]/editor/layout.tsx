import type { Metadata } from "next";
import { appPageLang } from "@/lib/i18n/appPage";

/** Metadata lives here: a layout only sees [lang], so the editor page itself stays prerenderable. */
export async function generateMetadata({ params }: LayoutProps<"/app/[lang]/editor">): Promise<Metadata> {
  const { t } = await appPageLang(params);
  return { title: t.meta.editor };
}

export default function EditorLayout({ children }: LayoutProps<"/app/[lang]/editor">) {
  return children;
}
