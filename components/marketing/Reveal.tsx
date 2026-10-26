"use client";

import { motion, type Variants } from "motion/react";
import { EASE_OUT, MOTION } from "@/lib/motion";

const item: Variants = {
  hidden: { opacity: 0, y: MOTION.reveal.distance },
  show: { opacity: 1, y: 0, transition: { duration: MOTION.reveal.duration, ease: EASE_OUT } },
};

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: MOTION.reveal.stagger } },
};

/** Fades and rises once when 10% inside the viewport. Under reduced motion Motion skips the rise. */
export function Reveal({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "ul" }) {
  const Tag = as === "ul" ? motion.ul : motion.div;
  return (
    <Tag className={className} variants={group} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-10%" }}>
      {children}
    </Tag>
  );
}

/** A staggered child of <Reveal>. */
export function RevealItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const Tag = as === "li" ? motion.li : motion.div;
  return (
    <Tag className={className} variants={item}>
      {children}
    </Tag>
  );
}
