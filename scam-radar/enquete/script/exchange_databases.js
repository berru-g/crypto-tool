// exchange_databases:
/*
  // Binance
  'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h': { name: 'Binance', type: 'exchange' },
  '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo': { name: 'Binance', type: 'exchange' },
  'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97': { name: 'Binance', type: 'exchange' },
  '3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb': { name: 'Binance', type: 'exchange' },
  
  // Coinbase
  '3Nxwenay9Z8Lc9JBiywExpnEFiLp6Afp8v': { name: 'Coinbase', type: 'exchange' },
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s': { name: 'Coinbase', type: 'exchange' },
  
  // Kraken
  'bc1qj3nzvuse6jnke7suq4xqrjw9a8w8lsc5haqjf6': { name: 'Kraken', type: 'exchange' },
  '3EhLZarJUNSfV6TWMZY1Nh53K7Z8Q9K6nN': { name: 'Kraken', type: 'exchange' },
  
  // Bitfinex
  '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r': { name: 'Bitfinex', type: 'exchange' },
  '1Kr6QSydW9bFQG1mXiPNNu6WpJGmUa9i1g': { name: 'Bitfinex', type: 'exchange' },
  
  // Huobi
  '3Cbq7aT1tY8kMxWLbitaG7yT6bPbKChq64': { name: 'Huobi', type: 'exchange' },
  '17A16QmavnUfCW11DAApiJxp7ARnxN5pGX': { name: 'Huobi', type: 'exchange' },
  
  // Bittrex
  '1N52wHoVR79PMDishab2XmRHsbekCdGquK': { name: 'Bittrex', type: 'exchange' },
  
  // Bitstamp
  '1HD8Xfr3W7tKBpvMx4kSXZBbE3sLUjBgED': { name: 'Bitstamp', type: 'exchange' },
  
  // OKEx
  '1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC': { name: 'OKEx', type: 'exchange' },
  
  // Gate.io
  '1FoWyxwPXuj4C6abqwhjDWdz6D4PZgYRjA': { name: 'Gate.io', type: 'exchange' }
  */
const EXCHANGE_ADDRESS_DATABASES = {
    'WalletExplorer': 'https://www.walletexplorer.com',
    'Blockchair': 'https://blockchair.com/dashboards/bitcoin-exchanges',
    'BitcoinWhoIsWho': 'https://bitcoinwhoswho.com',
    'ExchangeAddressesGitHub': 'https://github.com/wbnns/bitcoin-address-database'
};

async function searchInKnownDatabases(address) {
    const results = [];
    
    // 1. Vérifier avec WalletExplorer (le plus complet)
    try {
        const weResult = await checkWalletExplorer(address);
        if (weResult) results.push(weResult);
    } catch (e) {}
    
    // 2. Vérifier avec des APIs tierces
    try {
        const blockchairResult = await checkBlockchair(address);
        if (blockchairResult) results.push(blockchairResult);
    } catch (e) {}
    
    // 3. Vérifier local databases
    try {
        const localResult = await checkLocalExchangeDB(address);
        if (localResult) results.push(localResult);
    } catch (e) {}
    
    return results;
}

async function checkWalletExplorer(address) {
    // WalletExplorer a la meilleure base de données
    // Technique: Chercher dans leur API/interface
    
    try {
        // Méthode 1: Via leur API publique
        const response = await fetch(
            `https://www.walletexplorer.com/api/1/address-lookup?address=${address}`
        );
        
        if (response.ok) {
            const data = await response.json();
            if (data.wallet) {
                return {
                    source: 'WalletExplorer',
                    wallet: data.wallet,
                    type: data.type || 'exchange',
                    confidence: 0.9
                };
            }
        }
        
        // Méthode 2: Scraper la page web (fallback)
        const pageResponse = await fetch(
            `https://www.walletexplorer.com/address/${address}`
        );
        const html = await pageResponse.text();
        
        // Chercher des patterns dans le HTML
        if (html.includes('wallet-label') || html.includes('exchange')) {
            const walletMatch = html.match(/<span class="wallet-label">([^<]+)</);
            if (walletMatch) {
                return {
                    source: 'WalletExplorer (scraped)',
                    wallet: walletMatch[1],
                    confidence: 0.8
                };
            }
        }
        
    } catch (error) {
        console.log('WalletExplorer non disponible:', error);
    }
    
    return null;
}