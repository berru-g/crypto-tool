// op_return_analysis.js
async function extractOPReturnData(txid) {
    const response = await fetch(`https://blockstream.info/api/tx/${txid}`);
    const tx = await response.json();
    
    const opReturns = tx.vout.filter(output => 
        output.scriptpubkey_type === 'op_return'
    ).map(output => {
        try {
            // Décoder hex en texte
            const hex = output.scriptpubkey.slice(4);
            return {
                data: hexToString(hex),
                hex: hex,
                ascii: hexToAscii(hex),
                possibleFormat: guessDataFormat(hex)
            };
        } catch (e) {
            return { hex: output.scriptpubkey, error: e.message };
        }
    });
    
    return opReturns;
}

function hexToString(hex) {
    let str = '';
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return str;
}