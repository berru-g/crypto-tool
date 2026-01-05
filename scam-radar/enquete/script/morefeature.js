// ============================================================================
// AMÉLIORATIONS SCAM RADAR - AJOUTS SANS CONFLITS
// ============================================================================

// 1. DIAGRAMME AMÉLIORÉ STYLE JSONCRACK
let extendedWalletsData = new Map(); // Map pour stocker les données étendues

function enhanceNetworkVisualization() {
    if (!network) return;

    // Améliorer les options de visualisation
    network.setOptions({
        nodes: {
            shapeProperties: {
                useBorderWithImage: true,
                interpolation: false,
                borderDashes: false,
            },
            scaling: {
                min: 20,
                max: 80, // Augmenter la taille max
                label: {
                    enabled: true,
                    min: 12,
                    max: 18,
                    maxVisible: 20
                }
            },
            shape: 'box',
            shadow: {
                enabled: true,
                color: 'rgba(0,0,0,0.7)',
                size: 15,
                x: 5,
                y: 5
            }
        },
        edges: {
            smooth: {
                enabled: true,
                type: 'curvedCW', // Courbes plus élégantes
                roundness: 0.6
            },
            color: {
                inherit: 'from',
                opacity: 0.8
            },
            scaling: {
                min: 1,
                max: 8,
                label: {
                    enabled: true,
                    min: 8,
                    max: 20
                }
            },
            font: {
                size: 11,
                face: 'Courier New',
                color: '#ffffff',
                background: 'rgba(0,0,0,0.7)',
                strokeWidth: 2,
                strokeColor: '#000000'
            }
        },
        groups: {
            source: {
                color: { background: '#ff6b6b', border: '#ff4757' },
                shape: 'star',
                size: 60,
                font: { size: 16, color: '#ffffff', bold: true }
            },
            high: {
                color: { background: '#ff4757', border: '#ff3838' },
                shape: 'box',
                size: 50,
                font: { size: 14 }
            },
            medium: {
                color: { background: '#ffa502', border: '#ff9f1a' },
                shape: 'circle',
                size: 40,
                font: { size: 13 }
            },
            low: {
                color: { background: '#2ed573', border: '#20bf6b' },
                shape: 'ellipse',
                size: 35,
                font: { size: 12 }
            },
            external: {
                color: { background: '#a4b0be', border: '#747d8c' },
                shape: 'database',
                size: 30,
                font: { size: 11, color: '#dfe4ea' }
            }
        }
    });
}

// 2. DÉTECTION DES TRANSACTIONS EXTERNES
async function detectExternalTransactions(walletAddress, index) {
    try {
        console.log(`🔍 Analyse des transactions externes pour: ${walletAddress}`);

        const response = await fetch(`https://blockstream.info/api/address/${walletAddress}/txs`);
        if (!response.ok) return new Set();

        const txs = await response.json();
        const externalAddresses = new Set();

        // Analyser les 50 dernières transactions
        txs.slice(0, 50).forEach(tx => {
            // Adresses d'entrée (sources)
            tx.vin?.forEach(input => {
                if (input.prevout?.scriptpubkey_address) {
                    const addr = input.prevout.scriptpubkey_address;
                    // Vérifier si c'est une adresse externe (pas dans notre liste)
                    if (!investigationData.wallets.some(w => w.address === addr)) {
                        externalAddresses.add(addr);
                    }
                }
            });

            // Adresses de sortie (destinations)
            tx.vout?.forEach(output => {
                if (output.scriptpubkey_address) {
                    const addr = output.scriptpubkey_address;
                    if (!investigationData.wallets.some(w => w.address === addr)) {
                        externalAddresses.add(addr);
                    }
                }
            });
        });

        // Stocker les données étendues
        extendedWalletsData.set(walletAddress, {
            externalConnections: Array.from(externalAddresses),
            lastUpdated: new Date().toISOString(),
            totalExternal: externalAddresses.size
        });

        console.log(`✅ ${externalAddresses.size} connexions externes détectées pour ${walletAddress}`);
        return externalAddresses;

    } catch (error) {
        console.error(`❌ Erreur détection transactions externes: ${error}`);
        return new Set();
    }
}
console.log("fin des requetes!");

// 3. BOUTON POUR VISUALISER LA RECHERCHE ÉTENDUE
function addExtendedSearchButton() {
    const controls = document.querySelector('.map-controls');
    if (!controls) return;

    // Vérifier si le bouton existe déjà
    if (document.getElementById('extendedSearchBtn')) return;

    const extendedBtn = document.createElement('button');
    extendedBtn.id = 'extendedSearchBtn';
    extendedBtn.className = 'control-btn';
    extendedBtn.innerHTML = '<i class="fa-solid fa-satellite-dish"></i> ';
    extendedBtn.onclick = showExtendedSearchModal;

    // Ajouter après les autres boutons
    const exportBtn = document.querySelector('[onclick="exportNetworkImage()"]');
    if (exportBtn) {
        exportBtn.parentNode.insertBefore(extendedBtn, exportBtn.nextSibling);
    } else {
        controls.appendChild(extendedBtn);
    }
}

