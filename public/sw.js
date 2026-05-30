// RoadWatch service worker — lite offline (app shell + static assets).
// Dynamic road data is cached separately in IndexedDB (see lib/offlineCache.ts);
// complaints filed offline are queued there too. This SW just keeps the app
// itself openable with no network.

const CACHE = "roadwatch-shell-v1";
const SHELL = ["/", "/complaints", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never cache POST/PUT (API writes)

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // skip tiles, APIs on other hosts

  // Don't cache our own API responses — they're handled by the app's IDB layer.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first, fall back to the cached app shell.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Static assets: stale-while-revalidate.
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});
