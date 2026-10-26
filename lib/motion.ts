/**
 * One place to tune or switch off marketing effects. Durations are seconds (Motion's unit);
 * the matching CSS values live as custom properties in app/globals.css.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_ROLL = [0.65, 0, 0.35, 1] as const;

export const MOTION = {
  /** Hero headline: per-word 3D reveal. */
  heroWord: { duration: 0.85, stagger: 0.07, delay: 0.1 },
  /** Section entrance: fade + rise, staggered children. */
  reveal: { duration: 0.7, stagger: 0.08, distance: 24 },
  /** Mockups sharpening into focus while scrolling into view. */
  focusIn: { blur: 12, scaleFrom: 0.94 },
} as const;

export const EFFECTS = {
  /** Slow moving gradient behind the hero. */
  meshBackground: true,
  /** Light that follows the cursor on cards. */
  spotlight: true,
  /** Duplicate-label roll on hover for nav links and buttons. */
  rollText: true,
  /** Template marquee between sections. */
  marquee: true,
} as const;

/** Lenis offset for anchor jumps: the floating navbar's height plus breathing room. */
export const NAV_OFFSET = 80;
