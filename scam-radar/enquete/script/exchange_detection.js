// exchange_detection.js
const KNOWN_EXCHANGES = {
    "Binance": ["1M8t7...", "3J98t..."],
    "Coinbase": ["bc1qxy...", "3E8oci..."],
    "Kraken": ["3A1xjP..."],
    "Bitfinex": ["1Kr6QS..."],
    "LocalBitcoins": ["bc1q9z..."]
};

async function identifyExchangeWithdrawals(mixerAddress) {
    const allTxs = await fetchAllTransactions(mixerAddress);
    const exchangeWithdrawals = [];
    
    allTxs.forEach(tx => {
        tx.vout?.forEach(output => {
            const address = output.scriptpubkey_address;
            
            // Vérifier si c'est une adresse connue d'exchange
            for (const [exchange, addresses] of Object.entries(KNOWN_EXCHANGES)) {
                if (addresses.some(knownAddr => 
                    address.toLowerCase().includes(knownAddr.toLowerCase().slice(0, 10))
                )) {
                    exchangeWithdrawals.push({
                        exchange: exchange,
                        address: address,
                        amount: output.value / 100000000,
                        txid: tx.txid,
                        timestamp: tx.status.block_time
                    });
                }
            }
        });
    });
    
    return exchangeWithdrawals;
}