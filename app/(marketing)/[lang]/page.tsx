import { notFound } from "next/navigation";
import { Hero } from "@/components/marketing/Hero";
import { WordReveal } from "@/components/marketing/WordReveal";
import { Marquee } from "@/components/marketing/Marquee";
import { StickyStory } from "@/components/marketing/StickyStory";
import { AgentShowcase } from "@/components/marketing/AgentShowcase";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  return (
    <>
      <Hero t={t.hero} mock={t.mock} />
      <Marquee lang={lang} label={t.marquee.label} />
      <WordReveal t={t.define} />
      <StickyStory t={t.story} />
      <AgentShowcase t={t.agent} />
      <FeatureGrid t={t.features} />
      <PricingTable lang={lang} t={t.pricing} />
      <Faq t={t.faq} />
      <FinalCta t={t.final} />
    </>
  );
}
