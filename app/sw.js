// Kilalao service worker: cache-first, so the whole playroom works offline.
// Bump VERSION whenever any file under app/ changes; old caches are deleted.
const VERSION = 'kilalao-v1.0.1';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/main.js',
  'js/lib.js',
  'js/audio.js',
  'js/icons.js',
  'js/parent.js',
  'js/people.js',
  'js/season.js',
  'js/settings.js',
  'js/toys/busyboard.js',
  'js/toys/shapes.js',
  'js/toys/blocks.js',
  'js/toys/silly.js',
  'js/toys/marble.js',
  'js/toys/town.js',
  'js/toys/house.js',
  'js/toys/code.js',
  'js/toys/sequencer.js',
  'js/toys/radio.js',
  'js/toys/puzzle.js',
  'js/toys/islands.js',
  'js/toys/book.js',
  'js/toys/space.js',
  'js/toys/dinos.js',
  'js/toys/phonics.js',
  'js/toys/draw.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kilalao-') && k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    }),
  );
});
