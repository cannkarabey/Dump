"use client";

import { useAccountSync } from "@/hooks/useAccountSync";

/** Mount point for account syncing inside server-rendered layouts. */
export function AccountSync() {
  useAccountSync();
  return null;
}