// 4. MODAL POUR LA RECHERCHE ÉTENDUE
function showExtendedSearchModal() {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('extendedSearchModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'extendedSearchModal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
        `;

        modal.innerHTML = `
            <div class="modal-content" style="
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                margin: 5% auto;
                padding: 0;
                border: 1px solid #74c0fc;
                width: 90%;
                max-width: 800px;
                border-radius: 15px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.7);
                color: white;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <div style="
                    background: linear-gradient(135deg, #74c0fc, #74c0fc);
                    padding: 20px;
                    border-radius: 15px 15px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <h2 style="margin: 0; font-size: 1.5rem;">
                        <i class="fa-solid fa-satellite-dish"></i> 
                    </h2>
                    <button onclick="closeExtendedSearchModal()" style="
                        background: none;
                        border: none;
                        color: white;
                        font-size: 1.5rem;
                        cursor: pointer;
                    ">&times;</button>
                </div>
                
                <div style="padding: 20px;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 10px; font-weight: 600;">
                            <i class="fa-solid fa-wallet"></i> Sélectionnez un wallet pour analyse approfondie:
                        </label>
                        <select id="extendedWalletSelect" style="
                            width: 100%;
                            padding: 12px;
                            border-radius: 8px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid #74c0fc;
                            color: grey;
                            font-size: 1rem;
                            margin-bottom: 20px;
                        ">
                            <option value="">-- Choisir un wallet --</option>
                        </select>
                    </div>
                    
                    <div id="extendedAnalysisResults" style="
                        background: rgba(0,0,0,0.3);
                        border-radius: 10px;
                        color: white;
                        padding: 20px;
                        margin-bottom: 20px;
                        min-height: 200px;
                    ">
                        <div style="text-align: center; padding: 40px; color: #666;">
                            Sélectionnez un wallet pour voir l'analyse des transactions externes
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="startExtendedAnalysis()" style="
                            background: linear-gradient(135deg, #74c0fc, #74c0fc);
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        ">
                            <i class="fa-solid fa-magnifying-glass-chart"></i> Lancer l'analyse
                        </button>
                        <button onclick="closeExtendedSearchModal()" style="
                            background: rgba(255,255,255,0.1);
                            color: white;
                            border: 1px solid #666;
                            padding: 12px 24px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                        ">
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Mettre à jour la liste des wallets
    updateExtendedWalletSelect();

    // Afficher le modal
    modal.style.display = 'block';
}

function updateExtendedWalletSelect() {
    const select = document.getElementById('extendedWalletSelect');
    if (!select) return;

    // Sauvegarder la sélection actuelle
    const currentValue = select.value;

    // Vider les options
    select.innerHTML = '<option value="">-- Choisir un wallet --</option>';

    // Ajouter les wallets
    investigationData.wallets.forEach((wallet, index) => {
        const option = document.createElement('option');
        option.value = wallet.address;
        option.textContent = `${wallet.alias} (${wallet.address.slice(0, 8)}...${wallet.address.slice(-6)})`;
        option.dataset.index = index;
        select.appendChild(option);
    });

    // Restaurer la sélection si possible
    if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
        select.value = currentValue;
    }
}

async function startExtendedAnalysis() {
    const select = document.getElementById('extendedWalletSelect');
    if (!select || !select.value) {
        alert('Veuillez sélectionner un wallet');
        return;
    }

    const walletAddress = select.value;
    const wallet = investigationData.wallets.find(w => w.address === walletAddress);
    if (!wallet) return;

    const resultsDiv = document.getElementById('extendedAnalysisResults');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2rem; color: #74c0fc; margin-bottom: 10px;">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div>Analyse en cours...</div>
            <div style="font-size: 0.9rem; color: #888; margin-top: 10px;">
                Recherche des transactions externes pour ${walletAddress.slice(0, 15)}...
            </div>
        </div>
    `;

    try {
        // Détecter les transactions externes
        const externalAddresses = await detectExternalTransactions(walletAddress);

        // Afficher les résultats
        displayExtendedResults(wallet, Array.from(externalAddresses));

    } catch (error) {
        resultsDiv.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div style="margin-top: 10px;">Erreur lors de l'analyse</div>
                <div style="font-size: 0.9rem; margin-top: 10px;">${error.message}</div>
            </div>
        `;
    }
}

