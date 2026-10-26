import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale, languageAlternates, ROUTES, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import * as content from "./legal/content";

/** Values to fill in before launch (company details aren't known yet). */
export const LEGAL = {
  company: "[Şirket unvanı]",
  address: "[Adres]",
  email: "[iletisim@alanadi.com]",
  updated: { tr: "27 Ekim 2026", en: "27 October 2026" },
};

type LegalKey = "privacy" | "terms" | "refund";

/** Shared metadata for legal pages, with hreflang between the TR and EN versions. */
export async function legalMetadata(kind: LegalKey, params: Promise<{ lang: string }>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const doc = content[kind](lang);
  return {
    title: `${doc.title} — Dump Creator`,
    description: doc.description,
    alternates: { canonical: ROUTES[kind][lang], languages: languageAlternates(kind) },
  };
}

/** Plain sections so lawyers can edit the text easily (components/marketing/legal/content.tsx). */
export async function LegalPage({ kind, params }: { kind: LegalKey; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const doc = content[kind](lang as Locale);
  const t = getDictionary(lang).legal;
  return (
    <article className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="display-2">{doc.title}</h1>
      <p className="mt-3 text-sm text-muted">
        {t.updated}: {LEGAL.updated[lang]}
      </p>
      {t.translationNote && <p className="mt-4 rounded-2xl bg-black/5 p-4 text-sm text-muted">{t.translationNote}</p>}
      <div className="mt-10 flex flex-col gap-8">
        {doc.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold tracking-[-0.01em]">{s.heading}</h2>
            <div className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-fg/80 [&_li]:ml-5 [&_li]:list-disc">
              {s.body}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
