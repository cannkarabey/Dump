"use client";

import { useRef } from "react";
import { cn } from "@/lib/cn";
import { EFFECTS } from "@/lib/motion";

/**
 * Card that lifts on hover; with EFFECTS.spotlight a soft light follows the cursor.
 * The light is a CSS radial gradient driven by --mx/--my (see .spotlight in globals.css),
 * so pointer moves only set two custom properties — no React re-render.
 */
export function SpotlightCard({
  as: Tag = "div",
  className,
  children,
  tone = "light",
}: {
  as?: "div" | "li" | "article";
  className?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLElement>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !EFFECTS.spotlight || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      className={cn("lift-card", EFFECTS.spotlight && "spotlight", tone === "dark" && "spotlight-dark", className)}
    >
      {children}
    </Tag>
  );
}
