#!/bin/bash
# ═══════════════════════════════════════════════════
# Le Lab Robotique - Script d'installation
# ═══════════════════════════════════════════════════
set -e

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}"
echo "  ╔═══════════════════════════════════════╗"
echo "  ║   Le Lab Robotique - Installation     ║"
echo "  ╚═══════════════════════════════════════╝"
echo -e "${NC}"

# ─── Check curl ───
echo -e "${YELLOW}► Vérification de curl...${NC}"
if ! command -v curl &> /dev/null; then
    echo -e "  curl non trouvé, installation..."
    sudo apt update && sudo apt install -y curl
fi
echo -e "  curl ${GREEN}✓${NC}"

# ─── Check Node.js ───
echo -e "${YELLOW}► Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js n'est pas installé.${NC}"
    echo -e "Installez-le avec:"
    echo -e "  ${BOLD}sudo apt install nodejs npm${NC}"
    echo -e "  ou via https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
echo -e "  Node.js $(node -v) ${GREEN}✓${NC}"

if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js v18+ requis. Version actuelle: $(node -v)${NC}"
    exit 1
fi

# ─── Install npm dependencies ───
echo -e "${YELLOW}► Installation des dépendances npm...${NC}"
npm install
echo -e "  Dépendances installées ${GREEN}✓${NC}"

# ─── Check for arduino-cli (optional) ───
echo -e "${YELLOW}► Vérification de arduino-cli (optionnel)...${NC}"
if command -v arduino-cli &> /dev/null; then
    echo -e "  arduino-cli $(arduino-cli version | head -1) ${GREEN}✓${NC}"
else
    echo -e "  ${YELLOW}arduino-cli non trouvé (optionnel pour le téléversement)${NC}"
    echo ""
    read -p "  Voulez-vous installer arduino-cli? (o/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Oo]$ ]]; then
        echo -e "  Installation de arduino-cli..."
        mkdir -p ~/.local/bin
        curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
        export PATH="$HOME/.local/bin:$PATH"
        echo -e "  ${GREEN}✓ arduino-cli installé dans ~/.local/bin${NC}"

        echo -e "  Installation du core Arduino AVR..."
        ~/.local/bin/arduino-cli core install arduino:avr
        echo -e "  ${GREEN}✓ Arduino AVR core installé${NC}"
    fi
fi

# ─── Add user to dialout group (for serial port access) ───
echo -e "${YELLOW}► Vérification des permissions port série...${NC}"
if groups | grep -q dialout; then
    echo -e "  Utilisateur dans le groupe dialout ${GREEN}✓${NC}"
else
    echo -e "  ${YELLOW}Ajout au groupe dialout (nécessaire pour communiquer avec Arduino)${NC}"
    sudo usermod -a -G dialout $USER
    echo -e "  ${GREEN}✓ Ajouté! Déconnectez-vous et reconnectez-vous pour appliquer.${NC}"
fi

# ─── Done ───
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  Installation terminée!${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════${NC}"
echo ""
echo -e "  Pour lancer l'application:"
echo -e "    ${BOLD}npm start${NC}"
echo ""
echo -e "  Pour construire un paquet installable:"
echo -e "    ${BOLD}npm run dist:linux${NC}"
echo ""
