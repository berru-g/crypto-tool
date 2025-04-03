/* Importation de Three.js et du GLTFLoader
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';*/
import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";

// Initialisation de la scène
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lumière ambiante et directionnelle
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 5).normalize();
scene.add(directionalLight);

// Sphère avec texture représentant la Terre
const sphereGeometry = new THREE.SphereGeometry(50, 32, 32);
const textureLoader = new THREE.TextureLoader();
const sphereMaterial = new THREE.MeshStandardMaterial({
    map: textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/grasslight-big.jpg'),
    roughness: 1,
    metalness: 0
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.rotation.x = Math.PI / 2;
scene.add(sphere);

// Fonction pour charger et ajouter des arbres à partir des fichiers GLB
function createTreeFromGLB(filePath, position, size) {
    const loader = new GLTFLoader();
    loader.load(filePath, (gltf) => {
        const tree = gltf.scene;
        tree.scale.set(size, size, size); // Ajuste la taille de l'arbre
        tree.position.set(position.x, position.y, position.z);
        scene.add(tree);
    });
}

// API CoinGecko pour récupérer les informations des tokens
async function fetchCryptoData() {
    const tokens = ['bitcoin', 'ethereum', 'solana', 'aave', 'bittensor', 'near'];
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${tokens.join(',')}&order=market_cap_desc&per_page=6&page=1&sparkline=false`);
    const data = await response.json();
    
    data.forEach((coin, index) => {
        // Taille de l'arbre en fonction du volume 24h
        const size = Math.log10(coin.total_volume) * 0.5;
        const position = {
            x: Math.cos(index * Math.PI / 3) * 55,
            y: 10,
            z: Math.sin(index * Math.PI / 3) * 55
        };

        // Associe chaque arbre avec un fichier GLB spécifique
        const treeFiles = ['arbre1.glb', 'arbre2.glb', 'arbre3.glb', 'arbre4.glb', 'arbre5.glb', 'arbre6.glb'];
        createTreeFromGLB(`assets/trees/${treeFiles[index]}`, position, size);
    });
}
fetchCryptoData();

// Position de la caméra
camera.position.set(0, 50, 200);
camera.lookAt(0, 0, 0);

// Rotation interactive de la sphère
function enableRotation() {
    let mouseX = 0;
    let mouseY = 0;
    let isMouseDown = false;

    window.addEventListener('mousedown', (e) => {
        isMouseDown = true;
    });

    window.addEventListener('mouseup', () => {
        isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
        if (isMouseDown) {
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            sphere.rotation.y += mouseX * 0.05;
            sphere.rotation.x += mouseY * 0.05;
        }
    });
}

// Activer la rotation de la sphère
enableRotation();

// Animation de la scène
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();
