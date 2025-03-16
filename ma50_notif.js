// ma50_notif.js - Calcul des moyennes mobiles et affichage dans le HTML + notifications

async function getHistoricalData(cryptoId, days = 200) {
    let url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    let response = await fetch(url);
    let data = await response.json();
    return data.prices.map(price => price[1]);
}

function calculateMovingAverage(data, period) {
    let ma = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = i; j > i - period; j--) {
            sum += data[j];
        }
        ma.push(sum / period);
    }
    return ma;
}

async function checkMovingAverages(cryptoId) {
    let data = await getHistoricalData(cryptoId);
    let ma50 = calculateMovingAverage(data, 50);
    let ma200 = calculateMovingAverage(data, 200); 

    if (ma50.length > 0 && ma200.length > 0) {
        let lastMA50 = ma50[ma50.length - 1].toFixed(2);
        let lastMA200 = ma200[ma200.length - 1].toFixed(2);

        // Mettre à jour le HTML
        document.getElementById("ma50").innerText = lastMA50;
        document.getElementById("ma200").innerText = lastMA200;

        let prevMA50 = ma50[ma50.length - 2];
        let prevMA200 = ma200[ma200.length - 2];

        if (prevMA50 < prevMA200 && lastMA50 > lastMA200) {
            alert("Potentiel Pump 📈");
            triggerAlert("Golden Cross détecté ! Potentiel Pump 📈", "#60d394", "./img/notif.mp3");
            sendNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
            displayAlertHistory("Golden Cross détecté ! Potentiel Pump 📈", "#60d394");
        }
        if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            alert("Risque de chute");
            triggerAlert("Death Cross détecté ! Risque de chute du marché.", "#ee6055", "./img/notif.mp3");
            sendNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
            displayAlertHistory("Death Cross détecté ! Risque de chute du marché.", "#ee6055");
        }
        else {
            triggerAlert("Zéro Notif", "Grey");
            sendNotification("Test Notif ! 📉", "La MA50.");
            displayAlertHistory("Test Notif", "grey");
        }
/*
        if (true) {
            triggerAlert("Test Notif", "#60d394", "./img/notif.mp3");
            sendNotification("Test Notif ! 📉", "La MA50.");
            displayAlertHistory("Test Notif", "grey");
        }
*/
    }
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "/img/logo.png"
        });
    }
}

function triggerAlert(message, color, soundUrl) {
    let alertBox = document.getElementById("alert-box");
    alertBox.textContent = "⚠ " + message;
    alertBox.style.background = color;
    alertBox.style.display = "block";

    // Jouer le son d'alerte
    let audio = new Audio(soundUrl);
    audio.play();

    // Ajout d'une alerte visuelle sur le logo
    let alertDot = document.createElement("div");
    alertDot.className = "logo-alert";
    document.querySelector(".logo").appendChild(alertDot);
    alertDot.style.display = "block";

    // Notification push persistante
    sendPushNotification(message);

    // Ajout d'une notification persistante sur l'icône de l'app (si supporté)
    if ('setAppBadge' in navigator) {
        console.log("🔴 Ajout du badge sur l'icône de l'App...");
        navigator.setAppBadge(1);
    } else {
        console.warn("🚫 API Badging non supportée sur ce device.");
    }
}

async function sendPushNotification(message) {
    console.log("📢 Tentative d'envoi d'une notification push...");

    try {
        const registration = await navigator.serviceWorker.ready;
        if (registration) {
            console.log("✅ Service Worker trouvé, envoi de la notification...");

            registration.showNotification("Crypto Alert 🚨", {
                body: message,
                icon: "img/logo.png",
                badge: "img/badge.png",
                requireInteraction: true,
                vibrate: [200, 100, 200],
                actions: [{ action: 'open_app', title: '📲 Ouvrir l’App' }]
            });
        } else {
            console.error("❌ Aucun Service Worker trouvé, notification annulée.");
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'envoi de la notification :", error);
    }
}

// Vérifier les moyennes mobiles toutes les 60 secondes
setInterval(() => checkMovingAverages("bitcoin"), 60000);

// Exécution au chargement
document.addEventListener("DOMContentLoaded", () => checkMovingAverages("bitcoin"));

async function requestPushPermission() {
    console.log("🔔 Tentative d'activation des notifications...");

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log("✅ Service Worker enregistré :", registration);

            const permission = await Notification.requestPermission();
            console.log("🔔 Permission des notifications :", permission);

            if (permission === 'granted') {
                alert("🔔 Notifications activées !");
                console.log("✅ Notifications activées avec succès !");
            } else {
                alert("⚠️ Vous devez autoriser les notifications.");
                console.warn("🚫 L'utilisateur a refusé les notifications.");
            }
        } catch (error) {
            console.error("❌ Erreur lors de l'enregistrement du Service Worker :", error);
        }
    } else {
        alert("🚫 Les notifications ne sont pas supportées par ce navigateur.");
        console.warn("⚠️ Notifications non supportées.");
    }
}

// Vérifie les MAs toutes les 3h = 10800000
setInterval(() => checkMovingAverages("bitcoin"), 200000);

// Lancer la détection au chargement
checkMovingAverages("bitcoin");

// Affichage de la dernière alerte en haut de l'application
function displayAlertHistory(message, color) {
    let alertHistory = document.getElementById("alert-history");
    alertHistory.innerHTML = `<p style='background:${color}; color:white; padding:10px; text-align:center; font-weight:bold; padding:10px;'>⚠ ${message}</p>`;
    alertHistory.style.display = "block";
}

// Vérifier si une alerte doit être affichée au chargement
window.onload = function () {
    let alertHistory = document.getElementById("alert-history");
    if (alertHistory.innerHTML.trim() !== "") {
        alertHistory.style.display = "block";
    }
};

// Déclencher la synchro avec SW
navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('crypto-sync')
        .then(() => console.log('Sync enregistré'))
        .catch(error => console.error('Erreur lors de l\'enregistrement du sync:', error));
});