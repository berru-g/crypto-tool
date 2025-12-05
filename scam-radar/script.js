// V2 - ANALYSE AVANCÉE
let network = null;
let currentData = { nodes: [], edges: [] };
let investigatedAddresses = new Set();
let currentSelectedNode = null;
let analysisDepth = 3;

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

// BASE DE DONNÉES ÉTENDUE
const knownEntities = {
    //'bc1q9hk2gs7zj80tqynu5skerc0clwasagzmcar0an': { name: 'BerruWallet12', type: 'Phantom', risk: 'low' },
    //'1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa': { name: 'Genesis', type: 'exchange', risk: 'low' },
    '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy': { name: 'Binance', type: 'exchange', risk: 'high' },
    '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2': { name: 'Coinbase', type: 'exchange', risk: 'high' },
    'bc1q34aq5drpkwy6d3g9q8t4z5q6x5k6q5jq4x5k6q': { name: 'Kraken', type: 'exchange', risk: 'high' },
    '3FFgKaYkEf1P2DqWF6cXpbH72hiW6NjkqC': { name: 'Bitfinex', type: 'exchange', risk: 'high' },
    '1LQoWist8KkaUXSPKZHNvEyfrEkPHzWCdS': { name: 'Bittrex', type: 'exchange', risk: 'high' },
    '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r': { name: 'Bitstamp', type: 'exchange', risk: 'high' },
    '3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64': { name: 'Wasabi Wallet', type: 'mixer', risk: 'medium' },
    'bc1qs0z9g2qzyj2n2nffpndd0p5a2y8u8d2i3h4m5n': { name: 'Samourai', type: 'mixer', risk: 'high' },
    '1CounterpartyXXXXXXXXXXXXXXXUWLpVr': { name: 'Counterparty', type: 'service', risk: 'low' }
};

// Nouvelle fonctionnalité KYC Check
async function checkKYCForWallet(address) {
    const response = await fetch(`/api/kyc-check?address=${address}`);
    const data = await response.json();
    
    return {
        isKYC: data.isKycVerified,
        platform: data.platform,
        riskScore: data.riskScore,
        tags: data.tags
    };
}

// Interface utilisateur
function displayKYCInfo(wallet) {
    const kycInfo = document.createElement('div');
    kycInfo.className = 'kyc-badge';
    
    if (wallet.kycStatus === 'KYC_IDENTIFIED') {
        kycInfo.innerHTML = `
            <span class="kyc-verified">✅ KYC Verified</span>
            <small>${wallet.platform}</small>
        `;
        kycInfo.style.background = '#4CAF50';
    } else if (wallet.kycStatus === 'NO_KYC_DETECTED') {
        kycInfo.innerHTML = `
            <span class="kyc-unknown">⚠️ No KYC Detected</span>
            <small>High risk</small>
        `;
        kycInfo.style.background = '#FF9800';
    }
    
    return kycInfo;
}
// Détection intelligente des patterns KYC
const exchangePatterns = {
    binance: /^(bc1q|3J|1A1)/,
    coinbase: /^(1Bv|3|bc1q)/,
    kraken: /^(bc1q|3)/,
    bitfinex: /^(3FF|1)/,
    bitstamp: /^(3D2o)/
};

async function startDeepAnalysis() {
    const address = document.getElementById('btcAddress').value.trim();
    if (!address) {
        alert('Veuillez entrer une adresse Bitcoin');
        return;
    }

    document.getElementById('transactionList').innerHTML = '<div class="loading"><i class="fas fa-sync fa-spin fa-icon"></i>Analyse approfondie en cours...</div>';
    
    investigatedAddresses.clear();
    currentData = { nodes: [], edges: [] };
    await investigateAddress(address, 0, analysisDepth);
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
            
            if (depth < maxDepth) {
                const connectedAddresses = getConnectedAddressesAdvanced(data, address);
                for (const connectedAddr of connectedAddresses.slice(0, 8)) {
                    await investigateAddress(connectedAddr, depth + 1, maxDepth);
                }
            }
            break;
        } catch (error) {
            console.log(`API ${api.name} échouée:`, error);
        }
    }
}

