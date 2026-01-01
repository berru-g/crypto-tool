// deep_transaction_fetch.js
async function fetchAllTransactions(address, maxPages = 50) {
    const allTransactions = [];
    let page = 0;
    
    while (page < maxPages) {
        try {
            const response = await fetch(
                `https://blockstream.info/api/address/${address}/txs/${page * 25}`
            );
            const txs = await response.json();
            
            if (txs.length === 0) break;
            
            allTransactions.push(...txs);
            page++;
            
            // Anti-rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.error(`Erreur page ${page}:`, error);
            break;
        }
    }
    
    return allTransactions;
}