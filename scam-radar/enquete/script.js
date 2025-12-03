
// Configuration
const BTC_PRICE = 85000; // Prix BTC en USD - à récupérer via API
let network = null;
let selectedWallet = null;
let investigationData = {
    metadata: {
        caseName: "ENZO - Arnaque Ramp Network",
        startDate: "2024-11-23",
        lastUpdated: new Date().toISOString()
    },
    wallets: [] // Initialement vide
};

// Wallets à suivre (à partir de ton enquête)
const WALLETS_TO_TRACK = [
    "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp",
    "bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj",
    "bc1qzjv5s09zuepsaj808jlxcjcvhw7nprr9kytwej",
    "bc1q202lj4yklsyz5m4krtt95qfnlppuha5rydueyc"
];

// API configuration
const API_ENDPOINTS = {
    blockchain: (address) => `https://blockchain.info/rawaddr/${address}?limit=50`,
    blockstream: (address) => `https://blockstream.info/api/address/${address}`,
    blockstreamTxs: (address) => `https://blockstream.info/api/address/${address}/txs`,
    mempool: (address) => `https://mempool.space/api/address/${address}`
};

document.addEventListener('DOMContentLoaded', async function () {
    loadSavedData();
    await fetchBitcoinPrice();
    await loadAllWalletsData();
    renderWalletList();
    renderNetworkGraph();
    loadNotes();

    // Mettre à jour périodiquement
    setInterval(async () => {
        await updateWalletData(selectedWallet);
    }, 300000); // Toutes les 5 minutes
});

async function fetchBitcoinPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        window.BTC_PRICE = data.bitcoin.usd;
    } catch (error) {
        console.error('Erreur prix BTC:', error);
        window.BTC_PRICE = 45000;
    }
}

async function loadAllWalletsData() {
    const loadingPromises = WALLETS_TO_TRACK.map(async (address, index) => {
        // Vérifier si on a déjà des données sauvegardées
        const savedWallet = investigationData.wallets.find(w => w.address === address);
        if (savedWallet && (Date.now() - new Date(savedWallet.lastFetched).getTime() < 300000)) {
            return savedWallet; // Données récentes, on les garde
        }

        return await fetchWalletData(address, index);
    });

    investigationData.wallets = await Promise.all(loadingPromises);
    saveInvestigationData();
}

async function fetchWalletData(address, index) {
    try {
        // Utiliser Blockstream API (CORS friendly)
        const response = await fetch(API_ENDPOINTS.blockstream(address));
        if (!response.ok) throw new Error('API error');

        const data = await response.json();

        // Récupérer les transactions
        const txsResponse = await fetch(API_ENDPOINTS.blockstreamTxs(address));
        const txsData = await txsResponse.json();

        // Calculer la balance
        const balanceBTC = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
        const balanceEUR = (balanceBTC * window.BTC_PRICE * 0.92).toFixed(2); // Conversion USD->EUR

        // Analyser les transactions
        const transactions = await analyzeTransactions(txsData, address);

        // Détecter le risque
        const risk = detectRiskLevel(data, transactions);

        // Créer alias basé sur le comportement
        const alias = generateWalletAlias(address, data, index);

        return {
            address: address,
            alias: alias,
            balance: balanceBTC.toFixed(8) + ' BTC',
            balanceEUR: balanceEUR + ' €',
            incomingTx: data.chain_stats.tx_count - data.chain_stats.spent_txo_count,
            outgoingTx: data.chain_stats.spent_txo_count,
            risk: risk,
            transactions: transactions.slice(0, 20), // 20 dernières transactions
            lastFetched: new Date().toISOString(),
            rawData: data // Garder les données brutes
        };

    } catch (error) {
        console.error(`Erreur fetch ${address}:`, error);
        return createFallbackWallet(address, index);
    }
}

async function analyzeTransactions(txsData, address) {
    const transactions = [];

    txsData.slice(0, 20).forEach(tx => {
        // Transactions entrantes
        tx.vout.forEach(output => {
            if (output.scriptpubkey_address === address) {
                tx.vin.forEach(input => {
                    if (input.prevout && input.prevout.scriptpubkey_address) {
                        transactions.push({
                            type: 'incoming',
                            amount: (input.prevout.value / 100000000).toFixed(8) + ' BTC',
                            from: input.prevout.scriptpubkey_address,
                            to: address,
                            timestamp: new Date(tx.status.block_time * 1000).toLocaleString('fr-FR'),
                            hash: tx.txid
                        });
                    }
                });
            }
        });

        // Transactions sortantes
        tx.vin.forEach(input => {
            if (input.prevout && input.prevout.scriptpubkey_address === address) {
                tx.vout.forEach(output => {
                    if (output.scriptpubkey_address && output.scriptpubkey_address !== address) {
                        transactions.push({
                            type: 'outgoing',
                            amount: (output.value / 100000000).toFixed(8) + ' BTC',
                            from: address,
                            to: output.scriptpubkey_address,
                            timestamp: new Date(tx.status.block_time * 1000).toLocaleString('fr-FR'),
                            hash: tx.txid
                        });
                    }
                });
            }
        });
    });

    return transactions;
}

