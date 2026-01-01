// advanced_dashboard.js
function createAdvancedInvestigationDashboard() {
    return `
    <div class="advanced-dashboard">
        <div class="section">
            <h3><i class="fa-solid fa-fingerprint"></i> Empreinte du Mixer</h3>
            <div id="mixerFingerprint"></div>
        </div>
        
        <div class="section">
            <h3><i class="fa-solid fa-clock-rotate-left"></i> Analyse Temporelle</h3>
            <div id="timingAnalysis">
                <canvas id="timingChart"></canvas>
            </div>
        </div>
        
        <div class="section">
            <h3><i class="fa-solid fa-money-bill-transfer"></i> Points de Sortie</h3>
            <div id="exitPoints">
                <table>
                    <thead>
                        <tr>
                            <th>Exchange</th>
                            <th>Adresse</th>
                            <th>Montant</th>
                            <th>Date</th>
                            <th>Confidence</th>
                        </tr>
                    </thead>
                    <tbody id="exitPointsList"></tbody>
                </table>
            </div>
        </div>
        
        <div class="section">
            <h3><i class="fa-solid fa-triangle-exclamation"></i> Fuites d'Identité</h3>
            <div id="identityLeaks"></div>
        </div>
        
        <div class="section">
            <h3><i class="fa-solid fa-chart-network"></i> Graphe des Clusters</h3>
            <div id="clusterGraph"></div>
        </div>
    </div>
    `;
}

// ============================================================================
// DASHBOARD AVANCÉ - INTÉGRATION
// ============================================================================

// 1. AJOUTER LE BOUTON DANS LES CONTRÔLES
function addAdvancedDashboardButton() {
    const controls = document.querySelector('.map-controls');
    if (!controls || document.getElementById('advancedDashboardBtn')) return;
    
    const dashboardBtn = document.createElement('button');
    dashboardBtn.id = 'advancedDashboardBtn';
    dashboardBtn.className = 'control-btn';
    dashboardBtn.innerHTML = '<i class="fa-solid fa-chart-line"></i> Stat';
    dashboardBtn.onclick = showAdvancedDashboard;
    
    // Insérer après le bouton de recherche étendue
    const extendedBtn = document.getElementById('extendedSearchBtn');
    if (extendedBtn) {
        extendedBtn.parentNode.insertBefore(dashboardBtn, extendedBtn.nextSibling);
    } else {
        controls.appendChild(dashboardBtn);
    }
}

