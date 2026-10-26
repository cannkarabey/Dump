"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Crown } from "@/components/ui/Crown";
import { useUi } from "@/lib/store/ui";
import { useMockTiers, useTier } from "@/lib/store/tier";
import { Segmented } from "@/components/ui/Segmented";
import { checkoutUrl, type Period } from "@/lib/billing";
import { signInWithGoogle } from "@/lib/supabase/client";
import { TIER_LABELS, TIER_PRICES, tierFeatures } from "@/lib/tiers";
import type { Tier } from "@/lib/types";
import { cn } from "@/lib/cn";
import { format, useT } from "@/lib/i18n/app";

export function PaywallModal() {
  const { open, feature } = useUi((s) => s.modals.paywall);
  const current = useTier((s) => s.tier);
  const account = useTier((s) => s.account);
  const mock = useMockTiers();
  const [period, setPeriod] = useState<Period>("monthly");
  const { lang, t } = useT();
  const p = t.paywall;
  const close = () => useUi.getState().closePaywall();

  const canCheckout = Boolean(account?.billingEnabled);
  const needsSignIn = canCheckout && account?.authEnabled && !account.user;

  const choose = (tier: Tier) => {
    if (mock) {
      // Local development without accounts: switch the mock tier instantly.
      useTier.getState().setTier(tier);
      close();
      return;
    }
    if (tier === "free") return;
    if (needsSignIn) {
      void signInWithGoogle(window.location.pathname);
      return;
    }
    const url = account?.user ? checkoutUrl(tier, period, account.user) : null;
    // Full-page navigation to the hosted checkout; account sync picks up the new plan on return.
    if (url) window.location.assign(url);
  };

  const label = (tier: Tier) => {
    if (tier === current) return p.current;
    if (tier === "free") return mock ? p.toFree : p.viaPortal;
    if (!mock && !canCheckout) return p.soon;
    if (needsSignIn) return p.signInContinue;
    return format(p.switchTo, { tier: TIER_LABELS[tier] });
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && close()}
      title={feature ? format(p.title, { reason: p.reasons[feature] }) : p.plans}
      description={p.description}
    >
      <div className="mb-4 flex justify-center">
        <Segmented
          aria-label={p.period}
          value={period}
          onChange={setPeriod}
          options={[
            { value: "monthly", label: p.monthly },
            { value: "yearly", label: p.yearly },
          ]}
        />
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {(["free", "creator", "studio"] as Tier[]).map((tier) => {
          const highlight = tier === "creator";
          const price = period === "yearly" ? TIER_PRICES[tier].yearly / 12 : TIER_PRICES[tier].monthly;
          const disabled = tier === current || (!mock && (tier === "free" || !canCheckout));
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
                    <span className="ml-auto rounded-full bg-accent px-2 py-0.5 text-[11px] text-white">{p.popular}</span>
                  )}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
                  ${Number.isInteger(price) ? price : price.toFixed(2)}
                  <span className="text-sm font-normal text-muted">{p.perMonth}</span>
                </p>
                {period === "yearly" && tier !== "free" && (
                  <p className="text-xs text-muted">{format(p.billedYearly, { n: TIER_PRICES[tier].yearly })}</p>
                )}
              </div>
              <ul className="flex flex-1 flex-col gap-2 text-sm">
                {tierFeatures(tier, lang).map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={highlight ? "accent" : "secondary"} disabled={disabled} onClick={() => choose(tier)}>
                {label(tier)}
              </Button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-center text-xs text-muted">
        {mock ? p.devNote : canCheckout ? p.checkoutNote : p.soonNote}
      </p>
    </Modal>
  );
}
