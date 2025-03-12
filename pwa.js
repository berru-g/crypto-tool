// pwa.js - Transforme le site en PWA et gère l'installation
// Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
            console.log('✅ Service Worker enregistré :', registration);
        })
        .catch((error) => {
            console.error('❌ Erreur Service Worker :', error);
        });
}

// Détection de l'installation PWA
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById("installApp").style.display = "block";

    document.getElementById("installApp").addEventListener("click", () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("📲 PWA installée !");
            }
            deferredPrompt = null;
        });
    });
});
