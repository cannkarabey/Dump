import type { Metadata } from "next";
import { TemplateGallery } from "@/components/dashboard/TemplateGallery";
import { appPageLang } from "@/lib/i18n/appPage";

export async function generateMetadata({ params }: PageProps<"/app/[lang]/templates">): Promise<Metadata> {
  const { t } = await appPageLang(params);
  return { title: t.meta.templates };
}

export default async function TemplatesPage({ params }: PageProps<"/app/[lang]/templates">) {
  const { t } = await appPageLang(params);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-center font-display text-5xl font-semibold tracking-[-0.04em]">
        <span className="text-accent">dump</span>
        {t.gallery.titleB}
      </h1>
      <TemplateGallery />
    </main>
  );
}