function displayExtendedResults(wallet, externalAddresses) {
    const resultsDiv = document.getElementById('extendedAnalysisResults');

    if (externalAddresses.length === 0) {
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fa-solid fa-circle-check" style="font-size: 3rem; color: #2ed573; margin-bottom: 20px;"></i>
                <div style="font-size: 1.2rem; margin-bottom: 10px;">Aucune transaction externe détectée</div>
                <div>Cela peut être dû à une erreur api, vérifiez sur blockchain.com</div>
            </div>
        `;
        return;
    }

    // Grouper par nombre de transactions suspectes
    const groupedAddresses = externalAddresses.slice(0, 20); // Limiter à 20 pour la lisibilité

    resultsDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="
                background: rgba(116, 192, 252, 0.1);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #74c0fc;
            ">
                <div style="font-weight: 600; margin-bottom: 5px;">
                    <i class="fa-solid fa-chart-network"></i> 
                    ${externalAddresses.length} connexions externes détectées
                </div>
                <div style="font-size: 0.9rem; color: #aaa;">
                    Ces adresses ont transité avec ${wallet.alias} mais ne font pas partie de l'enquête initiale
                </div>
            </div>
            
            <div style="
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 10px;
            ">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="
                            background: rgba(116, 192, 252, 0.2);
                            position: sticky;
                            top: 0;
                        ">
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Adresse</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groupedAddresses.map(addr => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 10px; font-family: 'Courier New', monospace; font-size: 0.9rem;">
                                    ${addr}
                                </td>
                                <td style="padding: 10px;">
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="addExternalAddress('${addr}')" style="
                                            background: rgba(46, 213, 115, 0.2);
                                            color: #2ed573;
                                            border: 1px solid #2ed573;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 0.85rem;
                                            display: flex;
                                            align-items: center;
                                            gap: 5px;
                                        ">
                                            <i class="fa-solid fa-plus"></i> Ajouter
                                        </button>
                                        <button onclick="viewAddressExplorer('${addr}')" style="
                                            background: rgba(116, 192, 252, 0.2);
                                            color: #74c0fc;
                                            border: 1px solid #74c0fc;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 0.85rem;
                                            display: flex;
                                            align-items: center;
                                            gap: 5px;
                                        ">
                                            <i class="fa-solid fa-magnifying-glass"></i> Explorer
                                        </button>
                                        <button onclick="copyToClipboard('${addr}')" style="
                                            background: rgba(255, 107, 107, 0.2);
                                            color: #ff6b6b;
                                            border: 1px solid #ff6b6b;
                                            padding: 6px 12px;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            font-size: 0.85rem;
                                            display: flex;
                                            align-items: center;
                                            gap: 5px;
                                        ">
                                            <i class="fa-regular fa-copy"></i> Copier
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${externalAddresses.length > 20 ? `
                <div style="
                    background: rgba(255, 165, 2, 0.1);
                    padding: 12px;
                    border-radius: 6px;
                    margin-top: 15px;
                    border-left: 3px solid #ffa502;
                    font-size: 0.9rem;
                ">
                    <i class="fa-solid fa-info-circle"></i>
                    ${externalAddresses.length - 20} autres adresses détectées (affichage limité aux 20 premières)
                </div>
            ` : ''}
        </div>
    `;
}

function closeExtendedSearchModal() {
    const modal = document.getElementById('extendedSearchModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 5. FONCTIONS POUR LES ACTIONS DES BOUTONS
function addExternalAddress(address) {
    if (!address) return;

    // Vérifier si l'adresse est déjà dans la liste
    if (investigationData.wallets.some(w => w.address === address)) {
        alert('Cette adresse est déjà dans la liste');
        return;
    }

    // Ajouter le wallet
    addWallet(address);

    // Mettre à jour la sélection
    const select = document.getElementById('extendedWalletSelect');
    if (select) {
        select.value = address;
    }

    // Afficher un message de confirmation
    alert(`Adresse ${address.slice(0, 10)}... ajoutée à l'enquête`);
}

function viewAddressExplorer(address) {
    window.open(`https://blockchain.com/explorer/addresses/btc/${address}`, '_blank');
}

// 6. FONCTION DE COPIE D'ADRESSE
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Afficher une notification temporaire
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(46, 213, 115, 0.95);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;

        notification.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Adresse copiée dans le presse-papier
        `;

        document.body.appendChild(notification);

        // Supprimer après 2 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);

    }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        alert('Erreur lors de la copie');
    });
}

// 7. AMÉLIORER LE RENDU DES WALLETS POUR AJOUTER LE BOUTON COPY
function enhanceWalletCards() {
    // Cette fonction sera appelée après chaque rendu de wallet
    document.querySelectorAll('.wallet-item').forEach((item, index) => {
        const addressElement = item.querySelector('.wallet-address');
        if (addressElement && !addressElement.querySelector('.copy-btn')) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            copyBtn.title = 'Copier l\'adresse';
            copyBtn.style.cssText = `
                background: rgba(255, 107, 107, 0.1);
                color: #ff6b6b;
                border: 1px solid #ff6b6b;
                border-radius: 4px;
                padding: 4px 8px;
                cursor: pointer;
                font-size: 0.8rem;
                margin-left: 10px;
                transition: all 0.2s;
            `;

            copyBtn.onmouseover = () => {
                copyBtn.style.background = 'rgba(255, 107, 107, 0.3)';
            };

            copyBtn.onmouseout = () => {
                copyBtn.style.background = 'rgba(255, 107, 107, 0.1)';
            };

            copyBtn.onclick = (e) => {
                e.stopPropagation(); // Empêcher la sélection du wallet
                const address = addressElement.textContent;
                copyToClipboard(address);
            };

            addressElement.appendChild(copyBtn);
        }
    });
}

// 8. INTÉGRATION AVEC LE CODE EXISTANT (hooks)
function integrateEnhancements() {
    // Hook pour améliorer le rendu des wallets
    const originalRenderWalletList = window.renderWalletList;
    window.renderWalletList = function () {
        originalRenderWalletList();
        enhanceWalletCards();
    };

    // Hook pour améliorer le réseau après rendu
    const originalRenderNetwork = window.renderNetwork;
    window.renderNetwork = function () {
        originalRenderNetwork();
        setTimeout(enhanceNetworkVisualization, 10000);
    };

    // Hook pour les mises à jour de données ppp
    const originalFetchWalletData = window.fetchWalletData;
    window.fetchWalletData = async function(address, index) {
        await originalFetchWalletData(address, index);
        // Détecter aussi les transactions externes en arrière-plan
        setTimeout(() => detectExternalTransactions(address, index), 10000);
    };
    /* hook test ce fdp saute sans cesse ppp
    const originalFetchWalletData = window.fetchWalletData;
    window.fetchWalletData = async function (address, index) {
        await originalFetchWalletData(address, index);
        // Ralentir considérablement les analyses externes
        if (index % 3 === 0) { // Seulement 1 wallet sur 3
            setTimeout(() => {
                if (isNetworkStable) {
                    detectExternalTransactions(address, index);
                }
            }, 3000);
        }
    };*/

    // Ajoutez un bouton pour stabiliser manuellement
    function addStabilizeButton() {
        const controls = document.querySelector('.map-controls');
        if (!controls || document.getElementById('stabilizeBtn')) return;

        const stabilizeBtn = document.createElement('button');
        stabilizeBtn.id = 'stabilizeBtn';
        stabilizeBtn.className = 'control-btn';
        stabilizeBtn.innerHTML = '<i class="fa-solid fa-anchor"></i>';
        stabilizeBtn.title = 'Stabiliser la carte';
        stabilizeBtn.onclick = stabilizeNetwork;

        controls.appendChild(stabilizeBtn);
    }

    function stabilizeNetwork() {
        if (network) {
            isNetworkStable = false;
            network.setOptions({
                physics: {
                    enabled: true,
                    stabilization: {
                        enabled: true,
                        iterations: 500,
                        updateInterval: 50
                    }
                }
            });

            network.stabilize(500);

            setTimeout(() => {
                network.setOptions({ physics: { enabled: false } });
                isNetworkStable = true;
                alert('Carte stabilisée');
            }, 3000);
        }
    }

    // Initialisez le bouton
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(addStabilizeButton, 2000);
    });//fin de test new hook

    // Ajouter le bouton de recherche étendue
    setTimeout(addExtendedSearchButton, 500);
}

// 9. AJOUTER LES STYLES CSS NÉCESSAIRES
function addEnhancementStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        /* Styles pour le modal */
        .modal-content {
            animation: modalFadeIn 0.3s;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-50px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        /* Amélioration des tooltips du réseau */
        .vis-tooltip {
            background: rgba(30, 37, 48, 0.95) !important;
            border: 2px solid #74c0fc !important;
            border-radius: 10px !important;
            padding: 15px !important;
            color: white !important;
            font-family: 'Montserrat', sans-serif !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;
            backdrop-filter: blur(10px) !important;
            max-width: 400px !important;
        }
        
        /* Bouton de contrôle amélioré */
        #extendedSearchBtn {
            background: linear-gradient(135deg, #74c0fc, #74c0fc) !important;
            color: white !important;
            border: none !important;
        }
        
        #extendedSearchBtn:hover {
            background: linear-gradient(135deg, #74c0fc, #74c0fc) !important;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(116, 192, 252, 0.4);
        }
        
        /* Style pour les lignes du tableau */
        tbody tr:hover {
            background: rgba(116, 192, 252, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
}

// 10. INITIALISATION DES AMÉLIORATIONS
document.addEventListener('DOMContentLoaded', function () {
    // Attendre que le code original soit chargé
    setTimeout(() => {
        addEnhancementStyles();
        integrateEnhancements();
        console.log('✅ Améliorations Scam Radar chargées');
    }, 1000);
});

// ============================================================================
// FONCTIONS D'UTILITAIRE POUR L'ANALYSE AVANCÉE
// ============================================================================

// Analyse de patterns suspects
function analyzeSuspiciousPatterns() {
    const patterns = {
        mixingPatterns: [],
        highFrequency: [],
        largeTransfers: []
    };

    investigationData.wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance.split(' ')[0]) || 0;
        const totalTx = wallet.incomingTx + wallet.outgoingTx;

        // Pattern 1: Wallets avec beaucoup de transactions mais peu de balance (mixing)
        if (totalTx > 50 && balance < 0.1) {
            patterns.mixingPatterns.push({
                address: wallet.address,
                alias: wallet.alias,
                transactions: totalTx,
                balance: balance
            });
        }

        // Pattern 2: Wallets avec transactions fréquentes
        if (totalTx > 100) {
            patterns.highFrequency.push({
                address: wallet.address,
                alias: wallet.alias,
                transactions: totalTx
            });
        }

        // Pattern 3: Grands transferts
        if (balance > 10) {
            patterns.largeTransfers.push({
                address: wallet.address,
                alias: wallet.alias,
                balance: balance,
                valueUSD: balance * btcPrice
            });
        }
    });

    return patterns;
}

// Fonction pour exporter l'analyse complète
function exportCompleteAnalysis() {
    const analysis = {
        timestamp: new Date().toISOString(),
        caseName: investigationData.metadata.caseName,
        wallets: investigationData.wallets,
        extendedData: Array.from(extendedWalletsData.entries()),
        patterns: analyzeSuspiciousPatterns(),
        statistics: {
            totalWallets: investigationData.wallets.length,
            totalExternalConnections: Array.from(extendedWalletsData.values())
                .reduce((sum, data) => sum + (data.totalExternal || 0), 0),
            btcPrice: btcPrice
        }
    };

    const dataStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-complete-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Ajouter un bouton pour l'analyse complète
function addCompleteAnalysisButton() {
    setTimeout(() => {
        const controls = document.querySelector('.map-controls');
        if (!controls || document.getElementById('completeAnalysisBtn')) return;

        const analysisBtn = document.createElement('button');
        analysisBtn.id = 'completeAnalysisBtn';
        analysisBtn.className = 'control-btn';
        analysisBtn.innerHTML = '<i class="fa-solid fa-upload"></i> json';
        analysisBtn.onclick = exportCompleteAnalysis;

        controls.appendChild(analysisBtn);
    }, 1500);
}

// Initialiser le bouton d'analyse complète
document.addEventListener('DOMContentLoaded', addCompleteAnalysisButton);

// ============================================================================
// FONCTION DE DÉBOGAGE ET LOGS
// ============================================================================

function debugEnhancements() {
    console.group('🔧 Debug des améliorations Scam Radar');
    console.log('✅ Extended wallets data:', extendedWalletsData);
    console.log('✅ Network enhanced:', network !== null);
    console.log('✅ Modal available:', document.getElementById('extendedSearchModal') !== null);
    console.groupEnd();
}

// Exposer les fonctions pour le débogage
window.debugEnhancements = debugEnhancements;
window.exportCompleteAnalysis = exportCompleteAnalysis;


// ============================================================================
// AJOUTS FILTRAGE POUR AFFICHER TOUTE LES ADRESS TROUVER ET FILTRER PAR TRANSACTIONS SORTANTE 
// ============================================================================

// Variables pour le suivi des adresses externes
let externalAddressesCache = new Map();

// 1. FONCTION POUR AJOUTER TOUTES LES ADRESSES EN UNE FOIS
function addAllExternalAddresses() {
    const select = document.getElementById('extendedWalletSelect');
    if (!select || !select.value) {
        alert('Veuillez d\'abord sélectionner un wallet et lancer l\'analyse');
        return;
    }

    const walletAddress = select.value;
    const externalAddresses = externalAddressesCache.get(walletAddress);

    if (!externalAddresses || externalAddresses.length === 0) {
        alert('Aucune adresse externe disponible à ajouter');
        return;
    }

    // Demander confirmation
    if (!confirm(`Voulez-vous ajouter toutes les ${externalAddresses.length} adresses externes ?\n\nCette opération peut prendre quelques secondes.`)) {
        return;
    }

    // Afficher l'indicateur de progression
    const resultsDiv = document.getElementById('extendedAnalysisResults');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 2.5rem; color: #74c0fc; margin-bottom: 15px;">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 10px;">Ajout en cours...</div>
            <div id="addAllProgress" style="font-size: 0.9rem; color: #888;"></div>
            <div style="margin-top: 20px; width: 100%; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                <div id="addAllProgressBar" style="height: 6px; background: #74c0fc; width: 0%; transition: width 0.3s;"></div>
            </div>
        </div>
    `;

    // Ajouter les adresses une par une avec délai
    let addedCount = 0;
    let skippedCount = 0;
    const total = externalAddresses.length;

    externalAddresses.forEach((address, index) => {
        setTimeout(() => {
            // Vérifier si l'adresse existe déjà
            const exists = investigationData.wallets.some(w => w.address === address);

            if (!exists) {
                // Utiliser la fonction d'ajout existante
                addWallet(address);
                addedCount++;
            } else {
                skippedCount++;
            }

            // Mettre à jour la progression
            const progress = ((index + 1) / total) * 100;
            document.getElementById('addAllProgressBar').style.width = `${progress}%`;

            document.getElementById('addAllProgress').innerHTML = `
                <div>${index + 1}/${total} adresses traitées</div>
                <div>✅ ${addedCount} ajoutées | ⏭️ ${skippedCount} déjà présentes</div>
            `;

            // Quand tout est terminé
            if (index === total - 1) {
                setTimeout(() => {
                    resultsDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 3rem; color: #2ed573; margin-bottom: 20px;">
                                <i class="fa-solid fa-circle-check"></i>
                            </div>
                            <div style="font-size: 1.2rem; margin-bottom: 10px;">Ajout terminé !</div>
                            <div style="color: #888;">
                                ${addedCount} nouvelles adresses ajoutées<br>
                                ${skippedCount} adresses déjà suivies
                            </div>
                            <button onclick="startExtendedAnalysis()" style="
                                margin-top: 20px;
                                background: #74c0fc;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 6px;
                                cursor: pointer;
                            ">
                                <i class="fa-solid fa-rotate"></i> Rafraîchir l'analyse
                            </button>
                        </div>
                    `;

                    // Mettre à jour la carte
                    setTimeout(() => {
                        if (window.renderNetwork) {
                            window.renderNetwork();
                        }
                    }, 500);

                    alert(`✅ ${addedCount} nouvelles adresses ajoutées avec succès !`);
                }, 500);
            }
        }, index * 200); // Délai de 200ms entre chaque ajout
    });
}

// 2. FONCTION POUR AJOUTER UNIQUEMENT LES SORTIES (FOLLOW THE MONEY)
function addOnlyOutgoingAddresses() {
    const select = document.getElementById('extendedWalletSelect');
    if (!select || !select.value) {
        alert('Veuillez d\'abord sélectionner un wallet et lancer l\'analyse');
        return;
    }

    const walletAddress = select.value;

    if (!confirm(`Cette fonction analysera les transactions pour trouver uniquement les adresses qui ont reçu des fonds.\n\nVoulez-vous continuer ?`)) {
        return;
    }

    // Afficher l'indicateur de chargement
    const resultsDiv = document.getElementById('extendedAnalysisResults');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 2.5rem; color: #74c0fc; margin-bottom: 15px;">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 10px;">Analyse des transactions sortantes...</div>
            <div style="font-size: 0.9rem; color: #888;">
                Recherche des destinations de fonds
            </div>
        </div>
    `;

    // Analyser les transactions pour trouver les sorties
    analyzeOutgoingTransactionsAdvanced(walletAddress).then(outgoingAddresses => {
        // Mettre en cache pour réutilisation
        externalAddressesCache.set(walletAddress + '_outgoing', outgoingAddresses);

        if (outgoingAddresses.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <i class="fa-solid fa-circle-exclamation" style="font-size: 3rem; margin-bottom: 20px;"></i>
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">Aucune transaction sortante trouvée</div>
                    <div>Ce wallet n'a pas envoyé de fonds vers des adresses externes</div>
                </div>
            `;
            return;
        }

        // Afficher les résultats avec option d'ajout
        displayOutgoingResults(walletAddress, outgoingAddresses);
    }).catch(error => {
        console.error('Erreur analyse sortantes:', error);
        resultsDiv.innerHTML = `
            <div style="color: #ff6b6b; text-align: center; padding: 20px;">
                <i class="fa-solid fa-triangle-exclamation"></i>
                <div style="margin-top: 10px;">Erreur lors de l'analyse</div>
            </div>
        `;
    });
}

// 3. ANALYSE AVANCÉE DES TRANSACTIONS SORTANTES
async function analyzeOutgoingTransactionsAdvanced(walletAddress) {
    try {
        console.log(`🔍 Analyse détaillée des sorties pour: ${walletAddress}`);

        const response = await fetch(`https://blockstream.info/api/address/${walletAddress}/txs`);
        if (!response.ok) return [];

        const txs = await response.json();
        const outgoingAddresses = new Map(); // Utiliser Map pour éviter les doublons

        // Analyser les transactions (limité à 30 pour la performance)
        const txBatch = txs.slice(0, 30);

        for (const tx of txBatch) {
            // Vérifier si notre wallet est l'expéditeur
            const isSender = tx.vin?.some(input =>
                input.prevout?.scriptpubkey_address === walletAddress
            );

            if (isSender) {
                // Pour chaque sortie, vérifier si c'est une destination externe
                tx.vout?.forEach(output => {
                    const destAddress = output.scriptpubkey_address;

                    if (destAddress &&
                        destAddress !== walletAddress &&
                        !investigationData.wallets.some(w => w.address === destAddress)) {

                        // Stocker avec le montant pour information
                        const amountBTC = output.value / 100000000;
                        outgoingAddresses.set(destAddress, {
                            address: destAddress,
                            amount: amountBTC,
                            txId: tx.txid,
                            timestamp: tx.status?.block_time || Date.now() / 1000
                        });
                    }
                });
            }
        }

        // Convertir en tableau et trier par montant (du plus grand au plus petit)
        const sortedAddresses = Array.from(outgoingAddresses.values())
            .sort((a, b) => b.amount - a.amount)
            .map(item => item.address);

        console.log(`✅ ${sortedAddresses.length} destinations trouvées`);
        return sortedAddresses;

    } catch (error) {
        console.error('Erreur analyse sortantes avancée:', error);
        return [];
    }
}

// 4. AFFICHAGE DES RÉSULTATS DES SORTIES
function displayOutgoingResults(walletAddress, outgoingAddresses) {
    const resultsDiv = document.getElementById('extendedAnalysisResults');
    const wallet = investigationData.wallets.find(w => w.address === walletAddress);

    // Filtrer les adresses non présentes
    const newAddresses = outgoingAddresses.filter(addr =>
        !investigationData.wallets.some(w => w.address === addr)
    );

    resultsDiv.innerHTML = `
        <div style="margin-bottom: 20px;">
            <div style="
                background: rgba(255, 107, 107, 0.1);
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #ff6b6b;
            ">
                <div style="font-weight: 600; margin-bottom: 5px; color: #ff6b6b;">
                    <i class="fa-solid fa-arrow-right-from-bracket"></i> 
                    SUIVI DE L'ARGENT - ${newAddresses.length} DESTINATIONS
                </div>
                <div style="font-size: 0.9rem; color: #aaa;">
                    Adresses ayant reçu des fonds de ${wallet?.alias || walletAddress.slice(0, 10)}...
                </div>
            </div>
            
            <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: rgba(255, 107, 107, 0.2); position: sticky; top: 0;">
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ff6b6b;">Destination</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ff6b6b;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${newAddresses.slice(0, 15).map(addr => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                                <td style="padding: 10px; font-family: 'Courier New', monospace; font-size: 0.85rem;">
                                    <div style="color: #ff6b6b; font-weight: 600; margin-bottom: 2px;">
                                        <i class="fa-solid fa-arrow-right"></i> Destination
                                    </div>
                                    ${addr}
                                </td>
                                <td style="padding: 10px;">
                                    <button onclick="addExternalAddress('${addr}')" style="
                                        background: rgba(255, 107, 107, 0.2);
                                        color: #ff6b6b;
                                        border: 1px solid #ff6b6b;
                                        padding: 6px 12px;
                                        border-radius: 4px;
                                        cursor: pointer;
                                        font-size: 0.85rem;
                                        display: flex;
                                        align-items: center;
                                        gap: 5px;
                                        transition: all 0.2s;
                                    " onmouseover="this.style.background='rgba(255, 107, 107, 0.3)';"
                                    onmouseout="this.style.background='rgba(255, 107, 107, 0.2)';">
                                        <i class="fa-solid fa-plus"></i> Suivre
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            ${newAddresses.length > 15 ? `
                <div style="
                    background: rgba(255, 165, 2, 0.1);
                    padding: 10px;
                    border-radius: 6px;
                    margin-bottom: 15px;
                    border-left: 3px solid #ffa502;
                    font-size: 0.9rem;
                ">
                    <i class="fa-solid fa-info-circle"></i>
                    ${newAddresses.length - 15} autres destinations disponibles
                </div>
            ` : ''}
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="addAllFromOutgoingList()" style="
                    background: linear-gradient(135deg, #ff6b6b, #ee6055);
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(255, 107, 107, 0.3)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <i class="fa-solid fa-layer-group"></i>
                    Ajouter toutes les destinations (${newAddresses.length})
                </button>
                
                <button onclick="startExtendedAnalysis()" style="
                    background: rgba(116, 192, 252, 0.1);
                    color: #74c0fc;
                    border: 1px solid #74c0fc;
                    padding: 12px 24px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <i class="fa-solid fa-rotate"></i>
                    Retour
                </button>
            </div>
        </div>
    `;
}

// 5. FONCTION POUR AJOUTER TOUTES LES DESTINATIONS
function addAllFromOutgoingList() {
    const select = document.getElementById('extendedWalletSelect');
    if (!select || !select.value) return;

    const walletAddress = select.value;
    const outgoingAddresses = externalAddressesCache.get(walletAddress + '_outgoing');

    if (!outgoingAddresses || outgoingAddresses.length === 0) {
        alert('Aucune destination disponible');
        return;
    }

    // Filtrer les adresses non présentes
    const newAddresses = outgoingAddresses.filter(addr =>
        !investigationData.wallets.some(w => w.address === addr)
    );

    if (newAddresses.length === 0) {
        alert('Toutes les destinations sont déjà suivies');
        return;
    }

    if (!confirm(`Ajouter ${newAddresses.length} nouvelles destinations à l'enquête ?`)) {
        return;
    }

    // Afficher la progression
    const resultsDiv = document.getElementById('extendedAnalysisResults');
    resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 30px;">
            <div style="font-size: 2.5rem; color: #ff6b6b; margin-bottom: 15px;">
                <i class="fa-solid fa-spinner fa-spin"></i>
            </div>
            <div style="font-size: 1.1rem; margin-bottom: 10px;">Ajout des destinations...</div>
            <div id="outgoingProgress" style="font-size: 0.9rem; color: #888; margin-bottom: 10px;"></div>
            <div style="width: 100%; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;">
                <div id="outgoingProgressBar" style="height: 6px; background: #ff6b6b; width: 0%; transition: width 0.3s;"></div>
            </div>
        </div>
    `;

    let addedCount = 0;

    newAddresses.forEach((address, index) => {
        setTimeout(() => {
            addWallet(address);
            addedCount++;

            // Mettre à jour la progression
            const progress = ((index + 1) / newAddresses.length) * 100;
            document.getElementById('outgoingProgressBar').style.width = `${progress}%`;
            document.getElementById('outgoingProgress').innerHTML = `
                ${index + 1}/${newAddresses.length} destinations ajoutées
            `;

            // Terminé
            if (index === newAddresses.length - 1) {
                setTimeout(() => {
                    resultsDiv.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <div style="font-size: 3rem; color: #2ed573; margin-bottom: 20px;">
                                <i class="fa-solid fa-check-circle"></i>
                            </div>
                            <div style="font-size: 1.2rem; margin-bottom: 10px; color: #2ed573;">
                                Suivi activé !
                            </div>
                            <div style="color: #888;">
                                ${addedCount} nouvelles destinations ajoutées<br>
                                L'argent est maintenant tracé
                            </div>
                        </div>
                    `;

                    // Mettre à jour la carte
                    setTimeout(() => {
                        if (window.renderNetwork) {
                            window.renderNetwork();
                        }
                    }, 500);
                }, 500);
            }
        }, index * 300);
    });
}

// 6. MODIFIER LA FONCTION D'AFFICHAGE EXISTANTE POUR AJOUTER LES BOUTONS
function enhanceDisplayExtendedResults() {
    // Sauvegarder la fonction originale
    const originalDisplayExtendedResults = window.displayExtendedResults;

    window.displayExtendedResults = function (wallet, externalAddresses) {
        // Mettre en cache les adresses
        externalAddressesCache.set(wallet.address, externalAddresses);

        // Appeler la fonction originale
        originalDisplayExtendedResults(wallet, externalAddresses);

        // Ajouter les boutons supplémentaires après un délai
        setTimeout(() => {
            const resultsDiv = document.getElementById('extendedAnalysisResults');
            if (!resultsDiv) return;

            // Trouver le conteneur des boutons ou en créer un nouveau
            let buttonContainer = resultsDiv.querySelector('.enhanced-buttons');
            if (!buttonContainer) {
                buttonContainer = document.createElement('div');
                buttonContainer.className = 'enhanced-buttons';
                buttonContainer.style.cssText = `
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                `;
                resultsDiv.appendChild(buttonContainer);
            }

            // Ajouter les nouveaux boutons
            buttonContainer.innerHTML = `
                <button onclick="addAllExternalAddresses()" style="
                    background: linear-gradient(135deg, #74c0fc, #74c0fc);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    flex: 1;
                    min-width: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)';"
                onmouseout="this.style.transform='translateY(0)';">
                    <i class="fa-solid fa-layer-group"></i>
                    Ajouter toutes (${externalAddresses.length})
                </button>
                
                <button onclick="addOnlyOutgoingAddresses()" style="
                    background: linear-gradient(135deg, #ff6b6b, #ee6055);
                    color: white;
                    border: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                    flex: 1;
                    min-width: 200px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)';"
                onmouseout="this.style.transform='translateY(0)';">
                    <i class="fa-solid fa-filter"></i>
                    Suivre l'argent uniquement
                </button>
            `;
        }, 100);
    };
}

// 7. INITIALISATION DES AMÉLIORATIONS
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        // Activer les améliorations
        enhanceDisplayExtendedResults();

        // Ajouter les fonctions globales
        window.addAllExternalAddresses = addAllExternalAddresses;
        window.addOnlyOutgoingAddresses = addOnlyOutgoingAddresses;
        window.addAllFromOutgoingList = addAllFromOutgoingList;
        window.analyzeOutgoingTransactionsAdvanced = analyzeOutgoingTransactionsAdvanced;

        console.log('✅ Améliorations morefeature.js chargées');
    }, 1000);
});

