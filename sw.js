self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open('crypto-tool-cache').then(function (cache) {
      return cache.addAll([
        '/',
        '/index.html',
        '/new.css',
        '/new.js',
        '/img',
        '/alarm/',
        'chart-comparator/',
        // Ajoute ici les autres ressources à mettre en cache
      ]);
    })
  );
});
/*
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
self.addEventListener("install", (event) => {
  console.log("Service Worker installé !");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activé !");
});

self.addEventListener("fetch", (event) => {
  console.log("Intercepté :", event.request.url);
});
*/