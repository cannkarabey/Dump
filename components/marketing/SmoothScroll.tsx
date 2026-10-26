"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MotionConfig } from "motion/react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { NAV_OFFSET } from "@/lib/motion";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/**
 * Lenis smooth scrolling + Motion's reduced-motion policy for the marketing pages.
 * With "reduce" set, Lenis never starts and Motion skips transform animations.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const content = <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  if (reduced) return content;
  return (
    // anchors: in-page #links scroll smoothly and stop below the floating navbar.
    <ReactLenis root options={{ lerp: 0.1, anchors: { offset: -NAV_OFFSET } }}>
      {content}
    </ReactLenis>
  );
}

/** Pauses smooth scrolling while an overlay (modal, menu) is open. */
export function useLenisLock(locked: boolean) {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis || !locked) return;
    lenis.stop();
    return () => lenis.start();
  }, [lenis, locked]);
}

/** Scrolls to a section below the navbar: Lenis when running, native otherwise. */
export function useScrollToSection() {
  const lenis = useLenis();
  return (id: string) => {
    const el = document.getElementById(id);
    if (!el) return false;
    if (lenis) {
      lenis.scrollTo(el, { offset: -NAV_OFFSET });
    } else {
      const reduced = window.matchMedia(query).matches;
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET, behavior: reduced ? "auto" : "smooth" });
    }
    history.replaceState(null, "", `#${id}`);
    return true;
  };
}
