# CLAUDE.md

## Projet
Simulation de mécanique céleste : gravité N-corps avec particules dessinées sur un `<canvas>` HTML5. TP web L1S2, vanilla JS + jQuery.

## Objectif agent
Site statique de 3 fichiers, sans build. Faire des changements ciblés et minimaux. Ne pas introduire de framework, bundler, ni `package.json` sauf demande explicite. Si une modif touche la physique ou le rendu, proposer un plan court d'abord.

## Stack
- HTML5 + `<canvas>` 2D (`getContext("2d")`)
- CSS vanilla (sélecteurs par `#id`)
- JavaScript ES6 (classe `Particle`, pas de modules)
- jQuery 3.6.0 via CDN (uniquement pour le toggle afficher/masquer des contrôles)

## Map du repo
- `projet.html` — page + structure DOM, charge jQuery puis `script.js`
- `script.js` — toute la logique : particules, physique (gravité + collisions/fusion), explosions, contrôles UI
- `style.css` — mise en page (flex), panneau de contrôle, boutons

## Commandes
- run: ouvrir `projet.html` dans un navigateur (double-clic ou `open projet.html`)
- Pas de install / build / lint / test.

## Conventions
- IDs DOM et noms de variables en français, casse mixte existante (`Startbouton`, `Hidebouton`, `Controle`) — respecter le style en place.
- DOM lu via `document.getElementById` en tête de `script.js`; garder ce pattern.
- Dimensions canvas lues via `canvas.getAttribute("width"|"height")` (renvoie une string, coercion implicite) — ne pas « corriger » en ajoutant `parseInt` sans raison.
- Couleur des particules ajoutées = aléatoire (`getRandomColor`) ; pas de sélecteur de couleur. Corps central en `#f6ff07`.
- Masse pilotée par le `#slider` (1–500) synchronisé avec `#masse` ; les deux remis à 250 au Recommencer.
- Double-clic sur le canvas = ajoute une particule (masse = `#slider`) en orbite circulaire autour du corps central.

## Règles non négociables
- NE PAS supprimer le chargement jQuery (le toggle des contrôles en dépend).
- Les scripts restent chargés en fin de `<body>` (le DOM doit exister avant lecture des éléments).
- Garder le rendu dans la boucle `setInterval` (~10 ms) pilotée par `Startbouton`/`Stopbouton`.
- Ne pas casser la suppression des particules qui sortent du canvas dans `calculDesMouvements`.

## Priorités
1. Comportement physique/visuel inchangé sauf demande
2. Changements à faible impact
3. Lisibilité
4. Performance de la boucle d'animation

## Gotchas
- Dans `calculDesMouvements`, la mise à jour vitesse/position est **imbriquée dans la boucle `j`** (intégration appliquée par interaction, pas une fois par pas). C'est le comportement actuel voulu — ne pas « réparer » sans accord.
- Force = `G·mi·mj/(r²+softening²)` (G=1), puis accélération = `f/masse` → indépendante de la masse du corps (correct). Ne pas retirer la division par `masse`, ni la constante `softening` (borne la force quand `r→0`, évite les éjections).
- Init orbital : vitesse circulaire képlérienne `v = √(particles[0].masse / r)`. Ne pas revenir à `v ∝ r` (casse les orbites circulaires).
- `initSimulation()` (appelée au chargement **et** par le bouton Recommencer `#Restartbouton`) efface le canvas, vide `particles`/`sparks`, crée le corps central fixe via `createBigParticule` (`Move = false`, masse 3000) puis `nombreDeParticule` particules en orbite (rayon visuel = `masse/20`).
- Collision = fusion parfaitement inélastique (`gererCollisions`/`fusionner`) : conserve masse + quantité de mouvement, rayon à volume conservé `r=(r₁³+r₂³)^⅓` ; le corps fixe sinon le plus massif survit. Comportement voulu — ne pas revenir à « les deux explosent ».
- `fusionner` **additionne** les masses → `Number(masse)` obligatoire (`slider.value` est une string ; sinon concaténation au lieu d'addition).
- `sparks[]` + `spawnExplosion`/`dessineExplosions` = flash d'impact éphémère (pas de gravité), dessiné dans la boucle et vidé au Recommencer.
- Le texte du bouton est `↑ Masquer le controle` dans le HTML mais réécrit en `↑ Masquer les contrôles` par le JS.
