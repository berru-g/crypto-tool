//navbar teste - fonctionne sur l'index principal mais pas ailleurs malgré l'appel du js dans le bon fichier - moi teubé - objectif finir la migration vers astro ou php
document.querySelector("#navbar-container").innerHTML = `
    <nav class="navbar">
        <a href="index.html"><span><i class="fa-solid fa-house"></i></span>home</a>
        <a href="#tradingview"><span><i class="fa-solid fa-chart-line"></i></span>chart</a>
        <a href="./narratif/index.html"><span><i class="fa-solid fa-sliders"></i></span>narratif</a>
        <a href="./chart-comparator/index.html"><span><i class="fa-solid fa-layer-group"></i></span>multi</a>
        <a href="./4graphiques/index.html"><span><i class="fa-solid fa-table-cells-large"></i></span>4 chart</a>
    </nav>
`;

