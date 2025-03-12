
// Installation du Service Worker
self.addEventListener('install', function (event) {
  console.log("Service Worker installé !");
  event.waitUntil(
      caches.open('crypto-tool-cache').then(function (cache) {
          return cache.addAll([
              '/',
              '/index.html',
              '/new.css',
              '/new.js',
              '/img/logo.png',
              '/img/badge.png',
              '/alarm/notif.mp3',
              '/chart-comparator/chart.js',
              '/MA50.js',
          ]);
      })
  );
  self.skipWaiting(); // Force l'activation du nouveau Service Worker
});

// Activation du Service Worker
self.addEventListener('activate', function (event) {
  console.log("Service Worker activé !");
});

// Interception des requêtes réseau
self.addEventListener('fetch', function (event) {
  console.log("Intercepté :", event.request.url);
  event.respondWith(
      caches.match(event.request).then(function (response) {
          return response || fetch(event.request);
      })
  );
});

// Gestion des notifications push
self.addEventListener('push', function (event) {
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

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Ferme la notification
  event.waitUntil(
      clients.openWindow('https://crypto-free-tools.netlify.app') // Ouvre l'URL de ton app
  );
});

// Synchronisation en arrière-plan
self.addEventListener('sync', event => {
  if (event.tag === 'crypto-sync') {
      console.log("Sync event déclenché !");
      event.waitUntil(
          fetch('/api/check-cross') // Remplace par ton endpoint API
              .then(response => response.json())
              .then(data => {
                  if (data.crossDetected) {
                      self.registration.showNotification('Crypto Alert 🚨', {
                          body: 'Un croisement a été détecté !',
                          icon: 'img/logo.png',
                      });
                  }
              })
              .catch(error => {
                  console.error('Erreur lors de la synchronisation :', error);
              })
      );
  }
});