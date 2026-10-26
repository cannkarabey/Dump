import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/lib/i18n/config";
import { AppI18nProvider } from "@/lib/i18n/app";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

/** Internal language segment: proxy.ts rewrites /app/… here from the lang cookie. */
export default async function AppLangLayout({ children, params }: LayoutProps<"/app/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <AppI18nProvider lang={lang}>
      <div lang={lang} className="contents">
        {children}
      </div>
    </AppI18nProvider>
  );
}
