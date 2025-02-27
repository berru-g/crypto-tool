let chart;

async function loadChart() {
    const crypto = document.getElementById('cryptoInput').value.trim().toLowerCase();
    const period = document.getElementById('periodInput').value;

    if (!crypto) return alert('Veuillez entrer une crypto-monnaie.');

    const historicalData = await fetchHistoricalData(crypto, period);
    const prices = historicalData.map(entry => entry.price);
    const dates = historicalData.map(entry => entry.date);

    // Calculer les indicateurs techniques
    const rsi = calculateRSI(prices, 14); // RSI sur 14 périodes
    const bollingerBands = calculateBollingerBands(prices, 20); // Bollinger Bands sur 20 périodes

    // Afficher le graphique
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Prix',
                    data: prices,
                    borderColor: '#007bff',
                    fill: false,
                    yAxisID: 'price-axis', // Associer à l'axe des prix
                },
                {
                    label: 'RSI',
                    data: rsi,
                    borderColor: '#ff6384',
                    fill: false,
                    yAxisID: 'rsi-axis', // Associer à l'axe du RSI
                },
                {
                    label: 'Bollinger Bands (Upper)',
                    data: bollingerBands.upper,
                    borderColor: '#f4a261',
                    fill: false,
                    yAxisID: 'price-axis', // Associer à l'axe des prix
                },
                {
                    label: 'Bollinger Bands (Lower)',
                    data: bollingerBands.lower,
                    borderColor: '#e76f51',
                    fill: false,
                    yAxisID: 'price-axis', // Associer à l'axe des prix
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { type: 'time', time: { unit: 'day' } },
                'price-axis': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                },
                'rsi-axis': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: { drawOnChartArea: false }, // Ne pas afficher la grille pour le RSI
                }
            }
        }
    });
}

async function fetchHistoricalData(crypto, days) {
    const url = `https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${days}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.prices.map(entry => ({ date: new Date(entry[0]), price: entry[1] }));
}

function calculateRSI(prices, period) {
    const rsi = [];
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;

        if (i >= period) {
            const avgGain = gains / period;
            const avgLoss = losses / period;
            const rs = avgGain / avgLoss;
            rsi.push(100 - (100 / (1 + rs)));

            // Réinitialiser pour la prochaine période
            gains = 0;
            losses = 0;
        }
    }

    return rsi;
}

function calculateBollingerBands(prices, period) {
    const bb = { upper: [], lower: [] };

    for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = slice.reduce((sum, price) => sum + price, 0) / period;
        const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);

        bb.upper.push(mean + 2 * stdDev);
        bb.lower.push(mean - 2 * stdDev);
    }

    return bb;
}