// Service worker Calopro : livret et notices consultables hors ligne après une première ouverture.
// Réseau d'abord, cache en secours. Les formulaires ne sont pas synchronisés hors ligne.
const CACHE = "calopro-v1";
const OFFLINE_PATHS = [/^\/q\//, /^\/livret\//, /^\/sejour\/[^/]+(\/livret)?$/, /^\/_next\/static\//];

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (!OFFLINE_PATHS.some((re) => re.test(url.pathname))) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || Response.error())),
  );
});