function detectRiskLevel(walletData, transactions) {
    const balanceBTC = (walletData.chain_stats.funded_txo_sum - walletData.chain_stats.spent_txo_sum) / 100000000;
    const txCount = walletData.chain_stats.tx_count;

    if (balanceBTC > 10) return 'critical';
    if (balanceBTC > 1) return 'high';
    if (txCount > 100) return 'medium';
    return 'low';
}

function generateWalletAlias(address, data, index) {
    const balanceBTC = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;

    if (index === 0) return '🔄 Wallet source (arnaque)';
    if (balanceBTC > 20) return '💰 WALLET PRINCIPAL (' + balanceBTC.toFixed(1) + ' BTC)';
    if (balanceBTC > 1) return '📦 Wallet concentration';
    return '🔄 Wallet intermédiaire';
}

function createFallbackWallet(address, index) {
    const aliases = [
        '🔄 Wallet source (arnaque)',
        '📤 Wallet intermédiaire 1',
        '📤 Wallet intermédiaire 2',
        '💰 WALLET PRINCIPAL (à vérifier)'
    ];

    return {
        address: address,
        alias: aliases[index] || 'Wallet inconnu',
        balance: '? BTC',
        balanceEUR: '? €',
        incomingTx: 0,
        outgoingTx: 0,
        risk: 'medium',
        transactions: [],
        lastFetched: new Date().toISOString(),
        needsUpdate: true
    };
}

async function updateWalletData(walletIndex) {
    if (walletIndex === null || walletIndex === undefined) return;

    const wallet = investigationData.wallets[walletIndex];
    const updatedData = await fetchWalletData(wallet.address, walletIndex);

    investigationData.wallets[walletIndex] = {
        ...wallet,
        ...updatedData
    };

    saveInvestigationData();

    if (selectedWallet === walletIndex) {
        renderWalletList();
        renderTimeline();
        renderChart();
    }
}

// Les fonctions renderWalletList, renderNetworkGraph, etc. restent les mêmes
// mais utilisent maintenant investigationData.wallets qui contient les VRAIES données

