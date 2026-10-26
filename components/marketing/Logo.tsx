import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg width="28" height="20" viewBox="0 0 28 20" aria-hidden className={className}>
      <rect x="1" y="5" width="18" height="14" rx="3" fill="var(--color-accent)" opacity="0.45" />
      <rect x="9" y="1" width="18" height="14" rx="3" fill="var(--color-accent)" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight">dump</span>
    </span>
  );
}
