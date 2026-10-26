import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { PricingTable } from "@/components/marketing/PricingTable";
import { Faq } from "@/components/marketing/Faq";
import { FinalCta } from "@/components/marketing/FinalCta";

export const metadata: Metadata = {
  title: "Photo Dump Maker — Ücretsiz Instagram photo dump oluşturucu | Dump Creator",
  description:
    "Ücretsiz photo dump maker: fotoğraflarını sürükle bırak, polaroid ve film şablonlarıyla Instagram carousel ya da TikTok slideshow hazırla, 4K'ya kadar indir.",
  alternates: { canonical: "/photo-dump-maker" },
};

/** SEO landing for "photo dump maker" searches; same building blocks, search-intent copy. */
export default function PhotoDumpMakerPage() {
  return (
    <>
      <Hero
        line1="Photo dump maker,"
        line2="kurulumsuz ve ücretsiz."
        sub="Fotoğraflarını bırak, şablonunu seç, Instagram'a hazır carousel'i saniyeler içinde indir. Kaydırınca akan dump'lar, retro tarih damgaları, AI yorumları."
      />
      <FeatureGrid />
      <PricingTable />
      <Faq />
      <FinalCta />
    </>
  );
}