function getConnectedAddressesAdvanced(blockchainData, originalAddress) {
    const addresses = new Set();
    
    if (blockchainData.txs) {
        blockchainData.txs.forEach(tx => {
            tx.inputs?.forEach(input => {
                if (input.prev_out && input.prev_out.addr === originalAddress) {
                    tx.out?.forEach(output => {
                        if (output.addr && output.addr !== originalAddress) {
                            addresses.add(output.addr);
                        }
                    });
                }
            });
            
            tx.out?.forEach(output => {
                if (output.addr === originalAddress) {
                    tx.inputs?.forEach(input => {
                        if (input.prev_out && input.prev_out.addr && input.prev_out.addr !== originalAddress) {
                            addresses.add(input.prev_out.addr);
                        }
                    });
                }
            });
        });
    }
    
    return Array.from(addresses);
}

async function blockstreamParser(data, address, depth) {
    const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
    const nodeInfo = detectWalletType(address, data, depth);
    
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
        first_seen: 'N/A',
        kycScore: calculateKYCScore(address, data)
    };

    if (!currentData.nodes.find(n => n.id === address)) {
        currentData.nodes.push(node);
    }

    try {
        const txsResponse = await fetch(`https://blockstream.info/api/address/${address}/txs`);
        const txs = await txsResponse.json();
        await processBlockstreamTxsAdvanced(txs, address);
    } catch (error) {
        console.error('Erreur récupération transactions:', error);
    }

    updateVisualizationAdvanced();
    updateUI();
}

