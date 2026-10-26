"use client";

import { useEffect, useState } from "react";

/**
 * Id of the section currently crossing the middle band of the viewport, or null above the
 * first one. Uses IntersectionObserver, so it costs nothing per scroll frame.
 */
export function useScrollSpy(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // The last section (in page order) touching the band wins: tall sticky sections overlap.
        const current = [...ids].reverse().find((id) => visible.has(id)) ?? null;
        setActive(current);
      },
      // A thin band just below the navbar decides which section is "current".
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);

  return active;
}
