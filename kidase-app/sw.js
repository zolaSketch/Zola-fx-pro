/* የቅዳሴ መልመጃ አፕ — Service Worker (offline support) */
const CACHE = 'kidase-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          if (res.ok) caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
