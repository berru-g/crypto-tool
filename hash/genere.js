async function hashInput(input, salt = "super_secret_salt") {
    const encoder = new TextEncoder();
    const data = encoder.encode(input + salt);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

(async () => {
    const wordsToReveal = ["rouge", "1963", "sousa almeida", "capsule temporelle"];
    
    console.log("%cHash des Mots Cachés :", "color: lime; font-size: 14px;");
    for (let word of wordsToReveal) {
        let hashed = await hashInput(word.trim().toLowerCase());
        console.log(`"${word}" => "${hashed}"`);
    }
})();
