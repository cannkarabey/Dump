"use client";

import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Crown } from "@/components/ui/Crown";
import { useUi } from "@/lib/store/ui";
import { useTier } from "@/lib/store/tier";
import { TIER_LABELS, TIER_PRICES, tierFeatures, type Feature } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";

type PaywallReason = Feature | "maxPhotos" | "maxPages";

const REASONS: Record<PaywallReason, string> = {
  maxPhotos: "Daha fazla fotoğraf eklemek",
  maxPages: "Daha fazla sayfa eklemek",
  premiumTemplates: "Premium şablonlar",
  stamp: "Retro tarih damgası",
  zip: "ZIP olarak toplu indirme",
  hiRes: "2K / 4K dışa aktarma",
  brandKit: "Marka kiti ve özel fontlar",
};

export function PaywallModal() {
  const { open, feature } = useUi((s) => s.modals.paywall);
  const current = useTier((s) => s.tier);

  // Sprint 1: buttons switch the mock tier. Sprint 2 (S2.12) replaces this with checkout.
  const choose = (tier: Tier) => {
    useTier.getState().setTier(tier);
    useUi.getState().closePaywall();
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && useUi.getState().closePaywall()}
      title={feature ? `${REASONS[feature]} için planını yükselt` : "Planlar"}
      description="Ödeme anında kartının bankası tutarı TL'ye çevirir. İstediğin zaman iptal edebilirsin."
    >
      <ul className="grid gap-3 sm:grid-cols-3">
        {(["free", "creator", "studio"] as Tier[]).map((tier) => {
          const highlight = tier === "creator";
          return (
            <li
              key={tier}
              className={cn(
                "flex flex-col gap-4 rounded-3xl border p-5",
                highlight ? "border-accent bg-accent-soft" : "border-border bg-hover",
              )}
            >
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {TIER_LABELS[tier]}
                  {tier !== "free" && <Crown />}
                  {highlight && (
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">Popüler</span>
                  )}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                  ${TIER_PRICES[tier].monthly}
                  <span className="text-sm font-normal text-muted">/ay</span>
                </p>
              </div>
              <ul className="flex flex-1 flex-col gap-2 text-sm">
                {tierFeatures(tier).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={highlight ? "accent" : "secondary"}
                disabled={tier === current}
                onClick={() => choose(tier)}
              >
                {tier === current ? "Mevcut plan" : tier === "free" ? "Free'ye geç" : `${TIER_LABELS[tier]}'a geç`}
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-center text-xs text-muted">Test sürümü: ödeme henüz bağlı değil, plan anında değişir.</p>
    </Modal>
  );
}
