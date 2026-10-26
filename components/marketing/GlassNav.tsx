"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { href, SECTIONS, type Locale, type SectionId } from "@/lib/i18n/config";
import type { Dict } from "@/lib/i18n/dictionary";
import { EASE_OUT } from "@/lib/motion";
import { RollText } from "@/components/ui/RollText";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { useScrollSpy } from "./useScrollSpy";
import { useLenisLock, useScrollToSection } from "./SmoothScroll";

/**
 * Floating glass pill. On the home page the links scroll to their section (below the navbar)
 * and a pill slides behind the section in view; elsewhere they navigate to home#section.
 */
export function GlassNav({ lang, t }: { lang: Locale; t: Dict["nav"] }) {
  const active = useScrollSpy(SECTIONS);
  const scrollTo = useScrollToSection();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useLenisLock(open);

  // Close the mobile menu on Escape or a click outside.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => !menuRef.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const go = (id: SectionId) => (e: React.MouseEvent) => {
    // Same page: smooth scroll in place. Other pages: let the link navigate to home#id.
    if (scrollTo(id)) e.preventDefault();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 px-3">
      <div ref={menuRef} className="relative mx-auto mt-3 w-full max-w-[calc(100vw-24px)] sm:w-fit">
        <nav
          aria-label={t.label}
          className="flex h-12 items-center gap-1 rounded-full border border-white/60 bg-white/70 px-1.5 pl-4 shadow-[0_8px_24px_rgb(15_23_42/0.06),inset_0_0.5px_0_rgb(255_255_255/0.9)] backdrop-blur-[18px] backdrop-saturate-[1.8]"
        >
          <Link href={href(lang, "home")} aria-label={t.home} className="mr-2 shrink-0 rounded-full">
            <Logo />
          </Link>

          <LayoutGroup id="nav">
            <ul className="hidden items-center md:flex">
              {SECTIONS.map((id) => {
                const isActive = active === id;
                return (
                  <li key={id} className="relative">
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        aria-hidden
                        className="absolute inset-0 rounded-full bg-black/[0.06]"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <a
                      href={href(lang, "home", id)}
                      onClick={go(id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "roll-trigger relative block rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        isActive ? "text-fg" : "text-fg/75 hover:text-fg",
                      )}
                    >
                      <RollText>{t.links[id]}</RollText>
                    </a>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>

          <LangSwitch lang={lang} label={t.switchTo} className="ml-auto md:ml-1" />
          <Link
            href="/app/editor/new"
            className="roll-trigger hidden h-9 shrink-0 items-center rounded-full bg-fg px-4 text-sm font-medium text-white shadow-ink transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] min-[400px]:inline-flex"
          >
            <RollText>{t.cta}</RollText>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t.label}
            className="grid size-9 shrink-0 place-items-center rounded-full text-fg hover:bg-black/5 md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              className="absolute inset-x-0 top-[calc(100%+8px)] origin-top rounded-[24px] border border-white/60 bg-white/85 p-2 shadow-[0_24px_48px_-16px_rgb(15_23_42/0.25)] backdrop-blur-[18px] backdrop-saturate-[1.8] md:hidden"
            >
              <ul className="flex flex-col">
                {SECTIONS.map((id) => (
                  <li key={id}>
                    <a
                      href={href(lang, "home", id)}
                      onClick={go(id)}
                      aria-current={active === id ? "true" : undefined}
                      className={cn(
                        "block rounded-2xl px-4 py-3 text-base font-medium",
                        active === id ? "bg-black/[0.06] text-fg" : "text-fg/80 hover:bg-black/5",
                      )}
                    >
                      {t.links[id]}
                    </a>
                  </li>
                ))}
                <li className="mt-1 min-[400px]:hidden">
                  <Link href="/app/editor/new" className="block rounded-2xl bg-fg px-4 py-3 text-center text-base font-medium text-white">
                    {t.cta}
                  </Link>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
