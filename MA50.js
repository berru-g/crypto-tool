async function getHistoricalData(cryptoId, days = 200) {
    let url = `https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=usd&days=${days}&interval=daily`;
    let response = await fetch(url);
    let data = await response.json();
    return data.prices.map(price => price[1]); // Retourne uniquement les prix
}

function calculateMovingAverage(data, period) {
    let ma = [];
    for (let i = period - 1; i < data.length; i++) {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
            sum += data[j];
        }
        ma.push(sum / period);
    }
    return ma;
}

async function detectCross() {
    const cryptoId = "bitcoin"; // Change pour un autre token si besoin
    let prices = await getHistoricalData(cryptoId, 200);

    let ma50 = calculateMovingAverage(prices, 50);
    let ma200 = calculateMovingAverage(prices, 200);

    document.getElementById("ma50").textContent = ma50[ma50.length - 1].toFixed(2) + " $";
    document.getElementById("ma200").textContent = ma200[ma200.length - 1].toFixed(2) + " $";

    let lastMA50 = ma50[ma50.length - 1];
    let lastMA200 = ma200[ma200.length - 1];
    let prevMA50 = ma50[ma50.length - 2];
    let prevMA200 = ma200[ma200.length - 2];

    if (lastMA50 < lastMA200 && prevMA50 > prevMA200) {
        triggerAlert("Death Cross détecté ! Risque de chute du marché.", "red", "https://www.myinstants.com/media/sounds/tactical-nuke.mp3");
    } else if (lastMA50 > lastMA200 && prevMA50 < prevMA200) {
        triggerAlert("Golden Cross détecté ! Potentiel Pump 📈", "green", "https://www.myinstants.com/media/sounds/coin-drop.mp3");
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
        navigator.setAppBadge(1);
    }
}

async function sendPushNotification(message) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
        registration.showNotification("Crypto Alert 🚨", {
            body: message,
            icon: "img/logo.png",
            badge: "img/badge.png"
        });
    }
}

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

// Vérifie les MAs toutes les 5 minutes
setInterval(detectCross, 300000);

// Lancer la détection au chargement
detectCross();


/*
    if ('setAppBadge' in navigator) {
        navigator.setAppBadge(1); // Affiche un badge rouge sur l’icône PWA installée
    }
    
    
    if (true) {  // Forcer l'alerte pour tester
        triggerAlert("Test Notification - Golden Cross Détecté ! 📈", "green", "https://www.myinstants.com/media/sounds/coin-drop.mp3");
    }*/
