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
            triggerAlert("Golden Cross détecté ! Potentiel Pump 📈", "#3ad38b", "./img/notif.mp3");
            sendNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
            displayAlertHistory("Golden Cross détecté ! Potentiel Pump 📈", "#3ad38b");
        } else if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            alert("Risque de chute");
            triggerAlert("Death Cross détecté ! Risque de chute du marché.", "#f56545", "./img/notif.mp3");
            sendNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
            displayAlertHistory("Death Cross détecté ! Risque de chute du marché.", "#f56545");
        } else {
            triggerAlert("Zéro Notif", "#5086eb");
            sendNotification("Test Notif ! 📉", "La MA50.");
            displayAlertHistory("Test Notif", "#5086eb");
        }
    }
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "img/logo.png"
        });
    }
}

function triggerAlert(message, color, soundUrl) {
    let alertBox = document.getElementById("alert-box");
    alertBox.textContent = "⚠ " + message;
    alertBox.style.background = color;
    alertBox.style.display = "block";

    if (soundUrl) {
        let audio = new Audio(soundUrl);
        audio.play();
    }

    let alertDot = document.createElement("div");
    alertDot.className = "logo-alert";
    document.querySelector(".logo").appendChild(alertDot);
    alertDot.style.display = "block";
}

function displayAlertHistory(message, color) {
    let alertHistory = document.getElementById("alert-history");
    alertHistory.innerHTML = `<p style='background:${color}; color:white; padding:10px; text-align:center; font-weight:bold;'>⚠ ${message}</p>`;
    alertHistory.style.display = "block";
}

// Vérifier les moyennes mobiles toutes les 60 secondes
setInterval(() => checkMovingAverages("bitcoin"), 60000);

// Exécution au chargement
document.addEventListener("DOMContentLoaded", () => {
    checkMovingAverages("bitcoin");

    // Ajoute un écouteur d'événement pour le bouton de permission
    const requestPermissionBtn = document.getElementById("requestPermissionBtn");
    if (requestPermissionBtn) {
        requestPermissionBtn.addEventListener("click", requestPushPermission);
    }
});

async function requestPushPermission() {
    console.log("🔔 Tentative d'activation des notifications...");

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log("✅ Service Worker enregistré avec succès :", registration);

            const permission = await Notification.requestPermission();
            console.log("🔔 Permission des notifications :", permission);

            if (permission === 'granted') {
                console.log("✅ Notifications activées avec succès !");
                alert("🔔 Notifications activées !");
            } else {
                console.warn("🚫 L'utilisateur a refusé les notifications.");
                alert("⚠️ Vous devez autoriser les notifications.");
            }
        } catch (error) {
            console.error("❌ Erreur lors de l'enregistrement du Service Worker :", error);
            alert("❌ Erreur lors de l'activation des notifications.");
        }
    } else {
        console.warn("⚠️ Notifications non supportées par ce navigateur.");
        alert("🚫 Les notifications ne sont pas supportées par ce navigateur.");
    }
}

// Déclencher la synchro avec SW
navigator.serviceWorker.ready.then(registration => {
    registration.sync.register('crypto-sync')
        .then(() => console.log('Sync enregistré'))
        .catch(error => console.error('Erreur lors de l\'enregistrement du sync:', error));
});