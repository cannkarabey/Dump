import Link from "next/link";
import { Logo } from "./Logo";

const COLUMNS = [
  {
    title: "Ürün",
    links: [
      { href: "/app/editor/new", label: "Editör" },
      { href: "/#ozellikler", label: "Özellikler" },
      { href: "/#fiyatlar", label: "Fiyatlar" },
    ],
  },
  {
    title: "Keşfet",
    links: [
      { href: "/photo-dump-maker", label: "Photo dump maker" },
      { href: "/#asistan", label: "AI Asistan" },
      { href: "/#sss", label: "SSS" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik ve KVKK" },
      { href: "/kosullar", label: "Kullanım koşulları" },
      { href: "/iade", label: "İptal ve iade" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative -mt-14 rounded-t-[56px] bg-white px-6 pt-20 pb-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm text-muted">
            Aylık photo dump, Instagram carousel ve TikTok slideshow&apos;larını tarayıcında hazırla.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((c) => (
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
      <p className="mx-auto mt-14 max-w-5xl border-t border-border pt-6 text-xs text-muted">
        {/* Static year: `new Date()` would make this prerendered shell dynamic under Cache Components. */}
        © 2026 Dump Creator. Tüm hakları saklıdır.
      </p>
    </footer>
  );
}
