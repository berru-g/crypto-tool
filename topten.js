async function fetchCryptoData() {
    try {
        const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_asc&per_page=250&page=1&sparkline=false';
        const response = await fetch(apiUrl);
        const data = await response.json();

        const results = data.map(token => {
            const percentage = ((token.current_price - token.atl) / (token.ath - token.atl)) * 100;
            const circulatingSupplyPercentage = token.total_supply
                ? (token.circulating_supply / token.total_supply) * 100
                : null;

            return {
                name: token.name,
                symbol: token.symbol.toUpperCase(),
                percentage: percentage.toFixed(2),
                rank: token.market_cap_rank,
                marketCap: token.market_cap.toLocaleString('en-US'),
                circulatingSupplyPercentage: circulatingSupplyPercentage
                    ? circulatingSupplyPercentage.toFixed(2)
                    : 'N/A',
            };
        });

        // Trier par % croissant et prendre les 100 premiers
        const topTokens = results.sort((a, b) => a.percentage - b.percentage).slice(0, 100);

        displayResults(topTokens);
    } catch (error) {
        console.error(error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

function displayResults(tokens) {
    const table = document.getElementById('results');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear existing rows

    tokens.forEach(token => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${token.name}</td>
            <td>${token.symbol}</td>
            <td>${token.percentage} %</td>
            <td>${token.rank}</td>
            <td>$${token.marketCap}</td>
            <td>${token.circulatingSupplyPercentage} %</td>
        `;

        tbody.appendChild(row);
    });

    document.getElementById('loading').style.display = 'none';
    table.style.display = 'table';
}

// Charger les données au chargement de la page
fetchCryptoData();