// mixer_analysis.js
async function analyzeMixerPatterns() {
    const mixerPatterns = {
        "smurfing": [],       // Découpe en petites sommes
        "peeling": [],        // Transferts en cascade
        "cycling": [],        // Allers-retours
        "consolidation": []   // Regroupement avant retrait
    };
    
    // Pour chaque wallet dans ta liste
    for (const wallet of investigationData.wallets) {
        const fullTxHistory = await fetchFullTransactionHistory(wallet.address);
        
        // Détecter le pattern "peeling chain"
        const peelingChains = detectPeelingChains(fullTxHistory);
        if (peelingChains.length > 0) {
            mixerPatterns.peeling.push({
                wallet: wallet.address,
                chains: peelingChains
            });
        }
        
        // Détecter le "cycling" (même montant qui revient)
        const cycles = detectCycles(fullTxHistory);
        if (cycles.length > 0) {
            mixerPatterns.cycling.push({
                wallet: wallet.address,
                cycles: cycles
            });
        }
    }
    
    return mixerPatterns;
}