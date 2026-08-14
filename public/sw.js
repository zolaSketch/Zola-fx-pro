/**
 * J.A.R.V.I.S. service worker.
 *
 * Makes the HUD installable and genuinely usable offline. The offline
 * knowledge core, arithmetic, memory and voice all run on-device, so once the
 * shell is cached JARVIS keeps working with no connection at all.
 *
 * Strategy:
 *   - navigations : network-first, falling back to the cached shell
 *   - static build assets : cache-first (immutable, content-hashed)
 *   - /api/*      : never cached; must always hit the server
 */

const VERSION = "jarvis-v1";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;

const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      // Individual failures must not abort the whole install.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API responses are live state — never serve them from cache.
  if (url.pathname.startsWith("/api/")) return;

  // App shell: try the network, fall back to cache when offline.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL);
          cache.put("/", fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match("/", { ignoreSearch: true });
          return cached ?? Response.error();
        }
      })(),
    );
    return;
  }

  // Build output and icons are content-hashed, so cache-first is safe.
  if (
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:png|svg|ico|woff2?|webmanifest)$/.test(url.pathname)
  ) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(ASSETS);
            cache.put(request, fresh.clone());
          }
          return fresh;
        } catch {
          return cached ?? Response.error();
        }
      })(),
    );
  }
});
