const gratitude = {
    épreuves: "forces cachées",
    chutes: "leçons déguisées",
    douleurs: "preuves d'existence",
    doutes: "portes du savoir",
    amour: "lumière du cœur",
    présent: "cadeau sacré",
  
    célébrerLaVie() {
      return Object.entries(this)
        .map(([clé, valeur]) => `${clé} : ${valeur}`)
        .join("\n");
    }
  };
  
  console.log(gratitude.célébrerLaVie()); 
  