# Le Lab Robotique - Codage Visuel

Application de programmation visuelle Arduino pour les jeunes, construite avec Electron et Blockly.

## Installation rapide

```bash
# 1. Installer les dépendances et configurer
./install.sh

# 2. Lancer l'application
npm start
```

## Prérequis

- **Node.js** v18+ ([nodejs.org](https://nodejs.org))
- **npm** (inclus avec Node.js)
- **arduino-cli** (optionnel, pour le téléversement — installable via le script)

### Sur Ubuntu/Debian :
```bash
sudo apt update
sudo apt install nodejs npm
```

## Lancer l'application

```bash
npm start
```

## Construire un paquet installable

```bash
# Linux (.AppImage + .deb)
npm run dist:linux

# Windows (.exe) — nécessite une machine Windows ou Wine
npm run dist:win

# macOS (.dmg) — nécessite un Mac
npm run dist:mac
```

Les paquets sont créés dans le dossier `dist/`.

## Téléversement Arduino

1. Connectez votre Arduino en USB
2. Cliquez **Détecter Arduino** (ou menu Arduino → Détecter)
3. Sélectionnez la carte dans la liste déroulante
4. Cliquez **Téléverser vers Arduino**

Si `arduino-cli` n'est pas installé, utilisez le menu **Arduino → Installer arduino-cli**.

### Permissions port série (Linux)
Votre utilisateur doit être dans le groupe `dialout` :
```bash
sudo usermod -a -G dialout $USER
# Puis déconnectez-vous et reconnectez-vous
```

## Traduction

Toutes les chaînes de l'interface sont dans le fichier `i18n/fr.json`.

### Pour ajouter une nouvelle langue :

1. Copiez `i18n/fr.json` vers `i18n/XX.json` (ex: `en.json`)
2. Traduisez toutes les valeurs (gardez les clés identiques)
3. Dans `renderer.js`, changez la ligne :
   ```js
   const langData = require('./i18n/fr.json');
   ```
   en :
   ```js
   const langData = require('./i18n/en.json');
   ```
4. Relancez l'application

Le fichier JSON est organisé par sections (menus, boutons, blocs, exemples) pour faciliter la traduction.

## Structure du projet

```
lab-robotique/
├── main.js              # Processus principal Electron (Arduino CLI, fichiers, menus)
├── preload.js           # Pont sécurisé entre main et renderer
├── index.html           # Interface principale
├── renderer.js          # Logique UI (Blockly, génération de code, sidebar)
├── styles.css           # Styles de l'interface
├── package.json         # Configuration npm/Electron
├── install.sh           # Script d'installation
├── i18n/
│   └── fr.json          # Traductions françaises (toutes les chaînes UI)
├── blocks/
│   └── arduino-blocks.js  # Définitions des blocs Blockly personnalisés
├── generators/
│   └── arduino-generator.js  # Générateur de code Arduino
└── assets/
    ├── icon.png         # Icône de l'application
    └── icon.svg         # Icône source SVG
```

## Raccourcis clavier

| Raccourci        | Action                |
|------------------|-----------------------|
| Ctrl+N           | Nouveau projet        |
| Ctrl+O           | Ouvrir projet         |
| Ctrl+S           | Sauvegarder           |
| Ctrl+Shift+S     | Sauvegarder sous...   |
| Ctrl+U           | Téléverser            |
| Ctrl+Z           | Annuler               |
| Ctrl+Y           | Rétablir              |
| F12              | Outils développeur    |
| Échap            | Fermer les fenêtres   |

## Licence

MIT — Le Lab Robotique
