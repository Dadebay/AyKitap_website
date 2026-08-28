"use client";

import { useSyncExternalStore } from "react";

// True only after client hydration — used to avoid SSR/client mismatches
// for UI that depends on persisted (localStorage) stores.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
