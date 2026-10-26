import Link from "next/link";
import { Logo } from "./Logo";

const LINKS = [
  { href: "/#ozellikler", label: "Özellikler" },
  { href: "/#asistan", label: "AI Asistan" },
  { href: "/#fiyatlar", label: "Fiyatlar" },
  { href: "/#sss", label: "SSS" },
];

export function GlassNav() {
  return (
    <header className="sticky top-0 z-50 px-3">
      <nav
        aria-label="Ana menü"
        className="mx-auto mt-3 flex h-12 max-w-[calc(100vw-24px)] items-center gap-1 rounded-full border border-white/60 bg-white/70 px-2 pl-4 shadow-[0_8px_24px_#0f172a0f,inset_0_0.5px_0_#ffffffe6] backdrop-blur-[18px] backdrop-saturate-[1.8] sm:w-fit"
      >
        <Link href="/" aria-label="Dump Creator ana sayfa" className="mr-2">
          <Logo />
        </Link>
        <ul className="hidden items-center sm:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-full px-3 py-1.5 text-sm font-medium text-fg/70 transition hover:bg-black/5 hover:text-fg">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/app/editor/new"
          className="ml-auto rounded-full bg-fg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 sm:ml-2"
        >
          Dump&apos;la
        </Link>
      </nav>
    </header>
  );
}
