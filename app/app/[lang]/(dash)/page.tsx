import type { Metadata } from "next";
import { MyDumps } from "@/components/dashboard/MyDumps";
import { appPageLang } from "@/lib/i18n/appPage";

export async function generateMetadata({ params }: PageProps<"/app/[lang]">): Promise<Metadata> {
  const { t } = await appPageLang(params);
  return { title: t.meta.dumps };
}

export default async function MyDumpsPage({ params }: PageProps<"/app/[lang]">) {
  const { t } = await appPageLang(params);
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-center font-display text-5xl font-semibold tracking-[-0.04em]">
        {t.dumps.titleA}
        <span className="text-accent">{t.dumps.titleB}</span>
      </h1>
      <p className="mt-3 text-center text-sm text-muted">{t.dumps.subtitle}</p>
      <MyDumps />
    </main>
  );
}
