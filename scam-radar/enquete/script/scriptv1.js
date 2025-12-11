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
    "bc1q9wvygkq7h9xgcp59mc6ghzczrqlgrj9k3ey9tz"
];

let network = null;
let selectedWallet = null;
let physicsEnabled = true;

// INITIALISATION
document.addEventListener('DOMContentLoaded', function () {
    loadSavedData();
    initializeWallets();
    renderWalletList();
    renderNetwork();
    loadNotes();
    updateStats();
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
        balance: "? BTC",
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
                            <div><strong>Balance:</strong> ${wallet.balance}</div>
                            <div><strong>TX:</strong> ${wallet.incomingTx + wallet.outgoingTx}</div>
                        </div>
                        <div style="font-size: 0.85rem; color: #888;">
                            Ajouté: ${new Date(wallet.addedDate).toLocaleDateString('fr-FR')}
                        </div>
                        ${wallet.notes ? `<div style="margin-top: 10px; padding: 8px; background: #f0f0f0; border-radius: 4px; font-size: 0.85rem;">${wallet.notes}</div>` : ''}
                    </div>
                    
                    <div class="wallet-actions">
                        <a href="https://blockchain.com/explorer/addresses/btc/${wallet.address}" target="_blank" class="action-btn">
                            <i class="fa-solid fa-magnifying-glass"></i> Blockchain.com
                        </a>
                        <a href="https://blockstream.info/address/${wallet.address}" target="_blank" class="action-btn">
                            📊 Blockstream
                        </a>
                        <a href="https://www.crypto-free-tools.netlify.app/scam-radar/?address=${wallet.address}" target="_blank" class="action-btn">
                            🎯 Scam Radar
                        </a>
                        <button class="action-btn" onclick="removeWallet(${index})">
                            🗑️ Supprimer
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

// CARTE DES CONNEXIONS
function renderNetwork() {
    const container = document.getElementById('network');

    if (investigationData.wallets.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">Ajoutez des wallets pour voir la carte</div>';
        return;
    }

    const nodes = [];
    const edges = [];

    // Créer les nœuds
    investigationData.wallets.forEach((wallet, index) => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;

        let nodeColor = '#4caf50'; // Vert par défaut (faible)
        let nodeShape = 'dot';
        let nodeSize = 20;

        // Déterminer la couleur et la taille par risque/solde
        if (balance > 10) {
            nodeColor = '#f44336'; // Rouge (critique)
            nodeSize = 40;
            nodeShape = 'star';
        } else if (balance > 1) {
            nodeColor = '#ff5722'; // Orange (élevé)
            nodeSize = 30;
            nodeShape = 'dot';
        } else if (balance > 0.1) {
            nodeColor = '#ff9800'; // Jaune (moyen)
            nodeSize = 25;
            nodeShape = 'dot';
        }

        // Wallet source spécial
        if (wallet.address === "bc1qujeavxy7wu4tdr45rfph590h4u6ayt45n827yp") {
            nodeColor = '#283593'; // Violet
            nodeShape = 'diamond';
            nodeSize = 35;
        }

        nodes.push({
            id: wallet.address,
            label: `${wallet.alias.split(' ')[0]}\n${wallet.balance}`,
            color: nodeColor,
            shape: nodeShape,
            size: nodeSize,
            font: {
                size: 14,
                face: 'Montserrat',
                color: '#000000',
                strokeWidth: 3,
                strokeColor: 'rgba(255,255,255,0.7)'
            },
            borderWidth: 2,
            shadow: true,
            title: `
                    <div style="padding: 10px; font-family: Montserrat;">
                        <strong>${wallet.alias}</strong><br>
                        ${wallet.address}<br>
                        Balance: ${wallet.balance}<br>
                        Transactions: ${wallet.incomingTx + wallet.outgoingTx}<br>
                        Risque: ${wallet.risk}<br>
                        <a href="https://blockchain.com/explorer/addresses/btc/${wallet.address}" target="_blank" style="color: #1a237e;"><i class="fa-solid fa-magnifying-glass"></i> Explorer</a>
                    </div>
                    `
        });
    });

    // Créer les connexions (basées sur les patterns d'arnaque)
    // Pour l'instant, connexions factices basées sur l'ordre d'ajout
    for (let i = 0; i < investigationData.wallets.length - 1; i++) {
        edges.push({
            from: investigationData.wallets[i].address,
            to: investigationData.wallets[i + 1].address,
            arrows: 'to',
            color: { color: '#666', opacity: 0.6 },
            width: 2,
            smooth: { enabled: true, type: 'continuous' },
            label: '→',
            font: { size: 12 }
        });
    }

    // Ajouter des connexions supplémentaires pour les gros wallets
    investigationData.wallets.forEach(wallet => {
        if (parseFloat(wallet.balance.split(' ')[0]) > 5) {
            investigationData.wallets.forEach(otherWallet => {
                if (wallet.address !== otherWallet.address &&
                    parseFloat(otherWallet.balance.split(' ')[0]) < 1) {
                    edges.push({
                        from: otherWallet.address,
                        to: wallet.address,
                        arrows: 'to',
                        color: { color: '#ff5722', opacity: 0.4 },
                        width: 1,
                        dashes: true
                    });
                }
            });
        }
    });

    const data = { nodes, edges };
    const options = {
        nodes: {
            shapeProperties: {
                useBorderWithImage: true,
                interpolation: false
            }
        },
        edges: {
            smooth: {
                enabled: true,
                type: 'continuous',
                roundness: 0.5
            },
            arrows: {
                to: {
                    enabled: true,
                    scaleFactor: 0.8,
                    type: 'arrow'
                }
            }
        },
        physics: {
            enabled: physicsEnabled,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -100,
                centralGravity: 0.01,
                springLength: 150,
                springConstant: 0.08,
                damping: 0.4,
                avoidOverlap: 1
            },
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 100
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            navigationButtons: true,
            keyboard: {
                enabled: true,
                speed: { x: 10, y: 10, zoom: 0.03 }
            }
        },
        layout: {
            improvedLayout: true
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
        network.fit({ animation: { duration: 1000, easingFunction: 'easeInOutQuad' } });
    }, 500);
}

// FONCTIONS UTILITAIRES
function updateStats() {
    const totalBTC = investigationData.wallets.reduce((sum, wallet) => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
        return sum + balance;
    }, 0);

    const criticalWallets = investigationData.wallets.filter(wallet =>
        parseFloat(wallet.balance.split(' ')[0]) > 10
    ).length;

    document.getElementById('totalWallets').textContent = investigationData.wallets.length;
    document.getElementById('totalConnections').textContent = Math.max(0, investigationData.wallets.length - 1);
    document.getElementById('totalBTC').textContent = totalBTC.toFixed(2) + ' BTC';
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
        totalBTC: investigationData.wallets.reduce((sum, w) => sum + (parseFloat(w.balance.split(' ')[0]) || 0), 0)
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

// SIMULATION