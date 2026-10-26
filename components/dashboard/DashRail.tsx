"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleUser, Crown, FolderOpen, LayoutTemplate, Plus } from "lucide-react";
import { LogoMark } from "@/components/marketing/Logo";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";
import { href as marketingHref } from "@/lib/i18n/config";
import { AppLangSwitch } from "./AppLangSwitch";

/** Public /app paths; the internal /app/[lang] prefix is stripped in case SSR reports it. */
const publicPath = (pathname: string) => pathname.replace(/^\/app\/(?:tr|en)(?=\/|$)/, "/app");

export function DashRail() {
  const pathname = publicPath(usePathname());
  const { lang, t } = useT();
  const items = [
    { href: "/app", label: t.rail.dumps, icon: FolderOpen },
    { href: "/app/templates", label: t.rail.templates, icon: LayoutTemplate },
    { href: marketingHref(lang, "home", "pricing"), label: t.rail.plan, icon: Crown },
    { href: "/app/account", label: t.rail.account, icon: CircleUser },
  ];
  return (
    <nav aria-label={t.rail.label} className="flex w-[92px] shrink-0 flex-col items-center gap-2 border-r border-border bg-panel py-4">
      <Link href={marketingHref(lang, "home")} aria-label={t.rail.home} className="mb-3">
        <LogoMark className="scale-125" />
      </Link>
      <Link href="/app/editor/new" className="group flex flex-col items-center gap-1 text-[11px] font-medium">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-white shadow-[0_8px_24px_-8px_var(--color-accent)] transition group-hover:scale-105">
          <Plus size={22} />
        </span>
        {t.rail.create}
      </Link>
      <ul className="mt-3 flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-[76px] flex-col items-center gap-1 rounded-xl py-2.5 text-[11px] font-medium transition",
                  active ? "bg-active text-fg" : "text-muted hover:bg-hover hover:text-fg",
                )}
              >
                <Icon size={20} strokeWidth={1.75} className={active ? "text-accent" : undefined} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto">
        <AppLangSwitch />
      </div>
    </nav>
  );
}
