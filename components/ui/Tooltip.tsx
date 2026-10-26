"use client";

import * as RTooltip from "@radix-ui/react-tooltip";

export const TooltipProvider = RTooltip.Provider;

export function Tooltip({
  content,
  side = "bottom",
  children,
}: {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}) {
  return (
    <RTooltip.Root delayDuration={300}>
      <RTooltip.Trigger asChild>{children}</RTooltip.Trigger>
      <RTooltip.Portal>
        <RTooltip.Content
          side={side}
          sideOffset={6}
          className="z-50 rounded-lg bg-[#2c2c2e] px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {content}
        </RTooltip.Content>
      </RTooltip.Portal>
    </RTooltip.Root>
  );
}
