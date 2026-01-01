// INITIALISATION - WALLETS À SUIVRE
let investigationData = {
    metadata: {
        caseName: "Arnaque Ramp Network",
        startDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString()
    },
    wallets: [],
    notes: ""
};

// WALLETS DÉJÀ IDENTIFIÉS (ta liste de base)
const INITIAL_WALLETS = [
    "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp",
    "bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj",
    "bc1qzjv5s09zuepsaj808jlxcjcvhw7nprr9kytwej",
    "bc1q202lj4yklsyz5m4krtt95qfnlppuha5rydueyc",
    "bc1qy3896n4zy8jh62scnag6482e4khep0xsr3hn8w",
    "1B5hVExEx5DjAMueQGESP2b6jzBu5UfTkP",
    "3HaVwfq3hYxVaqZUSEJnUajYe6iyDydfz2",
    "bc1q9wvygkq7h9xgcp59mc6ghzczrqlgrj9k3ey9tz",
    "bc1qjjp862nj209kp4uhtnqtd3uxg7rxshqsudeq3n",
    "bc1qns9f7yfx3ry9lj6yz7c9er0vwa0ye2eklpzqfw",
    "bc1qu5e06feh08754jm3zappfkgut8cfqcl7th22nn",
    "bc1qkeg5j427l3srudv3w7fd7q9kwzrrpar6snxpjw"
];

let network = null;
let selectedWallet = null;
let physicsEnabled = true;
let btcPrice = 80000; // Valeur par défaut
let btcPriceChange = 0;
let priceUpdateInterval = null;
let walletDataInterval = null;

// INITIALISATION
document.addEventListener('DOMContentLoaded', function () {
    loadSavedData();
    initializeWallets();
    renderWalletList();
    renderNetwork();
    loadNotes();
    updateStats();

    // Initialiser les données temps réel
    fetchAllWalletData();
    fetchBTCPrice();

    // Configurer les intervalles
    priceUpdateInterval = setInterval(fetchBTCPrice, 30 * 60 * 1000); // 30 minutes
    walletDataInterval = setInterval(fetchAllWalletData, 10 * 60 * 1000); // 10 minutes

    // Initialiser le widget prix BTC
    updateBTCPriceWidget();
});

// FONCTIONS DE GESTION DES WALLETS
function initializeWallets() {
    // Si pas de données sauvegardées, initialiser avec les wallets de base
    if (investigationData.wallets.length === 0) {
        INITIAL_WALLETS.forEach(address => {
            addWallet(address, true); // true = initial
        });
    }
}

function addWallet(address, isInitial = false) {
    if (!address || !address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/)) {
        alert('Adresse Bitcoin invalide');
        return;
    }

    // Vérifier si le wallet existe déjà
    if (investigationData.wallets.some(w => w.address === address)) {
        alert('Ce wallet est déjà dans la liste');
        return;
    }

    const newWallet = {
        address: address,
        alias: generateAlias(address, isInitial),
        addedDate: new Date().toISOString(),
        risk: 'medium',
        notes: isInitial ? 'Wallet identifié dans l\'enquête initiale' : 'Ajouté manuellement',
        balance: "0 BTC",
        incomingTx: 0,
        outgoingTx: 0,
        connections: []
    };

    investigationData.wallets.push(newWallet);
    saveInvestigationData();
    renderWalletList();

    if (!isInitial) {
        fetchWalletData(address, investigationData.wallets.length - 1);
        document.getElementById('newWalletInput').value = '';
    } else {
        // Pour les wallets initiaux, charger les données immédiatement
        setTimeout(() => {
            fetchWalletData(address, investigationData.wallets.length - 1);
        }, 100);
    }
}

function addWalletFromInput() {
    const input = document.getElementById('newWalletInput');
    addWallet(input.value.trim());
}

function generateAlias(address, isInitial) {
    if (isInitial) {
        if (address === "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp") return "🎯 Wallet source (arnaque)";
        if (address === "bc1q202lj4yklsyz5m4krtt95qfnlppuha5rydueyc") return "💰 WALLET PRINCIPAL (27 BTC)";
        return "🔄 Wallet intermédiaire";
    }
    return "🆕 Nouveau wallet";
}

function removeWallet(index) {
    if (confirm('Supprimer ce wallet de l\'enquête ?')) {
        investigationData.wallets.splice(index, 1);
        if (selectedWallet === index) selectedWallet = null;
        saveInvestigationData();
        renderWalletList();
        renderNetwork();
        updateStats();
    }
}

