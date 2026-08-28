// Retries + caches static asset fetches. The network path to this server
// randomly resets connections mid-transfer (DPI); each retry is a fresh
// connection with an independent chance of surviving, and a cached chunk is
// never fetched again at all.
const STATIC_CACHE = "static-v1";
const RETRIES = 3;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== STATIC_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

// Fetch with the whole body buffered inside the try block, so a connection
// reset mid-body is caught here and retried — not surfaced to the page.
async function fetchBuffered(request, attempts) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(request, { cache: "no-store" });
      if (!response.ok) return response;
      const body = await response.arrayBuffer();
      return new Response(body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (err) {
      lastError = err;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw lastError;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Content-hashed, immutable: cache-first, retried fetch on miss.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetchBuffered(request, RETRIES + 1);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      })(),
    );
    return;
  }

  // Optimized images: retried fetch, browser HTTP cache handles storage.
  if (url.pathname.startsWith("/_next/image")) {
    event.respondWith(fetchBuffered(request, RETRIES + 1));
  }
});
