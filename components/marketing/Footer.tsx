import Link from "next/link";
import { href, type Locale } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionary";
import { Logo } from "./Logo";

export function Footer({ lang, t, nav }: { lang: Locale; t: Dict["footer"]; nav: Dict["nav"]["links"] }) {
  const columns = [
    {
      title: t.product,
      links: [
        { href: "/app/editor/new", label: t.editor },
        { href: href(lang, "home", "features"), label: nav.features },
        { href: href(lang, "home", "pricing"), label: nav.pricing },
      ],
    },
    {
      title: t.explore,
      links: [
        { href: href(lang, "photoDumpMaker"), label: "Photo dump maker" },
        { href: href(lang, "home", "assistant"), label: nav.assistant },
        { href: href(lang, "home", "faq"), label: nav.faq },
      ],
    },
    {
      title: t.legal,
      links: [
        { href: href(lang, "privacy"), label: t.privacy },
        { href: href(lang, "terms"), label: t.terms },
        { href: href(lang, "refund"), label: t.refund },
      ],
    },
  ];

  return (
    <footer className="relative mx-2 -mt-14 mb-2 rounded-cover bg-white px-6 pt-20 pb-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-muted">{t.tagline}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {columns.map((c) => (
            <div key={c.title}>
              <p className="text-sm font-semibold">{c.title}</p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto mt-14 max-w-5xl border-t border-border pt-6 text-xs text-muted">{t.rights}</p>
    </footer>
  );
}
