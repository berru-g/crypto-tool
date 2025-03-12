// sw push firebase
// sw.js - Service Worker pour gérer les notifications Firebase en arrière-plan

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js");

// 1️⃣ Configuration Firebase
firebase.initializeApp({
  apiKey: "AIzaSyDjuiFTrfmTaSizXrEVr4o6Ehq0_jwsc0o",
  authDomain: "crypto-tools-93073.firebaseapp.com",
  projectId: "crypto-tools-93073",
  storageBucket: "crypto-tools-93073.firebasestorage.app",
  messagingSenderId: "962710503785",
  appId: "1:962710503785:web:53df269d4550848c447df8",
  measurementId: "G-BT011W5TVT"
});

const messaging = firebase.messaging();

// 2️⃣ Gérer les notifications en arrière-plan
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Notification reçue en arrière-plan :", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: payload.notification.icon
  });
});

// 3️⃣ Gestion des clics sur la notification
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("https://crypto-free-tools.netlify.app") // Redirige vers ton site
  );
});



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
        '/chart-comparator/',
        'MA50.js',
      ]);
    })
  );
});

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

// sw.js
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

self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Ferme la notification
  event.waitUntil(
    clients.openWindow('https://crypto-free-tools.netlify.app') // Ouvre l'URL de ton app
  );
});
// tache de synchro pour notif arriere plan uniquement - utiliser un server comme FCM 
self.addEventListener('sync', event => {
  if (event.tag === 'crypto-sync') {
    event.waitUntil(
      detectCross() // Appelle ta fonction de détection de croisement
    );
  }
});
