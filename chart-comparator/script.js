////////////////// COMPARE CHART
let chart;
let cryptoData = {};

// Récupérer les 100 premiers tokens
async function fetchTopTokens() {
    const url = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false';
    const response = await fetch(url);
    const data = await response.json();

    const tokens = data.map(token => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol.toLowerCase()
    }));

    localStorage.setItem('topTokens', JSON.stringify(tokens));
}

fetchTopTokens();

// Récupérer la liste des cryptomonnaies et remplir le datalist
async function fetchAndPopulateTokenList() {
    const tokenList = document.getElementById('tokenList');
    const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
    const data = await response.json();

    // Vider la liste actuelle
    tokenList.innerHTML = '';

    // Ajouter chaque cryptomonnaie à la liste
    data.forEach(token => {
        const option = document.createElement('option');
        option.value = token.name; // Afficher le nom de la cryptomonnaie
        option.dataset.id = token.id; // Stocker l'ID pour une utilisation ultérieure
        tokenList.appendChild(option);
    });
}

// Appeler cette fonction au chargement de la page
fetchAndPopulateTokenList();

// Fonction pour récupérer les données d'un crypto
async function fetchCryptoData(crypto, days) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${days}`);
        if (!response.ok) throw new Error("Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez (bitcoin), pour injective notez (injective-protocol), pour Akash notez (akash-network), pour RSR notez (reserve-rights-token) etc.");
        const data = await response.json();
        return data.prices.map(entry => ({ x: entry[0], y: entry[1] }));
    } catch (error) {
        alert("Erreur: " + error.message + "rafraichir la page");
        return null;
    }
}

// Fonction pour ajouter un crypto au graphique
async function addCrypto() {
    const cryptoInput = document.getElementById('cryptoInput');
    const cryptoName = cryptoInput.value.trim();
    if (!cryptoName) return;

    // Trouver l'ID de la cryptomonnaie sélectionnée
    const tokenList = document.getElementById('tokenList');
    const tokenOption = Array.from(tokenList.options).find(option => option.value === cryptoName);

    if (!tokenOption) {
        alert("Cryptomonnaie non trouvée. Veuillez sélectionner une cryptomonnaie valide dans la liste.");
        return;
    }

    const cryptoId = tokenOption.dataset.id;
    if (cryptoData[cryptoId]) return; // Ne pas ajouter deux fois la même cryptomonnaie

    const period = document.getElementById('period').value;
    const data = await fetchCryptoData(cryptoId, period);

    if (data) {
        cryptoData[cryptoId] = data;
        updateChart();
    }

    // Réinitialiser la barre de recherche
    cryptoInput.value = '';
}

// Fonction pour mettre à jour le graphique
function updateChart() {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: Object.keys(cryptoData).map((crypto, index) => [
                {
                    label: crypto,
                    data: cryptoData[crypto],
                    borderColor: ['#5086eb', '#fad646', '#fdd5dc', '#f4a261', '#f56545'][index % 5],
                    fill: false,
                },
                {
                    label: `${crypto} (SMA 7)`,
                    data: calculateSMA(cryptoData[crypto], 7),
                    borderColor: ['#5086eb', '#fad646', '#fdd5dc', '#f4a261', '#f56545'][index % 5],
                    borderDash: [5, 5],
                    fill: false,
                    responsive: true,
                    maintainAspectRatio: false,
                }
            ]).flat(),
        },
        options: {
            interaction: {
                mode: 'nearest',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true,
                        },
                        mode: 'xy',
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                },
            },
            scales: { x: { type: 'time', time: { unit: 'day' } } },
            responsive: true,
            maintainAspectRatio: false,
        },
    });
    // Forcer la redimension
    setTimeout(() => chart.resize(), 0);
}

// Fonction pour effacer le graphique
function clearChart() {
    cryptoData = {};
    updateChart();
}

// Fonction pour calculer la moyenne mobile (SMA)
function calculateSMA(data, period) {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, point) => acc + point.y, 0);
        sma.push({ x: data[i].x, y: sum / period });
    }
    return sma;
}

// Ajuster la hauteur du graphique dynamiquement
function adjustChartHeight() {
    const chartContainer = document.querySelector('#chart-container');
    const width = chartContainer.clientWidth;
    chartContainer.style.height = `${width * 0.6}px`; // Ajuster la hauteur en fonction de la largeur

    // Redimensionner le graphique si il existe
    if (chart) {
        chart.resize();
    }
}

// Appliquer l'ajustement au chargement et au redimensionnement
window.addEventListener('load', adjustChartHeight);
window.addEventListener('resize', adjustChartHeight);

// Fonction pour exporter les données en CSV
function exportData() {
    const csvContent = Object.keys(cryptoData).map(crypto => {
        const header = `Date,${crypto}\n`;
        const rows = cryptoData[crypto].map(point => `${new Date(point.x).toLocaleDateString()},${point.y}`).join('\n');
        return header + rows;
    }).join('\n\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crypto_data.csv';
    a.click();
    URL.revokeObjectURL(url);
}