// site to app service worker notif
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function (registration) {
            console.log('Service Worker enregistré avec succès:', registration);
        })
        .catch(function (error) {
            console.log('Échec de l\'enregistrement du Service Worker:', error);
        });
}

//////////////////////// dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.add(currentTheme + '-mode');

// Gestion du bouton de bascule
const themeToggleButton = document.createElement('button');
themeToggleButton.className = 'theme-toggle';
themeToggleButton.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
document.body.appendChild(themeToggleButton);

themeToggleButton.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.replace('dark-mode', 'light-mode');
        themeToggleButton.textContent = 'Dark';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.replace('light-mode', 'dark-mode');
        themeToggleButton.textContent = 'Light';
        localStorage.setItem('theme', 'dark');
    }
});

// Fonction pour charger le cache depuis localStorage calcul du fiboscope
function loadCache() {
    const cache = localStorage.getItem('tokenCache');
    return cache ? JSON.parse(cache) : {
        "btc": "bitcoin",
        "eth": "ethereum",
        "xrp": "ripple",
        "usdt": "tether",
        "sol": "solana",
        "bnb": "binancecoin",
        "doge": "dogecoin",
        "usdc": "usd-coin",
        "ada": "cardano",
        "trx": "tron",
        "dot": "polkadot",
        "matic": "polygon",
        "avax": "avalanche",
        "shib": "shiba-inu",
        "ltc": "litecoin",
        "wbtc": "wrapped-bitcoin",
        "dai": "dai",
        "uni": "uniswap",
        "leo": "leo-token",
        "atom": "cosmos",
        "link": "chainlink",
        "etc": "ethereum-classic",
        "xlm": "stellar",
        "bch": "bitcoin-cash",
        "algo": "algorand",
        "qnt": "quant-network",
        "near": "near",
        "cro": "crypto-com-chain",
        "vet": "vechain",
        "icp": "internet-computer",
        "hbar": "hedera-hashgraph",
        "fil": "filecoin",
        "apt": "aptos",
        "lunc": "terra-luna",
        "egld": "elrond",
        "ftm": "fantom",
        "sand": "the-sandbox",
        "axs": "axie-infinity",
        "mana": "decentraland",
        "chz": "chiliz",
        "xmr": "monero",
        "okb": "okb",
        "bsv": "bitcoin-sv",
        "theta": "theta-token",
        "eos": "eos",
        "flow": "flow",
        "aave": "aave",
        "frax": "frax",
        "klay": "klaytn",
        "xtz": "tezos",
        "rune": "thorchain",
        "zec": "zcash",
        "snx": "synthetix-network-token",
        "neo": "neo",
        "gala": "gala",
        "crv": "curve-dao-token",
        "kcs": "kucoin-shares",
        "miota": "iota",
        "ht": "huobi-token",
        "usdp": "paxos-standard",
        "btt": "bittorrent",
        "lrc": "loopring",
        "comp": "compound-governance-token",
        "one": "harmony",
        "enj": "enjincoin",
        "bat": "basic-attention-token",
        "mkr": "maker",
        "xem": "nem",
        "dcr": "decred",
        "waves": "waves",
        "tusd": "true-usd",
        "cdai": "cdai",
        "cusdc": "cusdc",
        "ceth": "ceth",
        "cusdt": "cusdt",
        "ftt": "ftx-token",
        "ksm": "kusama",
        "yfi": "yearn-finance",
        "btg": "bitcoin-gold",
        "omg": "omisego",
        "zrx": "0x",
        "ont": "ontology",
        "nano": "nano",
        "sc": "siacoin",
        "icx": "icon",
        "qtum": "qtum",
        "bnt": "bancor",
        "zen": "horizen",
        "sushi": "sushi",
        "dgb": "digibyte",
        "uma": "uma",
        "rev": "revain",
        "hive": "hive",
        "iotx": "iotex",
        "fet": "fetch-ai",
        "cel": "celsius",
        "srm": "serum",
        "rsv": "reserve",
        "ogn": "origin-protocol",
        "ankr": "ankr",
        "storj": "storj",
        "ocean": "ocean-protocol",
        "grt": "the-graph",
        "bal": "balancer",
        "band": "band-protocol",
        "akash": "akash-network",
        "rsr": "reserve-rights-token",
        "tao": "bittensor",
        "inj": "injective-protocol",
        "render": "render-token",
        "pepe": "pepe",
        "woj": "wojak",
        "floki": "floki",
        "dogelon": "dogelon-mars",
        "babyDoge": "baby-doge-coin",
        "bonk": "bonk",
        "kishu": "kishu-inu",
        "shib": "shiba-inu",
        "jup": "jupiter-exchange-solana",
        "nano": "nano",
        "celo": "celo",
        "imx": "immutable-x",
        "ilv": "illuvium",
        "arbitrum": "arbitrum",
        "op": "optimism",
        "scrt": "secret",
        "dusk": "dusk-network"

    };
}

