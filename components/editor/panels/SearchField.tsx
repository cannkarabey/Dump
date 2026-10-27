"use client";

import { Search } from "lucide-react";

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-10 items-center gap-2 rounded-xl bg-hover px-3 focus-within:ring-1 focus-within:ring-accent">
      <Search size={15} className="shrink-0 text-muted" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
      />
    </label>
  );
}

/** Lowercase, accent-insensitive ("şablon" finds "sablon"). */
export function normalizeQuery(s: string) {
  return s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/ı/g, "i");
}
