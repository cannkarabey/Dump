import {
  Caveat,
  Inter,
  Pixelify_Sans,
  Playfair_Display,
  Space_Grotesk,
  VT323,
} from "next/font/google";

// next/font needs literal options, so subsets are repeated per font.
// latin-ext is required for Turkish glyphs (ğ, ş, İ, ı).
export const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
export const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-playfair", display: "swap" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-space-grotesk", display: "swap" });
export const caveat = Caveat({ subsets: ["latin", "latin-ext"], variable: "--font-caveat", display: "swap" });
export const pixelify = Pixelify_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-pixelify", display: "swap" });
export const vt323 = VT323({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-vt323", display: "swap" });

export const fontVariables = [inter, playfair, spaceGrotesk, caveat, pixelify, vt323]
  .map((f) => f.variable)
  .join(" ");
