# DESIGN.md — Thème « Cosmos profond »

Système visuel de l'habillage de la page (titre, panneau de contrôle, boutons,
footer) autour de la simulation `<canvas>`. La physique et le rendu du canvas ne
sont pas concernés. Tokens définis en variables CSS dans `:root` ([style.css](style.css)).

## Couleurs

| Rôle | Token | Valeur |
|------|-------|--------|
| Fond spatial sombre | `--bg-0` | `#04050d` |
| Fond spatial (haut) | `--bg-1` | `#0a0a1e` |
| Accent violet | `--violet` | `#7c5cff` |
| Accent cyan | `--cyan` | `#39d8ff` |
| Cyan clair (texte/valeurs) | `--cyan-soft` | `#8be9ff` |
| Rose (bouton STOP) | `--rose` | `#ff5d8f` |
| Vert (bouton DÉMARRER) | `--green` | `#56e39f` |
| Texte principal | `--text` | `#ecedff` |
| Texte secondaire | `--text-dim` | `#a9add6` |
| Texte discret / labels | `--text-faint` | `#767aa6` |

Corps central de la simu (dans `script.js`, inchangé) : jaune `#f6ff07`.

### Dégradés clés
- **Bandeau de titre** : `linear-gradient(110deg, #1a1346 0%, #3a1d7a 48%, #16306e 100%)`
- **Fond de page** : deux `radial-gradient` (violet 78%/-10%, cyan 12%/8%) sur
  `linear-gradient(180deg, --bg-1, --bg-0, #020308)`
- **Rail du slider** : `linear-gradient(90deg, --cyan, --violet)`
- **Bouton DÉMARRER** : `linear-gradient(135deg, --cyan, --green)`
- **Bouton STOP** : `linear-gradient(135deg, #ff8f6b, --rose)`

## Typographie

- **Titres / UI** : `'Space Grotesk'` (500/600/700) — titre, h2, labels, boutons, valeurs.
- **Corps** : `'Inter'` (400/500/600) — texte d'instructions, footer.
- Chargées via Google Fonts (`<link>` dans `projet.html`).
- Titre : `text-transform: uppercase`, `letter-spacing: 0.14em`, taille fluide
  `clamp(1.5rem, 1rem + 2.4vw, 2.6rem)`.

## Verre dépoli (panneau de contrôle)

```css
background: linear-gradient(160deg, rgba(18,20,44,.55), rgba(28,24,58,.45));
backdrop-filter: blur(16px) saturate(140%);
border: 1px solid rgba(140,160,255,.22);
border-radius: 16px;
box-shadow: 0 18px 48px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
```

- `--panel-border-bright` : `rgba(160,180,255,.40)` (survol, lignes lumineuses).

## Échelle & formes

- Rayons : `--radius: 16px` (cartes/bandeau), `--radius-sm: 10px` (bloc texte),
  `12px` (boutons), `8px` (sélecteur de couleur).
- Ombre carte : `--shadow-panel` (voir recette ci-dessus).
- Halos lumineux : `box-shadow` cyan `rgba(57,216,255,.55)` / violet
  `rgba(124,92,255,.35)` / rose `rgba(255,93,143,.35)`.

## Préférences système

- `@media (prefers-reduced-motion: reduce)` : transitions désactivées.

## Règles de cohérence

- Thème sombre par nature (sujet spatial) — ne pas introduire de mode clair franc.
- Accents = cyan (action positive / valeurs) + violet (ambiance) + rose (arrêt/danger).
- Garder les IDs/structure DOM existants : tout le style cible les sélecteurs en
  place (`#title`, `#panneauDeControle`, `#Controle`, `#texteAdd`, `#slider`,
  `#masse`, `#inputCouleur`, `#Bouton`…). Voir [CLAUDE.md](CLAUDE.md).