// ============================================================================
// AJOUTER LE CSS POUR LES NOUVELLES FONCTIONS
// ============================================================================
const moreFeaturesStyle = document.createElement('style');
moreFeaturesStyle.textContent = `
    /* Styles pour les nouveaux boutons */
    .money-trace-button {
        background: linear-gradient(135deg, #ff6b6b, #ee6055) !important;
        color: white !important;
        border: none !important;
        position: relative;
        overflow: hidden;
    }
    
    .money-trace-button::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
    }
    
    .money-trace-button:hover::after {
        left: 100%;
    }
    
    /* Animation pour l'ajout en masse */
    @keyframes pulse-add {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .adding-address {
        animation: pulse-add 0.5s ease;
    }
    
    /* Style pour les destinations */
    .destination-address {
        background: rgba(255, 107, 107, 0.05);
        border-left: 3px solid #ff6b6b;
        padding: 8px;
        margin: 5px 0;
        border-radius: 4px;
    }
    
    /* Style pour la progression */
    .progress-container {
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        overflow: hidden;
        margin: 15px 0;
    }
    
    .progress-fill {
        height: 6px;
        background: linear-gradient(90deg, #74c0fc, #74c0fc);
        transition: width 0.3s ease;
    }
    
    .progress-fill-money {
        background: linear-gradient(90deg, #ff6b6b, #ee6055);
    }
`;
document.head.appendChild(moreFeaturesStyle);

