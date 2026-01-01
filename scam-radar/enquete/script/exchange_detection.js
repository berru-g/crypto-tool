// exchange_detector_complete.js
class ExchangeDetector {
    constructor(address) {
        this.address = address;
        this.results = {
            address: address,
            checks: [],
            confidence: 0,
            verdict: 'UNKNOWN',
            evidence: []
        };
    }
    
    async runFullDetection() {
        console.log(`🎯 Détection exchange pour: ${this.address}`);
        
        // 1. Vérification basique
        await this.runBasicChecks();
        
        // 2. Analyse des patterns
        await this.runPatternAnalysis();
        
        // 3. Recherche bases de données
        await this.searchDatabases();
        
        // 4. Analyse heuristique
        await this.runHeuristicAnalysis();
        
        // 5. Conclusion
        this.calculateVerdict();
        
        return this.results;
    }
    
    async runBasicChecks() {
        // Vérifier le format
        if (!this.address.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/)) {
            this.results.checks.push({
                type: 'FORMAT',
                passed: false,
                message: 'Format d\'adresse invalide'
            });
            return;
        }
        
        // Vérifier l'existence
        try {
            const response = await fetch(
                `https://blockstream.info/api/address/${this.address}`
            );
            
            if (response.ok) {
                const data = await response.json();
                this.results.basicInfo = {
                    balance: (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000,
                    transactions: data.chain_stats.tx_count,
                    firstSeen: data.chain_stats.tx_count > 0 ? 'ACTIVE' : 'INACTIVE'
                };
                
                this.results.checks.push({
                    type: 'EXISTENCE',
                    passed: true,
                    message: `Adresse active (${data.chain_stats.tx_count} transactions)`
                });
            }
        } catch (error) {
            this.results.checks.push({
                type: 'EXISTENCE',
                passed: false,
                message: 'Impossible de vérifier l\'adresse'
            });
        }
    }
    
    async runPatternAnalysis() {
        const txs = await fetchAllTransactions(this.address, 5);
        
        // Pattern 1: Batch transactions
        const batchSize = this.detectBatchSize(txs);
        if (batchSize) {
            this.results.evidence.push({
                type: 'BATCH_PROCESSING',
                confidence: 0.7,
                details: `Transactions groupées par ${batchSize}`
            });
        }
        
        // Pattern 2: Hot wallet indicators
        const hotWalletScore = this.calculateHotWalletScore(txs);
        if (hotWalletScore > 0.6) {
            this.results.evidence.push({
                type: 'HOT_WALLET',
                confidence: hotWalletScore,
                details: 'Comportement typique de hot wallet'
            });
        }
        
        // Pattern 3: UTXO management
        const utxoEfficiency = this.analyzeUTXOEfficiency(txs);
        if (utxoEfficiency > 0.7) {
            this.results.evidence.push({
                type: 'PROFESSIONAL_UTXO_MGMT',
                confidence: utxoEfficiency,
                details: 'Gestion professionnelle des UTXOs'
            });
        }
    }
    
    detectBatchSize(transactions) {
        if (transactions.length < 10) return null;
        
        // Regrouper par timestamp (par minute)
        const groups = {};
        transactions.forEach(tx => {
            const minute = Math.floor(tx.status.block_time / 60);
            if (!groups[minute]) groups[minute] = [];
            groups[minute].push(tx);
        });
        
        // Chercher des groupes de plus de 3 transactions
        const batches = Object.values(groups).filter(g => g.length >= 3);
        if (batches.length > 0) {
            const avgBatchSize = batches.reduce((sum, batch) => sum + batch.length, 0) / batches.length;
            return Math.round(avgBatchSize);
        }
        
        return null;
    }
    
    calculateHotWalletScore(transactions) {
        if (transactions.length < 5) return 0;
        
        let score = 0;
        
        // Beaucoup de transactions = +0.3
        if (transactions.length > 50) score += 0.3;
        else if (transactions.length > 20) score += 0.2;
        
        // Petites transactions = +0.3
        const smallTxCount = transactions.filter(tx => {
            const total = tx.vout?.reduce((sum, out) => sum + out.value, 0) || 0;
            return total < 0.1 * 100000000; // < 0.1 BTC
        }).length;
        
        if (smallTxCount / transactions.length > 0.5) score += 0.3;
        
        // Transactions récentes = +0.2
        const now = Math.floor(Date.now() / 1000);
        const recentTxCount = transactions.filter(tx => 
            (now - tx.status.block_time) < 86400 * 7 // 7 jours
        ).length;
        
        if (recentTxCount > 0) score += 0.2;
        
        return Math.min(1, score);
    }
    
