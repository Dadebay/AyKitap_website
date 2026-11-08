// Mobile-app links for subscription CTAs. Store URLs stay empty until the
// app is published — set them in .env and rebuild; nothing else changes.
export const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL ?? "";
export const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL ?? "";
// Deep-link scheme the mobile app registers (aykitap://book/<id>).
const APP_SCHEME = process.env.NEXT_PUBLIC_APP_SCHEME ?? "aykitap://";

/**
 * Tries to open the book in the mobile app; if the app doesn't take over
 * within the timeout, falls back to the platform's store page (when a store
 * URL is configured). Browser-only — call from click handlers.
 */
export function openBookInApp(bookId: number): void {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const storeUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL;

  const fallback = setTimeout(() => {
    // Still visible => the deep link did not open the app.
    if (document.visibilityState === "visible" && storeUrl) {
      window.location.href = storeUrl;
    }
  }, 1600);

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) clearTimeout(fallback);
    },
    { once: true },
  );

  // This is a mobile-app URL scheme, not a route handled by Next.js.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${APP_SCHEME}book/${bookId}`;
}
