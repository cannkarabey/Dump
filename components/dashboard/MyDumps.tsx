"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nanoid } from "nanoid";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { Copy, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { deleteDump, duplicateDump, listDumps, type DumpSummary } from "@/lib/persist";
import { LogoMark } from "@/components/marketing/Logo";
import { format, useT } from "@/lib/i18n/app";

function ago(ts: number, locale: string, justNow: string) {
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diff = (ts - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, sec] of units) if (Math.abs(diff) >= sec) return relative.format(Math.round(diff / sec), unit);
  return justNow;
}

export function MyDumps() {
  const { t } = useT();
  const [dumps, setDumps] = useState<DumpSummary[] | null>(null);
  const refresh = () => void listDumps().then(setDumps);
  useEffect(refresh, []);

  if (!dumps) return <p className="mt-16 text-center text-sm text-muted">{t.common.loading}</p>;

  if (!dumps.length) {
    return (
      <div className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-4 rounded-[32px] bg-panel px-8 py-14 text-center">
        <LogoMark className="scale-[2.6]" />
        <p className="mt-6 text-lg font-semibold">
          {t.dumps.emptyTitleA} <span className="text-accent">dump</span> {t.dumps.emptyTitleB}
        </p>
        <p className="max-w-sm text-sm text-muted">
          {t.dumps.emptyText}
        </p>
        <Link
          href="/app/editor/new"
          className="mt-2 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white shadow-[0_12px_30px_-10px_var(--color-accent)]"
        >
          <Plus size={16} /> {t.dumps.startFirst}
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      <li>
        <Link
          href="/app/editor/new"
          className="flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border-strong text-sm font-medium text-muted transition hover:border-accent hover:text-fg"
        >
          <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
            <Plus size={22} />
          </span>
          {t.dumps.newDump}
        </Link>
      </li>
      {dumps.map((d) => (
        <li key={d.id} className="group relative">
          <Link href={`/app/editor/${d.id}`} className="block">
            <span className="block aspect-[3/4] overflow-hidden rounded-2xl bg-panel ring-1 ring-border transition group-hover:ring-accent">
              {d.thumb ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.thumb} alt="" className="size-full object-contain" />
              ) : (
                <span className="grid size-full place-items-center text-xs text-muted">{t.dumps.noPreview}</span>
              )}
            </span>
            <span className="mt-2 block truncate text-sm font-medium">{d.title}</span>
            <span className="block text-xs text-muted">
              {format(t.dumps.meta, { ago: ago(d.savedAt, t.locale, t.dumps.justNow), pages: d.pages, photos: d.photos })}
            </span>
          </Link>
          <Dropdown.Root>
            <Dropdown.Trigger
              aria-label={format(t.dumps.options, { title: d.title })}
              className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            >
              <MoreHorizontal size={16} />
            </Dropdown.Trigger>
            <Dropdown.Portal>
              <Dropdown.Content
                align="end"
                sideOffset={4}
                className="theme-dark z-50 min-w-40 rounded-xl border border-border bg-card p-1 text-sm text-fg shadow-xl"
              >
                <Dropdown.Item
                  onSelect={() => void duplicateDump(d.id, nanoid(10)).then(refresh)}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 outline-none data-highlighted:bg-hover"
                >
                  <Copy size={14} /> {t.dumps.duplicate}
                </Dropdown.Item>
                <Dropdown.Item
                  onSelect={() => {
                    if (window.confirm(format(t.dumps.confirmDelete, { title: d.title }))) void deleteDump(d.id).then(refresh);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[#ff453a] outline-none data-highlighted:bg-hover"
                >
                  <Trash2 size={14} /> {t.dumps.delete}
                </Dropdown.Item>
              </Dropdown.Content>
            </Dropdown.Portal>
          </Dropdown.Root>
        </li>
      ))}
    </ul>
  );
}
