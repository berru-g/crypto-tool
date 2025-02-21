let chart;
        let cryptoData = {};
        let priceAlert = null;

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

        // Fonction pour récupérer les données d'un crypto
        async function fetchCryptoData(crypto, days) {
            try {
                const response = await fetch(`https://api.coingecko.com/api/v3/coins/${crypto}/market_chart?vs_currency=usd&days=${days}`);
                if (!response.ok) throw new Error("Erreur lors de la récupération des données.");
                const data = await response.json();
                return data.prices.map(entry => ({ x: entry[0], y: entry[1] }));
            } catch (error) {
                alert("Erreur: " + error.message);
                return null;
            }
        }
     

        // Fonction pour ajouter un crypto au graphique
        async function addCrypto() {
            const crypto = document.getElementById("cryptoInput").value.toLowerCase().trim();
            if (!crypto || cryptoData[crypto]) return;

            const tokens = JSON.parse(localStorage.getItem('topTokens')) || [];
            const token = tokens.find(t => t.id === crypto || t.symbol === crypto);

            if (!token) {
                alert("Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez bitcoin, pour injective notez injective-protocol, pour Akash notez akash-network, pour RSR notez reserve-rights-token etc");
                return;
            }

            const period = document.getElementById("period").value;
            const data = await fetchCryptoData(token.id, period);
            if (data) {
                cryptoData[token.id] = data;
                updateChart();
            }
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
                            borderColor: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'][index % 5],
                            fill: false,
                        },
                        {
                            label: `${crypto} (SMA 7)`,
                            data: calculateSMA(cryptoData[crypto], 7),
                            borderColor: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'][index % 5],
                            borderDash: [5, 5],
                            fill: false,
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
                },
            });
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

        // Fonction pour basculer entre dark mode et light mode
        function toggleTheme() {
            const body = document.body;
            body.classList.toggle('dark-mode');
            chart.update();
        }

        // Fonction pour définir une alerte de prix
        function setPriceAlert() {
            const price = parseFloat(document.getElementById('priceAlert').value);
            if (isNaN(price)) return;
            priceAlert = price;
            checkPriceAlert();
        }

        // Fonction pour vérifier l'alerte de prix
        function checkPriceAlert() {
            if (!priceAlert) return;
            const currentPrice = cryptoData[Object.keys(cryptoData)[0]]?.slice(-1)[0]?.y;
            if (currentPrice >= priceAlert) {
                alert(`Alerte : Le prix a atteint ${priceAlert} USD !`);
                priceAlert = null;
            }
        }

        // Vérifier l'alerte de prix toutes les 10 secondes
        setInterval(checkPriceAlert, 10000);

        // menu
const hamburgerMenu = document.querySelector('.hamburger-menu');

hamburgerMenu.addEventListener('click', () => {
  // Utilisation de SweetAlert pour afficher la fenêtre contextuelle
  Swal.fire({
    title: 'Other Tool',
    html: '<ul><p><a href="../index.html">fiboscope</a></p><p><a href="../alarm/index.html">Alarm Crypto</a></p><p><a href="../wallet/index.html">Wallet</a></p><p><a href="../superpose/index.html">Multi Chart</a></p><p><a href="https://medium.com/@gael-berru">Article</a></p><p><a href="https://berru-g.github.io/berru-g/blog/donation.html">Donation</a></p></ul>',
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      popup: 'custom-swal-popup',
      closeButton: 'custom-swal-close-button',
      content: 'custom-swal-content',
    }
  });
});