const ctx = document.getElementById('cryptoChart').getContext('2d');
const narratives = {
    bitcoin: "Pow",
    solana: "Layer 1",
    near: "AI",
    aave: "DeFi",
    "reserve-rights-token": "RWA",
    helium: "DePin"
};

async function fetchCryptoData(days) {
    const apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${Object.keys(narratives).join(',')}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=${days}d`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
}

async function updateChart() {
    const days = document.getElementById('timeRange').value;
    let data = await fetchCryptoData(days);
    let datasets = data.map((coin, index) => ({
        label: narratives[coin.id] + ` (${coin.name})`,
        data: coin.sparkline_in_7d.price.map((price, i, arr) => {
            let percentageChange = ((price - arr[0]) / arr[0]) * 100;
            return { x: new Date(Date.now() - (arr.length - 1 - i) * 86400000), y: percentageChange };
        }),
        borderColor: ["#5086eb", "#fad646", "#fdd5dc", "#3ad38b", "#f56545", "#1a1a1a"][index],
        fill: false,
        tension: 0.1,
        pointRadius: 2
    }));

    chart.data = { datasets };
    chart.update();
}

const chart = new Chart(ctx, {
    type: 'line',
    data: { datasets: [] },
    options: {
        responsive: true,
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'x' },
                zoom: { enabled: true, mode: 'x' }
            }
        },
        scales: {
            x: { type: 'time', time: { unit: 'day' } },
            y: { beginAtZero: false, title: { display: true, text: 'Variation (%)' } }
        }
    }
});

document.getElementById('timeRange').addEventListener('change', updateChart);
updateChart();