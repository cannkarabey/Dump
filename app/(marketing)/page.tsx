import { Hero } from "@/components/marketing/Hero";
import { WordReveal } from "@/components/marketing/WordReveal";
import { StickyStory } from "@/components/marketing/StickyStory";
import { AgentShowcase } from "@/components/marketing/AgentShowcase";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <WordReveal />
      <StickyStory />
      <AgentShowcase />
      <FeatureGrid />
      <PricingTable />
      <Faq />
      <FinalCta />
    </>
  );
}
