const CACHE_NAME = "whatodo-v3";

self.addEventListener("install", (event) => {
  // Do NOT pre-cache index.html — new builds change the hashed JS/CSS filenames
  // and a stale cached index.html would reference old (404) asset paths.
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Delete ALL old caches (v1, v2, etc.) so stale index.html is gone
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
  const accept = event.request.headers.get("accept") || "";

  // Always network-first for API/AI calls and fonts
  if (
    url.includes("/api/") ||
    url.includes("puter") ||
    url.includes("fonts.googleapis")
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // ALWAYS network-first for HTML — so new deployments are picked up immediately
  // and the fresh index.html (with correct hashed asset paths) is always used.
  if (accept.includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache HTML — let every load fetch the latest
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for JS/CSS — new builds change hashes, always get fresh files
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

  // Cache-first for images, fonts, and other immutable assets
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached || fetch(event.request))
  );
});
