const apiUrl = "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=250";

// Fonction pour calculer une moyenne mobile simple (SMA)
function calculateSMA(data, period) {
    return data.map((_, index, arr) => {
        if (index < period - 1) return null; // Pas assez de données
        const slice = arr.slice(index - period + 1, index + 1);
        return slice.reduce((sum, candle) => sum + parseFloat(candle[4]), 0) / period;
    });
}

// Fonction pour afficher une alerte dans la div
function addAlertToHistory(message) {
    const alertDiv = document.getElementById("alert-history");
    alertDiv.style.display = "block"; // Afficher la div
    const newAlert = document.createElement("p");
    newAlert.textContent = `[${new Date().toLocaleString()}] ${message}`;
    alertDiv.appendChild(newAlert);
}

// Fonction principale de détection
async function checkGoldenDeathCross() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        const sma50 = calculateSMA(data, 50);
        const sma200 = calculateSMA(data, 200);

        const lastIndex = sma200.length - 1;
        let message = "";

        if (sma50[lastIndex - 1] < sma200[lastIndex - 1] && sma50[lastIndex] > sma200[lastIndex]) {
            message = "📈 Golden Cross ! Possible hausse de Bitcoin !";
        } else if (sma50[lastIndex - 1] > sma200[lastIndex - 1] && sma50[lastIndex] < sma200[lastIndex]) {
            message = "📉 Death Cross ! Possible baisse de Bitcoin !";
        }

        if (message) {
            addAlertToHistory(message);
            sendNotification(message);
        }

    } catch (error) {
        console.error("Erreur lors de la récupération des données : ", error);
    }
}

// Fonction pour envoyer une notification via le Service Worker
function sendNotification(message) {
    if ("serviceWorker" in navigator && "Notification" in window) {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Bitcoin Alert", {
                body: message,
                icon: "/logo.png", // Remplace par l’icône de ton site
                vibrate: [200, 100, 200],
            });
        });
    }
}

// Vérifier toutes les heures
setInterval(checkGoldenDeathCross, 60 * 60 * 1000);
checkGoldenDeathCross();
