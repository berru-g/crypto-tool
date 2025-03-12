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
            triggerAlert("Death Cross détecté ! Risque de chute du marché.", "red", "./img/notif.mp3");
            sendNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
        }
        if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            triggerAlert("Golden Cross détecté ! Potentiel Pump 📈", "green", "./img/notif.mp3");
            sendNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
        }
        if (true) { //teste des notifs
            triggerAlert("Ce service est indisponble pour le moment.", "grey", "./img/notif.mp3");
            sendNotification("Teste notif M.A 50/200");
        }
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
                requireInteraction: true, // La notif reste affichée jusqu’à action
                vibrate: [200, 100, 200], // Vibration pour mobile
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
