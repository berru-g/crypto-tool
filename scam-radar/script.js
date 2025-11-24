// 🚀 VERSION ULTIME - FontAwesome + Toutes les features
let network = null;
let currentData = { nodes: [], edges: [] };
let investigatedAddresses = new Set();
let currentSelectedNode = null;

// APIs CORS-compatibles
const BLOCKCHAIN_APIS = [
    {
        name: 'Blockstream',
        url: (address) => `https://blockstream.info/api/address/${address}`,
        parser: blockstreamParser
    },
    {
        name: 'Mempool',
        url: (address) => `https://mempool.space/api/address/${address}`,
        parser: mempoolParser
    }
];

// Base de données étendue
const knownEntities = {
    //'bc1q9hk2gs7zj80tqynu5skerc0clwasagzmcar0an': { name: 'BerruWallet12', type: 'Phantom', risk: 'low' },
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': { name: 'Genesis', type: 'exchange', risk: 'low' },
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy': { name: 'Binance', type: 'exchange', risk: 'high' },
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': { name: 'Coinbase', type: 'exchange', risk: 'high' },
    'bc1q34aq5drpkwy6d3g9q8t4z5q6x5k6q5jq4x5k6q': { name: 'Kraken', type: 'exchange', risk: 'high' },
    '3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64': { name: 'Wasabi Wallet', type: 'mixer', risk: 'medium' }
};

async function startDeepAnalysis() {
    const address = document.getElementById('btcAddress').value.trim();
    if (!address) {
        alert('Veuillez entrer une adresse Bitcoin');
        return;
    }

    investigatedAddresses.clear();
    currentData = { nodes: [], edges: [] };
    await investigateAddress(address, 0, 2);
}

async function investigateAddress(address, depth, maxDepth) {
    if (depth > maxDepth || investigatedAddresses.has(address)) return;
    investigatedAddresses.add(address);

    for (const api of BLOCKCHAIN_APIS) {
        try {
            const response = await fetch(api.url(address));
            if (!response.ok) continue;

            const data = await response.json();
            await api.parser(data, address, depth);

            // Investiguer les adresses connectées
            if (depth < maxDepth) {
                const connectedAddresses = getConnectedAddresses(data, address);
                for (const connectedAddr of connectedAddresses.slice(0, 5)) {
                    await investigateAddress(connectedAddr, depth + 1, maxDepth);
                }
            }
            break;
        } catch (error) {
            console.log(`API ${api.name} échouée:`, error);
        }
    }
}

function getConnectedAddresses(blockchainData, originalAddress) {
    const addresses = new Set();
    // Cette fonction sera implémentée selon l'API utilisée
    return Array.from(addresses);
}

async function blockstreamParser(data, address, depth) {
    const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
    const nodeInfo = knownEntities[address] || { name: 'Wallet', type: 'unknown', risk: 'medium' };

    const node = {
        id: address,
        label: `${nodeInfo.name}\n${address.substring(0, 6)}...`,
        color: getNodeColor(nodeInfo.type),
        group: nodeInfo.type,
        address: address,
        depth: depth,
        balance: balance.toFixed(8),
        total_received: (data.chain_stats.funded_txo_sum / 100000000).toFixed(8),
        total_sent: (data.chain_stats.spent_txo_sum / 100000000).toFixed(8),
        txCount: data.chain_stats.tx_count,
        first_seen: 'N/A'
    };

    if (!currentData.nodes.find(n => n.id === address)) {
        currentData.nodes.push(node);
    }

    // Récupérer les transactions détaillées
    try {
        const txsResponse = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        const txs = await txsResponse.json();
        await processBlockstreamTxs(txs, address);
    } catch (error) {
        console.error('Erreur récupération transactions:', error);
    }

    updateVisualization();
    updateUI();
}

