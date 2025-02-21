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

// Fonction pour récupérer les données d'un token
async function fetchCryptoData(crypto) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=30`);
        if (!response.ok) throw new Error("Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez bitcoin, pour injective notez injective-protocol, pour Akash notez akash-network, pour RSR notez reserve-rights-token etc");
        const data = await response.json();
        return data.prices.map(entry => ({ x: entry[0], y: entry[1] }));
    } catch (error) {
        alert("Erreur: " + error.message);
        return null;
    }
}

// Fonction pour ajouter un token au graphique
async function addCrypto() {
    const crypto = document.getElementById("cryptoInput").value.toLowerCase().trim();
    if (!crypto || cryptoData[crypto]) return;

    const tokens = JSON.parse(localStorage.getItem('topTokens')) || [];
    const token = tokens.find(t => t.id === crypto || t.symbol === crypto);

    if (!token) {
        alert("Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez bitcoin, pour injective notez injective-protocol, pour Akash notez akash-network, pour RSR notez reserve-rights-token etc");
        return;
    }

    const data = await fetchCryptoData(token.id);
    if (data) {
        cryptoData[token.id] = data;
        updateChart();
    }
}
//alert("Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez bitcoin, pour injective notez injective-protocol, pour Akash notez akash-network, pour RSR notez reserve-rights-token etc");

// Fonction pour mettre à jour le graphique
function updateChart() {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: Object.keys(cryptoData).map((crypto, index) => ({
                label: crypto,
                data: cryptoData[crypto],
                borderColor: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'][index % 5],
                fill: false
            }))
        },
        options: {
            scales: { x: { type: 'time', time: { unit: 'month' } } },
            responsive: true
        }
    });
}

// Fonction pour effacer le graphique
function clearChart() {
    cryptoData = {};
    updateChart();
}

// Fonction pour afficher les suggestions de tokens
function showTokenSuggestions(searchTerm) {
    const suggestionsList = document.getElementById('tokenSuggestions');
    suggestionsList.innerHTML = '';

    const tokens = JSON.parse(localStorage.getItem('topTokens')) || [];
    const filteredTokens = tokens.filter(token =>
        token.name.toLowerCase().includes(searchTerm) ||
        token.symbol.includes(searchTerm)
    );

    filteredTokens.forEach(token => {
        const li = document.createElement('li');
        li.textContent = `${token.name} (${token.symbol})`;
        li.addEventListener('click', () => {
            document.getElementById('cryptoInput').value = token.id;
            suggestionsList.innerHTML = '';
        });
        suggestionsList.appendChild(li);
    });
}

// Écouter les changements dans le champ de recherche
document.getElementById('cryptoInput').addEventListener('input', (event) => {
    const searchTerm = event.target.value.toLowerCase().trim();
    if (searchTerm) {
        showTokenSuggestions(searchTerm);
    } else {
        document.getElementById('tokenSuggestions').innerHTML = '';
    }
});

// menu
const hamburgerMenu = document.querySelector('.hamburger-menu');

hamburgerMenu.addEventListener('click', () => {
  // Utilisation de SweetAlert pour afficher la fenêtre contextuelle
  Swal.fire({
    title: 'Other Tool',
    html: '<ul><p><a href="../index.html">fiboscope</a></p><p><a href="./alarm/index.html">Alarm Crypto</a></p><p><a href="./wallet/index.html">Wallet</a></p><p><a href="./superpose/index.html">Multi Chart</a></p><p><a href="https://medium.com/@gael-berru">Article</a></p><p><a href="https://berru-g.github.io/berru-g/blog/donation.html">Donation</a></p></ul>',
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      popup: 'custom-swal-popup',
      closeButton: 'custom-swal-close-button',
      content: 'custom-swal-content',
    }
  });
});