document.getElementById('checkButton').addEventListener('click', checkContract);

// Détection automatique de la blockchain
function detectBlockchain(address) {
    if (!address) return null;

    // Ethereum / EVM (0x...)
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'ethereum';

    // Solana (Base58)
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana';

    // BSC (0x ou bnb...)
    if (/^(0x[a-fA-F0-9]{40}|bnb[a-z0-9]{39})$/.test(address)) return 'bsc';

    return 'unknown';
}

async function checkContract() {
    const address = document.getElementById('contractAddress').value.trim();
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '<div class="loading">Analyse en cours...</div>';

    try {
        const blockchain = detectBlockchain(address);

        if (!blockchain || blockchain === 'unknown') {
            resultDiv.innerHTML = `
                        <div class="error">
                            <h3>❌ Format non reconnu</h3>
                            <p>Nous n'avons pas pu identifier la blockchain correspondante.</p>
                            <p><strong>Formats acceptés :</strong></p>
                            <ul>
                                <li>Ethereum : <code>0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984</code></li>
                                <li>Solana : <code>vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg</code></li>
                                <li>BSC : <code>0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82</code></li>
                            </ul>
                        </div>
                    `;
            return;
        }

        // Affiche la blockchain détectée
        const blockchainNames = {
            ethereum: 'Ethereum',
            solana: 'Solana',
            bsc: 'Binance Smart Chain'
        };

        let verification;
        if (blockchain === 'solana') {
            verification = await verifySolanaToken(address);
        } else {
            verification = await verifyWithCoinGecko(address, blockchain);
        }

        if (verification.verified) {
            resultDiv.innerHTML = `
                        <div class="verified">
                            <h3>✅ Adresse vérifiée <span class="blockchain-tag">${blockchainNames[blockchain]}</span></h3>
                            <p><strong>Projet :</strong> ${verification.name}</p>
                            <p><strong>Symbole :</strong> ${verification.symbol}</p>
                            ${verification.riskNote ? `<p>${verification.riskNote}</p>` : ''}
                            <p><em>Vérifié via ${verification.source}</em></p>
                        </div>
                    `;
        } else {
            resultDiv.innerHTML = `
                        <div class="unverified">
                            <h3>⚠️ Adresse non vérifiée <span class="blockchain-tag">${blockchainNames[blockchain]}</span></h3>
                            <p><strong>Attention :</strong> Cette adresse n'est pas reconnue comme officielle.</p>
                            <p><strong>Conseil :</strong> Ne transférez aucun actif sans avoir fait vos propres recherches (DYOR).</p>
                            ${verification.note ? `<p>${verification.note}</p>` : ''}
                        </div>
                    `;
        }

    } catch (error) {
        resultDiv.innerHTML = `
                    <div class="error">
                        <h3>❌ Erreur technique</h3>
                        <p>Une erreur est survenue : ${error.message}</p>
                        <p>Veuillez réessayer ou vérifier manuellement l'adresse.</p>
                    </div>
                `;
    }
}

// Vérification via CoinGecko (pour Ethereum, BSC, etc.)
async function verifyWithCoinGecko(address, blockchain) {
    const blockchainMapping = {
        ethereum: 'ethereum',
        bsc: 'binance-smart-chain',
        polygon: 'polygon-pos'
    };

    const coinGeckoChain = blockchainMapping[blockchain] || 'ethereum';
    const url = `https://api.coingecko.com/api/v3/coins/${coinGeckoChain}/contract/${address}`;

    const response = await fetch(url);

    if (!response.ok) {
        return {
            verified: false,
            note: 'Non répertorié sur CoinGecko',
            source: 'CoinGecko'
        };
    }

    const data = await response.json();
    return {
        verified: true,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        riskNote: 'Même pour les adresses vérifiées, vérifiez toujours les URLs officielles.',
        source: 'CoinGecko'
    };
}

// Vérification pour Solana
async function verifySolanaToken(address) {
    try {
        // Solution légère sans dépendance
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/solana/contract/${address}`);

        if (response.ok) {
            const data = await response.json();
            return {
                verified: true,
                name: data.name,
                symbol: data.symbol.toUpperCase(),
                source: 'CoinGecko'
            };
        }

        // Fallback : vérification basique via l'explorateur Solana
        const explorerCheck = await fetch(`https://api.solscan.io/token/${address}?cluster=`);
        if (explorerCheck.ok) {
            return {
                verified: true,
                name: 'Token Solana',
                symbol: '?',
                riskNote: 'Adresse valide mais non vérifiée via CoinGecko',
                source: 'Solscan'
            };
        }

        return {
            verified: false,
            note: 'Non trouvé sur CoinGecko ni Solscan',
            source: 'Solana'
        };

    } catch (error) {
        return {
            verified: false,
            note: 'Erreur lors de la vérification',
            source: 'Solana'
        };
    }
}