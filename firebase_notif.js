// firbase notif push
// firebase_notif.js - Gestion des notifications Firebase (app ouverte et fermée)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

// 1️⃣ Configuration Firebase
const firebaseConfig = {
    apiKey: "****",
    authDomain: "crypto-tools-93073.firebaseapp.com",
    projectId: "crypto-tools-93073",
    storageBucket: "crypto-tools-93073.firebasestorage.app",
    messagingSenderId: "962710503785",
    appId: "1:962710503785:web:53df269d4550848c447df8",
    measurementId: "G-BT011W5TVT"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 2️⃣ Demande de permission pour les notifications
function requestPermission() {
    Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            console.log("🔔 Notifications autorisées !");
            getUserToken();
        } else {
            console.log("🚫 Notifications refusées.");
        }
    });
}

// 3️⃣ Récupérer le Token Firebase de l'utilisateur
function getUserToken() {
    getToken(messaging, { vapidKey: "BEL_UbKzujfYV0QOGTCwaoXqw1pH6tS0SvAZtjuE3ySis6LLnlipmeJeJPPoD_1nURED0W6C1U_7Q--B69l7d3g" })
        .then((currentToken) => {
            if (currentToken) {
                console.log("🔥 Token Firebase:", currentToken);
                // Ici, envoyer ce token à ton backend pour envoyer des notifications
            } else {
                console.log("❌ Aucun token disponible.");
            }
        })
        .catch((err) => {
            console.log("Erreur lors de la récupération du token", err);
        });
}

// 4️⃣ Réception des notifications si l'app est ouverte
onMessage(messaging, (payload) => {
    console.log("📩 Notification reçue :", payload);
    new Notification(payload.notification.title, {
        body: payload.notification.body,
        icon: payload.notification.icon
    });
});

// 5️⃣ Enregistrer le Service Worker Firebase
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('✅ Service Worker Firebase enregistré :', registration);
        })
        .catch((error) => {
            console.error('❌ Erreur Service Worker Firebase :', error);
        });
}

// Lancer la demande de permission au chargement
document.addEventListener("DOMContentLoaded", requestPermission);
