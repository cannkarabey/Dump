import type { Metadata } from "next";
import { fontVariables } from "./fonts";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dump Creator — Ayın fotoğrafları, tek tıkla dump",
  description:
    "Instagram carousel, TikTok slideshow ve story için tarayıcıda photo dump oluştur. AI asistanı dump'ını yorumlasın.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
