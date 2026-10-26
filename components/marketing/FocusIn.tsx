"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "motion/react";
import { MOTION } from "@/lib/motion";

/**
 * Large visuals sharpen and settle as they scroll into view: blur(12px) → 0, scale 0.94 → 1,
 * finishing when the element's center reaches the viewport's center.
 */
export function FocusIn({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const blur = useTransform(scrollYProgress, [0, 1], [MOTION.focusIn.blur, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [MOTION.focusIn.scaleFrom, 1]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} className={className} style={{ filter, scale, willChange: "transform, filter" }}>
      {children}
    </motion.div>
  );
}
