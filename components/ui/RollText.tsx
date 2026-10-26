import { cn } from "@/lib/cn";
import { EFFECTS } from "@/lib/motion";

/**
 * Label that rolls on hover: the visible copy flips up and out while a duplicate rolls in
 * from below. Pure CSS (see .roll in globals.css); the parent needs the `roll-trigger` class.
 * The duplicate is aria-hidden so screen readers read the label once.
 */
export function RollText({ children, className }: { children: React.ReactNode; className?: string }) {
  if (!EFFECTS.rollText) return <span className={className}>{children}</span>;
  return (
    <span className={cn("roll", className)}>
      <span className="roll-a">{children}</span>
      <span className="roll-b" aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
