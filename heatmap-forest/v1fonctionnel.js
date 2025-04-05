// ====== version du 05/04/25 ======
document.getElementById('loading').textContent = "Préparation de l'environnement...";
// Attendre que tout soit prêt
window.addEventListener('load', async function () {
    try {
        // ====== CONFIGURATION ======
        const CONFIG = {
            earthSize: 0.3,
            // probleme de sécurité détecté dans firefox et google - cause probable / appel du RAW
            // revenir en 
            // https://raw.githubusercontent.com/berru-g/crypto-tool/main/heatmap-forest/ 
            // pour le taf localsinon utiliser les chemins relatif !
            earthTexture: './assets/my-map4.jpg',
             
            treeModels: [
                './assets/blue_tree.glb',
                './assets/boulot_tree.glb',
                './assets/coconut_tree.glb',
                './assets/tree_house.glb',
                './assets/pine_tree.glb',
                './assets/orange_tree.glb'
            ],
            fixedLightPosition: new THREE.Vector3(-5, 3, 5),
            treeDensity: 1.5
        };

        // ====== SCÈNE THREE.JS ======
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(7, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        /* ====== LUMIÈRES ======
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
        directionalLight.position.copy(CONFIG.fixedLightPosition);
        scene.add(directionalLight);
        scene.add(new THREE.AmbientLight(0x404040, 0.6));

        const haloLight = new THREE.PointLight(0x88ccff, 0.8, 10);
        haloLight.position.copy(CONFIG.fixedLightPosition);
        scene.add(haloLight); CONFIG*/
        // ====== LUMIÈRES ======
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-5, 0, 0); // À gauche de l'écran (ajuste la valeur en X si besoin)
        scene.add(directionalLight);

        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        scene.add(ambientLight);

        const haloLight = new THREE.PointLight(0x88ccff, 0.6, 4);
        haloLight.position.set(-5, 0, 0); // Même position que la lumière directionnelle
        scene.add(haloLight);

        // ====== TERRE ======
        document.getElementById('loading').textContent = "Chargement de la Terre...";

        const earthTexture = await new THREE.TextureLoader().loadAsync(CONFIG.earthTexture);
        const earth = new THREE.Mesh(
            new THREE.SphereGeometry(CONFIG.earthSize, 64, 64),
            new THREE.MeshPhongMaterial({
                map: earthTexture,
                specular: new THREE.Color(0x111111),
                shininess: 15,
                transparent: false,
                //opacity: 0.97
            })
        );
        scene.add(earth);

        // ====== ARBRES ======
        document.getElementById('loading').textContent = "Chargement des modèles (0/6)...";
        const treeTemplates = [];
        const loader = new THREE.GLTFLoader();

        // Chargement séquentiel (plus stable que parallèle)
        for (let i = 0; i < CONFIG.treeModels.length; i++) {
            try {
                const model = await loader.loadAsync(CONFIG.treeModels[i]);
                model.scene.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                model.scene.scale.set(0.25, 0.25, 0.25);
                model.scene.visible = false;
                scene.add(model.scene);
                treeTemplates.push(model.scene);
                document.getElementById('loading').textContent = `Chargement des modèles (${i + 1}/6)...`;
                document.getElementById('loading').textContent = `La heatmap la plus fun du net`;
            } catch (e) {
                console.error(`Erreur modèle ${i}:`, e);
            }
        }

        // Fallback si échec
        if (treeTemplates.length < 3) {
            console.warn("Création d'arbres basiques...");
            for (let i = 0; i < 3; i++) {
                const tree = new THREE.Group();
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.1, 0.15, 0.8, 8),
                    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
                );
                trunk.position.y = 0.4;

                const foliage = new THREE.Mesh(
                    new THREE.SphereGeometry(0.5, 16, 16),
                    new THREE.MeshPhongMaterial({
                        color: new THREE.Color(`hsl(${100 + i * 30}, 70%, 50%)`),
                        transparent: true,
                        opacity: 0.9
                    })
                );
                foliage.position.y = 0.9;

                tree.add(trunk);
                tree.add(foliage);
                tree.visible = false;
                scene.add(tree);
                treeTemplates.push(tree);
            }
        }

        // ====== DONNÉES CRYPTO ======
        document.getElementById('loading').textContent = "Récupération des données...";
        document.getElementById('loading').textContent = "Chaque arbre représente un token, sa taille varie selon son volume de transaction.";
        let cryptoData;

        try {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=50');
            cryptoData = await response.json();
            cryptoData = cryptoData.filter(token => token.total_volume > 0);
        } catch (e) {
            console.error("API hors ligne, données de test utilisées");
            cryptoData = [
                { name: "Bitcoin", symbol: "BTC", total_volume: 25000000000, current_price: 50000 },
                { name: "Ethereum", symbol: "ETH", total_volume: 15000000000, current_price: 3000 },
                { name: "Cardano", symbol: "ADA", total_volume: 5000000000, current_price: 1.5 }
            ];
        }

        /* ====== PLACEMENT DES ARBRES ======
        document.getElementById('loading').textContent = "Placement des arbres...";
        const trees = [];
        const volumes = cryptoData.map(t => t.total_volume);
        const minVol = Math.min(...volumes);
        const maxVol = Math.max(...volumes);

        cryptoData.forEach((token, i) => {
            const size = 0.2 + 0.8 * (Math.log(token.total_volume) - Math.log(minVol)) / (Math.log(maxVol) - Math.log(minVol));
            const lat = Math.random() * 160 - 80;
            const lon = Math.random() * 360;

            const tree = treeTemplates[i % treeTemplates.length].clone();
            tree.visible = true;
            tree.scale.set(size, size, size);

            // Positionnement sphérique
            const phi = (90 - lat) * Math.PI / 180;
            const theta = lon * Math.PI / 180;
            const radius = CONFIG.earthSize * 1.02;

            tree.position.x = -radius * Math.sin(phi) * Math.cos(theta);
            tree.position.y = radius * Math.cos(phi);
            tree.position.z = radius * Math.sin(phi) * Math.sin(theta);

            tree.lookAt(earth.position);
            tree.rotateX(Math.PI / 2);

            // Stockage des données
            tree.userData = {
                name: token.name,
                symbol: token.symbol,
                volume: token.total_volume,
                price: token.current_price,
                isTree: true
            };

            scene.add(tree);
            trees.push(tree);
        });*/
        // ====== PLACEMENT DES ARBRES - VERSION AMÉLIORÉE ======
        document.getElementById('loading').textContent = "Placement des arbres...";
        const trees = [];
        const volumes = cryptoData.map(t => t.total_volume);
        const minVol = Math.min(...volumes);
        const maxVol = Math.max(...volumes);

        // Nouveau placement plus dense
        cryptoData.forEach((token, i) => {
            // Taille basée sur le volume (ajustée pour le nouveau globe)
            const size = 0.15 + 0.6 * (Math.log(token.total_volume) - Math.log(minVol)) / (Math.log(maxVol) - Math.log(minVol));
            
            // Position aléatoire mais plus serrée
            const lat = 180 * (Math.random() - 0.5); // Latitude entre -90 et 90
            const lon = 360 * Math.random(); // Longitude entre 0 et 360
            
            // Clone le modèle
            const tree = treeTemplates[i % treeTemplates.length].clone();
            tree.visible = true;
            tree.scale.set(size, size, size);

            // Positionnement sphérique amélioré
            const phi = (90 - lat) * Math.PI / 180;
            const theta = lon * Math.PI / 180;
            const radius = CONFIG.earthSize * (1.01 + 0.02 * Math.random()); // Léger offset aléatoire

            tree.position.set(
                -radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.cos(phi),
                radius * Math.sin(phi) * Math.sin(theta)
            );

            // Alignement à la surface
            tree.lookAt(earth.position);
            tree.rotateX(Math.PI / 2);

            // Ajustement pour que la base touche bien la sphère
            tree.position.multiplyScalar(1 + (0.005 * size)); // Compensation en fonction de la taille

            // Stockage des données
            tree.userData = {
                name: token.name,
                symbol: token.symbol,
                volume: token.total_volume,
                price: token.current_price,
                isTree: true
            };

            scene.add(tree);
            trees.push(tree);
        });

        // ====== INTERACTIONS ======
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        camera.position.z = 12;

        const tooltipElement = document.getElementById('tooltip');
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(trees, true);

            if (intersects.length > 0) {
                let obj = intersects[0].object;
                while (obj && !obj.userData?.isTree && obj.parent) {
                    obj = obj.parent;
                }

                if (obj?.userData?.isTree) {
                    const token = obj.userData;
                    tooltipElement.style.display = 'block';
                    tooltipElement.style.left = `${event.clientX + 15}px`;
                    tooltipElement.style.top = `${event.clientY + 15}px`;
                    tooltipElement.innerHTML = `
                        <strong>${token.name} (${token.symbol})</strong><br>
                        Volume 24h: $${(token.volume / 1000000000).toFixed(1)}B<br>
                        Prix: $${token.price?.toLocaleString() || 'N/A'}
                    `;
                    return;
                }
            }

            tooltipElement.style.display = 'none';
        });

        // ====== ANIMATION ======
        /*function animate() {
            requestAnimationFrame(animate);

            // Maintient la lumière fixe
            directionalLight.position.copy(CONFIG.fixedLightPosition);
            haloLight.position.copy(CONFIG.fixedLightPosition);

            controls.update();
            renderer.render(scene, camera);
        }*/

        function animate() {
            requestAnimationFrame(animate);

            // Si tu veux que la lumière reste à gauche de la caméra :
            directionalLight.position.copy(camera.position);
            directionalLight.position.x -= 5; // Décalage à gauche
            directionalLight.position.y += 0; // Ajuste en Y si besoin
            directionalLight.position.z += 0; // Ajuste en Z si besoin

            // (Optionnel) Même chose pour le haloLight si tu veux qu'il suive aussi
            haloLight.position.copy(directionalLight.position);

            renderer.render(scene, camera);
        }



        // ====== LANCEMENT FINAL ======
        document.getElementById('loading').style.display = 'none';
        animate();
        
        // Redimensionnement
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

    } catch (error) {
        console.error("ERREUR CRITIQUE:", error);
        document.getElementById('loading').textContent = "Erreur : " + (error.message || "Voir console (F12)");
    }
});