// Fonction pour sauvegarder le cache dans localStorage
function saveCache(cache) {
    localStorage.setItem('tokenCache', JSON.stringify(cache));
}

// Charger le cache initial
const tokenCache = loadCache();

document.getElementById('calculate').addEventListener('click', async () => {
    const userInput = document.getElementById('token').value.toLowerCase();
    const resultDiv = document.getElementById('result');
    const chartDiv = document.getElementById('chart');

    try {
        let token = userInput;

        // Vérifier si le token existe déjà dans le cache
        if (tokenCache[token]) {
            token = tokenCache[token];
        } else {
            // Si non trouvé, faire une requête pour valider et récupérer le nom officiel
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token}`);
            if (!response.ok) throw new Error(' Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez bitcoin, pour injective notez injective-protocol, pour Akash notez akash-network, pour RSR notez reserve-rights-token etc');
            const data = await response.json();

            // Ajouter le token au cache avec son nom officiel
            tokenCache[userInput] = data.id;
            saveCache(tokenCache); // Sauvegarder dans localStorage
        }

        // Faire la requête pour obtenir les informations du token
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${token}`);
        if (!response.ok) throw new Error(' Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez (bitcoin), pour injective notez (injective-protocol), pour Akash notez (akash-network), pour RSR notez (reserve-rights-token) etc');

        const data = await response.json();
        const currentPrice = data.market_data.current_price.usd;
        const allTimeHigh = data.market_data.ath.usd;
        const allTimeLow = data.market_data.atl.usd;

        // Calcul du pourcentage
        const percentage = ((currentPrice - allTimeLow) / (allTimeHigh - allTimeLow)) * 100;
        let percentageClass = '';
        let percentageText = '';

        // Attribution de la couleur selon le pourcentage
        if (percentage > 75) {
            percentageClass = 'red';
            percentageText = '⚠️';
        } else if (percentage > 50) {
            percentageClass = 'orange';
            percentageText = 'DYOR';
        } else if (percentage > 25) {
            percentageClass = 'blue';
            percentageText = '🤷‍♂️';
        } else {
            percentageClass = 'green';
            percentageText = '🚀';
        }

        // **Ajout : Calcul du Ratio Supply/Max Supply**
        const circulatingSupply = data.market_data.circulating_supply || 0; // Vérifier s'il est disponible
        const maxSupply = data.market_data.max_supply || 1; // Éviter la division par zéro
        const supplyRatio = maxSupply > 0 ? (circulatingSupply / maxSupply) * 100 : 0;

        // **Ajout : Récupération du Rang**
        const marketRank = data.market_cap_rank || 'Non classé';
        const priceChange24h = data.market_data.price_change_percentage_24h.toFixed(2);
        const priceChange7d = data.market_data.price_change_percentage_7d.toFixed(2);

        resultDiv.className = "result"; // Reset any existing class
        setTimeout(() => {
            resultDiv.classList.add("show");
        }, 100);

        // Mise en forme du résultat
        resultDiv.innerHTML = `
        <p style="display: flex; justify-content: space-between; align-items: center;">
<span><strong>Token :</strong> ${data.name} (${data.symbol.toUpperCase()})</span>
<img src="${data.image.small}" alt="${data.name} logo" style="width: 50px; height: 50px; margin-left: 10px;"></p>
<p><strong>Prix actuel :</strong> $${currentPrice.toFixed(4)}</p>
<p><strong>ATL 📉 </strong> $${allTimeLow.toFixed(4)}</p>
<p><strong>ATH 📈</strong> $${allTimeHigh.toFixed(4)}</p>
<p><strong>${data.name} est à </strong> 
    <span class="percentage ${percentageClass}">
        ${percentage.toFixed(2)}%
    </span>
    <strong> de son potentiel max </strong><br>
</p>
<p><strong>Rang :</strong> ${marketRank}</p>
<p><strong>Capitalisation :</strong> 
${data.market_data && data.market_data.market_cap.usd
                ? `$${data.market_data.market_cap.usd.toLocaleString()}`
                : 'Non spécifiée'}
</p>

<p><strong>Tokens en circulation :</strong> ${supplyRatio.toFixed(2)}%</p>

<p><strong>Sur 24h :</strong> ${priceChange24h}%</p>
<p><strong>Sur 7 jours :</strong> ${priceChange7d}%</p>

<p><strong>Écosystème : </strong>${data.platforms && Object.keys(data.platforms).length > 0
                ? Object.keys(data.platforms).join(', ')
                : 'Non spécifié'}</p>
                

<p><strong>Catégorie :</strong> ${data.categories ? data.categories.join(', ') : 'Non spécifiée'}</p>
<div id="chart-container" style="border-radius: 8px; overflow: hidden;">
        <div id="chart"></div>
<p style="text-align:center;"><a href="https://www.coingecko.com/fr/coins/${data.id}"
            target="_blank">Voir la chart sur CoinGecko.com</a></p>
`;


        // **Ajout : Affichage de la chart avec personnalisation**
        const pricesResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${token}/market_chart?vs_currency=usd&days=30`);
        const pricesData = await pricesResponse.json();
        const prices = pricesData.prices;

        const xValues = prices.map(([timestamp]) => new Date(timestamp));
        const yValues = prices.map(([, price]) => price);

        const trace = {
            x: xValues,
            y: yValues,
            mode: 'lines+markers', // Ajouter des marqueurs
            name: data.name,
            line: {
                color: '#58a6ff', // Couleur de la courbe (orange)
                width: 2, // Épaisseur de la courbe
            },
            marker: {
                color: '#58a6ff', // Couleur des marqueurs
                size: 3, // Taille des marqueurs
            },
        };

        const layout = {
            title: `Prix de ${data.name} (30 jours)`,
            xaxis: {
                title: 'Date',
                titlefont: { size: 14, color: '#FFF' }, // Couleur du titre de l'axe X
                tickfont: { size: 12, color: '#FFF' }, // Couleur des étiquettes de l'axe X
                gridcolor: '#transparent', // Couleur de la grille de l'axe X
            },
            yaxis: {
                title: 'Prix (USD)',
                titlefont: { size: 14, color: '#FFF' }, // Couleur du titre de l'axe Y
                tickfont: { size: 12, color: '#FFF' }, // Couleur des étiquettes de l'axe Y
                gridcolor: '#444', // Couleur de la grille de l'axe Y
            },
            plot_bgcolor: 'transparent!important', // Fond de la zone de tracé semi-transparent
            paper_bgcolor: 'transparent!important', // Fond de la chart semi-transparent
            font: {
                color: '#FFF', // Couleur du texte global
            },
            showlegend: true, // Afficher la légende
            legend: {
                x: 0.1,
                y: 1.1,
                font: { size: 12, color: '#FFF' }, // Couleur de la légende
            },
        };

        Plotly.newPlot('chart', [trace], layout).then(() => {
            Plotly.relayout('chart', {
                width: 450, // Largeur personnalisée
                height: 400, // Hauteur personnalisée
            });
        });

        Plotly.newPlot('chart', [trace], {
            title: `Prix de ${data.name} (30 jours)`,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Prix (USD)' },
        });
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Erreur: ${error.message}</p>`;
        chartDiv.innerHTML = ''; // Effacer la chart en cas d'erreur
    }
});
/* section DISCLAIMER
function toggleSection() {
    const section = document.getElementById('dyor');
    const arrow = document.querySelector('#dyor .arrow');

    if (section.style.height === '50px' || !section.style.height) {
        // Ouvrir la section
        section.style.height = `${section.scrollHeight}px`; // Hauteur totale du contenu
        arrow.textContent = 'ℹ️'; // Changer la flèche vers le haut
    } else {
        // Fermer la section
        section.style.height = '100px'; // Revenir à la hauteur initiale
        arrow.textContent = 'ℹ️ Disclaimer:'; // Changer la flèche vers le bas
    }
}*/
// Sélection des éléments
const openPopupLink = document.querySelector('.open-popup');
const popup = document.getElementById('dyor-popup');
const closePopupButton = document.querySelector('.close-popup');

