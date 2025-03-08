// Fonction pour hacher une chaîne de caractères (SHA-256)
async function hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Réponses attendues (hachées)
const expectedHashes = {
    q1: "d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1", // "rouge"
    q2: "f5ca38f748a1d6eaf726b8a42fb575c3c71f1864a8143301782de13da2d9202b", // "1963"
    q3: "1b4f0e9851971998e732078544c96b36c3d01cedf7caa332359d6f1d83567014", // "Sousa Almeida"
    q4: "9b9b7f7e8a9b9b7f7e8a9b9b7f7e8a9b9b7f7e8a9b9b7f7e8a9b9b7f7e8a9b9b"  // "capsule temporelle"
};

// 12 mots à afficher (hachés)
const secretWordsHash = "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"; // Hachage des 12 mots

// Fonction pour poser les questions dans la console
async function askQuestions() {
    console.log("Bienvenue. Réponds aux questions pour débloquer le secret.");

    // Question 1
    console.log("Question 1 : Rouge ou bleu ?");
    const answer1 = await waitForConsoleInput();
    const hash1 = await hashString(answer1.toLowerCase());
    if (hash1 !== expectedHashes.q1) {
        console.log("Mauvaise réponse. Essaie encore.");
        return;
    }

    // Question 2
    console.log("Question 2 : En quelle année est née ton père ?");
    const answer2 = await waitForConsoleInput();
    const hash2 = await hashString(answer2);
    if (hash2 !== expectedHashes.q2) {
        console.log("Mauvaise réponse. Essaie encore.");
        return;
    }

    // Question 3
    console.log("Question 3 : Quel est le nom de naissance de ta mère ?");
    const answer3 = await waitForConsoleInput();
    const hash3 = await hashString(answer3);
    if (hash3 !== expectedHashes.q3) {
        console.log("Mauvaise réponse. Essaie encore.");
        return;
    }

    // Question 4
    console.log("Question 4 : Retourné avec un motoculteur ?");
    const answer4 = await waitForConsoleInput();
    const hash4 = await hashString(answer4.toLowerCase());
    if (hash4 !== expectedHashes.q4) {
        console.log("Mauvaise réponse. Essaie encore.");
        return;
    }

    // Si toutes les réponses sont correctes, afficher les 12 mots
    console.log("Félicitations ! Voici les 12 mots :");
    console.log(secretWordsHash); // En production, utilise une méthode sécurisée pour afficher les mots
}

// Fonction pour attendre une entrée dans la console
function waitForConsoleInput() {
    return new Promise((resolve) => {
        // Créer un champ de saisie invisible dans la page
        const input = document.createElement("input");
        input.type = "text";
        input.style.position = "fixed";
        input.style.top = "-1000px";
        document.body.appendChild(input);

        // Focus sur le champ de saisie
        input.focus();

        // Écouter la touche "Entrée"
        input.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const value = input.value;
                document.body.removeChild(input); // Supprimer le champ de saisie
                resolve(value);
            }
        });
    });
}

// Démarrer le questionnaire
askQuestions();