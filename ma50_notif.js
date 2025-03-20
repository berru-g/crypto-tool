// Vérifier si les notifications sont supportées
function requestPushPermission() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        alert("Les notifications ne sont pas supportées par votre navigateur.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            navigator.serviceWorker.register("sw.js").then(registration => {
                console.log("Service Worker enregistré :", registration);
                alert("🔔 Notifications activées !");
            }).catch(error => console.error("Erreur SW :", error));
        } else {
            alert("Vous avez refusé les notifications.");
        }
    });
}

// ⚡ Fonction pour envoyer une notification quand la MA50 croise la MA200
function checkMA50MA200(croisement) {
    if (croisement) {  // Mettre ici la condition exacte du croisement MA50/MA200
        sendPushNotification("🚀 Signal MA50/MA200", "Un croisement important a été détecté !");
    }
}

// 📅 Fonction pour envoyer une notification chaque semaine avec le top narratif
function sendWeeklyNarrative(bestNarrative) {
    sendPushNotification("🔥 Meilleur Narratif de la Semaine", `Le narratif ${bestNarrative} a le plus performé cette semaine !`);
}

// Fonction générique pour envoyer une notification
function sendPushNotification(title, message) {
    navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
            body: message,
            icon: "./img/icon.png"
        });
    });
}
setTimeout(() => sendPushNotification("🎉 Test réussi", "Les notifications fonctionnent !"), 5000);