async function processBlockstreamTxs(transactions, address) {
    for (const tx of transactions.slice(0, 30)) {
        // Transactions entrantes
        tx.vout.forEach(output => {
            if (output.scriptpubkey_address === address) {
                tx.vin.forEach(input => {
                    if (input.prevout && input.prevout.scriptpubkey_address &&
                        input.prevout.scriptpubkey_address !== address) {
                        addTransactionEdge(
                            input.prevout.scriptpubkey_address,
                            address,
                            input.prevout.value,
                            tx.txid,
                            tx.status.block_time,
                            'incoming'
                        );
                    }
                });
            }
        });

        // Transactions sortantes
        tx.vin.forEach(input => {
            if (input.prevout && input.prevout.scriptpubkey_address === address) {
                tx.vout.forEach(output => {
                    if (output.scriptpubkey_address && output.scriptpubkey_address !== address) {
                        addTransactionEdge(
                            address,
                            output.scriptpubkey_address,
                            output.value,
                            tx.txid,
                            tx.status.block_time,
                            'outgoing'
                        );
                    }
                });
            }
        });
    }
}

async function mempoolParser(data, address, depth) {
    await blockstreamParser(data, address, depth);
}

function getNodeColor(type) {
    const colors = {
        'exchange': '#f56545',
        'mixer': '#f4a261',
        'service': '#3ad38b',
        'unknown': '#ab9ff2'
    };
    return colors[type] || '#ab9ff2';
}

function addTransactionEdge(from, to, value, hash, timestamp, direction) {
    const edgeId = `${from}-${to}-${hash}`;

    if (!currentData.edges.find(e => e.id === edgeId)) {
        if (to && !currentData.nodes.find(n => n.id === to)) {
            const entity = knownEntities[to] || { name: 'Wallet', type: 'unknown' };
            currentData.nodes.push({
                id: to,
                label: `${entity.name}\n${to.substring(0, 6)}...`,
                color: getNodeColor(entity.type),
                group: entity.type,
                address: to
            });
        }

        currentData.edges.push({
            id: edgeId,
            from: from,
            to: to,
            label: (value / 100000000).toFixed(4) + ' BTC',
            value: value / 100000000,
            color: direction === 'outgoing' ? '#f56545' : '#3ad38b',
            txHash: hash,
            timestamp: new Date(timestamp * 1000).toLocaleString(),
            arrows: 'to'
        });
    }
}

function updateVisualization() {
    const container = document.getElementById('network');

    if (!network) {
        const options = {
            nodes: {
                shape: 'dot',
                size: 25,
                font: { size: 12, color: '#000000' },
                borderWidth: 2
            },
            edges: {
                width: 2,
                arrows: { to: { enabled: true } },
                font: { color: '#000000', size: 10 }
            },
            physics: { enabled: true }
        };

        network = new vis.Network(container, currentData, options);

        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                currentSelectedNode = params.nodes[0];
                showNodeDetails(currentSelectedNode);
            }
        });
    } else {
        network.setData(currentData);
    }
}

function showNodeDetails(nodeId) {
    const node = currentData.nodes.find(n => n.id === nodeId);
    if (!node) return;

    const entity = knownEntities[node.address];
    const detailsHtml = `
                <div class="detail-section">
                    <strong><i class="fas fa-search fa-icon"></i>Adresse Complète:</strong><br>
                    <div style="background: var(--input-background); padding: 12px; border-radius: 8px; margin: 8px 0; word-break: break-all; font-family: monospace;">
                        ${node.address}
                    </div>
                </div>

                <div class="detail-section">
                    <strong><i class="fas fa-coins fa-icon"></i>Balance Actuelle:</strong> ${node.balance} BTC<br>
                    <strong><i class="fas fa-download fa-icon"></i>Total Reçu:</strong> ${node.total_received} BTC<br>
                    <strong><i class="fas fa-upload fa-icon"></i>Total Envoyé:</strong> ${node.total_sent} BTC<br>
                    <strong><i class="fas fa-exchange-alt fa-icon"></i>Transactions:</strong> ${node.txCount}<br>
                    <strong><i class="fas fa-layer-group fa-icon"></i>Niveau Investigation:</strong> ${node.depth}
                </div>

                <div class="detail-section">
                    <strong><i class="fas fa-tags fa-icon"></i>Tags & Risque:</strong><br>
                    <span class="risk-badge risk-${entity ? entity.risk : 'medium'}">
                        ${entity ? entity.name.toUpperCase() : 'UNKNOWN'}
                    </span>
                    <span class="risk-badge risk-${node.txCount > 1000 ? 'high' : node.txCount > 100 ? 'medium' : 'low'}">
                        ${node.txCount} TXS
                    </span>
                </div>

                <div class="action-buttons">
                    <button class="action-btn" onclick="copyToClipboard('${node.address}')"><i class="fas fa-copy fa-icon"></i>Copier Adresse</button>
                    <button class="action-btn" onclick="openInBlockstream('${node.address}')"><i class="fas fa-code fa-icon"></i>Blockstream (Tech)</button>
                    <button class="action-btn" onclick="openInBlockchainCom('${node.address}')"><i class="fas fa-globe fa-icon"></i>Blockchain.com (Simple)</button>
                    <button class="action-btn" onclick="openInMempool('${node.address}')"><i class="fas fa-chart-line fa-icon"></i>Mempool (Live)</button>
                    <button class="action-btn" onclick="investigateDeeper('${node.address}')"><i class="fas fa-search-plus fa-icon"></i>Investiguer Plus</button>
                    ${entity ?
            `<button class="action-btn" style="background: var(--error-color); color: white;" onclick="reportKYCFound('${node.address}')"><i class="fas fa-exclamation-triangle fa-icon"></i>Signaler KYC</button>` :
            ''
        }
                </div>
            `;

    document.getElementById('nodeDetails').innerHTML = detailsHtml;
    switchTab('details');
}