    async searchDatabases() {
        // Liste des endpoints à vérifier
        const endpoints = [
            {
                name: 'WalletExplorer',
                url: `https://www.walletexplorer.com/address/${this.address}`,
                parser: (html) => {
                    const match = html.match(/<title>([^<]+)<\/title>/);
                    if (match && match[1].includes('Wallet:')) {
                        return match[1].replace('Wallet:', '').trim();
                    }
                    return null;
                }
            },
            {
                name: 'BitcoinWhoisWho',
                url: `https://bitcoinwhoswho.com/search/${this.address}`,
                parser: (html) => {
                    if (html.includes('This address belongs to')) {
                        const start = html.indexOf('This address belongs to') + 23;
                        const end = html.indexOf('<', start);
                        return html.substring(start, end).trim();
                    }
                    return null;
                }
            }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(endpoint.url)}`);
                const data = await response.json();
                
                if (data.contents) {
                    const result = endpoint.parser(data.contents);
                    if (result) {
                        this.results.evidence.push({
                            type: 'DATABASE_MATCH',
                            confidence: 0.9,
                            details: `Trouvé dans ${endpoint.name}: ${result}`,
                            source: endpoint.name
                        });
                    }
                }
            } catch (error) {
                console.log(`Erreur ${endpoint.name}:`, error.message);
            }
        }
    }
    
    calculateVerdict() {
        // Calculer le score total
        let totalScore = 0;
        let maxScore = 0;
        
        this.results.evidence.forEach(evidence => {
            totalScore += evidence.confidence;
            maxScore += 1;
        });
        
        this.results.confidence = totalScore / Math.max(1, maxScore);
        
        // Déterminer le verdict
        if (this.results.confidence >= 0.7) {
            this.results.verdict = 'LIKELY_EXCHANGE';
        } else if (this.results.confidence >= 0.5) {
            this.results.verdict = 'POSSIBLE_EXCHANGE';
        } else if (this.results.confidence >= 0.3) {
            this.results.verdict = 'UNLIKELY_EXCHANGE';
        } else {
            this.results.verdict = 'NOT_EXCHANGE';
        }
    }
    
    generateReport() {
        return `
        📊 RAPPORT DÉTECTION EXCHANGE
        ==============================
        Adresse: ${this.address}
        Verdict: ${this.results.verdict}
        Confiance: ${(this.results.confidence * 100).toFixed(1)}%
        
        📈 INFORMATIONS DE BASE:
        • Balance: ${this.results.basicInfo?.balance || 'N/A'} BTC
        • Transactions: ${this.results.basicInfo?.transactions || 'N/A'}
        
        🔍 PREUVES COLLECTÉES:
        ${this.results.evidence.map(e => `• [${e.type}] ${e.details} (${(e.confidence * 100).toFixed(0)}%)`).join('\n')}
        
        ✅ CHECKS EFFECTUÉS:
        ${this.results.checks.map(c => `• ${c.type}: ${c.passed ? '✓' : '✗'} ${c.message}`).join('\n')}
        
        💡 RECOMMANDATION:
        ${this.results.verdict === 'LIKELY_EXCHANGE' ? 
          '🔴 ADRESSE D\'EXCHANGE - Surveiller les sorties vers les exchanges KYC' :
          this.results.verdict === 'POSSIBLE_EXCHANGE' ?
          '🟠 POSSIBLE EXCHANGE - Nécessite une surveillance approfondie' :
          '🟢 PROBABLEMENT PAS UN EXCHANGE - Continuer l\'enquête normale'
        }
        `;
    }
}

// Fonction d'utilisation simple
async function detectExchange(address) {
    const detector = new ExchangeDetector(address);
    const results = await detector.runFullDetection();
    console.log(detector.generateReport());
    return results;
}

// Utilisation
// detectExchange('bc1q9wvygkq7h9xgcp59mc6ghzczrqlgrj9k3ey9tz');