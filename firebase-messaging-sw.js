importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.10/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "****",
    authDomain: "crypto-tools-93073.firebaseapp.com",
    projectId: "crypto-tools-93073",
    storageBucket: "crypto-tools-93073.firebasestorage.app",
    messagingSenderId: "962710503785",
    appId: "1:962710503785:web:53df269d4550848c447df8",
    measurementId: "G-BT011W5TVT"
};

// Initialise Firebase
const app = firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();
const analytics = getAnalytics(app);

// Gestion des messages en arrière-plan
self.addEventListener('push', function (event) {
    const payload = event.data.json();
    const options = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        badge: 'img/badge.png',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        actions: [{ action: 'open_app', title: '📲 Ouvrir l’App' }]
    };

    event.waitUntil(
        self.registration.showNotification(payload.notification.title, options)
    );
});