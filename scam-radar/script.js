
document.getElementById('checkButton').onclick = async function() {
    const address = document.getElementById('contractAddress').value.trim();
    const resultDiv = document.getElementById('result');
    
    if (!address) {
        resultDiv.innerHTML = "<span class='danger'>⚠️ Adresse vide !</span>";
        return;
    }

    resultDiv.innerHTML = "Analyse en cours...";

    try {
        // 1. Vérification basique de l'adresse
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
            resultDiv.innerHTML = "<span class='danger'>🚨 Format d'adresse invalide</span>";
            return;
        }

        let report = "=== RAPPORT SCAMRADAR ===\n\n";

        // 2. Vérification Ownership (via Etherscan API)
        const etherscanResponse = await fetch(`https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=#`);
        const etherscanData = await etherscanResponse.json();

        if (etherscanData.status === "0") {
            report += "🔴 <span class='danger'>Impossible de récupérer les données (API limit reached?)</span>\n";
        } else {
            // 3. Checks simples
            const contractCode = etherscanData.result[0].SourceCode;
            
            // Ownership renounced
            if (contractCode.includes("renounceOwnership")) {
                report += "✅ <span class='safe'>Ownership renounced (safe)</span>\n";
            } else {
                report += "⚠️ <span class='warning'>Ownership NON renounced (risque)</span>\n";
            }

            // Fonction mint
            if (contractCode.includes("function mint")) {
                report += "⚠️ <span class='warning'>Fonction mint() détectée (risque inflation)</span>\n";
            }

            // Appels externes
            if (contractCode.includes("call(") || contractCode.includes("delegatecall(")) {
                report += "🚨 <span class='danger'>Appel à contrat externe détecté (danger potentiel)</span>\n";
            }
        }

        // 4. Résultat final
        report += `\nℹ️ <em>Ces résultats sont basiques. Pour une analyse approfondie, contactez un auditeur.</em>`;
        resultDiv.innerHTML = report;

    } catch (error) {
        resultDiv.innerHTML = `<span class='danger'>Erreur : ${error.message}</span>`;
    }
};