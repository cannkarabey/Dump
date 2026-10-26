import type { Metadata } from "next";
import { SmoothScroll } from "@/components/marketing/SmoothScroll";
import { GlassNav } from "@/components/marketing/GlassNav";
import { Footer } from "@/components/marketing/Footer";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Dump Creator — Ayın fotoğrafları, tek tıkla dump",
  description:
    "Instagram carousel, TikTok slideshow ve story için tarayıcıda photo dump oluştur. AI asistanı dump'ını yorumlasın, sıralamayı ve caption'ı önersin.",
  openGraph: {
    title: "Dump Creator",
    description: "Ayın fotoğrafları, tek tıkla dump. Kaydırınca akan carousel'ler, AI asistan, 4K export.",
    type: "website",
    locale: "tr_TR",
    siteName: "Dump Creator",
  },
  twitter: { card: "summary_large_image" },
};

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <SmoothScroll>
      <div className="flex min-h-dvh flex-col bg-bg text-fg">
        <GlassNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
