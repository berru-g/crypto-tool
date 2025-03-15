const searchInput = document.getElementById("tokenSearch");
const resultSection = document.getElementById("tokenResults");
const tokenList = document.getElementById("tokenList");

// Récupérer la liste des tokens au chargement de la page
async function fetchTokenList() {
    try {
        let response = await fetch("https://api.coingecko.com/api/v3/coins/list");
        if (!response.ok) throw new Error("Erreur lors de la récupération de la liste des tokens");
        let data = await response.json();
        console.log("Liste des tokens chargée :", data); // Vérification
        populateTokenList(data);
    } catch (error) {
        console.error("Erreur :", error);
    }
}

// Remplir la liste des tokens dans le datalist
function populateTokenList(tokens) {
    tokens.forEach(token => {
        const option = document.createElement("option");
        option.value = token.name; // Affiche le nom complet du token
        option.setAttribute("data-id", token.id); // Stocke l'ID du token
        tokenList.appendChild(option);
    });
}

// Fonction pour calculer le pourcentage par rapport à l'ATH
function calculatePercentageFromATH(currentPrice, ath) {
    if (ath === 0) return 0; // Pour éviter une division par zéro
    return ((currentPrice / ath) * 100).toFixed(2);
}

// Fonction pour calculer les niveaux de Fibonacci
function calculateFibonacciLevels(ath, atl) {
    const levels = [0.236, 0.382, 0.5, 0.618, 0.786];
    return levels.map(level => ({
        level: level * 100,
        price: ath - (ath - atl) * level
    }));
}

// Fonction pour afficher les niveaux de support/resistance
function displaySupportResistanceLevels(currentPrice, fibonacciLevels) {
    let message = "";
    fibonacciLevels.forEach(level => {
        if (Math.abs(currentPrice - level.price) < 2) { // 2 est une marge d'erreur
            message += `Support/resistance à ${level.price.toFixed(2)} (${level.level}%)<br>`;
        }
    });
    return message || "Aucun niveau de support/resistance proche.";
}

// Rechercher les données du token
async function fetchTokenData(query) {
    console.log("Recherche du token :", query); // Vérification
    if (!query.trim()) {
        resultSection.innerHTML = `<p style='color:#ee6055;'>⚠ Veuillez entrer un nom de token</p>`;
        return;
    }

    resultSection.innerHTML = `<p>Chargement...</p>`;

    try {
        let response = await fetch(`https://api.coingecko.com/api/v3/coins/${query}`);
        console.log("Réponse API :", response); // Vérification
        if (!response.ok) throw new Error("Token non trouvé");
        let data = await response.json();
        console.log("Données du token :", data); // Vérification
        displayTokenData(data);
    } catch (error) {
        console.error("Erreur :", error); // Vérification
        resultSection.innerHTML = `<p style='color:#ee6055;'>⚠ Token introuvable ou probléme de connexion possible. Please Refresh 🔄️</p>`;
    }
}

// Afficher les données du token
function displayTokenData(data) {
    const { name, symbol, image, market_data, market_cap_rank, platforms, categories } = data;
    const price = market_data.current_price.usd.toFixed(2);
    const ath = market_data.ath.usd.toFixed(2);
    const atl = market_data.atl.usd.toFixed(2);
    const blockchains = platforms ? Object.keys(platforms).join(", ") : "Non listé";
    const utility = categories ? categories.join(", ") : "Non spécifié";

    // Calcul du pourcentage par rapport à l'ATH
    const percentFromATH = calculatePercentageFromATH(market_data.current_price.usd, market_data.ath.usd);

    // Calcul des niveaux de Fibonacci
    const fibonacciLevels = calculateFibonacciLevels(market_data.ath.usd, market_data.atl.usd);
    const supportResistanceMessage = displaySupportResistanceLevels(market_data.current_price.usd, fibonacciLevels);

    resultSection.innerHTML = `
        <p style="display: flex; justify-content: space-between; align-items: center;">
<strong><span>${name} (${symbol.toUpperCase()})</span></strong>
<img src="${image.small}" alt="${name} logo" style="width: 50px; height: 50px; margin-left: 10px;"></p>
            <div>
                
                <p>Price  <strong style='color:grey;'>${price}</strong> $</p>
                <p>Rank  <strong style='color:grey;'>${market_cap_rank}</strong>⭐</p>
                <p>ATH 📈<strong style='color:#60d394;'>${ath}</strong>$</p>
                <p>ATL 📉<strong style='color:#ee6055;'>${atl}</strong>$</p><br>
                <p style='color:#58a6ff;'><strong>${name}</strong> is at <strong>${percentFromATH}%</strong> of its ATH</p><br>
                <p><strong style='color:#3c325b;'>Niveaux de Fibonacci :</strong><br>${supportResistanceMessage}</p><br>
                <p><strong style='color:#3c325b;'>Blockchain</strong> 🔗 ${blockchains}</p><br>
                <p><strong style='color:#3c325b;'>Utilité</strong> 🛠 ${utility}</p>
            </div>
        </div>
        <!--<canvas id="price-chart"></canvas>-->
    `;
    fetchHistoricalData(data.id);
}

// Récupérer les données historiques pour le graphique
async function fetchHistoricalData(tokenId) {
    console.log("Récupération des données historiques pour :", tokenId); // Vérification
    try {
        let response = await fetch(`https://api.coingecko.com/api/v3/coins/${tokenId}/market_chart?vs_currency=usd&days=30`);
        console.log("Réponse API historique :", response); // Vérification
        if (!response.ok) throw new Error("Erreur lors de la récupération des données historiques");
        let data = await response.json();
        console.log("Données historiques :", data); // Vérification
        drawChart(data.prices);
    } catch (error) {
        console.error("Erreur :", error); // Vérification
    }
}

// Dessiner le graphique
function drawChart(priceData) {
    const ctx = document.getElementById("price-chart").getContext("2d");
    const labels = priceData.map(entry => new Date(entry[0]).toLocaleDateString());
    const prices = priceData.map(entry => entry[1]);

    new Chart(ctx, {
        data: {
            labels: labels,
            datasets: [{
                label: "Prix USD",
                data: prices,
                borderColor: "#ab9ff2",
                fill: false
            }]
        },
        options: { responsive: true }
    });
}

// Événements
document.getElementById("tokenSearch").addEventListener("keypress", (event) => {
    console.log("Touche pressée :", event.key); // Vérification
    if (event.key === "Enter") {
        const selectedOption = Array.from(tokenList.options).find(option => option.value === event.target.value);
        if (selectedOption) {
            console.log("Token sélectionné :", selectedOption.getAttribute("data-id")); // Vérification
            fetchTokenData(selectedOption.getAttribute("data-id"));
        } else {
            console.log("Recherche directe :", event.target.value.toLowerCase()); // Vérification
            fetchTokenData(event.target.value.toLowerCase());
        }
    }
});

document.getElementById("searchButton").addEventListener("click", () => {
    console.log("Bouton de recherche cliqué"); // Vérification
    const selectedOption = Array.from(tokenList.options).find(option => option.value === searchInput.value);
    if (selectedOption) {
        console.log("Token sélectionné :", selectedOption.getAttribute("data-id")); // Vérification
        fetchTokenData(selectedOption.getAttribute("data-id"));
    } else {
        console.log("Recherche directe :", searchInput.value.toLowerCase()); // Vérification
        fetchTokenData(searchInput.value.toLowerCase());
    }
});

// Charger la liste des tokens au démarrage
fetchTokenList();