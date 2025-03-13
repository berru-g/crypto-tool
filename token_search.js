// token_search.js - Recherche de tokens + affichage des données avancées

const searchInput = document.getElementById("tokenSearch");
const resultSection = document.getElementById("tokenResults");

async function fetchTokenData(query) {
    try {
        let response = await fetch(`https://api.coingecko.com/api/v3/coins/${query}`);
        if (!response.ok) throw new Error("Token non trouvé");
        let data = await response.json();
        displayTokenData(data);
    } catch (error) {
        resultSection.innerHTML = `<p style='color:red;'>⚠ Token introuvable</p>`;
    }
}

function displayTokenData(data) {
    const { name, symbol, market_data, market_cap_rank, platforms, categories } = data;
    const price = market_data.current_price.usd.toFixed(2);
    const athPercentage = ((price / market_data.ath.usd) * 100).toFixed(2);
    const atlPercentage = ((price / market_data.atl.usd) * 100).toFixed(2);
    const blockchains = Object.keys(platforms).join(", ") || "Non listé";
    const utility = categories.join(", ") || "Non spécifié";

    resultSection.innerHTML = `
        <h2>${name} (${symbol.toUpperCase()})</h2>
        <p>💰 Prix : $${price}</p>
        <p>📊 Rank : ${market_cap_rank}</p>
        <p>📈 % ATH : ${athPercentage}%</p>
        <p>📉 % ATL : ${atlPercentage}%</p>
        <p>🔗 Blockchain : ${blockchains}</p>
        <p>🛠 Utilité : ${utility}</p>
        <canvas id="priceChart"></canvas>
    `;
    fetchHistoricalData(data.id);
}

async function fetchHistoricalData(tokenId) {
    let response = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=30`);
    let data = await response.json();
    drawChart(data.prices);
}

function drawChart(priceData) {
    const ctx = document.getElementById("priceChart").getContext("2d");
    const labels = priceData.map(entry => new Date(entry[0]).toLocaleDateString());
    const prices = priceData.map(entry => entry[1]);

    new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Prix USD",
                data: prices,
                borderColor: "#4caf50",
                fill: false
            }]
        },
        options: { responsive: true }
    });
}
console.log("🔍 Réponse API :", data);

//searchInput.addEventListener("change", () => fetchTokenData(searchInput.value.toLowerCase()));
document.getElementById("tokenSearch").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        fetchTokenData(event.target.value.toLowerCase());
        
    }
});
document.getElementById("searchButton").addEventListener("click", () => {
    fetchTokenData(document.getElementById("tokenSearch").value.toLowerCase());
});