function selectWallet(index) {
    selectedWallet = index;
    renderWalletList();

    // Centrer le réseau sur ce wallet
    if (network && investigationData.wallets[index]) {
        network.focus(investigationData.wallets[index].address, {
            animation: { duration: 1000, easingFunction: 'easeInOutQuad' }
        });
    }
}

// RENDU DE LA LISTE DES WALLETS
function renderWalletList() {
    const container = document.getElementById('walletListContainer');
    container.innerHTML = '';

    if (investigationData.wallets.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div>Aucun wallet identifié</div>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    Ajoutez des adresses Bitcoin pour commencer
                </div>
            </div>
        `;
        return;
    }

    investigationData.wallets.forEach((wallet, index) => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
        const balanceUSD = balance * btcPrice;
        const totalTx = wallet.incomingTx + wallet.outgoingTx;

        const walletElement = document.createElement('div');
        walletElement.className = `wallet-item ${selectedWallet === index ? 'active' : ''}`;

        walletElement.innerHTML = `
            <div class="wallet-header">
                <div class="wallet-alias">${wallet.alias}</div>
                <span class="risk-badge risk-${wallet.risk}">${wallet.risk.toUpperCase()}</span>
            </div>
            
            <div class="wallet-address">${wallet.address}</div>
            
            <div class="wallet-info">
                <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                    <div>
                        <strong>Balance:</strong><br>
                        ${wallet.balance}<br>
                        <span style="font-size: 0.85rem; color: #63e6be;">
                            $${balanceUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div>
                        <strong>Transactions:</strong><br>
                        ${totalTx} (↓${wallet.incomingTx} ↑${wallet.outgoingTx})<br>
                        <span style="font-size: 0.85rem; color: #888;">
                            Connexions: ${wallet.connections.length}
                        </span>
                    </div>
                </div>
                <div style="font-size: 0.85rem; color: #888;">
                    Ajouté: ${new Date(wallet.addedDate).toLocaleDateString('fr-FR')}
                    ${wallet.notes ? `<div style="margin-top: 10px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; font-size: 0.85rem;">${wallet.notes}</div>` : ''}
                </div>
            </div>
            
            <div class="wallet-actions">
                <a href="https://blockchain.com/explorer/addresses/btc/${wallet.address}" target="_blank" class="action-btn">
                    <i class="fa-solid fa-magnifying-glass"></i> Blockchain
                </a>
                <a href="https://blockstream.info/address/${wallet.address}" target="_blank" class="action-btn">
                    <i class="fa-solid fa-chart-line"></i> Blockstream
                </a>
                <button class="action-btn" onclick="removeWallet(${index})">
                    <i class="fa-solid fa-trash"></i> Supprimer
                </button>
            </div>
        `;

        walletElement.onclick = (e) => {
            if (!e.target.closest('.wallet-actions')) {
                selectWallet(index);
            }
        };

        container.appendChild(walletElement);
    });
}

// FONCTIONS API TEMPS RÉEL
async function fetchBTCPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        btcPrice = data.bitcoin.usd;
        btcPriceChange = data.bitcoin.usd_24h_change;
        updateBTCPriceWidget();
        updateStats();
    } catch (error) {
        console.error('Erreur lors de la récupération du prix BTC:', error);
        btcPrice = 60000;
        updateBTCPriceWidget();
    }
}

function updateBTCPriceWidget() {
    let widget = document.getElementById('btcPriceWidget');
    if (!widget) {
        widget = document.createElement('div');
        widget.id = 'btcPriceWidget';
        widget.className = 'btc-price';
        document.querySelector('.map-controls').appendChild(widget);
    }

    const changeColor = btcPriceChange >= 0 ? '#63e6be' : '#f44336';
    const changeIcon = btcPriceChange >= 0 ? '↗' : '↘';

    widget.innerHTML = `
        <i class="fa-brands fa-bitcoin"></i>
        <div>
            <div>$${btcPrice.toLocaleString('fr-FR')}</div>
            <div class="change" style="color: ${changeColor}">
                ${changeIcon} ${Math.abs(btcPriceChange).toFixed(2)}%
            </div>
        </div>
    `;
}

async function fetchWalletData(address, index) {
    try {
        // Utiliser Blockstream API
        const response = await fetch(`https://blockstream.info/api/address/${address}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Calculer le solde
        const balanceBTC = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;

        // Mettre à jour le wallet
        investigationData.wallets[index].balance = `${balanceBTC.toFixed(8)} BTC`;
        investigationData.wallets[index].incomingTx = data.chain_stats.tx_count;
        investigationData.wallets[index].outgoingTx = data.mempool_stats.tx_count;

        // Calculer le risque dynamique
        investigationData.wallets[index].risk = calculateRisk(balanceBTC, data.chain_stats.tx_count);

        // Mettre à jour les connexions
        await fetchWalletConnections(address, index);

        saveInvestigationData();
        renderWalletList();
        renderNetwork();
        updateStats();

    } catch (error) {
        console.error(`Erreur lors de la récupération des données pour ${address}:`, error);

        // Valeurs par défaut en cas d'erreur
        investigationData.wallets[index].balance = "0 BTC";
        investigationData.wallets[index].incomingTx = 0;
        investigationData.wallets[index].outgoingTx = 0;
        investigationData.wallets[index].risk = 'low';
    }
}

async function fetchAllWalletData() {
    console.log('Mise à jour des données wallets...');
    for (let i = 0; i < investigationData.wallets.length; i++) {
        await fetchWalletData(investigationData.wallets[i].address, i);
        // Petit délai pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

async function fetchWalletConnections(address, index) {
    try {
        const response = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        const txs = await response.json();

        const connections = new Set();

        // Analyser les 10 dernières transactions
        txs.slice(0, 10).forEach(tx => {
            // Adresses d'entrée
            tx.vin?.forEach(input => {
                if (input.prevout?.scriptpubkey_address) {
                    connections.add(input.prevout.scriptpubkey_address);
                }
            });

            // Adresses de sortie
            tx.vout?.forEach(output => {
                if (output.scriptpubkey_address) {
                    connections.add(output.scriptpubkey_address);
                }
            });
        });

        // Filtrer pour ne garder que les wallets que nous suivons
        investigationData.wallets[index].connections = Array.from(connections)
            .filter(addr => investigationData.wallets.some(w => w.address === addr))
            .filter(addr => addr !== address);

    } catch (error) {
        console.error('Erreur lors de la récupération des connexions:', error);
        investigationData.wallets[index].connections = [];
    }
}

function calculateRisk(balanceBTC, txCount) {
    if (balanceBTC > 10) return 'high';
    if (balanceBTC > 1) return 'medium';
    if (balanceBTC > 0.1 && txCount > 10) return 'medium';
    return 'low';
}

// CARTE DES CONNEXIONS - STYLE JSONCRACK
function renderNetwork() {
    const container = document.getElementById('network');

    if (investigationData.wallets.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Ajoutez des wallets pour voir la carte</div>';
        return;
    }

    const nodes = [];
    const edges = [];

    // Créer les nœuds avec style JSONCrack
    investigationData.wallets.forEach((wallet, index) => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
        const balanceUSD = balance * btcPrice;

        // Déterminer le style du nœud
        const nodeStyle = getNodeStyle(wallet, balance);

        nodes.push({
            id: wallet.address,
            label: `${wallet.alias.split(' ')[0]}\n${balance.toFixed(2)} BTC`,
            color: nodeStyle.color,
            shape: nodeStyle.shape,
            size: nodeStyle.size,
            font: {
                size: nodeStyle.fontSize,
                face: 'Montserrat',
                color: '#ffffff',
                bold: true,
                strokeWidth: 2,
                strokeColor: 'rgba(0,0,0,0.8)'
            },
            borderWidth: 3,
            borderColor: nodeStyle.borderColor,
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.5)',
                size: 10,
                x: 5,
                y: 5
            },
            title: generateTooltipHTML(wallet, balanceUSD),
            group: wallet.risk,
            x: Math.cos((index / investigationData.wallets.length) * 2 * Math.PI) * 300,
            y: Math.sin((index / investigationData.wallets.length) * 2 * Math.PI) * 300
        });
    });

    // Créer les connexions basées sur les données réelles
    investigationData.wallets.forEach((wallet, index) => {
        wallet.connections.forEach(connectedAddress => {
            const connectedWallet = investigationData.wallets.find(w => w.address === connectedAddress);
            if (connectedWallet) {
                const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
                const connectedBalance = parseFloat(connectedWallet.balance.split(' ')[0]) || 0;

                edges.push({
                    from: wallet.address,
                    to: connectedAddress,
                    arrows: 'to',
                    color: {
                        color: balance > connectedBalance ? '#4b0e09ff' : '#0d4b38ff',
                        opacity: 1
                    },
                    width: Math.min(3, Math.log(balance + 1)),
                    smooth: {
                        enabled: true,
                        type: 'continuous',
                        roundness: 1
                    },
                    dashes: balance < 1,
                    label: balance > 0 ? `${balance.toFixed(2)} BTC` : '',
                    font: {
                        size: 10,
                        color: '#ffffff',
                        strokeWidth: 2,
                        strokeColor: '#000000'
                    }
                });
            }
        });
    });

    // Ajouter des connexions pour la lisibilité si pas de connexions réelles
    if (edges.length === 0 && investigationData.wallets.length > 1) {
        for (let i = 0; i < Math.min(3, investigationData.wallets.length - 1); i++) {
            const balance = parseFloat(investigationData.wallets[i].balance.split(' ')[0]) || 0;
            edges.push({
                from: investigationData.wallets[i].address,
                to: investigationData.wallets[i + 1].address,
                arrows: 'to',
                color: { color: '#8f4b8bff', opacity: 0.9 },
                width: 1,
                dashes: true,
                label: balance > 0 ? '→' : ''
            });
        }
    }

    const data = { nodes, edges };
    const options = {
        nodes: {
            shapeProperties: {
                useBorderWithImage: true,
                interpolation: false
            },
            scaling: {
                min: 20,
                max: 50,
                label: {
                    enabled: true,
                    min: 12,
                    max: 16
                }
            }
        },
        edges: {
            smooth: {
                enabled: true,
                type: 'continuous',
                roundness: 1
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.8,
                    type: 'arrow'
                }
            },
            scaling: {
                min: 1,
                max: 5
            }
        },
        physics: {
            enabled: physicsEnabled,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -150,
                centralGravity: 0.05,
                springLength: 200,
                springConstant: 0.06,
                damping: 0.5,
                avoidOverlap: 1.2
            },
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 100
            }
        },
        interaction: {
            hover: true,
            hoverConnectedEdges: true,
            tooltipDelay: 100,
            navigationButtons: true,
            keyboard: {
                enabled: true,
                speed: { x: 10, y: 10, zoom: 0.03 }
            }
        },
        layout: {
            improvedLayout: true
        },
        groups: {
            high: {
                color: { background: '#ee6055', border: '#ee6055' },
                shape: 'box'
            },
            medium: {
                color: { background: '#ffd43b', border: '#ffd43b' },
                shape: 'box'
            },
            low: {
                color: { background: '#63e6be', border: '#63e6be' },
                shape: 'box'
            }
        }
    };

    if (network) {
        network.destroy();
    }

    network = new vis.Network(container, data, options);

    // Événements
    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const walletIndex = investigationData.wallets.findIndex(w => w.address === params.nodes[0]);
            if (walletIndex > -1) {
                selectWallet(walletIndex);
            }
        }
    });

    network.on("doubleClick", function (params) {
        if (params.nodes.length > 0) {
            const walletAddress = params.nodes[0];
            window.open(`https://blockchain.com/explorer/addresses/btc/${walletAddress}`, '_blank');
        }
    });

    // Zoom optimal au démarrage
    setTimeout(() => {
        network.fit({ animation: { duration: 1500, easingFunction: 'easeInOutQuad' } });
    }, 500);
}

