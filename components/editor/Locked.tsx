"use client";

import { Crown } from "@/components/ui/Crown";
import { useCan } from "@/lib/store/tier";
import { useUi } from "@/lib/store/ui";
import type { Feature } from "@/lib/tiers";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/app";

/**
 * Gates a control behind a tier feature. When not allowed, the children are inert and
 * a click anywhere on them opens the paywall instead.
 */
export function Locked({
  feature,
  children,
  className,
  showCrown = true,
}: {
  feature: Feature;
  children: React.ReactNode;
  className?: string;
  showCrown?: boolean;
}) {
  const allowed = useCan(feature);
  const { t } = useT();
  if (allowed) return <>{children}</>;
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t.common.premiumLocked}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        useUi.getState().openPaywall(feature);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") useUi.getState().openPaywall(feature);
      }}
      className={cn("relative cursor-pointer", className)}
    >
      <div className="pointer-events-none opacity-60" inert>
        {children}
      </div>
      {showCrown && (
        <span className="absolute top-1/2 right-2 -translate-y-1/2">
          <Crown size={14} />
        </span>
      )}
    </div>
  );
}
