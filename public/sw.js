/**
 * Kopala Kits — Service Worker
 * Cache-first for static assets, stale-while-revalidate for API data
 */

const CACHE_NAME = "kopala-kits-v1";
const STATIC_ASSETS = [
  "/",
  "/favicon.svg",
  "/index.html",
  "/og-image.jpg",
  "/manifest.json",
  "/icons.svg",
  "/whatsapp-icon.svg",
  "/products.json",
  "/robots.txt",
];

const API_CACHE_NAME = "kopala-api-v1";
const API_ROUTES = ["/api/products", "/api/banner", "/api/config"];

// ─── Install ──────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // API routes — stale-while-revalidate
  if (API_ROUTES.includes(url.pathname)) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Image assets — cache-first with 30-day expiration
  if (request.destination === "image" && url.pathname.startsWith("/jerseys/")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          // Check age
          const dateHeader = cached.headers.get("x-cache-date");
          if (dateHeader) {
            const age = Date.now() - parseInt(dateHeader, 10);
            if (age < 30 * 24 * 60 * 60 * 1000) return cached;
          }
        }
        try {
          const response = await fetch(request);
          const headers = new Headers(response.headers);
          headers.set("x-cache-date", String(Date.now()));
          const clone = new Response(response.body, { status: response.status, statusText: response.statusText, headers });
          cache.put(request, clone.clone());
          return clone;
        } catch {
          return cached || new Response("", { status: 404 });
        }
      })
    );
    return;
  }

  // Everything else — cache-first, network fallback
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).catch(() => {
        if (request.mode === "navigate") {
          return caches.match("/index.html");
        }
        return new Response("Offline", { status: 503 });
      });
    })
  );
});

// ─── Background Sync ────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "kopala-refresh") {
    event.waitUntil(refreshApiData());
  }
});

async function refreshApiData() {
  const cache = await caches.open(API_CACHE_NAME);
  for (const route of API_ROUTES) {
    try {
      const res = await fetch(route);
      if (res.ok) cache.put(route, res.clone());
    } catch (e) {
      // ignore offline
    }
  }
}

// ─── Push Notifications (placeholder) ───────────────────────────────────
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Kopala Kits", {
      body: data.body || "New jerseys just dropped!",
      icon: "/favicon.svg",
      badge: "/favicon.svg",
      tag: data.tag || "kopala-notification",
      data: data.url || "/",
      requireInteraction: false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.openWindow(event.notification.data || "/")
  );
});