// FONCTIONS UTILITAIRES POUR LE STYLE JSONCRACK
function getNodeStyle(wallet, balance) {
    if (wallet.address === "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp") {
        return {
            color: { background: '#74c0fc', border: '#74c0fc' },
            borderColor: '#5c6bc0',
            shape: 'box',
            size: 45,
            fontSize: 14
        };
    }

    if (balance > 10) {
        return {
            color: { background: '#ee6055', border: '#ee6055' },
            borderColor: '#ef5350',
            shape: 'box',
            size: 50,
            fontSize: 14
        };
    } else if (balance > 1) {
        return {
            color: { background: '#ffd43b', border: '#ffd43b' },
            borderColor: '#ffb74d',
            shape: 'box',
            size: 40,
            fontSize: 13
        };
    } else if (balance > 0.1) {
        return {
            color: { background: '#63e6be', border: '#63e6be' },
            borderColor: '#81c784',
            shape: 'box',
            size: 30,
            fontSize: 12
        };
    } else {
        return {
            color: { background: '#757575', border: '#616161' },
            borderColor: '#bdbdbd',
            shape: 'box',
            size: 25,
            fontSize: 11
        };
    }
}

function generateTooltipHTML(wallet, balanceUSD) {
    const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
    const totalTx = wallet.incomingTx + wallet.outgoingTx;
    return `
                ${wallet.alias}
                ${wallet.address}
                Balance: ${wallet.balance}
                Valeur USD: $${balanceUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    `;
}

