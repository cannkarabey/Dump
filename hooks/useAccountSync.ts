"use client";

import { useEffect } from "react";
import { useTier } from "@/lib/store/tier";

/**
 * Loads the persisted mock tier, then the real account; refreshes when the tab regains focus
 * (e.g. after finishing checkout in another tab or returning from the customer portal).
 */
export function useAccountSync() {
  useEffect(() => {
    void useTier.persist.rehydrate();
    void useTier.getState().refreshAccount();
    const onFocus = () => void useTier.getState().refreshAccount();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
}
