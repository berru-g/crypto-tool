// site to app btn 
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (event) => {
    console.log("beforeinstallprompt détecté !");
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById("installApp").style.display = "block";

    document.getElementById("installApp").addEventListener("click", () => {
        console.log("Bouton cliqué !");
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("L’utilisateur a installé l’application !");
            }
            deferredPrompt = null;
        });
    });
});


//////////////////////// dark mode 
const currentTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.add(currentTheme + '-mode');

// Gestion du bouton de bascule
const themeToggleButton = document.createElement('button');
themeToggleButton.className = 'theme-toggle';
themeToggleButton.textContent = currentTheme === 'dark' ? 'L/D' : 'D/L';
document.body.appendChild(themeToggleButton);

themeToggleButton.addEventListener('click', () => {
    if (document.body.classList.contains('dark-mode')) {
        document.body.classList.replace('dark-mode', 'light-mode');
        themeToggleButton.textContent = 'D/L';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.replace('light-mode', 'dark-mode');
        themeToggleButton.textContent = 'L/D';
        localStorage.setItem('theme', 'dark');
    }
});


// Sélection des éléments SHARE popup
const openPopupLink = document.querySelector('.open-popup');
const popup = document.getElementById('dyor-popup');
const closePopupButton = document.querySelector('.close-popup');

// Ouvrir le popup
openPopupLink.addEventListener('click', function (e) {
    e.preventDefault(); // Empêche le comportement par défaut du lien
    popup.style.display = 'flex'; // Affiche le popup
});

// Fermer le popup
closePopupButton.addEventListener('click', function () {
    popup.style.display = 'none'; // Cache le popup
});

// Fermer le popup en cliquant à l'extérieur
popup.addEventListener('click', function (e) {
    if (e.target === popup) {
        popup.style.display = 'none'; // Cache le popup si on clique à l'extérieur
    }
});
// Gestion du bouton de partage
document.addEventListener("DOMContentLoaded", () => {
    const shareButton = document.getElementById("shareButton");
    const sharePopup = document.getElementById("sharePopup");
    const currentURL = window.location.href;

    // Configurer les liens de partage
    const twitterShare = document.getElementById("twitterShare");
    twitterShare.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentURL)}&text=${encodeURIComponent("Tool magic Fibonacci Retracement !")}`;

    const whatsappShare = document.getElementById("whatsappShare");
    whatsappShare.href = `https://api.whatsapp.com/send?text=${encodeURIComponent("Tool magic Fibonacci Retracement  : " + currentURL)}`;

    const facebookShare = document.getElementById("facebookShare");
    facebookShare.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentURL)}`;

    // Afficher ou masquer le popup
    shareButton.addEventListener("click", () => {
        const isVisible = sharePopup.style.display === "flex";
        sharePopup.style.display = isVisible ? "none" : "flex";
    });

    // Copier le lien dans le presse-papier
    window.copyToClipboard = () => {
        navigator.clipboard.writeText(currentURL).then(() => {
            alert("Lien copié dans le presse-papier !");
        }).catch(err => {
            console.error("Échec de la copie du lien : ", err);
        });
    };

    // Cacher le popup quand on clique en dehors
    document.addEventListener("click", (e) => {
        if (!shareButton.contains(e.target) && !sharePopup.contains(e.target)) {
            sharePopup.style.display = "none";
        }
    });
});



//////////////////////////// MENU
const hamburgerMenu = document.querySelector('.hamburger-menu');

hamburgerMenu.addEventListener('click', () => {
    // Utilisation de SweetAlert pour afficher la fenêtre contextuelle
    Swal.fire({
        title: 'Cryptool',
        html: '<ul><p><a href="../index.html">Home</a></p><br><p><a href="https://github.com/berru-g/">Open Source</a></p><br><p><a href="../wallet/index.html">Wallet</a></p><br><p><a href="https://medium.com/@gael-berru">Articles</a></p><br><p><a href="https://berru-g.github.io/berru-g/blog/donation.html">Donation</a></p></ul>',
        showCloseButton: true,
        showConfirmButton: false,
        customClass: {
            popup: 'custom-swal-popup',
            closeButton: 'custom-swal-close-button',
            content: 'custom-swal-content',
        }
    });
});



// test firebase pour les notif MA
function getUserToken() {
    getToken(messaging, { vapidKey: "****" })
        .then((currentToken) => {
            if (currentToken) {
                console.log("🔥 Token Firebase:", currentToken);
                // Envoie ce token à ton backend pour envoyer des notifications
            } else {
                console.log("❌ Aucun token disponible.");
            }
        })
        .catch((err) => {
            console.log("Erreur lors de la récupération du token", err);
        });
}


// Ajout d'un événement pour chaque bouton Copier
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        const addressElement = document.getElementById(targetId);
        const address = addressElement.textContent;

        // Crée un élément temporaire pour copier le texte
        const tempInput = document.createElement('input');
        tempInput.value = address;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);

        // Optionnel : Feedback visuel
        Toastify({
            text: "✅ Adresse copiée !",
            duration: 2000,
            gravity: "center",
            position: "center",
            backgroundColor: "grey",

        }).showToast();
    });
});

// Features index, full info sur le token


