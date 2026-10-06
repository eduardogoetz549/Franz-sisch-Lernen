'use strict';
// Increase this version when changing the offline behavior.
const CACHE_PREFIX = 'fr-learning:' + self.registration.scope + ':';
const CACHE_NAME = CACHE_PREFIX + 'v3-analysis';
const START_URL = new URL('./main.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Optional resources must not prevent installation if an icon is missing.
    await Promise.allSettled(
      ['./main.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './learning-core.js']
        .map(path => cache.add(new URL(path, self.registration.scope).href))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  if (/franzoesisch-(?:.*-[23]-oberstufe(?:-mit-gemischten-schreibuebungen)?|pruefung-[123]-oberstufe|15-minuten-lerneinheit(?:-aktiv)?)\.html$/.test(url.pathname)) {
    event.respondWith(fetch(request, {cache:'no-store'}).catch(()=>new Response('Für diese Übung brauchst du eine Internetverbindung.',{status:503})));return;
  }
  // Cache public pages/assets only; never cache API responses or account data.
  const cacheable = request.mode === 'navigate' ||
    ['script', 'style', 'image', 'font', 'manifest'].includes(request.destination);
  if (!cacheable) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // Prefer the current online version so published changes remain visible.
      const response = await fetch(request);
      if (response.ok && response.type === 'basic' && !response.redirected) {
        try { await cache.put(request, response.clone()); } catch (_) {}
      }
      return response;
    } catch (_) {
      const saved = await cache.match(request);
      if (saved) return saved;
      if (request.mode === 'navigate') {
        const home = await cache.match(START_URL);
        if (home) return home;
        return new Response('Du bist offline. Öffne die Lernplattform einmal mit Internetverbindung.', {
          status: 503, headers: {'Content-Type': 'text/plain; charset=utf-8'}
        });
      }
      return Response.error();
    }
  })());
});
