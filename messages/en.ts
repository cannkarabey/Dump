import type { Dict } from "./tr";

/** English marketing copy; shape is enforced by the Dict type. */
export const en: Dict = {
  meta: {
    title: "Dump Creator — This month's photos, one-click dump",
    description:
      "Make photo dumps for Instagram carousels, TikTok slideshows and stories right in your browser. An AI assistant reviews your dump and suggests the order and captions.",
    ogDescription: "This month's photos, one-click dump. Seamless carousels, an AI assistant, 4K export.",
    locale: "en_US",
  },
  nav: {
    label: "Main menu",
    home: "Dump Creator home",
    links: { features: "Features", assistant: "AI Assistant", pricing: "Pricing", faq: "FAQ" },
    cta: "Start dumping",
    language: "Language",
    switchTo: "Türkçe",
  },
  hero: {
    badge: "New: an AI assistant that reviews your dump",
    line1: "This month's photos,",
    line2: "one-click dump.",
    sub: "Make seamless, swipe-through dumps for Instagram carousels, TikTok slideshows and stories. Let the AI assistant review it, then post.",
    primary: "Start dumping",
    secondary: "How it works",
    note: "Free · no sign-up · your photos stay on your device",
  },
  mock: {
    title: "OCT '26 dump",
    month: "OCT '26",
    monthDump: "Month dump",
    export: "Export",
    templates: "Templates",
    assistant: "Assistant",
    advice: "Strong cover! The two photos on page 2 look alike. Move one to page 3?",
    apply: "Apply",
    scores: ["Hook", "Flow", "Color"],
  },
  define: {
    pos: "verb",
    definition: "To turn a pile of photos into something your followers stop scrolling for.",
    tagline: "Post more. Overthink less.",
  },
  story: {
    handle: "october.dump",
    month: "OCT '26",
    progress: "Step {n} of {total}",
    steps: [
      { title: ["One canvas.", "The whole carousel."], text: "Design your dump in one piece; every slide exports separately and flows seamlessly as you swipe." },
      { title: ["Your photos.", "Your vibe."], text: "Polaroid, film strip, panorama… templates that never look like templates, so your shots stand out." },
      { title: ["Month dump.", "One click."], text: "Sorts by capture date, builds a month cover with a color palette and adds retro date stamps." },
    ],
  },
  agent: {
    badge: "AI Assistant",
    title: ["A second pair", "of eyes."],
    body: "The assistant looks at your slides and points out a weak cover, near-duplicate shots and a broken color flow. Like a suggestion? Apply it in one click.",
    scores: ["Hook", "Flow", "Color harmony", "Variety"],
    user: "Can you review this month's dump?",
    reply:
      "The cover feels flat; your most vivid photo is third. Make it the cover and split up the two similar shots to fix the rhythm.",
    cardTitle: "Fix the order",
    cardSub: "4 photos · new cover",
    apply: "Apply",
    applied: "Applied ✓",
    caption: 'Caption idea: "october, in a nutshell ☕🍂" · #photodump #octoberdump',
  },
  marquee: { label: "Examples from the templates" },
  features: {
    title: ["Post more.", "Fuss less."],
    demoAsk: "Review",
    demoTip: "Lead with your most vivid photo.",
    items: [
      { title: "Seamless carousels", text: "One wide canvas; photos cross page edges and flow as you swipe on Instagram." },
      { title: "Month dump", text: "EXIF date order, a month cover, a color palette and retro date stamps — in one click." },
      { title: "AI assistant", text: "Reviews your cover, order and color harmony; suggests captions and hashtags." },
      { title: "Templates that don't look like templates", text: "Polaroid, film strip, panorama and month cover; drag photos into the frames." },
      { title: "Export up to 4K", text: "PNG or JPG, page by page or one ZIP. Studio exports at a 3840px long side." },
      { title: "No sign-up, no install", text: "Opens in your browser; photos are processed on your device, never uploaded." },
    ],
  },
  pricing: {
    title: "Pick a plan",
    sub: "Everything is free to try. Prices in USD; your bank converts at checkout.",
    period: "Billing period",
    monthly: "Monthly",
    yearly: "Yearly −30%",
    popular: "Most popular",
    perMonth: "/mo",
    forever: "forever",
    billedYearly: "${n} billed yearly",
    billedMonthly: "billed monthly",
    blurbs: {
      free: "To start dumping.",
      creator: "For people who post every month.",
      studio: "For creators and brands.",
    },
    ai: {
      creator: "AI assistant: 300 messages + 30 deep reviews / mo",
      studio: "AI assistant: 1000 messages + 100 deep reviews / mo",
    },
    startFree: "Start free",
    tryTier: "Try {tier}",
  },
  faq: {
    title: "FAQ",
    items: [
      {
        q: "Where do my photos go?",
        a: "Nowhere. Photos are processed and exported in your browser, on your device. Only when you use the AI assistant are small previews of your slides sent to the AI model for review, and you agree to that the first time.",
      },
      { q: "Which currencies can I pay in?", a: "Prices are in USD. If your card is in another currency, your bank converts at that day's rate." },
      {
        q: "Can I cancel anytime?",
        a: "Yes. When you cancel, your plan stays active until the end of the period, then switches to Free; your dumps aren't deleted.",
      },
      {
        q: "What exactly does the AI assistant do?",
        a: "It reviews your cover, order, color harmony and repeated shots, and suggests an order, template, background and captions. Nothing changes until you hit Apply.",
      },
      { q: "Does it work on my phone?", a: "It works in any modern browser; a computer is more comfortable for editing the wide canvas." },
    ],
  },
  final: {
    title: ["Your next post", "starts here."],
    sub: "Pick a template, drop your photos, post it today.",
    cta: "Start dumping",
    note: "Free · works on your phone too",
  },
  footer: {
    tagline: "Make monthly photo dumps, Instagram carousels and TikTok slideshows in your browser.",
    product: "Product",
    explore: "Explore",
    legal: "Legal",
    editor: "Editor",
    privacy: "Privacy",
    terms: "Terms of use",
    refund: "Cancellation & refunds",
    rights: "© 2026 Dump Creator. All rights reserved.",
  },
  photoDumpMaker: {
    title: "Photo Dump Maker — Free Instagram photo dump creator | Dump Creator",
    description:
      "Free photo dump maker: drag in your photos, use polaroid and film templates for Instagram carousels or TikTok slideshows, and download up to 4K.",
    line1: "Photo dump maker,",
    line2: "free, nothing to install.",
    sub: "Drop your photos, pick a template and download an Instagram-ready carousel in seconds. Seamless dumps, retro date stamps, AI reviews.",
  },
  legal: {
    updated: "Last updated",
    translationNote:
      "This is an English translation provided for convenience. The Turkish version is the legally binding text.",
  },
};