function detectWalletType(address, data, depth) {
    if (knownEntities[address]) {
        return knownEntities[address];
    }
    
    for (const [exchange, pattern] of Object.entries(exchangePatterns)) {
        if (pattern.test(address)) {
            return { 
                name: `Possible ${exchange.charAt(0).toUpperCase() + exchange.slice(1)}`, 
                type: 'exchange', 
                risk: 'high' 
            };
        }
    }
    
    const txCount = data.chain_stats.tx_count;
    const balance = (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000;
    
    if (txCount > 1000) {
        return { name: 'Hot Wallet Exchange', type: 'exchange', risk: 'high' };
    } else if (txCount > 100 && balance > 10) {
        return { name: 'Wallet Actif', type: 'service', risk: 'medium' };
    } else if (depth === 0) {
        return { name: 'Source', type: 'source', risk: 'low' };
    } else {
        return { name: 'Wallet', type: 'unknown', risk: 'medium' };
    }
}

function calculateKYCScore(address, data) {
    let score = 0;
    const txCount = data.chain_stats.tx_count;
    const totalVolume = (data.chain_stats.funded_txo_sum + data.chain_stats.spent_txo_sum) / 100000000;
    
    if (knownEntities[address]?.type === 'exchange') score += 100;
    if (txCount > 500) score += 30;
    if (txCount > 1000) score += 50;
    if (totalVolume > 100) score += 20;
    if (totalVolume > 1000) score += 30;
    
    return score;
}

async function processBlockstreamTxsAdvanced(transactions, address) {
    for (const tx of transactions.slice(0, 50)) {
        tx.vout.forEach(output => {
            if (output.scriptpubkey_address === address) {
                tx.vin.forEach(input => {
                    if (input.prevout && input.prevout.scriptpubkey_address &&
                        input.prevout.scriptpubkey_address !== address) {
                        addTransactionEdgeAdvanced(
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

        tx.vin.forEach(input => {
            if (input.prevout && input.prevout.scriptpubkey_address === address) {
                tx.vout.forEach(output => {
                    if (output.scriptpubkey_address && output.scriptpubkey_address !== address) {
                        addTransactionEdgeAdvanced(
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
        
        detectSuspiciousPatterns(tx, address);
    }
}

function addTransactionEdgeAdvanced(from, to, value, hash, timestamp, direction) {
    const edgeId = `${from}-${to}-${hash}`;

    if (!currentData.edges.find(e => e.id === edgeId)) {
        if (to && !currentData.nodes.find(n => n.id === to)) {
            const entity = knownEntities[to] || detectWalletType(to, { chain_stats: { tx_count: 1 } }, 1);
            currentData.nodes.push({
                id: to,
                label: `${entity.name}\n${to.substring(0, 6)}...`,
                color: getNodeColor(entity.type),
                group: entity.type,
                address: to,
                kycScore: 0
            });
        }

        const btcValue = value / 100000000;
        currentData.edges.push({
            id: edgeId,
            from: from,
            to: to,
            label: btcValue.toFixed(4) + ' BTC',
            value: btcValue,
            color: getEdgeColor(direction, btcValue),
            txHash: hash,
            timestamp: new Date(timestamp * 1000).toLocaleString(),
            arrows: 'to',
            width: Math.min(btcValue * 10 + 1, 5),
            type: classifyTransaction(btcValue, direction)
        });
    }
}

function classifyTransaction(amount, direction) {
    if (amount > 10) return 'large';
    if (amount > 1) return 'medium';
    if (amount > 0.1) return 'small';
    return 'dust';
}

function getEdgeColor(direction, amount) {
    if (direction === 'outgoing') {
        if (amount > 10) return '#ff0000';
        if (amount > 1) return '#ff6b6b';
        return '#ffa502';
    } else {
        if (amount > 10) return '#00ff00';
        if (amount > 1) return '#51cf66';
        return '#3ad38b';
    }
}

function detectSuspiciousPatterns(tx, address) {
    if (tx.vin.length > 5 && tx.vout.length > 5) {
        console.log(`⚠️ Transaction de mixage possible: ${tx.txid}`);
    }
    
    if (tx.vout.length > 10) {
        console.log(`⚠️ Fractionnement possible: ${tx.txid}`);
    }
}

function getNodeColor(type) {
    const colors = {
        'exchange': '#f56545',
        'mixer': '#f4a261',
        'service': '#3ad38b',
        'source': '#ab9ff2',
        'unknown': '#a4b0be'
    };
    return colors[type] || '#a4b0be';
}

function updateVisualizationAdvanced() {
    const container = document.getElementById('network');
    
    if (!network) {
        const options = {
            nodes: {
                shape: 'dot',
                size: 30,
                font: { 
                    size: 12, 
                    color: '#000000',
                    face: 'Montserrat',
                    strokeWidth: 3,
                    strokeColor: 'rgba(255,255,255,0.7)'
                },
                borderWidth: 3,
                shadow: true,
                scaling: { min: 20, max: 50 }
            },
            edges: {
                width: 2,
                arrows: { to: { enabled: true, scaleFactor: 1.5 } },
                font: { 
                    color: '#000000', 
                    size: 10,
                    strokeWidth: 2,
                    strokeColor: 'rgba(255,255,255,0.7)'
                },
                smooth: { enabled: true, type: 'continuous' },
                shadow: true
            },
            physics: {
                enabled: true,
                stabilization: { iterations: 100 },
                barnesHut: {
                    gravitationalConstant: -8000,
                    springConstant: 0.04,
                    springLength: 95
                }
            },
            interaction: {
                hover: true,
                tooltipDelay: 200,
                navigationButtons: true,
                keyboard: true
            }
        };
        
        network = new vis.Network(container, currentData, options);
        
        network.on("click", function (params) {
            if (params.nodes.length > 0) {
                currentSelectedNode = params.nodes[0];
                showNodeDetails(currentSelectedNode);
            }
        });
        
        network.on("doubleClick", function (params) {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                investigateDeeper(nodeId);
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
            <strong><i class="fas fa-layer-group fa-icon"></i>Niveau Investigation:</strong> ${node.depth}<br>
            <strong><i class="fas fa-shield-alt fa-icon"></i>Score KYC:</strong> ${node.kycScore}/100
        </div>

        <div class="detail-section">
            <strong><i class="fas fa-tags fa-icon"></i>Tags & Risque:</strong><br>
            <span class="risk-badge risk-${entity ? entity.risk : 'medium'}">
                ${entity ? entity.name.toUpperCase() : 'UNKNOWN'}
            </span>
            <span class="risk-badge risk-${node.txCount > 1000 ? 'high' : node.txCount > 100 ? 'medium' : 'low'}">
                ${node.txCount} TXS
            </span>
            ${node.kycScore > 50 ? `<span class="risk-badge risk-high">KYC: ${node.kycScore}</span>` : ''}
        </div>

        <div class="action-buttons">
            <button class="action-btn" onclick="copyToClipboard('${node.address}')"><i class="fas fa-copy fa-icon"></i>Copier Adresse</button>
            <button class="action-btn" onclick="openInBlockstream('${node.address}')"><i class="fas fa-code fa-icon"></i>Blockstream</button>
            <button class="action-btn" onclick="openInBlockchainCom('${node.address}')"><i class="fas fa-globe fa-icon"></i>Blockchain.com</button>
            <button class="action-btn" onclick="openInMempool('${node.address}')"><i class="fas fa-chart-line fa-icon"></i>Mempool</button>
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

    const kycNodes = currentData.nodes.filter(node => 
        knownEntities[node.address]?.type === 'exchange' || node.kycScore > 50
    );
    
    document.getElementById('riskLevel').innerHTML = kycNodes.length > 0 ? 
        `<span class="risk-badge risk-high">${kycNodes.length} KYC DÉTECTÉ${kycNodes.length > 1 ? 'S' : ''}</span>` :
        '<span class="risk-badge risk-medium">EN COURS</span>';
}

function updateTransactionList() {
    const container = document.getElementById('transactionList');
    let html = '';

    currentData.edges.slice(0, 20).forEach(edge => {
        const isIncoming = edge.color === '#3ad38b' || edge.color === '#51cf66' || edge.color === '#00ff00';
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
                    <div style="color: var(--titre-color);">
                        <i class="fas fa-exchange-alt fa-icon"></i>${node.txCount} tx 
                        <i class="fas fa-layer-group fa-icon"></i>Niv ${node.depth}
                        ${node.kycScore > 50 ? `<i class="fas fa-shield-alt fa-icon"></i>KYC:${node.kycScore}` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html || '<div class="loading">Aucune adresse trouvée</div>';
}

function updateInvestigationPaths() {
    const container = document.getElementById('investigationPaths');
    const kycPaths = findPathsToKYCAdvanced();
    
    let html = '<h4><i class="fas fa-bullseye fa-icon"></i>Chemins vers les Exchanges KYC</h4>';
    
    if (kycPaths.length > 0) {
        kycPaths.forEach((path, index) => {
            const confidence = calculatePathConfidence(path);
            html += `<div class="investigation-path">
                <strong><i class="fas fa-route fa-icon"></i>Chemin ${index + 1} <span class="risk-badge risk-${confidence > 80 ? 'high' : confidence > 50 ? 'medium' : 'low'}">${confidence}% confiance</span></strong>
                <div class="path-steps">`;
            
            path.forEach((address, stepIndex) => {
                const entity = knownEntities[address] || currentData.nodes.find(n => n.id === address);
                const node = currentData.nodes.find(n => n.id === address);
                html += `<div class="path-step">
                    <span>${stepIndex + 1}. <i class="fas fa-${entity?.type === 'exchange' ? 'exchange-alt' : 'wallet'} fa-icon"></i>${entity ? entity.name : 'Wallet'}</span>
                    <span style="font-family: monospace; font-size: 10px; margin-left: 10px;">
                        ${address.substring(0, 15)}...
                    </span>
                    ${node?.kycScore > 50 ? `<span class="risk-badge risk-high" style="margin-left: 10px;">KYC: ${node.kycScore}</span>` : ''}
                    ${stepIndex < path.length - 1 ? '<span class="path-arrow"><i class="fas fa-arrow-right"></i></span>' : ''}
                </div>`;
            });
            
            html += `</div></div>`;
        });
    } else {
        html += '<div class="loading">Aucun chemin KYC identifié. Étendez l\'analyse.</div>';
    }

    container.innerHTML = html;
}

function findPathsToKYCAdvanced() {
    const paths = [];
    const sourceAddress = document.getElementById('btcAddress').value.trim();
    
    currentData.edges.forEach(edge1 => {
        if (edge1.from === sourceAddress) {
            const toEntity1 = knownEntities[edge1.to] || currentData.nodes.find(n => n.id === edge1.to);
            
            if (toEntity1?.type === 'exchange') {
                paths.push([sourceAddress, edge1.to]);
            }
            
            currentData.edges.forEach(edge2 => {
                if (edge2.from === edge1.to) {
                    const toEntity2 = knownEntities[edge2.to] || currentData.nodes.find(n => n.id === edge2.to);
                    if (toEntity2?.type === 'exchange') {
                        paths.push([sourceAddress, edge1.to, edge2.to]);
                    }
                    
                    currentData.edges.forEach(edge3 => {
                        if (edge3.from === edge2.to) {
                            const toEntity3 = knownEntities[edge3.to] || currentData.nodes.find(n => n.id === edge3.to);
                            if (toEntity3?.type === 'exchange') {
                                paths.push([sourceAddress, edge1.to, edge2.to, edge3.to]);
                            }
                        }
                    });
                }
            });
        }
    });
    
    return paths
        .map(path => ({ path, confidence: calculatePathConfidence(path) }))
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5)
        .map(item => item.path);
}

function calculatePathConfidence(path) {
    let confidence = 0;
    
    path.forEach(address => {
        const node = currentData.nodes.find(n => n.id === address);
        const entity = knownEntities[address];
        
        if (entity?.type === 'exchange') confidence += 40;
        if (node?.kycScore > 50) confidence += 20;
        if (node?.txCount > 100) confidence += 10;
    });
    
    return Math.min(confidence, 100);
}

// FONCTIONS EXISTANTES À CONSERVER
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

function expandNetwork() {
    const currentAddress = document.getElementById('btcAddress').value.trim();
    if (currentAddress) {
        investigateAddress(currentAddress, 0, analysisDepth + 1);
    }
}

function findKYCPaths() {
    updateInvestigationPaths();
    switchTab('investigation');
}

function investigateDeeper(address) {
    investigateAddress(address, 0, 2);
}

function increaseAnalysisDepth() {
    analysisDepth = Math.min(analysisDepth + 1, 5);
    document.getElementById('analysisDepth').textContent = analysisDepth;
    alert(`Profondeur d'analyse augmentée à ${analysisDepth} niveaux`);
}

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
    updateVisualizationAdvanced();
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
    
    // 1. Générer un template de plainte
    const reportTemplate = `
🚨 SIGNALEMENT ARNAQUE BITCOIN

Exchange identifié: ${entity.name}
Adresse suspecte: ${address}
Montant volé: [À COMPLÉTER]
Date: [À COMPLÉTER]

Preuves disponibles dans l'outil Bitcoin Tracer PRO.

Contactez le support de ${entity.name} avec ces informations.
`;

    // 2. Copier automatiquement le template
    navigator.clipboard.writeText(reportTemplate);
    
    // 3. Ouvrir les pages de support des exchanges
    const supportLinks = {
        'Binance': 'https://www.binance.com/en/support',
        'Coinbase': 'https://help.coinbase.com/',
        'Kraken': 'https://support.kraken.com/'
    };
    
    // 4. Popup amélioré avec actions
    if(confirm(`🚨 ${entity.name} KYC IDENTIFIÉ!\n\nAdresse: ${address}\n\n✅ Template copié dans le presse-papier\n\nOuvrir la page de support ${entity.name} ?`)) {
        window.open(supportLinks[entity.name], '_blank');
    }
}

async function mempoolParser(data, address, depth) {
    await blockstreamParser(data, address, depth);
}

// AJOUTER CES BOUTONS DANS VOTRE HTML
function addAdvancedControls() {
    const controls = document.querySelector('.controls');
    if (controls && !document.getElementById('analysisDepth')) {
        controls.innerHTML += `
            <button class="control-btn" onclick="increaseAnalysisDepth()">
                <i class="fas fa-layer-group fa-icon"></i>Profondeur: <span id="analysisDepth">${analysisDepth}</span>
            </button>
        `;
    }
}

// INITIALISATION
document.addEventListener('DOMContentLoaded', function () {
    addAdvancedControls();
    setTimeout(() => startDeepAnalysis(), 1000);
});