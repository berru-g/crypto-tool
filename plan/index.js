<!--
 - adapter a la landing page
 - prevoir 3 plan, free plan, pro trader, expert
 - payement via ...
 - redirection + inscription ( php, sql 'en cour' )
-->
<head>
	<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
	<title>Carrousel Outils Crypto</title>
</head>

<body>
	<div class="main-container">
		<div class="carousel-container">
			<div class="carousel">
				<div class="card subscription">
					<div class="subscription-header">
						<i class="fas fa-coins"></i>
						<h3>Basic Tools</h3>
						<div class="price">Free</div>
					</div>
					<ul class="features">
						<li><i class="fas fa-check"></i> Portfolio tracker</li>
						<li><i class="fas fa-check"></i> Prix des cryptos</li>
						<li><i class="fas fa-check"></i> Alertes basiques</li>
						<li><i class="fas fa-times"></i> <span class="disabled">Analyse technique</span></li>
					</ul>
					<a href="https://crypto-free-tools.netlify.app/" class="subscribe-btn">Accéder</a>
				</div>

				<div class="card subscription popular">
					<div class="popular-badge">TOP</div>
					<div class="subscription-header">
						<i class="fas fa-chart-line"></i>
						<h3>Pro Trader</h3>
						<div class="price">5€<span>/mois</span></div>
					</div>
					<ul class="features">
						<li><i class="fas fa-check"></i> Tous les outils Basic</li>
						<li><i class="fas fa-check"></i> Indicateurs avancés</li>
						<li><i class="fas fa-check"></i> Backtesting</li>
						<li><i class="fas fa-check"></i> Signaux en temps réel</li>
					</ul>
					<a href="https://crypto-free-tools.netlify.app/" class="subscribe-btn">Essai 7 jours</a>
				</div>

				<div class="card subscription">
					<div class="subscription-header">
						<i class="fa-solid fa-rocket"></i>
						<h3>XXL</h3>
						<div class="price">15€<span>/mois</span></div>
					</div>
					<ul class="features">
						<li><i class="fas fa-check"></i> Toute les options +</li>
						<li><i class="fas fa-check"></i> Bilan mensuel</li>
						<li><i class="fas fa-check"></i> Accès au forum</li>
						<li><i class="fas fa-check"></i> Alertes intelligentes</li>
					</ul>
					<a href="https://crypto-free-tools.netlify.app/" class="subscribe-btn">Démarrer</a>
				</div>
				<div class="card subscription">
					<div class="subscription-header">
						<i class="fas fa-robot"></i>
						<h3>AI Assistant</h3>
						<div class="price">25€<span>/mois</span></div>
					</div>
					<ul class="features">
						<li><i class="fas fa-check"></i> Analyse prédictive</li>
						<li><i class="fas fa-check"></i> Optimisation de portefeuille</li>
						<li><i class="fas fa-check"></i> Rapports automatiques</li>
						<li><i class="fas fa-check"></i> Alertes intelligentes</li>
					</ul>
					<a href="https://crypto-free-tools.netlify.app/" class="subscribe-btn">Démarrer</a>
				</div>
			</div>
		</div>
		<footer>
			<h5 style="margin-bottom:5px;">crypto-free-tools &copy; 2025 by <a href="https://berru-g.github.io/berru-g/">berru-g</a></h5>
		</footer>
	</div>
</body>