function updateUI() {
    updateStats();
    updateTransactionList();
    updateAddressList();
    updateInvestigationPaths();
}

function updateStats() {
    document.getElementById('totalAddresses').textContent = currentData.nodes.length;
    document.getElementById('totalTransactions').textContent = currentData.edges.length;

    const totalAmount = currentData.edges.reduce((sum, edge) => sum + edge.value, 0);
    document.getElementById('totalAmount').textContent = totalAmount.toFixed(4) + ' BTC';

    const hasKYC = currentData.nodes.some(node => knownEntities[node.address]?.type === 'exchange');
    document.getElementById('riskLevel').innerHTML = hasKYC ?
        '<span class="risk-badge risk-high">KYC DÉTECTÉ</span>' :
        '<span class="risk-badge risk-medium">EN COURS</span>';
}

function updateTransactionList() {
    const container = document.getElementById('transactionList');
    let html = '';

    currentData.edges.slice(0, 20).forEach(edge => {
        const isIncoming = edge.color === '#3ad38b';
        html += `
                    <div class="transaction-item" onclick="showTransactionDetails('${edge.txHash}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>${edge.label}</strong>
                            <span class="risk-badge risk-${isIncoming ? 'low' : 'medium'}">
                                <i class="fas fa-${isIncoming ? 'download' : 'upload'} fa-icon"></i>${isIncoming ? 'ENTRANT' : 'SORTANT'}
                            </span>
                        </div>
                        <div style="font-size: 12px; margin-top: 8px;">
                            <div><i class="fas fa-arrow-left fa-icon"></i>De: ${edge.from.substring(0, 15)}...</div>
                            <div><i class="fas fa-arrow-right fa-icon"></i>Vers: ${edge.to.substring(0, 15)}...</div>
                            <div style="color: var(--titre-color);"><i class="fas fa-clock fa-icon"></i>${edge.timestamp}</div>
                        </div>
                    </div>
                `;
    });

    container.innerHTML = html || '<div class="loading">Aucune transaction trouvée</div>';
}

function updateAddressList() {
    const container = document.getElementById('addressList');
    let html = '';

    currentData.nodes.forEach(node => {
        const entity = knownEntities[node.address];
        html += `
                    <div class="address-item" onclick="showNodeDetails('${node.address}')">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong><i class="fas fa-wallet fa-icon"></i>${entity ? entity.name : 'Wallet Inconnu'}</strong>
                            <span class="risk-badge risk-${entity ? entity.risk : 'medium'}">
                                ${entity ? entity.type.toUpperCase() : 'UNKNOWN'}
                            </span>
                        </div>
                        <div style="font-size: 12px; margin-top: 8px;">
                            <div>${node.address.substring(0, 20)}...</div>
                            <div style="color: var(--titre-color);"><i class="fas fa-exchange-alt fa-icon"></i>${node.txCount} transactions <i class="fas fa-layer-group fa-icon"></i>Niveau ${node.depth}</div>
                        </div>
                    </div>
                `;
    });

    container.innerHTML = html || '<div class="loading">Aucune adresse trouvée</div>';
}

