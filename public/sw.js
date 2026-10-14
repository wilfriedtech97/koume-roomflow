// Service worker: makes the installed app open offline (app shell cache).
const CACHE_NAME = 'koume-roomflow-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle same-origin requests; never touch backend/API traffic.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.includes('/api/') || url.pathname.includes('/functions/')) return;
  // Skip dev-module traffic so hot updates keep working in the builder preview.
  if (url.pathname.startsWith('/src/') || url.pathname.includes('node_modules') || url.pathname.startsWith('/@')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (req.mode === 'navigate') {
      try {
        const res = await fetch(req);
        await cache.put(self.location.origin + '/', res.clone());
        return res;
      } catch (e) {
        const shell = await cache.match(self.location.origin + '/');
        if (shell) return shell;
        throw e;
      }
    }
    if (url.pathname.startsWith('/assets/')) {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res.ok) await cache.put(req, res.clone());
        return res;
      } catch (e) {
        return new Response('', { status: 503 });
      }
    }
    return fetch(req);
  })());
});
