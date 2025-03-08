async function revealWords() {
    let hashedWords = [
        "a5cbdec727eb9b77f1dd6375118115bc624157f92aa4e13dba146732a1524c40",
        "68967022de6a7069c549784b1765136157a7e546823a3bed34627569dfce5a98",
        "72459bb1d516f733e167564a60b37bf1088b94c203d180114a8f45c068c851f8",
        "ac28fd7881ee26c6ff8db7f55fbd9fea9c573e2ca782b6d9d9cb3f24adbfea5d"
    ];

    // On récupère les mots chiffrés depuis un serveur distant
    fetch("encrypted_words.json")
        .then(response => response.json())
        .then(async (data) => {
            let delay = 1000;
            for (let hash of hashedWords) {
                let decryptedWord = data[hash];
                if (decryptedWord) {
                    setTimeout(() => {
                        let p = document.createElement("p");
                        p.textContent = decryptedWord;
                        p.style.opacity = "0";
                        p.style.transition = "opacity 1s";
                        document.body.appendChild(p);
                        setTimeout(() => { p.style.opacity = "1"; }, 500);
                    }, delay);
                    delay += 1000;
                }
            }
        })
        .catch(error => console.error("Erreur de chargement des mots cachés :", error));
}
