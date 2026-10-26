import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { GlassNav } from "@/components/marketing/GlassNav";
import { Footer } from "@/components/marketing/Footer";
import { LangCookie } from "@/components/marketing/LangSwitch";
import { siteUrl } from "@/lib/site";
import { isLocale, languageAlternates, LOCALES, ROUTES } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(siteUrl),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: ROUTES.home[lang], languages: languageAlternates("home") },
    openGraph: {
      title: "Dump Creator",
      description: t.meta.ogDescription,
      type: "website",
      locale: t.meta.locale,
      siteName: "Dump Creator",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function MarketingLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <SmoothScroll>
      {/* The root <html lang> is Turkish; this marks English pages for assistive tech and crawlers. */}
      <div lang={lang} className="flex min-h-dvh flex-col bg-bg text-fg">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-white">
          {lang === "tr" ? "İçeriğe geç" : "Skip to content"}
        </a>
        <LangCookie lang={lang} />
        <GlassNav lang={lang} t={t.nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer lang={lang} t={t.footer} nav={t.nav.links} />
      </div>
    </SmoothScroll>
  );
}
