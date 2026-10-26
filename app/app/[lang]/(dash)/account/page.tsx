import { Suspense } from "react";
import type { Metadata } from "next";
import { AccountView } from "@/components/dashboard/AccountView";
import { AppLangSwitch } from "@/components/dashboard/AppLangSwitch";
import { appPageLang } from "@/lib/i18n/appPage";

export async function generateMetadata({ params }: PageProps<"/app/[lang]/account">): Promise<Metadata> {
  const { t } = await appPageLang(params);
  return { title: t.meta.account };
}

export default async function AccountPage({ params }: PageProps<"/app/[lang]/account">) {
  const { t } = await appPageLang(params);
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-4xl font-semibold tracking-[-0.04em]">{t.account.title}</h1>
      {/* AccountView reads ?error= from the URL, which is request-time data under Cache Components. */}
      <Suspense fallback={<p className="mt-8 text-sm text-muted">{t.common.loading}</p>}>
        <AccountView />
      </Suspense>
      <section className="mt-4 flex items-center justify-between gap-4 rounded-3xl bg-panel p-6">
        <div>
          <p className="font-semibold">{t.common.language}</p>
          <p className="mt-1 text-sm text-muted">{t.account.languageText}</p>
        </div>
        <AppLangSwitch variant="segmented" />
      </section>
    </main>
  );
}
