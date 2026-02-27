const CACHE_NAME = "whatodo-v2";
const STATIC_ASSETS = ["/", "/index.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Always network-first for API/AI calls
  if (url.includes("/api/") || url.includes("puter") || url.includes("fonts.googleapis")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for JS/CSS assets so new builds are always served fresh
  if (url.match(/\.(js|css)(\?.*)?$/)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for other static assets (images, fonts, etc.)
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
