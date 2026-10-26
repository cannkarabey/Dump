"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, FolderOpen, LayoutTemplate, Plus } from "lucide-react";
import { LogoMark } from "@/components/marketing/Logo";
import { cn } from "@/lib/cn";

const ITEMS = [
  { href: "/app", label: "Dump'larım", icon: FolderOpen },
  { href: "/app/templates", label: "Şablonlar", icon: LayoutTemplate },
  { href: "/#fiyatlar", label: "Plan", icon: Crown },
];

export function DashRail() {
  const pathname = usePathname();
  return (
    <nav aria-label="Uygulama" className="flex w-[92px] shrink-0 flex-col items-center gap-2 border-r border-border bg-panel py-4">
      <Link href="/" aria-label="Ana sayfa" className="mb-3">
        <LogoMark className="scale-125" />
      </Link>
      <Link href="/app/editor/new" className="group flex flex-col items-center gap-1 text-[11px] font-medium">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-white shadow-[0_8px_24px_-8px_var(--color-accent)] transition group-hover:scale-105">
          <Plus size={22} />
        </span>
        Oluştur
      </Link>
      <ul className="mt-3 flex flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => {
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
    </nav>
  );
}
