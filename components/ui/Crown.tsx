import { Crown as CrownIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/** Small premium marker shown next to locked features. */
export function Crown({ className, size = 12 }: { className?: string; size?: number }) {
  return (
    <CrownIcon
      aria-label="Premium"
      size={size}
      strokeWidth={2.5}
      className={cn("shrink-0 fill-premium text-premium", className)}
    />
  );
}
