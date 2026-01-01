// timing_attack.js
/**
 * Les mixers ont des patterns temporels :
 * 1. Dépôt → Attente → Mix → Sortie
 * 2. Batch processing (traitement par lots)
 * 3. Heures régulières (automatisation)
 */
async function performTimingAttack(mixerAddresses) {
    const timingPatterns = [];
    
    for (const address of mixerAddresses) {
        const txs = await fetchAllTransactions(address);
        
        // Extraire les heures des transactions
        const hours = txs.map(tx => {
            const date = new Date(tx.status.block_time * 1000);
            return {
                hour: date.getHours(),
                day: date.getDay(),
                timestamp: tx.status.block_time
            };
        });
        
        // Chercher des patterns
        const batchProcessing = detectBatchProcessing(hours);
        const regularIntervals = detectRegularIntervals(hours);
        
        if (batchProcessing || regularIntervals) {
            timingPatterns.push({
                address: address,
                batchProcessing: batchProcessing,
                regularIntervals: regularIntervals,
                activityHours: getMostActiveHours(hours)
            });
        }
    }
    
    return timingPatterns;
}

function detectBatchProcessing(timestamps) {
    // Un mixer traite souvent par lots
    // Ex: Toutes les heures pleines, ou toutes les 6h
    const intervals = [];
    
    for (let i = 1; i < timestamps.length; i++) {
        const diff = timestamps[i] - timestamps[i-1];
        intervals.push(diff);
    }
    
    // Chercher des intervalles réguliers
    const commonInterval = findCommonInterval(intervals);
    return commonInterval ? `Batch toutes les ${commonInterval} minutes` : null;
}