async function fetchMomentumFromBinance() {
    try {
        let response = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1h&limit=50");
        let data = await response.json();

        let closePrices = data.map(candle => parseFloat(candle[4])); // Prix de clôture

        // Calcul du momentum simple : Différence entre la dernière clôture et celle d'il y a 5 heures
        let momentum = closePrices[closePrices.length - 1] - closePrices[closePrices.length - 5];

        updateMomentumIndicator(momentum);
    } catch (error) {
        console.error("Erreur lors de la récupération des données de Binance", error);
    }
}

function updateMomentumIndicator(momentum) {
    let indicator = document.getElementById("momentum-indicator");

    if (momentum > 50) {
        indicator.style.backgroundColor = "#2a9d8f"; // Momentum fort, bullish
        alert("🟢 Momentum fort, bullish");
    } else if (momentum > 10) {
        indicator.style.backgroundColor = "#f4a261"; // Momentum en ralentissement
        alert("🟠 Momentum en ralentissement");
    } else {
        indicator.style.backgroundColor = "#e76f51"; // Risque de retournement baissier
        alert("🔴 Risque de retournement baissier");
    }

    // Stocker l'état dans localStorage pour garder la couleur entre les pages
    localStorage.setItem("momentumColor", indicator.style.backgroundColor);
}

// Charger la couleur stockée au chargement de chaque page
document.addEventListener("DOMContentLoaded", () => {
    let savedColor = localStorage.getItem("momentumColor") || "gray";
    document.getElementById("momentum-indicator").style.backgroundColor = savedColor;
});

// Mettre à jour le momentum toutes les 200 secondes
setInterval(fetchMomentumFromBinance, 200000);
