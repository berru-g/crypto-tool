const alarmSoundUpper = document.getElementById('alarmSoundUpper');
        const alarmSoundLower = document.getElementById('alarmSoundLower');
        const solanaPriceDisplay = document.getElementById('solanaPriceDisplay');

        let tokenSymbol = ''; // Le token saisi par l'utilisateur
        let targetLowerPrice = 0; // Prix bas saisi par l'utilisateur
        let targetUpperPrice = 0; // Prix haut saisi par l'utilisateur

        // Écoute l'événement de soumission du formulaire
        document.getElementById('priceForm').addEventListener('submit', function (event) {
            event.preventDefault(); // Empêche le rechargement de la page

            // Récupère les valeurs saisies par l'utilisateur
            tokenSymbol = document.getElementById('token').value.toLowerCase();
            targetLowerPrice = parseFloat(document.getElementById('targetLowerPrice').value);
            targetUpperPrice = parseFloat(document.getElementById('targetUpperPrice').value);

            // Démarre la surveillance du prix
            checkSolanaPrice();
            setInterval(checkSolanaPrice, 10000); // Vérifie le prix toutes les 10 secondes
        });

        function checkSolanaPrice() {
            if (!tokenSymbol || !targetLowerPrice || !targetUpperPrice) {
                console.error('Veuillez saisir un token et des prix valides.');
                return;
            }

            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol}&vs_currencies=usd`)
                .then(response => response.json())
                .then(data => {
                    const tokenPrice = data[tokenSymbol]?.usd;
                    if (tokenPrice === undefined) {
                        console.error(`Token "${tokenSymbol}" non trouvé.`);
                        solanaPriceDisplay.textContent = `Notez le nom complet avec un tiret si nécessaire. Ex: pour btc notez (bitcoin), pour injective notez (injective-protocol), pour Akash notez (akash-network), pour RSR notez (reserve-rights-token) etc.`;
                        return;
                    }

                    solanaPriceDisplay.textContent = `${tokenSymbol} : $${tokenPrice.toFixed(8)}`;

                    if (tokenPrice < targetLowerPrice) {
                        console.log('Le prix est descendu en dessous de la limite inférieure, déclenchement de l\'alarme descendante');
                        playLowerAlarm();
                        solanaPriceDisplay.textContent = `👇 ${tokenSymbol} : $${tokenPrice.toFixed(2)}`;
                        document.body.style.backgroundColor = '#ab9ff2';
                        document.body.style.color = 'black';
                    } else if (tokenPrice > targetUpperPrice) {
                        console.log('Le prix a dépassé la limite supérieure, déclenchement de l\'alarme ascendante');
                        playUpperAlarm();
                        solanaPriceDisplay.textContent = `👆 ${tokenSymbol} : $${tokenPrice.toFixed(2)}`;
                        document.body.style.backgroundColor = '#0ebeff';
                        document.body.style.color = 'black';
                    } else {
                        console.log('Le prix est dans la plage spécifiée');
                        document.body.style.backgroundColor = '#333';
                        document.body.style.color = 'white';
                    }
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération du prix :', error);
                });
        }

        function playUpperAlarm() {
            alarmSoundUpper.play();
        }

        function playLowerAlarm() {
            alarmSoundLower.play();
        }
        // menu
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
        // Gestion du bouton de bascule
        const themeToggleButton = document.createElement('button');
        themeToggleButton.className = 'theme-toggle';
        themeToggleButton.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
        document.body.appendChild(themeToggleButton);

        themeToggleButton.addEventListener('click', () => {
            if (document.body.classList.contains('dark-mode')) {
                document.body.classList.replace('dark-mode', 'light-mode');
                themeToggleButton.textContent = 'Dark';
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.replace('light-mode', 'dark-mode');
                themeToggleButton.textContent = 'Light';
                localStorage.setItem('theme', 'dark');
            }
        });