function renderWalletList() {
    const container = document.getElementById('walletList');
    container.innerHTML = '';

    if (investigationData.wallets.length === 0) {
        container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div>Chargement des données blockchain...</div>
                        <div style="margin-top: 20px; font-size: 0.9rem;">
                            Connexion à Blockstream API
                        </div>
                    </div>
                `;
        return;
    }

    investigationData.wallets.forEach((wallet, index) => {
        const walletElement = document.createElement('div');
        walletElement.className = `wallet-item ${selectedWallet === index ? 'active' : ''}`;
        walletElement.innerHTML = `
                    <div class="wallet-address">${wallet.address}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${wallet.alias}</strong>
                            <span class="risk-badge risk-${wallet.risk}">${wallet.risk.toUpperCase()}</span>
                            ${wallet.needsUpdate ? '<span style="background: #ff9800; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; margin-left: 8px;">MÀJ REQUISE</span>' : ''}
                        </div>
                        <div style="text-align: right;">
                            <div><strong>${wallet.balance}</strong></div>
                            <div style="font-size: 0.9rem; color: #666;">${wallet.balanceEUR}</div>
                        </div>
                    </div>
                    <div class="wallet-stats">
                        <div class="stat">
                            <div class="stat-label">TX Entrantes</div>
                            <div class="stat-value">${wallet.incomingTx}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">TX Sortantes</div>
                            <div class="stat-value">${wallet.outgoingTx}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Total TX</div>
                            <div class="stat-value">${wallet.incomingTx + wallet.outgoingTx}</div>
                        </div>
                    </div>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: #888; text-align: right;">
                        MAJ: ${new Date(wallet.lastFetched).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                `;

        walletElement.onclick = () => selectWallet(index);
        container.appendChild(walletElement);
    });
}

function selectWallet(index) {
    selectedWallet = index;
    renderWalletList();
    renderTimeline();
    renderChart();
}

function renderTimeline() {
    const container = document.getElementById('transactionTimeline');
    container.innerHTML = '';

    if (selectedWallet === null || !investigationData.wallets[selectedWallet]) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Sélectionnez un wallet pour voir ses transactions</div>';
        return;
    }

    const wallet = investigationData.wallets[selectedWallet];

    if (wallet.transactions.length === 0) {
        container.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #666;">
                        Aucune transaction récente
                        ${wallet.needsUpdate ? '<br><button class="btn" style="margin-top: 10px;" onclick="updateWalletData(' + selectedWallet + ')">Forcer la mise à jour</button>' : ''}
                    </div>
                `;
        return;
    }

    wallet.transactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = `timeline-item ${tx.type}`;

        // Raccourcir les adresses pour l'affichage
        const shortFrom = tx.from.length > 20 ? tx.from.substring(0, 10) + '...' + tx.from.substring(tx.from.length - 10) : tx.from;
        const shortTo = tx.to.length > 20 ? tx.to.substring(0, 10) + '...' + tx.to.substring(tx.to.length - 10) : tx.to;

        item.innerHTML = `
                    <div class="timeline-content">
                        <div class="transaction-amount">
                            ${tx.type === 'incoming' ? '⬇️ Entrant: ' : '⬆️ Sortant: '}
                            ${tx.amount}
                        </div>
                        <div class="transaction-from-to">
                            ${tx.type === 'incoming' ? `De: ${shortFrom}` : `Vers: ${shortTo}`}
                        </div>
                        <div class="timestamp">${tx.timestamp}</div>
                        <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">
                            Hash: ${tx.hash.substring(0, 20)}...
                        </div>
                    </div>
                `;

        // Ajouter un clic pour voir la transaction
        item.style.cursor = 'pointer';
        item.onclick = () => window.open(`https://blockstream.info/tx/${tx.hash}`, '_blank');

        container.appendChild(item);
    });
}

function renderNetworkGraph() {
    const container = document.getElementById('network');

    if (investigationData.wallets.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Chargement du réseau...</div>';
        return;
    }

    const nodes = [];
    const edges = [];

    investigationData.wallets.forEach((wallet, index) => {
        const balanceBTC = parseFloat(wallet.balance.split(' ')[0]);
        const isBigWallet = balanceBTC > 1 || wallet.risk === 'critical';

        nodes.push({
            id: wallet.address,
            label: `${wallet.alias.split(' ')[0]}\n${wallet.balance}`,
            color: getRiskColor(wallet.risk),
            shape: isBigWallet ? 'star' : 'dot',
            size: isBigWallet ? 30 : 20 + Math.min(balanceBTC * 2, 20),
            font: { size: 14, face: 'Montserrat' },
            title: `${wallet.alias}\n${wallet.balance} (${wallet.balanceEUR})\nTX: ${wallet.incomingTx + wallet.outgoingTx}`
        });
    });

    // Créer des connexions basées sur les transactions
    investigationData.wallets.forEach(wallet => {
        wallet.transactions.forEach(tx => {
            if (tx.type === 'outgoing') {
                // Vérifier si le destinataire est dans notre liste
                const targetWallet = investigationData.wallets.find(w => w.address === tx.to);
                if (targetWallet) {
                    edges.push({
                        from: wallet.address,
                        to: tx.to,
                        label: tx.amount,
                        arrows: 'to',
                        color: '#ff4444',
                        width: Math.min(parseFloat(tx.amount) * 10, 5)
                    });
                }
            }
        });
    });

    const data = { nodes, edges };
    const options = {
        nodes: {
            shapeProperties: { borderDashes: false }
        },
        edges: {
            smooth: { type: 'continuous' },
            arrows: { to: { enabled: true, scaleFactor: 0.8 } }
        },
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 100,
                springConstant: 0.08
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };

    if (network) {
        network.destroy();
    }
    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const walletIndex = investigationData.wallets.findIndex(w => w.address === params.nodes[0]);
            if (walletIndex > -1) {
                selectWallet(walletIndex);
            }
        }
    });
}

function getRiskColor(risk) {
    switch (risk) {
        case 'critical': return '#ff0000';
        case 'high': return '#ff6b00';
        case 'medium': return '#ffd600';
        case 'low': return '#4caf50';
        default: return '#9e9e9e';
    }
}

// Les autres fonctions (saveInvestigationData, loadSavedData, etc.) restent similaires
// mais adaptées pour gérer les données dynamiques