// FONCTIONS UTILITAIRES
function updateStats() {
    let totalBTC = 0;
    let totalUSD = 0;
    let criticalWallets = 0;
    let totalConnections = 0;

    investigationData.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
        totalBTC += balance;
        totalUSD += balance * btcPrice;

        if (balance > 10) criticalWallets++;
        totalConnections += wallet.connections.length;
    });

    // Utiliser les connexions réelles ou calculées
    const displayedConnections = totalConnections > 0 ? totalConnections : Math.max(0, investigationData.wallets.length - 1);

    document.getElementById('totalWallets').textContent = investigationData.wallets.length;
    document.getElementById('totalConnections').textContent = displayedConnections;
    document.getElementById('totalBTC').textContent = `${totalBTC.toFixed(2)} BTC\n$${totalUSD.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('criticalWallets').textContent = criticalWallets;
}

function refreshNetwork() {
    renderNetwork();
    updateStats();
}

function togglePhysics() {
    physicsEnabled = !physicsEnabled;
    if (network) {
        network.setOptions({ physics: { enabled: physicsEnabled } });
    }
    alert(`Physique ${physicsEnabled ? 'activée' : 'désactivée'}`);
}

function exportNetworkImage() {
    if (network) {
        const dataURL = network.canvas.frame.canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `carte-wallets-${new Date().toISOString().split('T')[0]}.png`;
        link.click();
    }
}

// GESTION DES DONNÉES
function saveInvestigationData() {
    investigationData.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem('bitcoinInvestigationDossier', JSON.stringify(investigationData));
    updateStats();
}

function loadSavedData() {
    const saved = localStorage.getItem('bitcoinInvestigationDossier');
    if (saved) {
        investigationData = JSON.parse(saved);
    }
}

function loadNotes() {
    const savedNotes = localStorage.getItem('investigationNotesDossier');
    if (savedNotes) {
        document.getElementById('investigationNotes').value = savedNotes;
        investigationData.notes = savedNotes;
    }
}

function saveNotes() {
    const notes = document.getElementById('investigationNotes').value;
    investigationData.notes = notes;
    localStorage.setItem('investigationNotesDossier', notes);
    saveInvestigationData();
    alert('Notes sauvegardées');
}

function addTimestamp() {
    const notes = document.getElementById('investigationNotes');
    const timestamp = `\n\n[${new Date().toLocaleString('fr-FR')}] `;
    notes.value += timestamp;
    notes.focus();
}

// IMPORT/EXPORT
function exportWallets() {
    const walletsList = investigationData.wallets.map(w => w.address).join('\n');
    const blob = new Blob([walletsList], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wallets-enquete-${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
}

function importWallets() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';

    input.onchange = function (e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const content = event.target.result;
            const addresses = content.split('\n')
                .map(line => line.trim())
                .filter(line => line.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/));

            addresses.forEach(address => addWallet(address));
            alert(`${addresses.length} wallets importés`);
        };

        reader.readAsText(file);
    };

    input.click();
}

function exportFullDossier() {
    const dossier = {
        ...investigationData,
        exportDate: new Date().toISOString(),
        totalWallets: investigationData.wallets.length,
        totalBTC: investigationData.wallets.reduce((sum, w) => sum + (parseFloat(w.balance.split(' ')[0]) || 0), 0),
        totalUSD: investigationData.wallets.reduce((sum, w) => sum + (parseFloat(w.balance.split(' ')[0]) || 0) * btcPrice, 0),
        btcPrice: btcPrice
    };

    const dataStr = JSON.stringify(dossier, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dossier-enquete-bitcoin-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function clearAllWallets() {
    if (confirm('Voulez-vous vraiment supprimer TOUS les wallets ?')) {
        investigationData.wallets = [];
        selectedWallet = null;
        saveInvestigationData();
        renderWalletList();
        renderNetwork();
        updateStats();
    }
}

function searchWallets() {
    const searchTerm = document.getElementById('searchWallet').value.toLowerCase();
    const wallets = document.querySelectorAll('.wallet-item');

    wallets.forEach(wallet => {
        const address = wallet.querySelector('.wallet-address').textContent.toLowerCase();
        const alias = wallet.querySelector('.wallet-alias').textContent.toLowerCase();

        if (address.includes(searchTerm) || alias.includes(searchTerm)) {
            wallet.style.display = 'block';
        } else {
            wallet.style.display = 'none';
        }
    });
}

// Nettoyage des intervalles
window.addEventListener('beforeunload', function () {
    if (priceUpdateInterval) clearInterval(priceUpdateInterval);
    if (walletDataInterval) clearInterval(walletDataInterval);
});