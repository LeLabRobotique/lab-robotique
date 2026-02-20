#!/bin/bash
# ═══════════════════════════════════════════
# Le Lab Robotique - Configuration Arduino
# À exécuter APRÈS l'installation du .deb
# VERSION AMÉLIORÉE avec librairies OLED
# ═══════════════════════════════════════════
set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}Configuration Arduino pour Le Lab Robotique${NC}\n"

# Check curl
if ! command -v curl &> /dev/null; then
    echo -e "${YELLOW}► Installation de curl...${NC}"
    sudo apt update && sudo apt install -y curl
fi

# CH340 driver (for Nano/Uno clones)
echo -e "${YELLOW}► Vérification du driver CH340 (clones Arduino)...${NC}"
if lsmod | grep -q ch341; then
    echo -e "  ${GREEN}✓ Driver CH340/CH341 déjà chargé${NC}"
else
    sudo modprobe ch341 2>/dev/null && echo -e "  ${GREEN}✓ Driver CH341 activé${NC}" || echo -e "  ${YELLOW}Driver ch341 non disponible (normal si pas de clone branché)${NC}"
fi

# Install arduino-cli
echo -e "${YELLOW}► Installation de arduino-cli...${NC}"
mkdir -p ~/.local/bin
curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=~/.local/bin sh
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
export PATH="$HOME/.local/bin:$PATH"
echo -e "  ${GREEN}✓ arduino-cli installé${NC}"

# Install Arduino AVR core
echo -e "${YELLOW}► Installation du core Arduino AVR...${NC}"
~/.local/bin/arduino-cli core install arduino:avr
echo -e "  ${GREEN}✓ Core AVR installé (inclut Servo.h, Wire.h, etc.)${NC}"

# Install libraries for Le Lab Robotique
echo -e "${YELLOW}► Installation des librairies pour Le Lab Robotique...${NC}"
~/.local/bin/arduino-cli lib install "Adafruit SSD1306"
~/.local/bin/arduino-cli lib install "Adafruit GFX Library"
echo -e "  ${GREEN}✓ Librairies OLED installées${NC}"

# Serial port permissions
echo -e "${YELLOW}► Configuration des permissions USB...${NC}"
sudo usermod -a -G dialout $USER
echo -e "  ${GREEN}✓ Permissions configurées (redémarrez la session)${NC}"

# Remove brltty (grabs /dev/ttyUSB* ports on Ubuntu, blocks Arduino clones)
echo -e "${YELLOW}► Vérification de brltty (conflit connu avec Arduino)...${NC}"
if dpkg -l | grep -q brltty; then
    echo -e "  brltty trouvé — il bloque souvent les ports USB des clones Arduino."
    sudo apt remove -y brltty 2>/dev/null
    echo -e "  ${GREEN}✓ brltty retiré${NC}"
else
    echo -e "  ${GREEN}✓ brltty non installé, aucun conflit${NC}"
fi

echo -e "\n${GREEN}${BOLD}✅ Configuration terminée!${NC}"
echo -e "\n${YELLOW}Librairies installées:${NC}"
echo -e "  • Servo.h (contrôle servo-moteurs)"
echo -e "  • Wire.h (communication I2C)"
echo -e "  • Adafruit_SSD1306 (écran OLED)"
echo -e "  • Adafruit_GFX (graphiques)"
echo -e "\n${GREEN}${BOLD}Redémarrez votre session pour activer les permissions USB.${NC}"