// Ouvrir le popup
openPopupLink.addEventListener('click', function (e) {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    popup.style.display = 'flex'; // Affiche le popup
});

// Fermer le popup
closePopupButton.addEventListener('click', function () {
    popup.style.display = 'none'; // Cache le popup
});

// Fermer le popup en cliquant à l'extérieur
popup.addEventListener('click', function (e) {
    if (e.target === popup) {
        popup.style.display = 'none'; // Cache le popup si on clique à l'extérieur
    }
});
// Gestion du bouton de partage
document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.getElementById("shareButton");
    const sharePopup = document.getElementById("sharePopup");
    const currentURL = window.location.href;

    // Configurer les liens de partage
    const twitterShare = document.getElementById("twitterShare");
    twitterShare.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent("Tool magic Fibonacci Retracement !")}`;

    const whatsappShare = document.getElementById("whatsappShare");
    whatsappShare.href = `https://api.whatsapp.com/send?text=${encodeURIComponent("Tool magic Fibonacci Retracement  : " + currentURL)}`;

    const facebookShare = document.getElementById("facebookShare");
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`;

    // Afficher ou masquer le popup
    shareButton.addEventListener("click", () => {
        const isVisible = sharePopup.style.display === "flex";
        sharePopup.style.display = isVisible ? "none" : "flex";
    });

    // Copier le lien dans le presse-papier
    window.copyToClipboard = () => {
        navigator.clipboard.writeText(currentURL).then(() => {
            alert("Lien copié dans le presse-papier !");
        }).catch(err => {
            console.error("Échec de la copie du lien : ", err);
        });
    };

    // Cacher le popup quand on clique en dehors
    document.addEventListener("click", (e) => {
        if (!shareButton.contains(e.target) && !sharePopup.contains(e.target)) {
            sharePopup.style.display = "none";
        }
    });
});

// mise a jour user
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(reg => {
        reg.onupdatefound = () => {
            const newSW = reg.installing;
            newSW.onstatechange = () => {
                if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nouvelle version détectée, afficher une alerte
                    let updateBanner = document.createElement("div");
                    updateBanner.innerHTML = `
                        <div style="position:fixed; bottom:10px; left:10px; right:10px; background:#222; color:#fff; padding:15px; text-align:center; border-radius:5px;">
                            🚀 Nouvelle mise à jour dispo ! <button onclick="window.location.reload()">Mettre à jour</button>
                        </div>
                    `;
                    document.body.appendChild(updateBanner);
                }
            };
        };
    });
}

//////////////////////////// MENU
const hamburgerMenu = document.querySelector('.hamburger-menu');

hamburgerMenu.addEventListener('click', () => {
    // Utilisation de SweetAlert pour afficher la fenêtre contextuelle
    Swal.fire({
        title: 'Cryptool',
        html: '<ul><p><a href="../index.html">Home</a></p><br><p><a href="https://github.com/berru-g/">Open Source</a></p><br><p><a href="../wallet/index.html">Wallet</a></p><br><p><a href="https://medium.com/@gael-berru">Articles</a></p><br><p><a href="https://berru-g.github.io/berru-g/blog/donation.html">Donation</a></p></ul>',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'custom-swal-popup',
            closeButton: 'custom-swal-close-button',
            content: 'custom-swal-content',
        }
    });
});

