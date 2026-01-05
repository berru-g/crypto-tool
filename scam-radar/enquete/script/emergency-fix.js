// emergency-fix.js - À charger APRÈS tous tes autres scripts
(function() {
    console.log('🔴 APPLICATION DU PATCH D\'URGENCE');
    
    // 1. STOPPER TOUTES LES BOUCLES
    const allIntervals = [];
    const originalSetInterval = window.setInterval;
    const originalSetTimeout = window.setTimeout;
    
    window.setInterval = function(fn, delay) {
        const id = originalSetInterval(fn, delay);
        allIntervals.push(id);
        console.warn('⚠️ Interval créé:', id, 'fn:', fn.name || 'anonymous');
        return id;
    };
    
    // 2. BLOQUER LES MULTIPLES RENDU
    let renderLock = false;
    let renderCount = 0;
    const maxRenders = 20;
    console.log("teste 20");
    if (window.renderNetwork) {
        const originalRender = window.renderNetwork;
        window.renderNetwork = function() {
            renderCount++;
            if (renderLock) {
                console.log('🔒 Rendu bloqué (lock actif)');
                return;
            }
            if (renderCount > maxRenders) {
                console.warn('⚠️ Trop de rendus, stoppé à', renderCount);
                return;
            }
            
            renderLock = true;
            console.log('🎬 Début rendu #' + renderCount);
            
            originalRender();
            
            setTimeout(() => {
                renderLock = false;
                console.log('🔓 Lock libéré');
            }, 500);
        };
    }
    
    // 3. KILLER LES PHYSIQUES AGGRESSIVES
    setTimeout(() => {
        if (network) {
            console.log('🧨 Application des paramètres stables');
            network.setOptions({
                physics: {
                    enabled: false, // COUPER LA PHYSIQUE
                    stabilization: false
                }
            });
            
            // Forcer la stabilisation
            network.stopSimulation();
            network.setOptions({ physics: false });
            
            console.log('✅ Physique désactivée');
        }
    }, 3000);
    
    // 4. AJOUTER UN PANEL DE DEBUG
    const debugPanel = document.createElement('div');
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: #0f0;
        padding: 10px;
        font-family: monospace;
        font-size: 12px;
        z-index: 99999;
        border: 2px solid red;
        max-width: 300px;
    `;
    
    function updateDebug() {
        if (!network) return;
        const canvas = document.querySelector('.vis-network canvas');
        debugPanel.innerHTML = `
            <strong>DEBUG MAP NUCLEAIRE</strong><br>
            Network: ${network ? '✓' : '✗'}<br>
            Canvases: ${document.querySelectorAll('canvas').length}<br>
            Physics: ${network.body.data.physics.enabled ? 'ON' : 'OFF'}<br>
            Lock: ${renderLock ? '🔒' : '🔓'}<br>
            Renders: ${renderCount}<br>
            <button onclick="network.stopSimulation()" style="background:red;color:white;">STOP PHYSICS</button>
            <button onclick="network.setOptions({physics:false})" style="background:darkred;color:white;">KILL PHYSICS</button>
        `;
    }
    
    document.body.appendChild(debugPanel);
    setInterval(updateDebug, 1000);
    
    console.log('🚀 Patch d\'urgence appliqué');
})();