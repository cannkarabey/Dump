import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { isLocale, languageAlternates, ROUTES } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export async function generateMetadata({ params }: PageProps<"/[lang]/photo-dump-maker">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).photoDumpMaker;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: ROUTES.photoDumpMaker[lang], languages: languageAlternates("photoDumpMaker") },
  };
}

/** SEO landing for "photo dump maker" searches; same building blocks, search-intent copy. */
export default async function PhotoDumpMakerPage({ params }: PageProps<"/[lang]/photo-dump-maker">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const seo = t.photoDumpMaker;
  return (
    <>
      <Hero t={{ ...t.hero, line1: seo.line1, line2: seo.line2, sub: seo.sub }} mock={t.mock} />
      <FeatureGrid t={t.features} />
      <PricingTable lang={lang} t={t.pricing} />
      <Faq t={t.faq} />
      <FinalCta t={t.final} />
    </>
  );
}
