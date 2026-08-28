"use client";

import { useEffect } from "react";

// Registers the asset-retry service worker (public/sw.js). Only takes effect
// on secure origins (HTTPS / localhost) — elsewhere the browser refuses the
// registration and we silently do nothing.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Insecure origin or fetch failure — the site works without it.
    });
  }, []);

  return null;
}
