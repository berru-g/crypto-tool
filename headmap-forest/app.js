import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Initialisation de la scène
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Création du fond d'écran
const bgTexture = new THREE.TextureLoader().load('https://github.com/berru-g/plane/blob/main/avion/layered.jpg?raw=true');
scene.background = bgTexture;

// Contrôles pour faire tourner la planète
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;

// Création de la sphère avec la texture demandée
const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
const earthTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/refs/heads/dev/examples/textures/terrain/grasslight-big.jpg');
const earthMaterial = new THREE.MeshPhongMaterial({ 
    map: earthTexture,
    specular: new THREE.Color(0x111111),
    shininess: 5
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Éclairage fixe (position statique)
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 3, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Position de la caméra
camera.position.z = 10;

// Création d'un tooltip HTML
const tooltip = document.createElement('div');
tooltip.style.position = 'absolute';
tooltip.style.backgroundColor = 'rgba(0,0,0,0.7)';
tooltip.style.color = 'white';
tooltip.style.padding = '8px 12px';
tooltip.style.borderRadius = '4px';
tooltip.style.display = 'none';
tooltip.style.pointerEvents = 'none';
document.body.appendChild(tooltip);

// Fonction pour créer un arbre avec feuillage
function createTree(size, lat, lon, tokenData) {
    // Ajustement de la taille basé sur le volume (échelle logarithmique)
    const baseSize = Math.max(0.1, Math.log10(tokenData.total_volume) / 3);
    
    // Tronc (cylindre marron)
    const trunkHeight = baseSize * 0.8;
    const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, trunkHeight, 8);
    const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    
    // Feuillage (sphère verte avec variation aléatoire)
    const foliageSize = baseSize * 0.6;
    const foliageGeometry = new THREE.SphereGeometry(foliageSize, 8, 8);
    const foliageMaterial = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(`hsl(${Math.random() * 60 + 100}, 70%, 40%)`),
        transparent: true,
        opacity: 0.9
    });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + foliageSize * 0.5;
    
    // Groupe pour l'arbre complet
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(foliage);
    
    // Positionnement sur la sphère
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const radius = 5.05; // Juste au-dessus de la surface
    
    tree.position.x = - (radius * Math.sin(phi) * Math.cos(theta));
    tree.position.y = radius * Math.cos(phi);
    tree.position.z = radius * Math.sin(phi) * Math.sin(theta);
    
    // Orientation vers l'extérieur
    tree.lookAt(earth.position);
    tree.rotateX(Math.PI / 2);
    
    // Stockage des données du token
    tree.userData = {
        name: tokenData.name,
        symbol: tokenData.symbol,
        volume: tokenData.total_volume,
        price: tokenData.current_price
    };
    
    return tree;
}

// Récupération des données depuis CoinGecko
async function fetchTokenData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=100');
        const data = await response.json();
        
        // Nettoyer la scène des anciens arbres
        scene.children.filter(child => child.userData?.isTree).forEach(tree => scene.remove(tree));
        
        // Créer les arbres pour chaque token
        data.forEach((token, index) => {
            // Répartition sur la sphère (vous pourriez utiliser des coordonnées spécifiques)
            const lat = Math.random() * 160 - 80; // Éviter les pôles
            const lon = Math.random() * 360 - 180;
            
            const tree = createTree(1, lat, lon, token);
            tree.userData.isTree = true;
            scene.add(tree);
        });
        
        console.log(`${data.length} tokens chargés`);
    } catch (error) {
        console.error('Error fetching token data:', error);
    }
}

// Gestion du survol des arbres
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    // Mise à jour de la position de la souris
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting pour détecter les intersections
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.userData?.isTree));
    
    if (intersects.length > 0) {
        const tree = intersects[0].object;
        
        // Mise à jour du tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.clientX + 15}px`;
        tooltip.style.top = `${event.clientY + 15}px`;
        tooltip.innerHTML = `
            <strong>${tree.userData.name} (${tree.userData.symbol})</strong><br>
            Volume 24h: $${tree.userData.volume.toLocaleString()}<br>
            Prix: $${tree.userData.price.toLocaleString()}
        `;
        
        // Effet de surbrillance (optionnel)
        tree.children[1].material.emissive = new THREE.Color(0x444444);
    } else {
        tooltip.style.display = 'none';
        
        // Réinitialiser la surbrillance sur tous les arbres
        scene.children.filter(child => child.userData?.isTree).forEach(tree => {
            tree.children[1].material.emissive = new THREE.Color(0x000000);
        });
    }
}

window.addEventListener('mousemove', onMouseMove, false);

// Animation
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialisation
fetchTokenData();
animate();

// Mise à jour périodique des données (toutes les 5 minutes)
setInterval(fetchTokenData, 5 * 60 * 1000);