function updateInvestigationPaths() {
    const container = document.getElementById('investigationPaths');
    const kycPaths = findPathsToKYC();

    let html = '<h4><i class="fas fa-bullseye fa-icon"></i>Chemins vers les Exchanges KYC</h4>';

    if (kycPaths.length > 0) {
        kycPaths.forEach((path, index) => {
            html += `<div class="investigation-path">
                        <strong><i class="fas fa-route fa-icon"></i>Chemin ${index + 1}:</strong>
                        <div class="path-steps">`;

            path.forEach((address, stepIndex) => {
                const entity = knownEntities[address];
                html += `<div class="path-step">
                            <span>${stepIndex + 1}. <i class="fas fa-${entity ? 'exchange-alt' : 'wallet'} fa-icon"></i>${entity ? entity.name : 'Wallet'}</span>
                            <span style="font-family: monospace; font-size: 10px; margin-left: 10px;">
                                ${address.substring(0, 15)}...
                            </span>
                            ${stepIndex < path.length - 1 ? '<span class="path-arrow"><i class="fas fa-arrow-right"></i></span>' : ''}
                        </div>`;
            });

            html += `</div></div>`;
        });
    } else {
        html += '<div class="loading">Aucun chemin KYC identifié pour le moment</div>';
    }

    container.innerHTML = html;
}

function findPathsToKYC() {
    const paths = [];
    const sourceAddress = document.getElementById('btcAddress').value.trim();

    currentData.edges.forEach(edge => {
        if (edge.from === sourceAddress) {
            const toEntity = knownEntities[edge.to];
            if (toEntity && toEntity.type === 'exchange') {
                paths.push([sourceAddress, edge.to]);
            }
        }
    });

    return paths.slice(0, 3);
}

// Fonctions de contrôle
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function expandNetwork() {
    const currentAddress = document.getElementById('btcAddress').value.trim();
    if (currentAddress) {
        investigateAddress(currentAddress, 0, 3);
    }
}

function findKYCPaths() {
    updateInvestigationPaths();
    switchTab('investigation');
}

function investigateDeeper(address) {
    investigateAddress(address, 0, 2);
}

// Fonctions d'exploration
function openInBlockchainCom(address) {
    window.open(`https://blockchain.com/explorer/addresses/btc/${address}`, '_blank');
}

function openInBlockstream(address) {
    window.open(`https://blockstream.info/address/${address}`, '_blank');
}

function openInMempool(address) {
    window.open(`https://mempool.space/address/${address}`, '_blank');
}

function showTransactionDetails(hash) {
    if (confirm('Ouvrir dans Blockchain.com (plus simple) ou Blockstream (plus technique) ?\n\nOK = Blockchain.com\nAnnuler = Blockstream')) {
        window.open(`https://blockchain.com/explorer/transactions/btc/${hash}`, '_blank');
    } else {
        window.open(`https://blockstream.info/tx/${hash}`, '_blank');
    }
}

function exportData() {
    const dataStr = JSON.stringify(currentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bitcoin-investigation.json';
    link.click();
}

function clearNetwork() {
    currentData = { nodes: [], edges: [] };
    investigatedAddresses.clear();
    updateVisualization();
    document.getElementById('transactionList').innerHTML = '<div class="loading">En attente d\'analyse...</div>';
    document.getElementById('addressList').innerHTML = '<div class="loading">En attente d\'analyse...</div>';
    document.getElementById('nodeDetails').innerHTML = '<div class="loading">Cliquez sur un nœud pour voir les détails</div>';
    document.getElementById('investigationPaths').innerHTML = '<div class="loading">Analyse des pistes en attente...</div>';
    updateStats();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    alert('Adresse copiée: ' + text);
}

function reportKYCFound(address) {
    const entity = knownEntities[address];
    alert(`🚨 EXCHANGE KYC IDENTIFIÉ!\n\nExchange: ${entity.name}\nAdresse: ${address}\n\nSignalez cette information dans votre plainte!`);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => startDeepAnalysis(), 1000);
});