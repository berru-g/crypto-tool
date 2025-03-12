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
            sendNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
        }
        if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            sendNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
        }
        if (true) { //teste des notifs
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

// Vérifier les moyennes mobiles toutes les 60 secondes
setInterval(() => checkMovingAverages("bitcoin"), 60000);

// Exécution au chargement
document.addEventListener("DOMContentLoaded", () => checkMovingAverages("bitcoin"));
