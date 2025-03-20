async function fetchCryptoData() {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
    const data = await response.json();
    return data;
}

async function checkMovingAverages() {
    let data = await fetchCryptoData();

    let ma50 = {}; // Stocker les MA50 par token
    let ma200 = {}; // Stocker les MA200 par token

    data.forEach(coin => {
        ma50[coin.id] = coin.sparkline_in_7d.price.slice(-50).reduce((a, b) => a + b) / 50;
        ma200[coin.id] = coin.sparkline_in_7d.price.slice(-200).reduce((a, b) => a + b) / 200;
    });

    Object.keys(ma50).forEach(token => {
        if (ma50[token] > ma200[token]) {
            sendNotification(`ALERTE : ${token.toUpperCase()} vient de croiser la MA200 !`);
        }
    });
}

async function checkBestNarrative() {
    let data = await fetchCryptoData();

    let bestNarrative = data.reduce((best, coin) => {
        let performance = (coin.current_price - coin.sparkline_in_7d.price[0]) / coin.sparkline_in_7d.price[0] * 100;
        return performance > best.performance ? { name: coin.id, performance } : best;
    }, { name: "", performance: -Infinity });

    sendNotification(`🚀 ${bestNarrative.name.toUpperCase()} est le meilleur narratif cette semaine (+${bestNarrative.performance.toFixed(2)}%)`);
}

function sendNotification(message) {
    if ("serviceWorker" in navigator && "PushManager" in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(message);
        });
    }
}

// Vérification toutes les 5 minutes
setInterval(checkMovingAverages, 300000);
// Notification du meilleur narratif chaque semaine
setInterval(checkBestNarrative, 7 * 24 * 60 * 60 * 1000);
