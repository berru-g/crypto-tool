async function getHistoricalData(cryptoId, days = 200) {
    let url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    let response = await fetch(url);
    let data = await response.json();
    return data.prices.map(price => price[1]);
}

function calculateMovingAverage(data, period) {
    let ma = new Array(period - 1).fill(null); // Ajout de valeurs nulles au début pour l'alignement
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
        let lastMA50 = ma50[ma50.length - 1]?.toFixed(2);
        let lastMA200 = ma200[ma200.length - 1]?.toFixed(2);

        let prevMA50 = ma50[ma50.length - 2];
        let prevMA200 = ma200[ma200.length - 2];

        // Vérification et mise à jour du HTML
        let ma50Elem = document.getElementById("ma50");
        let ma200Elem = document.getElementById("ma200");
        if (ma50Elem) ma50Elem.innerText = lastMA50;
        if (ma200Elem) ma200Elem.innerText = lastMA200;

        if (prevMA50 < prevMA200 && lastMA50 > lastMA200) {
            triggerAlert("Golden Cross détecté ! Potentiel Pump 📈", "#3ad38b", "./img/notif.mp3");
            sendNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
            displayAlertHistory("Golden Cross détecté ! Potentiel Pump 📈", "#3ad38b");
        } else if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            triggerAlert("Death Cross détecté ! Risque de chute du marché.", "#f56545", "./img/notif.mp3");
            sendNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
            displayAlertHistory("Death Cross détecté ! Risque de chute du marché.", "#f56545");
        }
        /*if (true) {
            triggerAlert("R.A.S", "#5086eb", "./img/notif.mp3");
            sendNotification("R.A.S");
            displayAlertHistory("R.A.S", "#5086eb");
        }*/
    }
}

function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, {
            body: message,
            icon: "img/logo.png"
        });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, {
                    body: message,
                    icon: "img/logo.png"
                });
            }
        });
    }
}

function triggerAlert(message, color, soundUrl) {
    let alertBox = document.getElementById("alert-box");
    if (alertBox) {
        alertBox.textContent = "ℹ️ " + message;
        alertBox.style.background = color;
        alertBox.style.display = "block";
    }

    if (soundUrl) {
        let audio = new Audio(soundUrl);
        audio.play();
    }

    let alertDot = document.createElement("div");
    alertDot.className = "logo-alert";
    let logoElem = document.querySelector(".logo");
    if (logoElem) {
        logoElem.appendChild(alertDot);
        alertDot.style.display = "block";
    }
}

function displayAlertHistory(message, color) {
    let alertHistory = document.getElementById("alert-history");
    if (alertHistory) {
        alertHistory.style.display = "block";
        alertHistory.innerHTML += `<p style='background:${color}; color:white; padding:10px; text-align:center; font-weight:bold;'>⚠ ${message}</p>`;
    }
}

// Vérifier les moyennes mobiles toutes les 900 secondes
setInterval(() => checkMovingAverages("bitcoin"), 900000);

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

// Supprimé : navigator.serviceWorker.ready.then(registration => {...});
