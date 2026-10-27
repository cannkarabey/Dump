import {
  Anton,
  Archivo_Black,
  Bebas_Neue,
  Caveat,
  Cinzel,
  Cormorant_Garamond,
  DM_Serif_Display,
  Fraunces,
  Instrument_Serif,
  Inter,
  Italiana,
  JetBrains_Mono,
  Major_Mono_Display,
  Outfit,
  Pacifico,
  Permanent_Marker,
  Pixelify_Sans,
  Playfair_Display,
  Plus_Jakarta_Sans,
  Shrikhand,
  Space_Grotesk,
  Space_Mono,
  Syne,
  VT323,
} from "next/font/google";

// next/font needs literal options, so subsets are repeated per font.
// latin-ext is required for Turkish glyphs (ğ, ş, İ, ı) wherever the family has it.
// Editor-only families use preload: false: their files load only when a text uses them.
export const inter = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-inter", display: "swap" });
export const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], variable: "--font-playfair", display: "swap" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], variable: "--font-space-grotesk", display: "swap" });
export const caveat = Caveat({ subsets: ["latin", "latin-ext"], variable: "--font-caveat", display: "swap" });
export const pixelify = Pixelify_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-pixelify", display: "swap" });
export const vt323 = VT323({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-vt323", display: "swap" });

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-jakarta", preload: false });
const outfit = Outfit({ subsets: ["latin", "latin-ext"], variable: "--font-outfit", preload: false });
const anton = Anton({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-anton", preload: false });
const bebas = Bebas_Neue({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-bebas", preload: false });
const archivo = Archivo_Black({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-archivo", preload: false });
const syne = Syne({ subsets: ["latin", "latin-ext"], variable: "--font-syne", preload: false });
const shrikhand = Shrikhand({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-shrikhand", preload: false });
const dmSerif = DM_Serif_Display({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-dmserif", preload: false });
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", preload: false });
const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], variable: "--font-fraunces", preload: false });
const pacifico = Pacifico({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-pacifico", preload: false });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-marker", preload: false });
const cinzel = Cinzel({ subsets: ["latin", "latin-ext"], variable: "--font-cinzel", preload: false });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-cormorant", preload: false });
const italiana = Italiana({ subsets: ["latin"], weight: "400", variable: "--font-italiana", preload: false });
const jetbrains = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jetbrains", preload: false });
const spaceMono = Space_Mono({ subsets: ["latin", "latin-ext"], weight: ["400", "700"], variable: "--font-spacemono", preload: false });
const majorMono = Major_Mono_Display({ subsets: ["latin", "latin-ext"], weight: "400", variable: "--font-majormono", preload: false });

export const fontVariables = [
  inter,
  playfair,
  spaceGrotesk,
  caveat,
  pixelify,
  vt323,
  jakarta,
  outfit,
  anton,
  bebas,
  archivo,
  syne,
  shrikhand,
  dmSerif,
  instrument,
  fraunces,
  pacifico,
  marker,
  cinzel,
  cormorant,
  italiana,
  jetbrains,
  spaceMono,
  majorMono,
]
  .map((f) => f.variable)
  .join(" ");
