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
// sw.js
self.addEventListener('push', function(event) {
  const options = {
    body: event.data.text(), // Le message de la notification
    icon: 'img/logo.png', // Chemin vers le logo de ton app
    badge: 'img/badge.png', // Petit icône pour la notification
    vibrate: [200, 100, 200], // Vibration pour mobile
    requireInteraction: true, // La notification reste affichée jusqu'à action
    actions: [{ action: 'open_app', title: '📲 Ouvrir l’App' }]
  };

  event.waitUntil(
    self.registration.showNotification('Crypto Alert 🚨', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); // Ferme la notification
  event.waitUntil(
    clients.openWindow('https://crypto-free-tools.netlify.app') // Ouvre l'URL de ton app
  );
});