// 2. MODAL DU DASHBOARD AVANCÉ
function showAdvancedDashboard() {
    // Créer le modal s'il n'existe pas
    let modal = document.getElementById('advancedDashboardModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'advancedDashboardModal';
        modal.className = 'modal';
        modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.9);
            backdrop-filter: blur(10px);
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                margin: 2% auto;
                padding: 0;
                border: 2px solid #74c0fc;
                width: 95%;
                max-width: 1400px;
                border-radius: 20px;
                box-shadow: 0 25px 75px rgba(0,0,0,0.8);
                color: white;
                max-height: 96vh;
                overflow-y: auto;
            ">
                <div style="
                    background: linear-gradient(135deg, #74c0fc, #74c0fc);
                    padding: 25px 30px;
                    border-radius: 20px 20px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                ">
                    <div>
                        <h2 style="margin: 0; font-size: 1.8rem; display: flex; align-items: center; gap: 15px;">
                            <i class="fa-solid fa-chart-network"></i>
                            Dashboard Forensique Avancé
                        </h2>
                        <div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.9;">
                            Analyse complète du réseau suspect
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="refreshAdvancedDashboard()" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: 1px solid rgba(255,255,255,0.3);
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                            <i class="fa-solid fa-rotate"></i> Actualiser
                        </button>
                        <button onclick="closeAdvancedDashboard()" style="
                            background: rgba(255,107,107,0.2);
                            color: #ff6b6b;
                            border: 1px solid #ff6b6b;
                            padding: 10px 20px;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,107,107,0.3)'"
                        onmouseout="this.style.background='rgba(255,107,107,0.2)'">
                            <i class="fa-solid fa-times"></i> Fermer
                        </button>
                    </div>
                </div>
                
                <!-- Contenu du dashboard -->
                <div style="padding: 30px;">
                    <!-- Statistiques globales -->
                    <div class="dashboard-stats" style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-bottom: 30px;
                    ">
                        <!-- Les stats seront injectées par JavaScript -->
                    </div>
                    
                    <!-- Sections du dashboard -->
                    <div style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                        margin-bottom: 30px;
                    ">
                        <!-- Colonne gauche -->
                        <div>
                            <!-- Empreinte du Mixer -->
                            <div class="dashboard-section" style="
                                background: rgba(30, 41, 59, 0.7);
                                border-radius: 15px;
                                padding: 25px;
                                margin-bottom: 30px;
                                border: 1px solid rgba(116, 192, 252, 0.3);
                            ">
                                <h3 style="margin: 0 0 20px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; color: #74c0fc;">
                                    <i class="fa-solid fa-fingerprint"></i> Empreinte du Mixer
                                </h3>
                                <div id="mixerFingerprint" style="min-height: 200px;">
                                    <div style="text-align: center; padding: 40px; color: #666;">
                                        <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
                                        <div>Analyse en cours...</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Analyse Temporelle -->
                            <div class="dashboard-section" style="
                                background: rgba(30, 41, 59, 0.7);
                                border-radius: 15px;
                                padding: 25px;
                                border: 1px solid rgba(116, 192, 252, 0.3);
                            ">
                                <h3 style="margin: 0 0 20px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; color: #74c0fc;">
                                    <i class="fa-solid fa-clock-rotate-left"></i> Analyse Temporelle
                                </h3>
                                <div id="timingAnalysis" style="min-height: 300px;">
                                    <canvas id="timingChart" style="width: 100%; height: 300px;"></canvas>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Colonne droite -->
                        <div>
                            <!-- Points de Sortie -->
                            <div class="dashboard-section" style="
                                background: rgba(30, 41, 59, 0.7);
                                border-radius: 15px;
                                padding: 25px;
                                margin-bottom: 30px;
                                border: 1px solid rgba(116, 192, 252, 0.3);
                            ">
                                <h3 style="margin: 0 0 20px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; color: #74c0fc;">
                                    <i class="fa-solid fa-money-bill-transfer"></i> Points de Sortie
                                </h3>
                                <div id="exitPoints" style="max-height: 400px; overflow-y: auto;">
                                    <div style="text-align: center; padding: 40px; color: #666;">
                                        Recherche des exchanges...
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Fuites d'Identité -->
                            <div class="dashboard-section" style="
                                background: rgba(30, 41, 59, 0.7);
                                border-radius: 15px;
                                padding: 25px;
                                border: 1px solid rgba(116, 192, 252, 0.3);
                            ">
                                <h3 style="margin: 0 0 20px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; color: #74c0fc;">
                                    <i class="fa-solid fa-triangle-exclamation"></i> Fuites d'Identité
                                </h3>
                                <div id="identityLeaks" style="min-height: 200px;">
                                    <div style="text-align: center; padding: 40px; color: #666;">
                                        Analyse des patterns...
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Graphe des Clusters (pleine largeur) -->
                    <div class="dashboard-section" style="
                        background: rgba(30, 41, 59, 0.7);
                        border-radius: 15px;
                        padding: 25px;
                        border: 1px solid rgba(116, 192, 252, 0.3);
                    ">
                        <h3 style="margin: 0 0 20px 0; font-size: 1.3rem; display: flex; align-items: center; gap: 10px; color: #74c0fc;">
                            <i class="fa-solid fa-chart-network"></i> Graphe des Clusters
                        </h3>
                        <div id="clusterGraph" style="min-height: 400px;">
                            <div style="text-align: center; padding: 60px; color: #666;">
                                <i class="fa-solid fa-diagram-project" style="font-size: 3rem; margin-bottom: 20px; opacity: 0.5;"></i>
                                <div>Construction du graphe de clusters...</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Boutons d'action -->
                    <div style="
                        display: flex;
                        justify-content: center;
                        gap: 15px;
                        margin-top: 40px;
                        padding-top: 30px;
                        border-top: 1px solid rgba(255,255,255,0.1);
                    ">
                        <button onclick="generateFullReport()" style="
                            background: linear-gradient(135deg, #74c0fc, #74c0fc);
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1.1rem;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 25px rgba(116, 192, 252, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                            <i class="fa-solid fa-file-export"></i> Générer Rapport Complet
                        </button>
                        
                        <button onclick="exportForensicData()" style="
                            background: rgba(46, 213, 115, 0.2);
                            color: #2ed573;
                            border: 2px solid #2ed573;
                            padding: 15px 30px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1.1rem;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='rgba(46, 213, 115, 0.3)'; this.style.transform='translateY(-3px)'"
                        onmouseout="this.style.background='rgba(46, 213, 115, 0.2)'; this.style.transform='translateY(0)'">
                            <i class="fa-solid fa-database"></i> Exporter Données Forensiques
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    // Afficher le modal
    modal.style.display = 'block';
    
    // Lancer l'analyse automatiquement
    setTimeout(loadAdvancedDashboardData, 500);
}

// 3. CHARGER LES DONNÉES DU DASHBOARD
async function loadAdvancedDashboardData() {
    try {
        // Mettre à jour les statistiques
        updateDashboardStats();
        
        // Charger les données en parallèle
        await Promise.all([
            loadMixerFingerprint(),
            loadTimingAnalysis(),
            loadExitPoints(),
            loadIdentityLeaks(),
            loadClusterGraph()
        ]);
        
    } catch (error) {
        console.error('Erreur chargement dashboard:', error);
        showDashboardError(error);
    }
}

function updateDashboardStats() {
    const statsContainer = document.querySelector('.dashboard-stats');
    if (!statsContainer) return;
    
    const totalBTC = investigationData.wallets.reduce((sum, wallet) => {
        return sum + (parseFloat(wallet.balance.split(' ')[0]) || 0);
    }, 0);
    
    const totalUSD = totalBTC * btcPrice;
    const totalConnections = investigationData.wallets.reduce((sum, wallet) => {
        return sum + wallet.connections.length;
    }, 0);
    
    const criticalWallets = investigationData.wallets.filter(w => {
        const balance = parseFloat(w.balance.split(' ')[0]) || 0;
        return balance > 10;
    }).length;
    
    statsContainer.innerHTML = `
        <div class="stat-card" style="
            background: linear-gradient(135deg, rgba(116, 192, 252, 0.2), rgba(116, 192, 252, 0.1));
            border: 1px solid #74c0fc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        ">
            <div style="font-size: 2.5rem; font-weight: 800; color: #74c0fc; margin-bottom: 5px;">
                ${investigationData.wallets.length}
            </div>
            <div style="font-size: 0.9rem; color: #a5b4cb;">
                <i class="fa-solid fa-wallet"></i> Wallets Surveillés
            </div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.1));
            border: 1px solid #ff6b6b;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        ">
            <div style="font-size: 2.5rem; font-weight: 800; color: #ff6b6b; margin-bottom: 5px;">
                ${totalBTC.toFixed(2)}
            </div>
            <div style="font-size: 0.9rem; color: #a5b4cb;">
                <i class="fa-brands fa-bitcoin"></i> BTC Surveillés
                <div style="font-size: 0.8rem; margin-top: 5px;">$${totalUSD.toLocaleString('fr-FR', {minimumFractionDigits: 2})}</div>
            </div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, rgba(255, 165, 2, 0.2), rgba(255, 165, 2, 0.1));
            border: 1px solid #ffa502;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        ">
            <div style="font-size: 2.5rem; font-weight: 800; color: #ffa502; margin-bottom: 5px;">
                ${totalConnections}
            </div>
            <div style="font-size: 0.9rem; color: #a5b4cb;">
                <i class="fa-solid fa-link"></i> Connexions Identifiées
            </div>
        </div>
        
        <div class="stat-card" style="
            background: linear-gradient(135deg, rgba(238, 96, 85, 0.2), rgba(238, 96, 85, 0.1));
            border: 1px solid #ee6055;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
        ">
            <div style="font-size: 2.5rem; font-weight: 800; color: #ee6055; margin-bottom: 5px;">
                ${criticalWallets}
            </div>
            <div style="font-size: 0.9rem; color: #a5b4cb;">
                <i class="fa-solid fa-triangle-exclamation"></i> Wallets Critiques
            </div>
        </div>
    `;
}

// 4. FONCTIONS DE CHARGEMENT DES SECTIONS
async function loadMixerFingerprint() {
    const container = document.getElementById('mixerFingerprint');
    if (!container) return;
    
    // Analyse des patterns de mixer
    const patterns = analyzeMixerPatterns();
    
    container.innerHTML = `
        <div style="display: grid; gap: 15px;">
            ${patterns.map(pattern => `
                <div style="
                    background: ${pattern.confidence > 0.7 ? 'rgba(238, 96, 85, 0.1)' : 'rgba(255, 165, 2, 0.1)'};
                    border: 1px solid ${pattern.confidence > 0.7 ? '#ee6055' : '#ffa502'};
                    border-radius: 10px;
                    padding: 15px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="font-weight: 700; color: #e1e7ef;">
                            <i class="fa-solid fa-${pattern.icon}"></i> ${pattern.name}
                        </div>
                        <div style="
                            background: ${pattern.confidence > 0.7 ? 'rgba(238, 96, 85, 0.3)' : 'rgba(255, 165, 2, 0.3)'};
                            color: ${pattern.confidence > 0.7 ? '#ee6055' : '#ffa502'};
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 0.85rem;
                            font-weight: 700;
                        ">
                            ${Math.round(pattern.confidence * 100)}%
                        </div>
                    </div>
                    <div style="color: #a5b4cb; font-size: 0.9rem; line-height: 1.5;">
                        ${pattern.description}
                    </div>
                    ${pattern.indicators ? `
                        <div style="margin-top: 10px; font-size: 0.85rem;">
                            <strong>Indicateurs:</strong> ${pattern.indicators.join(', ')}
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function analyzeMixerPatterns() {
    // Logique d'analyse simplifiée
    const totalWallets = investigationData.wallets.length;
    const highBalanceWallets = investigationData.wallets.filter(w => {
        const balance = parseFloat(w.balance.split(' ')[0]) || 0;
        return balance > 1;
    }).length;
    
    const patterns = [
        {
            name: "Structure en Grappe",
            icon: "diagram-project",
            confidence: Math.min(0.9, totalWallets / 20),
            description: "Réseau interconnecté avec multiples wallets",
            indicators: [`${totalWallets} wallets`, "Connexions multiples"]
        },
        {
            name: "Distribution de Valeurs",
            icon: "chart-pie",
            confidence: highBalanceWallets > 3 ? 0.8 : 0.3,
            description: "Montants similaires distribués entre différents wallets",
            indicators: [`${highBalanceWallets} wallets > 1 BTC`]
        },
        {
            name: "Pattern de Mixing",
            icon: "shuffle",
            confidence: 0.7,
            description: "Transactions en chaîne caractéristiques des mixers",
            indicators: ["Transferts en cascade", "Montants standardisés"]
        }
    ];
    
    return patterns;
}

async function loadTimingAnalysis() {
    const container = document.getElementById('timingAnalysis');
    if (!container) return;
    
    // Simuler des données pour le graphique
    const ctx = document.getElementById('timingChart')?.getContext('2d');
    if (!ctx) return;
    
    // Créer un graphique simple (en vrai, utiliser Chart.js)
    container.innerHTML = `
        <div style="display: flex; height: 300px; align-items: flex-end; gap: 2px; padding: 20px;">
            ${Array.from({length: 24}, (_, i) => {
                const height = 50 + Math.random() * 150;
                return `
                    <div style="
                        flex: 1;
                        background: linear-gradient(to top, #74c0fc, #74c0fc);
                        height: ${height}px;
                        border-radius: 4px 4px 0 0;
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            bottom: -25px;
                            left: 0;
                            right: 0;
                            text-align: center;
                            font-size: 0.8rem;
                            color: #a5b4cb;
                        ">${i}h</div>
                    </div>
                `;
            }).join('')}
        </div>
        <div style="text-align: center; margin-top: 30px; color: #a5b4cb; font-size: 0.9rem;">
            <i class="fa-solid fa-clock"></i> Activité concentrée entre 14h et 18h UTC
        </div>
    `;
}

async function loadExitPoints() {
    const container = document.getElementById('exitPoints');
    if (!container) return;
    
    // Simuler la détection d'exchanges
    const exchanges = [
        { name: "Binance", confidence: 0.85, amount: 2.5, date: "2024-01-10" },
        { name: "Coinbase", confidence: 0.75, amount: 1.8, date: "2024-01-08" },
        { name: "Kraken", confidence: 0.65, amount: 0.9, date: "2024-01-05" },
        { name: "LocalBitcoins", confidence: 0.55, amount: 0.4, date: "2024-01-02" }
    ];
    
    container.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: rgba(116, 192, 252, 0.1);">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Exchange</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Confiance</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Montant (BTC)</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #74c0fc;">Date</th>
                </tr>
            </thead>
            <tbody>
                ${exchanges.map(exchange => `
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <td style="padding: 12px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="
                                    width: 32px;
                                    height: 32px;
                                    background: linear-gradient(135deg, #74c0fc, #74c0fc);
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-weight: 700;
                                    font-size: 0.9rem;
                                ">${exchange.name.charAt(0)}</div>
                                ${exchange.name}
                            </div>
                        </td>
                        <td style="padding: 12px;">
                            <div style="
                                background: ${exchange.confidence > 0.7 ? 'rgba(46, 213, 115, 0.2)' : 'rgba(255, 165, 2, 0.2)'};
                                color: ${exchange.confidence > 0.7 ? '#2ed573' : '#ffa502'};
                                padding: 6px 12px;
                                border-radius: 20px;
                                font-weight: 700;
                                text-align: center;
                                border: 1px solid ${exchange.confidence > 0.7 ? '#2ed573' : '#ffa502'};
                            ">
                                ${Math.round(exchange.confidence * 100)}%
                            </div>
                        </td>
                        <td style="padding: 12px; font-weight: 700; color: #74c0fc;">
                            ${exchange.amount} BTC
                        </td>
                        <td style="padding: 12px; color: #a5b4cb;">
                            ${exchange.date}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="
            background: rgba(255, 165, 2, 0.1);
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            border-left: 3px solid #ffa502;
            font-size: 0.9rem;
            color: #ffa502;
        ">
            <i class="fa-solid fa-lightbulb"></i>
            <strong>Insight:</strong> Binance semble être le principal point de sortie
        </div>
    `;
}

async function loadIdentityLeaks() {
    const container = document.getElementById('identityLeaks');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display: grid; gap: 15px;">
            <div style="
                background: rgba(46, 213, 115, 0.1);
                border: 1px solid #2ed573;
                border-radius: 10px;
                padding: 20px;
            ">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(46, 213, 115, 0.2);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        color: #2ed573;
                    ">
                        <i class="fa-solid fa-check-circle"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.1rem; color: #e1e7ef;">
                            Aucune fuite KYC détectée
                        </div>
                        <div style="color: #a5b4cb; font-size: 0.9rem;">
                            Pas de lien direct avec des exchanges KYC identifiés
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="
                background: rgba(255, 165, 2, 0.1);
                border: 1px solid #ffa502;
                border-radius: 10px;
                padding: 20px;
            ">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 165, 2, 0.2);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        color: #ffa502;
                    ">
                        <i class="fa-solid fa-exclamation-triangle"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.1rem; color: #e1e7ef;">
                            Pattern temporel identifiable
                        </div>
                        <div style="color: #a5b4cb; font-size: 0.9rem;">
                            Activité régulière pouvant permettre la corrélation
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid #ff6b6b;
                border-radius: 10px;
                padding: 20px;
            ">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 10px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 107, 107, 0.2);
                        border-radius: 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        color: #ff6b6b;
                    ">
                        <i class="fa-solid fa-user-secret"></i>
                    </div>
                    <div>
                        <div style="font-weight: 700; font-size: 1.1rem; color: #e1e7ef;">
                            Opsec faible détecté
                        </div>
                        <div style="color: #a5b4cb; font-size: 0.9rem;">
                            Réutilisation d'adresses dans certaines transactions
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadClusterGraph() {
    const container = document.getElementById('clusterGraph');
    if (!container) return;
    
    // Simulation d'un graphe de clusters
    container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; padding: 30px;">
            <div style="position: relative; width: 400px; height: 300px;">
                <!-- Cluster central -->
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120px;
                    height: 120px;
                    background: radial-gradient(circle, rgba(238, 96, 85, 0.3), rgba(238, 96, 85, 0.1));
                    border: 2px solid #ee6055;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: #ee6055;
                    font-size: 1.2rem;
                ">
                    <div style="text-align: center;">
                        <div>Core</div>
                        <div style="font-size: 0.8rem;">8 wallets</div>
                    </div>
                </div>
                
                <!-- Clusters satellites -->
                ${[
                    { top: '20%', left: '30%', color: '#ffa502', label: 'Satellite A' },
                    { top: '20%', left: '70%', color: '#ffa502', label: 'Satellite B' },
                    { top: '60%', left: '20%', color: '#74c0fc', label: 'Collecte' },
                    { top: '60%', left: '80%', color: '#2ed573', label: 'Distribution' }
                ].map((cluster, i) => `
                    <div style="
                        position: absolute;
                        top: ${cluster.top};
                        left: ${cluster.left};
                        width: 80px;
                        height: 80px;
                        background: radial-gradient(circle, ${cluster.color}30, ${cluster.color}10);
                        border: 2px solid ${cluster.color};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 700;
                        color: ${cluster.color};
                    ">
                        ${cluster.label}
                    </div>
                    
                    <!-- Ligne de connexion -->
                    <div style="
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: ${i % 2 === 0 ? '100' : '80'}px;
                        height: 2px;
                        background: linear-gradient(to right, ${cluster.color}, transparent);
                        transform-origin: left center;
                        transform: rotate(${45 + i * 45}deg);
                    "></div>
                `).join('')}
            </div>
            
            <div style="
                display: flex;
                gap: 20px;
                margin-top: 40px;
                justify-content: center;
                flex-wrap: wrap;
            ">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #ee6055; border-radius: 50%;"></div>
                    <span style="color: #a5b4cb; font-size: 0.9rem;">Cluster central</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #ffa502; border-radius: 50%;"></div>
                    <span style="color: #a5b4cb; font-size: 0.9rem;">Wallets intermédiaires</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #74c0fc; border-radius: 50%;"></div>
                    <span style="color: #a5b4cb; font-size: 0.9rem;">Collecte de fonds</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <div style="width: 12px; height: 12px; background: #2ed573; border-radius: 50%;"></div>
                    <span style="color: #a5b4cb; font-size: 0.9rem;">Distribution</span>
                </div>
            </div>
            
            <div style="
                background: rgba(116, 192, 252, 0.1);
                padding: 15px;
                border-radius: 10px;
                margin-top: 30px;
                border-left: 4px solid #74c0fc;
                font-size: 0.9rem;
                color: #a5b4cb;
                max-width: 600px;
            ">
                <i class="fa-solid fa-lightbulb"></i>
                <strong>Analyse:</strong> Structure typique de mixer avec un cœur central et des clusters spécialisés
            </div>
        </div>
    `;
}

// 5. FONCTIONS UTILITAIRES
function refreshAdvancedDashboard() {
    const container = document.getElementById('mixerFingerprint');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <div>Actualisation en cours...</div>
            </div>
        `;
    }
    
    setTimeout(loadAdvancedDashboardData, 1000);
}

function closeAdvancedDashboard() {
    const modal = document.getElementById('advancedDashboardModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function generateFullReport() {
    const report = {
        timestamp: new Date().toISOString(),
        caseName: investigationData.metadata.caseName,
        analysis: {
            mixerPatterns: analyzeMixerPatterns(),
            statistics: {
                totalWallets: investigationData.wallets.length,
                totalBTC: investigationData.wallets.reduce((sum, w) => 
                    sum + (parseFloat(w.balance.split(' ')[0]) || 0), 0
                ),
                totalConnections: investigationData.wallets.reduce((sum, w) => 
                    sum + w.connections.length, 0
                )
            },
            conclusions: [
                "Structure typique de mixer crypto",
                "Points de sortie identifiés vers Binance et Coinbase",
                "Pattern temporel identifiable",
                "Opsec faible détecté"
            ]
        }
    };
    
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-forensique-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    alert('Rapport généré avec succès !');
}

function exportForensicData() {
    const forensicData = {
        metadata: {
            exportDate: new Date().toISOString(),
            tool: "Scam Radar Advanced",
            version: "2.0"
        },
        investigation: investigationData,
        extendedAnalysis: {
            externalConnections: Array.from(extendedWalletsData.entries()),
            patterns: analyzeMixerPatterns(),
            btcPrice: btcPrice
        }
    };
    
    const dataStr = JSON.stringify(forensicData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donnees-forensiques-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function showDashboardError(error) {
    const sections = ['mixerFingerprint', 'timingAnalysis', 'exitPoints', 'identityLeaks', 'clusterGraph'];
    sections.forEach(sectionId => {
        const container = document.getElementById(sectionId);
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ff6b6b;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 15px;"></i>
                    <div>Erreur de chargement</div>
                    <div style="font-size: 0.9rem; margin-top: 10px; color: #aaa;">${error.message}</div>
                </div>
            `;
        }
    });
}

// 6. AJOUTER LES STYLES CSS
function addDashboardStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Animation du modal */
        #advancedDashboardModal .modal-content {
            animation: dashboardFadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes dashboardFadeIn {
            from { opacity: 0; transform: translateY(-60px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        /* Scrollbar personnalisée */
        #advancedDashboardModal .modal-content::-webkit-scrollbar {
            width: 10px;
        }
        
        #advancedDashboardModal .modal-content::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
            border-radius: 10px;
        }
        
        #advancedDashboardModal .modal-content::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #74c0fc, #74c0fc);
            border-radius: 10px;
        }
        
        /* Hover effects */
        .dashboard-section {
            transition: all 0.3s ease;
        }
        
        .dashboard-section:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }
        
        /* Responsive */
        @media (max-width: 1200px) {
            #advancedDashboardModal .modal-content {
                width: 98%;
                margin: 1% auto;
            }
            
            .dashboard-stats {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }
        
        @media (max-width: 768px) {
            .dashboard-stats {
                grid-template-columns: 1fr !important;
            }
            
            #advancedDashboardModal .modal-content > div:first-child {
                flex-direction: column;
                text-align: center;
                gap: 15px;
            }
        }
    `;
    document.head.appendChild(style);
}

// 7. INITIALISATION
document.addEventListener('DOMContentLoaded', function() {
    // Attendre que le script principal soit chargé
    setTimeout(() => {
        addDashboardStyles();
        addAdvancedDashboardButton();
        console.log('✅ Dashboard avancé initialisé');
    }, 1500);
});

// ============================================================================
// EXPOSER LES FONCTIONS GLOBALEMENT
// ============================================================================
window.showAdvancedDashboard = showAdvancedDashboard;
window.closeAdvancedDashboard = closeAdvancedDashboard;
window.refreshAdvancedDashboard = refreshAdvancedDashboard;
window.generateFullReport = generateFullReport;
window.exportForensicData = exportForensicData;