self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('crypto-tool-cache').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/new.css',
          '/new.js',
          '/img',
          // Ajoute ici les autres ressources à mettre en cache
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
  