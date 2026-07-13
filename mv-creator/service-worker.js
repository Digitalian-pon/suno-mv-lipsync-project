const CACHE_NAME = 'mv-creator-v1';
const APP_SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/audio.js',
  './js/transcribe.js',
  './js/lyrics-sync.js',
  './js/scene-renderer.js',
  './js/recorder.js',
  './js/drive.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for same-origin app shell, cache-first fallback (offline support).
// Requests to CDNs (Google APIs / transformers.js / model weights) are left untouched
// so the browser's own HTTP cache handles them.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
