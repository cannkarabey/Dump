"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT } from "@/lib/motion";

import { Reveal, RevealItem } from "./Reveal";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RollText } from "@/components/ui/RollText";

import { format, type Dict } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Segmented } from "@/components/ui/Segmented";
import { Crown } from "@/components/ui/Crown";
import { TIER_LABELS, TIER_PRICES, tierFeatures } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";

export function PricingTable({ lang, t }: { lang: Locale; t: Dict["pricing"] }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <section id="pricing" className="scroll-mt-20 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="display-2">{t.title}</h2>
        <p className="mt-4 text-lg text-muted">{t.sub}</p>
        <Segmented
          aria-label={t.period}
          className="mt-8 bg-black/5"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: t.monthly },
            { value: "yearly", label: t.yearly },
          ]}
        />
      </div>

      <Reveal as="ul" className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
        {(["free", "creator", "studio"] as Tier[]).map((tier) => {
          const price = TIER_PRICES[tier];
          const perMonth = period === "yearly" ? price.yearly / 12 : price.monthly;
          const dark = tier === "creator";
          return (
            <RevealItem as="li" key={tier} className="flex">
              <SpotlightCard
                key={tier}
                tone={dark ? "dark" : "light"}
                className={cn(
                  "flex w-full flex-col gap-6 rounded-card border p-7 text-left",
                  dark ? "border-white/10 bg-[#0b0b0f] text-white" : "border-black/5 bg-white shadow-card",
                )}
              >
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    {TIER_LABELS[tier]}
                    {tier !== "free" && <Crown />}
                    {dark && (
                      <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px]">{t.popular}</span>
                    )}
                  </p>
                  <p className={cn("mt-1 text-sm", dark ? "text-white/60" : "text-muted")}>{t.blurbs[tier]}</p>
                  <p className="mt-5 flex items-baseline gap-1">
                    {/* Price swaps with a short slide when the billing period changes. */}
                    <span className="relative inline-flex overflow-hidden text-4xl font-semibold tracking-tight tabular-nums">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={perMonth}
                          initial={{ y: "60%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "-60%", opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE_OUT }}
                        >
                          ${Number.isInteger(perMonth) ? perMonth : perMonth.toFixed(2)}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                    <span className={dark ? "text-white/60" : "text-muted"}>{t.perMonth}</span>
                  </p>
                  <p className={cn("text-xs", dark ? "text-white/60" : "text-muted")}>
                    {tier === "free"
                      ? t.forever
                      : period === "yearly"
                        ? format(t.billedYearly, { n: price.yearly })
                        : t.billedMonthly}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col gap-2.5 text-sm">
                  {tierFeatures(tier, lang).map((f) => (
                    <li key={f} className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                  {tier !== "free" && (
                    <li className="flex gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                      {t.ai[tier as Exclude<Tier, "free">]}
                    </li>
                  )}
                </ul>
                <Link
                  href="/app/editor/new"
                  className={cn(
                    "roll-trigger flex justify-center rounded-full py-3 text-sm font-medium transition duration-150 hover:scale-[1.03] active:scale-[0.98]",
                    dark ? "bg-accent text-white shadow-accent hover:bg-accent-strong" : "bg-black/5 hover:bg-black/10",
                  )}
                >
                  <RollText>{tier === "free" ? t.startFree : format(t.tryTier, { tier: TIER_LABELS[tier] })}</RollText>
                </Link>
              </SpotlightCard>
            </RevealItem>
          );
        })}
      </Reveal>
    </section>
  );
}
