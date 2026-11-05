// Uloží hru do tabletu, aby běžela bez internetu.
// S internetem bere nejnovější soubory, bez něj uloženou kopii.
const VERSION = 'rosinka-8';
const FILES = [
  '.', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-512.png', 'css/style.css',
  'js/main.js', 'js/world.js', 'js/art.js', 'js/biomes.js', 'js/recorder.js', 'js/character.js', 'js/creator.js', 'js/questions.js',
  'js/voice.js', 'js/parent.js', 'js/storage.js', 'js/zip.js', 'js/shop.js', 'js/shopview.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(fetch(e.request, { cache: 'no-cache' })
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy));
      }
      return res;
    })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
