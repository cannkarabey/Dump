"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { Crown } from "@/components/ui/Crown";
import { TIER_LABELS, TIER_PRICES, tierFeatures } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";

const BLURBS: Record<Tier, string> = {
  free: "Dump'lamaya başlamak için.",
  creator: "Her ay düzenli paylaşanlar için.",
  studio: "İçerik üreticileri ve markalar için.",
};

export function PricingTable() {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="fiyatlar" className="scroll-mt-20 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="font-display text-[40px] leading-[1.02] font-semibold tracking-[-0.04em] sm:text-[52px]">Planını seç</h2>
        <p className="mt-4 text-lg text-fg/60">Her şey ücretsiz denenebilir. Fiyatlar USD; ödeme anında kartının bankası TL&apos;ye çevirir.</p>
        <Segmented
          aria-label="Faturalandırma dönemi"
          className="mt-8 bg-black/5"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: "Aylık" },
            { value: "yearly", label: "Yıllık −30%" },
          ]}
        />
      </div>

      <ul className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {(["free", "creator", "studio"] as Tier[]).map((tier) => {
          const price = TIER_PRICES[tier];
          const perMonth = period === "yearly" ? price.yearly / 12 : price.monthly;
          const dark = tier === "creator";
          return (
            <li
              key={tier}
              className={cn(
                "flex flex-col gap-6 rounded-[28px] border p-7 text-left",
                dark ? "border-white/10 bg-[#0b0b0f] text-white" : "border-black/5 bg-white shadow-[0_1px_2px_#0f172a0a,0_8px_28px_#0f172a0f]",
              )}
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {TIER_LABELS[tier]}
                  {tier !== "free" && <Crown />}
                  {dark && <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px]">En popüler</span>}
                </p>
                <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-muted")}>{BLURBS[tier]}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums">
                    ${Number.isInteger(perMonth) ? perMonth : perMonth.toFixed(2)}
                  </span>
                  <span className={dark ? "text-white/60" : "text-muted"}>/ay</span>
                </p>
                <p className={cn("text-xs", dark ? "text-white/50" : "text-muted")}>
                  {tier === "free" ? "sonsuza kadar" : period === "yearly" ? `yıllık $${price.yearly} faturalanır` : "aylık faturalanır"}
                </p>
              </div>
              <ul className="flex flex-1 flex-col gap-2.5 text-sm">
                {tierFeatures(tier).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
                {tier !== "free" && (
                  <li className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    AI asistan: {tier === "creator" ? "300 mesaj + 30 derin yorum / ay" : "1000 mesaj + 100 derin yorum / ay"}
                  </li>
                )}
              </ul>
              <Link
                href="/app/editor/new"
                className={cn(
                  "rounded-full py-3 text-center text-sm font-medium transition",
                  dark ? "bg-accent text-white hover:bg-accent-strong" : "bg-black/5 hover:bg-black/10",
                )}
              >
                {tier === "free" ? "Ücretsiz başla" : `${TIER_LABELS[tier]}'ı dene`}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
