// Détection automatique blockchain
function detectBlockchain(address) {
    if (!address) return null;

    // EVM (Ethereum, BSC, Polygon, etc.)
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'evm';

    // Solana
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) return 'solana';

    // Cosmos (ATOM, OSMO, etc.)
    if (/^cosmos1[a-z0-9]{38}$/.test(address)) return 'cosmos';

    // Bitcoin
    if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(address)) return 'bitcoin';

    // Hyperliquid (identique à EVM)
    if (/^0x[a-fA-F0-9]{40}$/.test(address)) return 'hyperliquid';

    return 'unknown';
}

// Vérification universelle
async function verifyAddress(address) {
    const blockchain = detectBlockchain(address);
    let result = {
        valid: false,
        blockchain: blockchain || 'inconnue',
        details: {}
    };

    try {
        switch (blockchain) {
            case 'evm':
            case 'hyperliquid':
                // Vérification via Etherscan-like API
                const evmResult = await checkEVMAddress(address);
                result = { ...result, ...evmResult };
                break;

            case 'solana':
                // Vérification Solana
                const solanaResult = await checkSolanaAddress(address);
                result = { ...result, ...solanaResult };
                break;

            case 'cosmos':
                // Vérification Cosmos
                result.details.note = "Adresse Cosmos valide (vérification manuelle recommandée)";
                result.valid = true;
                break;

            case 'bitcoin':
                // Vérification Bitcoin
                result.details.note = "Adresse Bitcoin valide (vérification manuelle recommandée)";
                result.valid = true;
                break;

            default:
                result.details.error = "Blockchain non supportée";
        }
    } catch (e) {
        result.details.error = e.message;
    }

    return result;
}

// Vérification EVM (Ethereum, BSC, Polygon, Hyperliquid, etc.)
async function checkEVMAddress(address) {
    let result = {
        verified: false,
        source: 'Aucune vérification'
    };

    // Essayer CoinGecko d'abord
    try {
        const cgResponse = await fetch(`https://api.coingecko.com/api/v3/coins/ethereum/contract/${address}`);
        if (cgResponse.ok) {
            const data = await cgResponse.json();
            return {
                verified: true,
                name: data.name,
                symbol: data.symbol?.toUpperCase(),
                source: 'CoinGecko'
            };
        }
    } catch { }

    // Fallback: vérification basique via Etherscan
    try {
        const response = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}`);
        const data = await response.json();

        if (data.result[0]?.SourceCode) {
            return {
                verified: true,
                name: data.result[0].ContractName || 'Contrat inconnu',
                source: 'Etherscan'
            };
        }
    } catch { }

    return {
        verified: false,
        note: 'Adresse EVM non vérifiée',
        source: 'Aucune source'
    };
}

// Vérification Solana
async function checkSolanaAddress(address) {
    try {
        // Vérification via Solscan
        const response = await fetch(`https://api.solscan.io/account/${address}`);
        const data = await response.json();

        if (data.data?.tokenInfo) {
            return {
                verified: true,
                name: data.data.tokenInfo.name || 'Token Solana',
                symbol: data.data.tokenInfo.symbol || '?',
                source: 'Solscan'
            };
        }

        return {
            verified: false,
            note: 'Adresse Solana non token',
            source: 'Solscan'
        };
    } catch {
        return {
            verified: false,
            note: 'Erreur de vérification',
            source: 'Solana'
        };
    }
}

// Fonction principale (à connecter à votre HTML)
async function checkAddress() {
    const address = document.getElementById('addressInput').value.trim();
    const resultDiv = document.getElementById('result');

    if (!address) {
        resultDiv.innerHTML = '<div class="error">Veuillez entrer une adresse</div>';
        return;
    }

    resultDiv.innerHTML = '<div class="loading">Vérification en cours...</div>';

    const verification = await verifyAddress(address);

    // Affichage des résultats
    if (verification.valid) {
        resultDiv.innerHTML = `
        <div class="verified">
          <h3>✅ Adresse ${verification.blockchain.toUpperCase()} valide</h3>
          ${verification.details.name ? `<p><strong>Projet:</strong> ${verification.details.name}</p>` : ''}
          ${verification.details.symbol ? `<p><strong>Symbole:</strong> ${verification.details.symbol}</p>` : ''}
          <p><strong>Source:</strong> ${verification.details.source}</p>
          ${verification.details.note ? `<p>${verification.details.note}</p>` : ''}
        </div>
      `;
    } else {
        resultDiv.innerHTML = `
        <div class="unverified">
          <h3>⚠️ Adresse ${verification.blockchain.toUpperCase()} non vérifiée</h3>
          <p><strong>Statut:</strong> ${verification.details.error || verification.details.note || 'Non reconnu'}</p>
          <p><strong>Conseil:</strong> Ne transférez rien sans vérification supplémentaire</p>
        </div>
      `;
    }
}