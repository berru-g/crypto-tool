fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,near,bittensor,solana,reserve-rights-token,mysterium,aave,ethereum')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('crypto-prices');

    const tokenHoldings = {
      bitcoin: 0,
      bittensor: 0,
      near: 0,
      solana: 1.89,
      ethereum: 0,
      'reserve-rights-token': 41560,
      mysterium: 16.16,
      aave: 1.31,
    };

    let totalPortfolioValue = 0;

    data.forEach(crypto => {
      const price = crypto.current_price;
      const change24h = crypto.price_change_percentage_24h.toFixed(2);
      const holdings = tokenHoldings[crypto.id] || 0;
      const totalValue = (price * holdings).toFixed(2);
      const imageUrl = crypto.image; // ✅ Ici, l'image est bien présente

      totalPortfolioValue += parseFloat(totalValue);

      let cryptoElement = document.querySelector(`#${crypto.id}`);

      if (!cryptoElement) {
        cryptoElement = document.createElement('div');
        cryptoElement.id = crypto.id;
        cryptoElement.classList.add('crypto-item');
        cryptoElement.innerHTML = `
          <p style="display: flex; align-items: center;">
            <img src="${imageUrl}" alt="${crypto.id} logo" style="width: 30px; height: 30px; margin-right: 10px;">
            <!--<span>${crypto.symbol.toUpperCase()}</span>-->
          </p>
          <p class="price" style="color:#333;">${price}$</p>
          <p class="holdings" style="color:grey;">${totalValue}$</p>
          <p class="change">${change24h}%</p>
        `;
        container.appendChild(cryptoElement);
      } else {
        cryptoElement.querySelector('.price').textContent = `$${price}`;
        cryptoElement.querySelector('.holdings').textContent = `Montant détenu : ${holdings} (Valeur totale : $${totalValue})`;
        cryptoElement.querySelector('.change').textContent = `24h : ${change24h}%`;
      }

      const changeElement = cryptoElement.querySelector('.change');
      changeElement.style.color = change24h < 0 ? '#f56545' : '#3ad38b';
    });

    let totalElement = document.querySelector('#portfolio-total');
    if (!totalElement) {
      totalElement = document.createElement('div');
      totalElement.id = 'portfolio-total';
      totalElement.classList.add('portfolio-total');
      container.appendChild(totalElement);
    }

    totalElement.innerHTML = `<h3 id="total" style="color:#ab9ff2"> ${totalPortfolioValue.toFixed(2)} $</h3>`;
  })
  .catch(error => console.error('Erreur lors de la récupération des données:', error));

const hamburgerMenu = document.querySelector('.hamburger-menu');

hamburgerMenu.addEventListener('click', () => {
  // Utilisation de SweetAlert pour afficher la fenêtre contextuelle
  Swal.fire({
    title: '0x',
    html: '<ul><li><a href="https://accounts.binance.com/register?ref=">Binance</a>.com</li><li><a href="https://shop.ledger.com/?r=">Ledger</a>/live</li><li><a href="https://app.uniswap.org">Uniswap</a>.org<li><a href="#">Phantom</a>/app</li><li><a href="https://solscan.io/account/D6khWoqvc2zX46HVtSZcNrPumnPLPM72SnSuDhBrZeTC#portfolio">Solscan</a>.io</li><li><a href="https://pump.fun/profile/D6khWo">Pump</a>.fun</li><li><a href="https://jup.ag">jup</a>.ag</li></ul>',
    showCloseButton: true,
    showConfirmButton: false,
    customClass: {
      popup: 'custom-swal-popup',
      closeButton: 'custom-swal-close-button',
      content: 'custom-swal-content',
    }
  });
});
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
      backgroundColor: "",

    }).showToast();
  });
});