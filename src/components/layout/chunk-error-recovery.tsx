"use client";

import { useEffect } from "react";

// A JS chunk can fail to download (dropped connection, flaky network, a deploy
// that replaced the files mid-session). React then dies with ChunkLoadError and
// the tab is stuck on a blank/error screen until the user reloads by hand.
// Reload once automatically; the session guard keeps a permanently broken
// chunk from turning into a reload loop.

const GUARD_KEY = "aykitap-chunk-reload";

function isChunkError(value: unknown): boolean {
  const text =
    value instanceof Error ? `${value.name}: ${value.message}` : String(value ?? "");
  return /ChunkLoadError|Failed to load chunk|Loading chunk \S+ failed|error loading dynamically imported module/i.test(
    text,
  );
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    function recover(reason: unknown) {
      if (!isChunkError(reason)) return;
      try {
        if (sessionStorage.getItem(GUARD_KEY)) return;
        sessionStorage.setItem(GUARD_KEY, "1");
      } catch {
        // Private mode / storage disabled: reloading once is still better.
      }
      window.location.reload();
    }

    const onError = (e: ErrorEvent) => recover(e.error ?? e.message);
    const onRejection = (e: PromiseRejectionEvent) => recover(e.reason);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    // The page survived — let a later incident retry once more.
    const clearGuard = window.setTimeout(() => {
      try {
        sessionStorage.removeItem(GUARD_KEY);
      } catch {}
    }, 10_000);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.clearTimeout(clearGuard);
    };
  }, []);

  return null;
}