function saveInvestigationData() {
    investigationData.metadata.lastUpdated = new Date().toISOString();
    localStorage.setItem('bitcoinInvestigation', JSON.stringify(investigationData));
}

function loadSavedData() {
    const saved = localStorage.getItem('bitcoinInvestigation');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Fusionner avec les wallets trackés
        investigationData.wallets = parsed.wallets || [];
        investigationData.metadata = parsed.metadata || investigationData.metadata;
    }
}

// ... (le reste des fonctions utilitaires reste inchangé)


/* Données de l'enquête test
const investigationData = {
    metadata: {
        caseName: "ENZO - Arnaque Ramp Network",
        startDate: "2024-11-23",
        investigator: "Enquêteur Bitcoin",
        lastUpdated: new Date().toISOString()
    },
    wallets: [
        {
            address: "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp",
            alias: "Wallet source (arnaque)",
            balance: "0.15 BTC",
            balanceEUR: "6,750 €",
            incomingTx: 1,
            outgoingTx: 3,
            risk: "high",
            notes: "Wallet créé pour l'arnaque - one shot use",
            transactions: [
                { type: "incoming", amount: "0.15 BTC", from: "arnaque", to: "this", timestamp: "2024-11-23 19:17", hash: "abc123" },
                { type: "outgoing", amount: "0.05 BTC", from: "this", to: "bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj", timestamp: "2024-11-23 19:30", hash: "def456" },
                { type: "outgoing", amount: "0.05 BTC", from: "this", to: "bc1qzjv5s09zuepsaj808jlxcjcvhw7nprr9kytwej", timestamp: "2024-11-23 19:31", hash: "ghi789" },
                { type: "outgoing", amount: "0.05 BTC", from: "this", to: "other_wallet", timestamp: "2024-11-23 19:32", hash: "jkl012" }
            ]
        },
        {
            address: "bc1q69lrvcrwnv7sqjxyuq2rtu7e5st8z39kphfhsj",
            alias: "Wallet intermédiaire 1",
            balance: "0.05 BTC",
            balanceEUR: "2,250 €",
            incomingTx: 1,
            outgoingTx: 2,
            risk: "medium",
            notes: "Redistribution vers d'autres wallets",
            transactions: [
                { type: "incoming", amount: "0.05 BTC", from: "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp", to: "this", timestamp: "2024-11-23 19:30", hash: "def456" },
                { type: "outgoing", amount: "0.02 BTC", from: "this", to: "next_wallet", timestamp: "2024-11-23 19:45", hash: "mno345" }
            ]
        },
        {
            address: "bc1qzjv5s09zuepsaj808jlxcjcvhw7nprr9kytwej",
            alias: "Wallet intermédiaire 2",
            balance: "0.05 BTC",
            balanceEUR: "2,250 €",
            incomingTx: 1,
            outgoingTx: 1,
            risk: "medium",
            notes: "Redistribution",
            transactions: [
                { type: "incoming", amount: "0.05 BTC", from: "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp", to: "this", timestamp: "2024-11-23 19:31", hash: "ghi789" }
            ]
        },
        {
            address: "bc1q202lj4yklsyz5m4krtt95qfnlppuha5rydueyc",
            alias: "WALLET PRINCIPAL (27 BTC)",
            balance: "27 BTC",
            balanceEUR: "1,215,000 €",
            incomingTx: 26,
            outgoingTx: 8,
            risk: "critical",
            kyc: "À identifier",
            notes: "Wallet de concentration - 26 wallets reliés - Potentiel KYC",
            transactions: [
                { type: "incoming", amount: "1.5 BTC", from: "wallet_x", to: "this", timestamp: "2024-11-22", hash: "pqr678" },
                { type: "incoming", amount: "2.3 BTC", from: "wallet_y", to: "this", timestamp: "2024-11-21", hash: "stu901" }
            ]
        }
    ],
    notes: "Pattern identifié : création de wallet one-shot par arnaque → redistribution multiple → concentration sur wallet principal. Recherche de KYC sur le wallet principal de 27 BTC.",
    patterns: {
        oneShotWallets: true,
        multipleRedistribution: true,
        concentrationWallet: true,
        possibleKYC: true
    }
};

// Initialisation
let network = null;
let selectedWallet = null;

document.addEventListener('DOMContentLoaded', function () {
    loadInvestigationData();
    renderWalletList();
    renderNetworkGraph();
    renderTimeline();
    renderChart();
    loadNotes();
});

// Fonctions principales
function loadInvestigationData() {
    const savedData = localStorage.getItem('bitcoinInvestigation');
    if (savedData) {
        Object.assign(investigationData, JSON.parse(savedData));
    }
}

function saveInvestigationData() {
    localStorage.setItem('bitcoinInvestigation', JSON.stringify(investigationData));
    investigationData.metadata.lastUpdated = new Date().toISOString();
}

function renderWalletList() {
    const container = document.getElementById('walletList');
    container.innerHTML = '';

    investigationData.wallets.forEach((wallet, index) => {
        const walletElement = document.createElement('div');
        walletElement.className = `wallet-item ${selectedWallet === index ? 'active' : ''}`;
        walletElement.innerHTML = `
                    <div class="wallet-address">${wallet.address}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${wallet.alias}</strong>
                            <span class="risk-badge risk-${wallet.risk}">${wallet.risk.toUpperCase()}</span>
                            ${wallet.kyc ? '<span class="kyc-flag">KYC POTENTIEL</span>' : ''}
                        </div>
                        <div style="text-align: right;">
                            <div><strong>${wallet.balance}</strong></div>
                            <div style="font-size: 0.9rem; color: #666;">${wallet.balanceEUR}</div>
                        </div>
                    </div>
                    <div class="wallet-stats">
                        <div class="stat">
                            <div class="stat-label">TX Entrantes</div>
                            <div class="stat-value">${wallet.incomingTx}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">TX Sortantes</div>
                            <div class="stat-value">${wallet.outgoingTx}</div>
                        </div>
                        <div class="stat">
                            <div class="stat-label">Total</div>
                            <div class="stat-value">${wallet.incomingTx + wallet.outgoingTx}</div>
                        </div>
                    </div>
                    ${wallet.notes ? `<div style="margin-top: 10px; font-size: 0.9rem; color: #666; background: #f0f0f0; padding: 8px; border-radius: 4px;">${wallet.notes}</div>` : ''}
                `;

        walletElement.onclick = () => selectWallet(index);
        container.appendChild(walletElement);
    });
}

function selectWallet(index) {
    selectedWallet = index;
    renderWalletList();
    renderTimeline();
    renderChart();
}

function renderNetworkGraph() {
    const nodes = [];
    const edges = [];

    // Création des nœuds
    investigationData.wallets.forEach((wallet, index) => {
        const isBigWallet = wallet.balance.includes('27 BTC') || wallet.balance.includes('10 BTC');
        nodes.push({
            id: wallet.address,
            label: wallet.alias.split(' ')[0] + '\n' + wallet.balance,
            color: wallet.risk === 'critical' ? '#ff4444' :
                wallet.risk === 'high' ? '#ff8800' :
                    wallet.risk === 'medium' ? '#ffbb33' : '#33b5e5',
            shape: isBigWallet ? 'star' : 'dot',
            size: isBigWallet ? 30 : 20,
            font: { size: 14, face: 'Montserrat' }
        });
    });

    // Création des arêtes (connexions)
    investigationData.wallets.forEach(wallet => {
        wallet.transactions.forEach(tx => {
            if (tx.type === 'outgoing' && tx.to !== 'this') {
                edges.push({
                    from: wallet.address,
                    to: tx.to.includes('bc1') ? tx.to : wallet.address, // Pour démo
                    label: tx.amount,
                    arrows: 'to',
                    color: '#ff4444',
                    width: 2
                });
            }
        });
    });

    // Configuration du réseau
    const container = document.getElementById('network');
    const data = { nodes, edges };
    const options = {
        nodes: {
            shape: 'dot',
            font: { size: 14, face: 'Montserrat' },
            borderWidth: 2
        },
        edges: {
            width: 2,
            arrows: { to: { enabled: true, scaleFactor: 0.5 } },
            font: { size: 12, background: 'white' }
        },
        physics: {
            enabled: true,
            stabilization: { iterations: 100 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 300
        }
    };

    if (network) {
        network.destroy();
    }
    network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const walletIndex = investigationData.wallets.findIndex(w => w.address === params.nodes[0]);
            if (walletIndex > -1) {
                selectWallet(walletIndex);
            }
        }
    });
}

function renderTimeline() {
    const container = document.getElementById('transactionTimeline');
    container.innerHTML = '';

    if (selectedWallet === null) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Sélectionnez un wallet pour voir ses transactions</div>';
        return;
    }

    const wallet = investigationData.wallets[selectedWallet];

    wallet.transactions.forEach(tx => {
        const item = document.createElement('div');
        item.className = `timeline-item ${tx.type}`;
        item.innerHTML = `
                    <div class="timeline-content">
                        <div class="transaction-amount">${tx.type === 'incoming' ? '⬇️ ' : '⬆️ '}${tx.amount}</div>
                        <div class="transaction-from-to">
                            ${tx.type === 'incoming' ? `De: ${tx.from}` : `Vers: ${tx.to}`}
                        </div>
                        <div class="timestamp">${tx.timestamp}</div>
                    </div>
                `;
        container.appendChild(item);
    });
}

function renderChart() {
    const ctx = document.getElementById('walletChart').getContext('2d');

    if (window.walletChart instanceof Chart) {
        window.walletChart.destroy();
    }

    if (selectedWallet === null) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#666';
        ctx.textAlign = 'center';
        ctx.fillText('Sélectionnez un wallet', ctx.canvas.width / 2, ctx.canvas.height / 2);
        return;
    }

    const wallet = investigationData.wallets[selectedWallet];

    window.walletChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Balance BTC', 'TX Entrantes', 'TX Sortantes'],
            datasets: [{
                label: 'Statistiques',
                data: [
                    parseFloat(wallet.balance.split(' ')[0]),
                    wallet.incomingTx,
                    wallet.outgoingTx
                ],
                backgroundColor: [
                    'rgba(255, 87, 34, 0.8)',
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderColor: [
                    'rgb(255, 87, 34)',
                    'rgb(76, 175, 80)',
                    'rgb(244, 67, 54)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: {
                    display: true,
                    text: `Statistiques: ${wallet.alias}`,
                    font: { size: 16, family: 'Montserrat' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.1)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function loadNotes() {
    const savedNotes = localStorage.getItem('investigationNotes');
    if (savedNotes) {
        document.getElementById('investigationNotes').value = savedNotes;
    } else {
        document.getElementById('investigationNotes').value = investigationData.notes;
    }

    document.getElementById('investigationNotes').addEventListener('input', function () {
        localStorage.setItem('investigationNotes', this.value);
        investigationData.notes = this.value;
        saveInvestigationData();
    });
}

// Fonctions utilitaires
function openInBlockchain() {
    if (selectedWallet !== null) {
        const wallet = investigationData.wallets[selectedWallet];
        window.open(`https://blockchain.com/explorer/addresses/btc/${wallet.address}`, '_blank');
    } else {
        window.open('https://blockchain.com/explorer', '_blank');
    }
}

function openInBlockstream() {
    if (selectedWallet !== null) {
        const wallet = investigationData.wallets[selectedWallet];
        window.open(`https://blockstream.info/address/${wallet.address}`, '_blank');
    } else {
        window.open('https://blockstream.info', '_blank');
    }
}

function openInMempool() {
    if (selectedWallet !== null) {
        const wallet = investigationData.wallets[selectedWallet];
        window.open(`https://mempool.space/address/${wallet.address}`, '_blank');
    } else {
        window.open('https://mempool.space', '_blank');
    }
}

function exportToPDF() {
    alert('Fonction PDF à implémenter avec une bibliothèque comme jsPDF');
    // Implémentation possible avec jsPDF
}

function exportToJSON() {
    const dataStr = JSON.stringify(investigationData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enquete-bitcoin-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    alert('Dossier exporté en JSON');
}

function addNewWallet() {
    const address = prompt('Adresse Bitcoin du nouveau wallet:');
    if (address && address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
        const alias = prompt('Alias/Description du wallet:');

        investigationData.wallets.push({
            address: address,
            alias: alias || 'Nouveau wallet',
            balance: '0 BTC',
            balanceEUR: '0 €',
            incomingTx: 0,
            outgoingTx: 0,
            risk: 'medium',
            notes: 'Ajouté manuellement',
            transactions: []
        });

        saveInvestigationData();
        renderWalletList();
        renderNetworkGraph();
        alert('Wallet ajouté à l\'enquête');
    } else if (address) {
        alert('Adresse Bitcoin invalide');
    }
}

function clearLocalData() {
    if (confirm('Voulez-vous vraiment effacer toutes les données locales ?')) {
        localStorage.clear();
        location.reload();
    }
}

// Mise à jour automatique
setInterval(() => {
    const now = new Date();
    document.querySelector('footer p:first-child').textContent =
        `Enquête initiée le 23 Novembre • Dernière mise à jour: ${now.toLocaleTimeString('fr-FR')}`;
}, 60000);
*/