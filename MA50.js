// MA50.js - Calcul de la moyenne mobile et notifications via Firebase

import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js";

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

async function checkGoldenCross(cryptoId) {
    let data = await getHistoricalData(cryptoId);
    let ma50 = calculateMovingAverage(data, 50);
    let ma200 = calculateMovingAverage(data, 200);

    if (ma50.length > 0 && ma200.length > 0) {
        let lastMA50 = ma50[ma50.length - 1];
        let lastMA200 = ma200[ma200.length - 1];
        let prevMA50 = ma50[ma50.length - 2];
        let prevMA200 = ma200[ma200.length - 2];

        if (prevMA50 < prevMA200 && lastMA50 > lastMA200) {
            sendFirebaseNotification("Golden Cross détecté ! 📈", "La MA50 est passée au-dessus de la MA200.");
        }
        if (prevMA50 > prevMA200 && lastMA50 < lastMA200) {
            sendFirebaseNotification("Death Cross détecté ! 📉", "La MA50 est passée en dessous de la MA200.");
        }
    }
}

function sendFirebaseNotification(title, message) {
    getToken(getMessaging(), { vapidKey: "BEL_UbKzujfYV0QOGTCwaoXqw1pH6tS0SvAZtjuE3ySis6LLnlipmeJeJPPoD_1nURED0W6C1U_7Q--B69l7d3g" }).then((currentToken) => {
        if (currentToken) {
            fetch("https://fcm.googleapis.com/fcm/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "key=AIzaSyDjuiFTrfmTaSizXrEVr4o6Ehq0_jwsc0o"
                },
                body: JSON.stringify({
                    to: currentToken,
                    notification: {
                        title: title,
                        body: message,
                        icon: "/img/logo.png"
                    }
                })
            }).then(response => console.log("Notif envoyée !", response))
              .catch(error => console.error("Erreur envoi notif", error));
        }
    });
}

checkGoldenCross("bitcoin");
