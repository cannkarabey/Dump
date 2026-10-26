import { cn } from "@/lib/cn";

/**
 * Glass frame for screenshots, demos and device mockups (.bezel in globals.css):
 * 10px padding, 36px radius, white-to-clear gradient, blur, 1px inner highlight, tinted shadow.
 */
export function Bezel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("bezel", className)}>{children}</div>;
}
