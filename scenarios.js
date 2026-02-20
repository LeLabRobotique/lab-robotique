/**
 * Le Lab Robotique — Système de Missions (Scénarios)
 * * Aventure spatiale : « Le Voyage de l'Étoile Filante »
 * ─────────────────────────────────────────────────────
 * Les jeunes recrues viennent de monter à bord du vaisseau spatial
 * « L'Étoile Filante ». L'IA de bord, NOVA, les guide à travers
 * 30 missions pour réparer les systèmes du vaisseau et atteindre
 * la planète Kepler-442b.
 *
 * Progression pédagogique (1 nouveau concept par mission, progression graduelle) :
 * Niveau 1 — Apprenti Spatial   (Missions 1-10) : LEDs, temps, séquences, boutons, buzzer, servo, potentiomètre.
 * Niveau 2 — Technicien de Bord (Missions 11-20): contraintes, RGB, PWM, ultrasons, automatisation, logique 3 états.
 * Niveau 3 — Commandant         (Missions 21-30): écran OLED, variables, boucles, opérateurs logiques ET/OU, examen final.
 *
 * ⚠️ IMPORTANT : Tout le vocabulaire des briefings et indices utilise les
 * termes FRANÇAIS des blocs Blockly (broche, ALLUMER/ÉTEINDRE, attendre,
 * convertir, etc.) et NON les termes Arduino (pin, HIGH/LOW, delay, map).
 */

// ═══════════════════════════════════════════════════
// Configuration des broches du panneau de contrôle
// ═══════════════════════════════════════════════════
const PANEL_PINS = {
  POT: 'A0',           
  BTN1: 2,             
  BTN2: 4,             
  ULTRA_TRIG: 12,      
  ULTRA_ECHO: 13,      
  LED_R: 5,            
  LED_Y: 6,            
  LED_G: 8,            
  RGB_R: 9,            
  RGB_G: 10,           
  RGB_B: 11,           
  SERVO: 3,            
  BUZZER: 7,           
  SDA: 'A4',
  SCL: 'A5',
};

const DIFFICULTY = {
  APPRENTI:      { label: '🌟 Apprenti Spatial',    stars: 1, color: '#4caf50' },
  TECHNICIEN:    { label: '🔧 Technicien de Bord',  stars: 2, color: '#ff9800' },
  COMMANDANT:    { label: '🚀 Commandant',          stars: 3, color: '#e74c3c' },
};

const NOVA = 'NOVA';

// ═══════════════════════════════════════════════════
// Missions (Scénarios) avec BUGS intégrés
// ═══════════════════════════════════════════════════
const MISSIONS = [

  // ╔═══════════════════════════════════════════╗
  // ║  NIVEAU 1 — APPRENTI SPATIAL (Missions 1-10)║
  // ╚═══════════════════════════════════════════╝

  {
    id: 'mission_01',
    title: 'Mission 1 : La Balise de Secours',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '💡',
    briefing:
`${NOVA} : « Recrue, bienvenue à bord de L'Étoile Filante ! Je suis NOVA, l'IA du vaisseau.\nAvant de décoller, nous devons vérifier les branchements.\nNotre vaisseau communique avec ses composants grâce à des "broches" (des petits câbles numérotés).\nLa DEL Rouge est branchée sur la broche ${PANEL_PINS.LED_R}, mais dans le code, quelqu'un a écrit 13 ! Corrige le numéro pour allumer la lumière. »`,
    objective: `Allumer la DEL Rouge en changeant la broche 13 pour la broche ${PANEL_PINS.LED_R}.`,
    hints: [
      `💡 Regarde bien les deux blocs : change le chiffre 13 par ${PANEL_PINS.LED_R}.`,
      `💡 Il faut changer le numéro dans la Configuration ET dans la Boucle.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led"><field name="PIN">13</field><field name="STATE">HIGH</field></block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_02',
    title: 'Mission 2 : Le Clignotant',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔴',
    briefing:
`${NOVA} : « Super ! Mais une lumière fixe dans l'espace, ça ne se remarque pas. Il faut qu'elle clignote !\nPour ça, le vaisseau doit "attendre" entre le moment où il allume et il éteint la lumière.\nAjoute les blocs manquants pour que la DEL Rouge (broche ${PANEL_PINS.LED_R}) s'allume, attende 1 seconde (1000 ms), s'éteigne, puis attende encore 1 seconde. »`,
    objective: `Faire clignoter la DEL Rouge (${PANEL_PINS.LED_R}) avec des blocs "attendre".`,
    hints: [
      `💡 Utilise le bloc "attendre (ms)". 1000 millisecondes = 1 seconde.`,
      `✅ L'ordre est : ALLUMER -> attendre -> ÉTEINDRE -> attendre.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="MODE">OUTPUT</field></block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led">
            <field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">HIGH</field>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_03',
    title: 'Mission 3 : Séquence de Vol',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🚦',
    briefing:
`${NOVA} : « Parfait ! Maintenant testons tout le panneau lumineux.\nNous avons 3 DELs : Rouge (broche ${PANEL_PINS.LED_R}), Jaune (broche ${PANEL_PINS.LED_Y}) et Verte (broche ${PANEL_PINS.LED_G}).\nJe veux que tu crées une séquence : Allume la Verte pendant 2 secondes, éteins-la, puis allume la Jaune 1 seconde, éteins-la, et enfin la Rouge 2 secondes. »`,
    objective: `Créer une séquence avec les 3 DELs.`,
    hints: [
      `💡 N'oublie pas d'éteindre une DEL avant d'allumer la suivante !`,
      `⏱️ 2 secondes = 2000 ms.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode"><field name="PIN">${PANEL_PINS.LED_G}</field><field name="MODE">OUTPUT</field>
            <next><block type="pin_mode"><field name="PIN">${PANEL_PINS.LED_Y}</field><field name="MODE">OUTPUT</field>
              <next><block type="pin_mode"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="MODE">OUTPUT</field></block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_04',
    title: 'Mission 4 : Test du Haut-Parleur',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔊',
    briefing:
`${NOVA} : « Un vaisseau silencieux est dangereux. Nous devons tester le Buzzer (le haut-parleur) pour les alarmes.\nLe Buzzer fonctionne comme une DEL, mais au lieu de faire de la lumière, il fait du bruit !\nLe code actuel envoie le son sur la DEL Verte (broche 8) au lieu du Buzzer (broche ${PANEL_PINS.BUZZER}) ! Corrige la broche. »`,
    objective: `Corriger le bloc Buzzer pour utiliser la broche ${PANEL_PINS.BUZZER}.`,
    hints: [
      `🔎 Trouve le bloc "buzzer broche" dans la boucle.`,
      `✅ Mets la broche à ${PANEL_PINS.BUZZER}.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_buzzer"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">440</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
            <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_05',
    title: 'Mission 5 : Prendre les commandes',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔘',
    briefing:
`${NOVA} : « Jusqu'ici, le vaisseau faisait tout tout seul. Il est temps d'utiliser tes mains !\nNous allons utiliser un Bouton (broche ${PANEL_PINS.BTN1}). Pour dire au vaisseau de réagir au bouton, on utilise un bloc logique : "SI / SINON".\nSI tu appuies sur le Bouton 1, la DEL Verte (broche ${PANEL_PINS.LED_G}) s'allume. SINON, elle s'éteint. »`,
    objective: `Utiliser "SI/SINON" pour allumer la DEL Verte avec le Bouton 1.`,
    hints: [
      `💡 Prends le bloc "si / sinon" dans le menu Logique.`,
      `💡 Dans le "si", met le bloc "bouton broche ${PANEL_PINS.BTN1}".`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode"><field name="PIN">${PANEL_PINS.BTN1}</field><field name="MODE">INPUT_PULLUP</field>
            <next><block type="pin_mode"><field name="PIN">${PANEL_PINS.LED_G}</field><field name="MODE">OUTPUT</field></block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_06',
    title: 'Mission 6 : Bouton d\'Alerte',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '⚠️',
    briefing:
`${NOVA} : « En cas de météorite, on a besoin d'une alarme manuelle ! \nSI le Bouton 2 (broche ${PANEL_PINS.BTN2}) est pressé, fais sonner le Buzzer (${PANEL_PINS.BUZZER}) et allume la DEL Rouge (${PANEL_PINS.LED_R}). SINON, éteins la DEL Rouge.\nLe code actuel vérifie le mauvais bouton (Bouton 1 au lieu du 2) ! Répare-le. »`,
    objective: `Modifier le code pour que le Bouton 2 (${PANEL_PINS.BTN2}) déclenche l'alarme.`,
    hints: [
      `🔎 Regarde la condition du "SI". C'est la broche 2 qui est vérifiée. Change-la pour 4 !`,
      `✅ Le Buzzer s'arrête tout seul, mais la DEL Rouge doit être éteinte dans le SINON.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if"><value name="IF0"><block type="sensor_button"><field name="PIN">2</field></block></value>
            <statement name="DO0"><block type="actuator_buzzer"><field name="PIN">${PANEL_PINS.BUZZER}</field><value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value>
              <next><block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">HIGH</field></block></next></block>
            </statement>
            <statement name="ELSE"><block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">LOW</field></block></statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_07',
    title: 'Mission 7 : Le Sas (Servomoteur)',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🚪',
    briefing:
`${NOVA} : « Le sas de chargement s'ouvre avec un "Servomoteur". C'est un moteur spécial qui se place à un angle précis (entre 0 et 180 degrés).\nOuvre le sas à 90 degrés ! \nAttention : le code envoie l'ordre à la broche 6 (une DEL) au lieu de la broche du Servo (${PANEL_PINS.SERVO}). »`,
    objective: `Placer le servomoteur sur la bonne broche (${PANEL_PINS.SERVO}) à 90 degrés.`,
    hints: [
      `🔎 Change la broche 6 pour la broche 3 dans le bloc du Servomoteur.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_servo"><field name="PIN">6</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_08',
    title: 'Mission 8 : Sécuriser le Sas',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🛡️',
    briefing:
`${NOVA} : « Le sas ne doit s'ouvrir que si on maintient le Bouton 1 enfoncé.\nSI le Bouton 1 (${PANEL_PINS.BTN1}) est pressé, le servo (${PANEL_PINS.SERVO}) va à 90 degrés. SINON, il retourne à 0 degré (fermé).\nL'apprenti précédent a inversé la logique : le sas s'ouvre quand on lâche le bouton ! Inverse les angles. »`,
    objective: `Corriger la logique pour que le bouton ouvre le sas (90°) et le relâchement le ferme (0°).`,
    hints: [
      `💡 Dans le "SI", mets l'angle à 90. Dans le "SINON", mets-le à 0.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if"><value name="IF0"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block></value>
            <statement name="DO0"><block type="actuator_servo"><field name="PIN">${PANEL_PINS.SERVO}</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></statement>
            <statement name="ELSE"><block type="actuator_servo"><field name="PIN">${PANEL_PINS.SERVO}</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block></statement>
            <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">20</field></shadow></value></block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_09',
    title: 'Mission 9 : L\'Écran de Contrôle',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🎚️',
    briefing:
`${NOVA} : « Le vaisseau possède un cadran rotatif appelé Potentiomètre (broche ${PANEL_PINS.POT}). \nContrairement à un bouton qui fait ON/OFF, ce cadran envoie plein de nombres différents (de 0 à 1023) selon comment on le tourne.\nLe code essaie d'afficher sa valeur dans le Moniteur Série, mais il lit la broche A1 au lieu de A0 ! »`,
    objective: `Afficher la valeur du potentiomètre en lisant la bonne broche (${PANEL_PINS.POT}).`,
    hints: [
      `🔎 Trouve le bloc Potentiomètre et change A1 pour A0.`
    ],
    allowedCategories: ['arduino', 'sensors', 'serial', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="serial_begin"><value name="BAUD"><shadow type="math_number"><field name="NUM">9600</field></shadow></value></block></statement>
        <statement name="LOOP">
          <block type="serial_println"><value name="TEXT"><block type="sensor_potentiometer"><field name="PIN">A1</field></block></value>
            <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">250</field></shadow></value></block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_10',
    title: 'Mission 10 : Le Radar Rotatif',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🧭',
    briefing:
`${NOVA} : « Épreuve finale du Niveau 1, Commandant !\nRelions le cadran (Potentiomètre) au Servomoteur pour le contrôler à la main.\nProblème du code actuel : le cadran va de 0 à 1023, mais le moteur va de 0 à 180 degrés ! Le moteur va forcer et griller !\nInsère le bloc "convertir" entre le potentiomètre et l'angle du servo. »`,
    objective: `Utiliser "convertir" pour adapter la valeur du potentiomètre (0-1023) en angle (0-180).`,
    hints: [
      `🔎 Prends le bloc "convertir" dans le menu Mathématiques.`,
      `✅ Glisse le bloc potentiomètre dans "convertir", puis glisse le tout dans l'angle du servo.`,
      `✅ De min: 0, De max: 1023. À min: 0, À max: 180.`
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_servo"><field name="PIN">${PANEL_PINS.SERVO}</field>
            <value name="ANGLE"><block type="sensor_potentiometer"><field name="PIN">${PANEL_PINS.POT}</field></block></value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ╔══════════════════════════════════════════════════╗
  // ║  NIVEAU 2 — TECHNICIEN DE BORD (Missions 11-20)  ║
  // ╚══════════════════════════════════════════════════╝

  {
    id: 'mission_11',
    title: 'Mission 11 : Le Limiteur de Sécurité',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🛡️',
    briefing:
`${NOVA} : « Bienvenue au Niveau 2, Technicien ! \nLa molette contrôle bien le sas, mais il y a un danger : si le moteur force trop contre les murs, il va casser. \nNous devons l'empêcher de descendre sous 30 degrés ou de dépasser 150 degrés.\nUtilise le bloc "contraindre" (dans Mathématiques) pour limiter l'angle envoyé au servo ! »`,
    objective: `Ajouter le bloc "contraindre" pour limiter l'angle entre 30 et 150.`,
    hints: [
      `🔎 Mets le bloc "contraindre" autour du bloc "convertir".`,
      `✅ Règle les limites sur 30 et 150.`
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_servo">
            <field name="PIN">${PANEL_PINS.SERVO}</field>
            <value name="ANGLE">
              <block type="arduino_map">
                <value name="VALUE"><block type="sensor_potentiometer"><field name="PIN">${PANEL_PINS.POT}</field></block></value>
                <value name="FROM_MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="FROM_MAX"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
                <value name="TO_MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="TO_MAX"><shadow type="math_number"><field name="NUM">180</field></shadow></value>
              </block>
            </value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_12',
    title: 'Mission 12 : La Lumière Magique',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🌈',
    briefing:
`${NOVA} : « Notre vaisseau possède une DEL spéciale appelée "RGB". Elle peut créer n'importe quelle couleur en mélangeant du Rouge (broche ${PANEL_PINS.RGB_R}), du Vert (broche ${PANEL_PINS.RGB_G}) et du Bleu (broche ${PANEL_PINS.RGB_B}).\nChaque couleur a une puissance de 0 (éteint) à 255 (maximum).\nLe code actuel allume toutes les couleurs à fond (ce qui fait du blanc). Modifie-le pour avoir un rouge pur ! »`,
    objective: `Régler la DEL RGB sur Rouge (R=255, G=0, B=0).`,
    hints: [
      `🔎 Trouve le bloc "DEL RGB" dans la boucle.`,
      `✅ Mets le Vert (G) et le Bleu (B) à 0.`
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
            <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
            <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_13',
    title: 'Mission 13 : Mixage de Couleurs',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🎨',
    briefing:
`${NOVA} : « Le rouge, c'est bien, mais nous avons besoin d'un voyant d'avertissement Jaune ! \nEn lumière, pour faire du jaune, on mélange le Rouge et le Vert à pleine puissance.\nModifie ton code pour allumer la DEL RGB en Jaune. »`,
    objective: `Mélanger Rouge (255) et Vert (255) sur la DEL RGB.`,
    hints: [
      `💡 Laisse le Bleu à 0 !`
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_rgb_led">
            <field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
            <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
            <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_14',
    title: 'Mission 14 : Variateur de Lumière',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🎛️',
    briefing:
`${NOVA} : « Et si on réglait la luminosité du Rouge avec notre molette ?\nLe code actuel branche directement le potentiomètre (0-1023) dans le Rouge de la DEL RGB (0-255). Ça ne marchera pas bien !\nUtilise le bloc "convertir" pour transformer la valeur de la molette avant de l'envoyer à la DEL. »`,
    objective: `Convertir la valeur de A0 (0-1023) en intensité (0-255) pour le rouge de la DEL RGB.`,
    hints: [
      `🔎 De min: 0 / De max: 1023. À min: 0 / À max: 255.`,
      `✅ Place le bloc convertir dans l'entrée "R" de la DEL RGB, et mets le potentiomètre dedans.`
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
            <value name="R"><block type="sensor_potentiometer"><field name="PIN">${PANEL_PINS.POT}</field></block></value>
            <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_15',
    title: 'Mission 15 : Deux Modes de Vol',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🧩',
    briefing:
`${NOVA} : « Le vaisseau possède deux modes. \nSi on appuie sur le Bouton 1 (broche ${PANEL_PINS.BTN1}), le mode normal s'active (allume la DEL Verte ${PANEL_PINS.LED_G}).\nSi on appuie sur le Bouton 2 (broche ${PANEL_PINS.BTN2}), le mode alerte s'active (allume la DEL Jaune ${PANEL_PINS.LED_Y} et fait un "bip" avec le buzzer).\nLe technicien précédent a mélangé les câbles dans le code ! Corrige-le. »`,
    objective: `Bouton 1 -> DEL Verte. Bouton 2 -> DEL Jaune + Buzzer.`,
    hints: [
      `🔎 Regarde bien les numéros de broches dans les blocs "Bouton".`,
      `✅ Change les DELs à l'intérieur des conditions pour qu'elles correspondent au bon bouton.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block></value>
            <statement name="DO0">
              <block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_Y}</field><field name="STATE">HIGH</field></block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN2}</field></block></value>
                <statement name="DO0">
                  <block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_G}</field><field name="STATE">HIGH</field>
                    <next><block type="actuator_buzzer"><field name="PIN">${PANEL_PINS.BUZZER}</field><value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">200</field></shadow></value></block></next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_16',
    title: 'Mission 16 : Le Radar Spatial',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '📡',
    briefing:
`${NOVA} : « Nous entrons dans un champ d'astéroïdes ! Allumons le radar (Capteur Ultrason).\nIl envoie un son (Trigger) et écoute l'écho (Echo) pour mesurer la distance en centimètres. \nMais les broches sont inversées ! Le signal d'envoi est sur ${PANEL_PINS.ULTRA_TRIG} et l'écoute sur ${PANEL_PINS.ULTRA_ECHO}. \nCorrige les broches et affiche la distance dans le Moniteur Série. »`,
    objective: `Inverser les broches du capteur ultrason (Envoi = ${PANEL_PINS.ULTRA_TRIG}, Écoute = ${PANEL_PINS.ULTRA_ECHO}).`,
    hints: [
      `🔁 TRIG = ${PANEL_PINS.ULTRA_TRIG} et ECHO = ${PANEL_PINS.ULTRA_ECHO}.`
    ],
    allowedCategories: ['arduino', 'sensors', 'serial', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="serial_begin"><value name="BAUD"><shadow type="math_number"><field name="NUM">9600</field></shadow></value></block>
        </statement>
        <statement name="LOOP">
          <block type="serial_println">
            <value name="TEXT">
              <block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_ECHO}</field><field name="ECHO">${PANEL_PINS.ULTRA_TRIG}</field></block>
            </value>
            <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value></block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_17',
    title: 'Mission 17 : Alerte Collision',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '⚠️',
    briefing:
`${NOVA} : « Regarder les chiffres du radar, c'est trop lent. Rendons ça automatique !\nSI un obstacle est à MOINS de 15 cm, la DEL Rouge s'allume et le Buzzer sonne. \nSINON, la DEL Verte s'allume.\nLe code a presque tout bon, mais le seuil de distance est réglé à 5 cm... on va s'écraser ! Change le seuil pour 15. »`,
    objective: `Changer le seuil de détection d'obstacle à 15 cm.`,
    hints: [
      `🔎 Cherche le bloc mathématique de comparaison (avec le signe '<').`,
      `✅ Remplace le chiffre 5 par 15.`
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'digital', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
                <value name="B"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">HIGH</field>
                <next><block type="actuator_buzzer"><field name="PIN">${PANEL_PINS.BUZZER}</field><value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">150</field></shadow></value></block></next>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_G}</field><field name="STATE">HIGH</field></block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_18',
    title: 'Mission 18 : Freinage Automatique',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🧯',
    briefing:
`${NOVA} : « Relions le radar aux moteurs pour freiner tout seul !\nSi le radar détecte un obstacle à moins de 20 cm, le Servo-moteur passe à 0° (frein). Sinon, il reste à 90° (croisière).\nLe problème : le code envoie les angles vers la mauvaise broche. Le servo est sur la broche ${PANEL_PINS.SERVO}. Corrige-le ! »`,
    objective: `Corriger la broche du servomoteur (${PANEL_PINS.SERVO}) dans les conditions de freinage.`,
    hints: [
      `✅ Il y a DEUX blocs servo à corriger : un dans le SI, un dans le SINON.`
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
                <value name="B"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_servo"><field name="PIN">6</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_servo"><field name="PIN">6</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value></block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_19',
    title: 'Mission 19 : Statut en Couleurs',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🚦',
    briefing:
`${NOVA} : « Utilisons notre DEL RGB comme indicateur de distance avec 3 couleurs !\n- À moins de 15 cm : Rouge.\n- À moins de 30 cm : Jaune.\n- Sinon (plus de 30 cm) : Vert.\nLe code a la bonne structure logique, mais toutes les couleurs affichent du rouge ! Corrige les valeurs pour le Jaune et le Vert. »`,
    objective: `Ajuster les couleurs RGB pour afficher Rouge (<15cm), Jaune (<30cm) et Vert (>30cm).`,
    hints: [
      `💡 Jaune = Rouge 255 + Vert 255.`,
      `💡 Vert = Vert 255 (Rouge 0, Bleu 0).`
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <mutation elseif="1" else="1"></mutation>
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
                <value name="B"><shadow type="math_number"><field name="NUM">15</field></shadow></value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
            <value name="IF1">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
                <value name="B"><shadow type="math_number"><field name="NUM">30</field></shadow></value>
              </block>
            </value>
            <statement name="DO1">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_20',
    title: 'Mission 20 : L\'Épreuve du Technicien',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🎓',
    briefing:
`${NOVA} : « C'est ton examen final pour le Niveau 2 ! \nLe système automatique fonctionne bien, mais l'équipage doit pouvoir prendre le contrôle manuel.\nSI le Bouton 1 est pressé, force la DEL RGB en Vert. \nSI le Bouton 2 est pressé, force la DEL RGB en Rouge. \nSINON, laisse le radar allumer le Jaune.\nLe code a inversé les couleurs des boutons ! Répare cette logique. »`,
    objective: `Créer un système de priorité : Bouton 1 (Vert) > Bouton 2 (Rouge) > Radar (Jaune).`,
    hints: [
      `💡 Change les valeurs RGB à l'intérieur des conditions des boutons pour les inverser.`,
      `✅ Bouton 1 = Vert (G:255). Bouton 2 = Rouge (R:255).`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors', 'math', 'analog'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if"><mutation elseif="1" else="1"></mutation>
            <value name="IF0"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block></value>
            <statement name="DO0"><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></statement>
            <value name="IF1"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN2}</field></block></value>
            <statement name="DO1"><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></statement>
            <statement name="ELSE"><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ╔══════════════════════════════════════════════════╗
  // ║  NIVEAU 3 — COMMANDANT (Missions 21-30)          ║
  // ╚══════════════════════════════════════════════════╝

  {
    id: 'mission_21',
    title: 'Mission 21 : L\'Écran de Bord (OLED)',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🖥️',
    briefing:
`${NOVA} : « Félicitations Commandant ! Tu as accès à l'écran principal (OLED). \nPour qu'il fonctionne, il y a une règle stricte :\n1. "Effacer écran" au début.\n2. Écrire le texte.\n3. "Actualiser écran" à la fin !\nLe code actuel écrit le texte, mais oublie d'effacer et d'actualiser ! Ajoute les blocs manquants. »`,
    objective: `Ajouter les blocs "Effacer écran" avant le texte, et "Actualiser écran" après.`,
    hints: [
      `💡 Va dans la catégorie "Écran OLED". L'ordre est vital !`,
      `✅ La Boucle doit avoir 3 blocs dans le bon ordre.`
    ],
    allowedCategories: ['arduino', 'oled'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_println"><value name="TEXT"><shadow type="math_number"><field name="NUM">442</field></shadow></value></block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_22',
    title: 'Mission 22 : Le Radar sur Écran',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '📊',
    briefing:
`${NOVA} : « Afficher des nombres fixes, c'est ennuyant. Affichons les dangers ! \nAu lieu d'écrire le nombre 442, on va relier le Radar (Capteur Ultrason) directement à l'écran OLED.\nRemplace le nombre par le bloc du Capteur Ultrason (Envoi sur ${PANEL_PINS.ULTRA_TRIG}, Écoute sur ${PANEL_PINS.ULTRA_ECHO}). »`,
    objective: `Afficher la distance du Capteur Ultrason sur l'écran OLED.`,
    hints: [
      `🔎 Prends le bloc "Capteur Ultrason" dans "Capteurs".`,
      `✅ Place ce bloc à l'intérieur du bloc OLED "Écrire ligne".`
    ],
    allowedCategories: ['arduino', 'oled', 'sensors'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_clear">
            <next><block type="oled_println"><value name="TEXT"><shadow type="math_number"><field name="NUM">442</field></shadow></value>
              <next><block type="oled_display"></block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_23',
    title: 'Mission 23 : Le Bouclier Visuel',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🛡️',
    briefing:
`${NOVA} : « L'écran OLED peut aussi dessiner des formes ! \nNous allons dessiner notre bouclier d'énergie. Utilise le bloc "Cercle" de la catégorie OLED.\nLe code actuel dessine un cercle tout petit dans le coin (X: 0, Y: 0, Rayon: 5). Place-le au centre (X: 64, Y: 32) et donne-lui un Rayon de 20 ! »`,
    objective: `Modifier le cercle pour le placer au centre de l'OLED (X:64, Y:32, Rayon:20).`,
    hints: [
      `💡 Change les nombres dans les cases X, Y et R du bloc Cercle.`
    ],
    allowedCategories: ['arduino', 'oled', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_clear">
            <next><block type="oled_draw_circle"><field name="STYLE">DRAW</field><field name="X">0</field><field name="Y">0</field><field name="R">5</field>
              <next><block type="oled_display"></block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_24',
    title: 'Mission 24 : Jauge en Pourcentage',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🎚️',
    briefing:
`${NOVA} : « Nous voulons afficher la puissance du Potentiomètre (A0) sur l'écran en pourcentage.\nProblème : la molette donne des nombres de 0 à 1023 ! Le code l'affiche directement tel quel.\nUtilise le bloc "Convertir" pour transformer la valeur de la molette (0-1023) en un pourcentage (0-100) avant de l'afficher sur l'OLED ! »`,
    objective: `Convertir le potentiomètre de 0-1023 vers 0-100 et l'afficher sur l'OLED.`,
    hints: [
      `🔎 Place le bloc "Convertir" à l'intérieur du bloc "Écrire ligne".`,
      `✅ À min: 0 / À max: 100.`
    ],
    allowedCategories: ['arduino', 'oled', 'math', 'sensors', 'analog'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_clear">
            <next><block type="oled_println"><value name="TEXT"><block type="sensor_potentiometer"><field name="PIN">${PANEL_PINS.POT}</field></block></value>
              <next><block type="oled_display"></block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_25',
    title: 'Mission 25 : L\'Hyper-Clignotement (Boucles)',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '⚡',
    briefing:
`${NOVA} : « L'hyper-propulsion demande un clignotement ultra-rapide de la DEL Rouge (broche ${PANEL_PINS.LED_R}).\nElle doit clignoter 5 fois de suite très vite (50 ms).\nLe code actuel clignote 10 fois, et beaucoup trop lentement (1000 ms). Modifie les valeurs de la boucle et des pauses ! »`,
    objective: `Modifier la boucle pour répéter 5 fois, avec des pauses de 50 ms.`,
    hints: [
      `💡 Va dans la catégorie "Boucles" (couleur marron) si tu veux voir comment marche le bloc "répéter".`,
      `✅ Change le "10" pour un "5", et les "1000" pour des "50".`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'loops', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_repeat_ext"><value name="TIMES"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
            <statement name="DO">
              <block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">HIGH</field>
                <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value>
                  <next><block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">LOW</field>
                    <next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next>
                  </block></next>
                </block></next>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_26',
    title: 'Mission 26 : Double Sécurité (Logique ET)',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🔐',
    briefing:
`${NOVA} : « Pour armer les lasers, il faut utiliser les deux mains : appuyer sur le Bouton 1 ET le Bouton 2 en même temps !\nLe code actuel utilise le bloc logique "ou". Cela veut dire qu'un seul bouton suffit, ce qui est très dangereux !\nChange l'opérateur "ou" pour un "et" (dans la catégorie Logique) pour allumer la DEL RGB en Bleu pur. »`,
    objective: `Utiliser l'opérateur "ET" au lieu de "OU" pour la sécurité.`,
    hints: [
      `🔎 Clique sur la petite flèche du bloc logique "ou" pour le transformer en "et".`,
      `✅ Bleu pur = Rouge 0, Vert 0, Bleu 255.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_operation"><field name="OP">OR</field>
                <value name="A"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block></value>
                <value name="B"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN2}</field></block></value>
              </block>
            </value>
            <statement name="DO0"><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">255</field></shadow></value></block></statement>
            <statement name="ELSE"><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_27',
    title: 'Mission 27 : Système de Survie (Logique OU)',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🆘',
    briefing:
`${NOVA} : « L'alarme générale doit sonner de deux manières différentes : \nSoit le pilote appuie sur le Bouton 1 (panique manuelle), OU le radar détecte un obstacle à moins de 10 cm.\nLe code actuel utilise le bloc "et", ce qui veut dire qu'il faut un obstacle ET appuyer sur le bouton en même temps ! Change-le pour un "ou". »`,
    objective: `Utiliser l'opérateur "OU" au lieu de "ET" pour le système de survie.`,
    hints: [
      `💡 Change le "et" en "ou" en cliquant sur la petite flèche du bloc de logique.`
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_operation"><field name="OP">AND</field>
                <value name="A"><block type="logic_compare"><field name="OP">LT</field><value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value><value name="B"><shadow type="math_number"><field name="NUM">10</field></shadow></value></block></value>
                <value name="B"><block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block></value>
              </block>
            </value>
            <statement name="DO0"><block type="actuator_buzzer"><field name="PIN">${PANEL_PINS.BUZZER}</field><value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value><next><block type="actuator_led"><field name="PIN">${PANEL_PINS.LED_R}</field><field name="STATE">HIGH</field></block></next></block></statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_28',
    title: 'Mission 28 : La Mémoire du Vaisseau',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🧠',
    briefing:
`${NOVA} : « Parfois, on a besoin de retenir une information pour la réutiliser plusieurs fois. On appelle ça une Variable.\nLe code crée une variable nommée "Puissance", mais il la met toujours à 0 ! \nUtilise le bloc "mettre Puissance à" et donne-lui la vraie valeur du Potentiomètre (A0) pour qu'elle s'affiche sur l'OLED ! »`,
    objective: `Associer le Potentiomètre à la variable "Puissance".`,
    hints: [
      `🔎 Remplace le chiffre "0" par le bloc du Potentiomètre.`
    ],
    allowedCategories: ['arduino', 'variables', 'sensors', 'oled'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="variables_set"><field name="VAR">Puissance</field><value name="VALUE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <next><block type="oled_clear">
              <next><block type="oled_println"><value name="TEXT"><block type="variables_get"><field name="VAR">Puissance</field></block></value>
                <next><block type="oled_display"></block></next>
              </block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_29',
    title: 'Mission 29 : Le Rapport de Vol',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '📈',
    briefing:
`${NOVA} : « À chaque tour de boucle, je veux que l'écran affiche DEUX choses en même temps :\n1. La distance du Radar.\n2. La valeur du Potentiomètre.\nLe code actuel ne fonctionne pas car le bloc "Actualiser écran" est placé trop tôt (au milieu de la séquence). Déplace-le tout à la fin ! »`,
    objective: `Placer le bloc "Actualiser écran" (display) à la fin de la séquence OLED.`,
    hints: [
      `💡 L'ordre est vital : 1. Effacer -> 2. Écrire le Radar -> 3. Écrire le Potentiomètre -> 4. Actualiser !`,
      `✅ Le "Actualiser écran" ne s'utilise qu'une seule fois.`
    ],
    allowedCategories: ['arduino', 'oled', 'sensors', 'math', 'analog'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_clear">
            <next><block type="oled_println"><value name="TEXT"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
              <next><block type="oled_display">
                <next><block type="oled_println"><value name="TEXT"><block type="sensor_potentiometer"><field name="PIN">${PANEL_PINS.POT}</field></block></value></block></next>
              </block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  {
    id: 'mission_30',
    title: 'Mission 30 : Atterrissage sur Kepler-442b !',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🌍',
    briefing:
`${NOVA} : « C'est l'examen final absolu ! Construisons le système d'atterrissage parfait.\n1. Affiche la distance Radar sur l'écran OLED.\n2. SI la distance est < 10 cm : Le Servo est à 90°, le Buzzer sonne, la DEL RGB est Rouge.\n3. SINON : Le Servo est à 0°, la DEL RGB est Verte (tout va bien).\nUn pirate a saboté la logique d'atterrissage (les moteurs ne réagissent qu'à 50 cm et les couleurs sont fausses). Répare tout, Commandant ! »`,
    objective: `Corriger le seuil du radar (< 10 cm) et rétablir les angles du Servo et les couleurs RGB d'atterrissage.`,
    hints: [
      `💡 Change le "> 50" pour un "< 10" dans la condition du SI.`,
      `💡 En cas d'alerte (DO0), le Servo doit être à 90 et la RGB en Rouge (R:255).`,
      `💡 Dans le SINON (ELSE), le Servo doit être à 0 et la RGB en Vert (G:255).`
    ],
    allowedCategories: ['arduino', 'digital', 'analog', 'actuators', 'logic', 'math', 'sensors', 'time', 'oled'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP"><block type="oled_init"></block></statement>
        <statement name="LOOP">
          <block type="oled_clear">
            <next><block type="oled_println"><value name="TEXT"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
              <next><block type="oled_display">
                <next><block type="controls_if"><value name="IF0">
                  <block type="logic_compare"><field name="OP">GT</field>
                    <value name="A"><block type="sensor_ultrasonic"><field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field><field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field></block></value>
                    <value name="B"><shadow type="math_number"><field name="NUM">50</field></shadow></value>
                  </block></value>
                  <statement name="DO0">
                    <block type="actuator_servo"><field name="PIN">${PANEL_PINS.SERVO}</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      <next><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value></block></next>
                    </block>
                  </statement>
                  <statement name="ELSE">
                    <block type="actuator_servo"><field name="PIN">${PANEL_PINS.SERVO}</field><value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
                      <next><block type="actuator_rgb_led"><field name="PINR">${PANEL_PINS.RGB_R}</field><field name="PING">${PANEL_PINS.RGB_G}</field><field name="PINB">${PANEL_PINS.RGB_B}</field><value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value><value name="B"><shadow type="math_number"><field name="NUM">255</field></shadow></value></block></next>
                    </block>
                  </statement>
                </block></next>
              </block></next>
            </block></next>
          </block>
        </statement>
      </block>
    </xml>`,
  }
];

// ═══════════════════════════════════════════════════
// Validation des Missions
// ═══════════════════════════════════════════════════
const VALIDATIONS = {

  // NIVEAU 1
  'mission_01': {
    checks: [
      { type: 'includes', value: 'pinMode(5,', msg: 'La broche dans "configurer" doit être 5.' },
      { type: 'regex', value: 'void loop\\(\\)[\\s\\S]*digitalWrite\\(5,\\s*HIGH\\)', msg: 'Il faut allumer la DEL rouge (broche 5) dans la boucle.' },
    ],
    successMsg: '🎉 Lumière allumée ! Tu as compris le système de broches.',
  },

  'mission_02': {
    checks: [
      { type: 'regex', value: 'digitalWrite\\(5,\\s*HIGH\\)[\\s\\S]*delay\\(1000\\)[\\s\\S]*digitalWrite\\(5,\\s*LOW\\)[\\s\\S]*delay\\(1000\\)', msg: 'Séquence requise : Allumer -> attendre 1000 -> Eteindre -> attendre 1000.' },
    ],
    successMsg: '🎉 La balise clignote parfaitement !',
  },

  'mission_03': {
    checks: [
      { type: 'regex', value: 'digitalWrite\\(8,\\s*HIGH\\)[\\s\\S]*delay\\(2000\\)[\\s\\S]*digitalWrite\\(8,\\s*LOW\\)', msg: 'La Verte doit s\'allumer 2s puis s\'éteindre.' },
      { type: 'regex', value: 'digitalWrite\\(6,\\s*HIGH\\)[\\s\\S]*delay\\(1000\\)[\\s\\S]*digitalWrite\\(6,\\s*LOW\\)', msg: 'La Jaune doit s\'allumer 1s puis s\'éteindre.' },
      { type: 'regex', value: 'digitalWrite\\(5,\\s*HIGH\\)[\\s\\S]*delay\\(2000\\)', msg: 'La Rouge doit s\'allumer 2s.' }
    ],
    successMsg: '🎉 Séquence validée !',
  },

  'mission_04': {
    checks: [
      { type: 'includes', value: 'tone(7,', msg: 'Le buzzer doit être sur la broche 7.' }
    ],
    successMsg: '🔊 Bip bip ! Le système audio est en ligne.',
  },

  'mission_05': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]*digitalWrite\\(8,\\s*HIGH\\)', msg: 'Le Bouton 1 (2) doit allumer la Verte (8).' },
      { type: 'regex', value: 'digitalWrite\\(8,\\s*LOW\\)', msg: 'La DEL Verte doit s\'éteindre dans le SINON.' }
    ],
    successMsg: '🎉 Tu as maîtrisé les commandes manuelles !',
  },

  'mission_06': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(4\\)[\\s\\S]*tone\\(7,', msg: 'Le Bouton 2 (4) doit activer le Buzzer (7).' },
      { type: 'regex', value: 'digitalWrite\\(5,\\s*HIGH\\)', msg: 'La DEL Rouge (5) doit s\'allumer en cas d\'alarme.' }
    ],
    successMsg: '🚨 Alarme configurée avec succès !',
  },

  'mission_07': {
    checks: [
      { type: 'includes', value: 'servo_3.write(90)', msg: 'Le servo (broche 3) doit être à 90 degrés.' }
    ],
    successMsg: '🚪 Le sas est ouvert !',
  },

  'mission_08': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]*servo_3\\.write\\(90\\)', msg: 'Le bouton (2) ouvre à 90 degrés.' },
      { type: 'regex', value: 'servo_3\\.write\\(0\\)', msg: 'Le servo doit retourner à 0 degré dans le SINON.' }
    ],
    successMsg: '🔒 Le sas est maintenant sécurisé.',
  },

  'mission_09': {
    checks: [
      { type: 'includes', value: 'Serial.begin(9600)', msg: 'N\'oublie pas de démarrer le Moniteur Série.' },
      { type: 'includes', value: 'analogRead(A0)', msg: 'Il faut lire le potentiomètre sur A0.' },
      { type: 'includes', value: 'Serial.println(', msg: 'Il faut écrire la valeur avec "série écrire ligne".' }
    ],
    successMsg: '📟 Connexion établie ! Les valeurs s\'affichent.',
  },

  'mission_10': {
    checks: [
      { type: 'includes', value: 'map(', msg: 'Il faut utiliser le bloc "convertir".' },
      { type: 'includes', value: 'servo_3.write(', msg: 'Le servo doit être sur la broche 3.' }
    ],
    successMsg: '🎓 Niveau 1 terminé ! Tu es un vrai technicien de bord !',
  },

  // NIVEAU 2
  'mission_11': {
    checks: [
      { type: 'includes', value: 'constrain(', msg: 'Il faut utiliser le bloc "contraindre" !' }
    ],
    successMsg: '🎉 Sécurité activée ! Le moteur est protégé.',
  },

  'mission_12': {
    checks: [
      { type: 'includes', value: 'analogWrite(9, 255)', msg: 'Le Rouge (broche 9) doit être à 255.' },
      { type: 'includes', value: 'analogWrite(10, 0)', msg: 'Le Vert (broche 10) doit être à 0.' }
    ],
    successMsg: '🎉 La DEL RGB brille de mille feux !',
  },

  'mission_13': {
    checks: [
      { type: 'regex', value: 'analogWrite\\(9,\\s*255\\)[\\s\\S]*analogWrite\\(10,\\s*255\\)', msg: 'Pour le jaune, le Rouge et le Vert doivent être à 255.' }
    ],
    successMsg: '🎨 Magnifique Jaune ! Tu maîtrises la lumière.',
  },

  'mission_14': {
    checks: [
      { type: 'includes', value: 'map(', msg: 'Il faut utiliser "convertir".' },
      { type: 'regex', value: 'analogWrite\\(9,\\s*map', msg: 'Le bloc convertir doit contrôler la broche Rouge (9).' }
    ],
    successMsg: '🎛️ Variateur fonctionnel ! L\'intensité est parfaite.',
  },

  'mission_15': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]{0,120}?digitalWrite\\(8,', msg: 'Le Bouton 1 (2) doit allumer la Verte (8).' },
      { type: 'regex', value: 'digitalRead\\(4\\)[\\s\\S]{0,120}?digitalWrite\\(6,', msg: 'Le Bouton 2 (4) doit allumer la Jaune (6).' }
    ],
    successMsg: '🎉 Les modes de vol sont rétablis !',
  },

  'mission_16': {
    checks: [
      { type: 'includes', value: 'readUltrasonic(12, 13)', msg: 'Les broches sont inversées ! Envoi = 12, Écoute = 13.' }
    ],
    successMsg: '📡 Radar calibré ! Je vois les astéroïdes sur l\'écran.',
  },

  'mission_17': {
    checks: [
      { type: 'regex', value: '<\\s*15\\)', msg: 'Le seuil doit être fixé à 15.' }
    ],
    successMsg: '⚠️ Système d\'alerte optimal ! On est en sécurité.',
  },

  'mission_18': {
    checks: [
      { type: 'includes', value: 'servo_3.write(0)', msg: 'Le freinage doit envoyer le servo de la broche 3 à 0°.' },
      { type: 'includes', value: 'servo_3.write(90)', msg: 'La croisière doit envoyer le servo de la broche 3 à 90°.' }
    ],
    successMsg: '🧯 Freinage d\'urgence calibré avec succès !',
  },

  'mission_19': {
    checks: [
      { type: 'regex', value: 'analogWrite\\(10,\\s*255\\)[\\s\\S]*analogWrite\\(11,\\s*0\\)', msg: 'Vérifie bien tes mélanges : Vert pur pour "tout va bien", et Jaune (Rouge+Vert) pour l\'approche.' }
    ],
    successMsg: '🚦 Interface couleur opérationnelle !',
  },

  'mission_20': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]*analogWrite\\(10,\\s*255\\)', msg: 'Il faut lire le Bouton 1 et allumer le Vert (Broche 10 à 255).' },
      { type: 'regex', value: 'digitalRead\\(4\\)[\\s\\S]*analogWrite\\(9,\\s*255\\)', msg: 'Il faut lire le Bouton 2 et allumer le Rouge (Broche 9 à 255).' }
    ],
    successMsg: '🎓 EXAMEN RÉUSSI ! Tu es maintenant un véritable Technicien de Bord. Prépare-toi pour le Niveau 3 !',
  },

  // NIVEAU 3
  'mission_21': {
    checks: [
      { type: 'includes', value: 'display.begin', msg: 'Il faut initialiser l\'OLED dans la Configuration.' },
      { type: 'includes', value: 'display.clearDisplay()', msg: 'Il faut effacer l\'écran au début de la boucle.' },
      { type: 'includes', value: 'display.print', msg: 'Il faut écrire un texte.' },
      { type: 'includes', value: 'display.display()', msg: 'Il faut actualiser l\'écran à la fin.' }
    ],
    successMsg: '🖥️ Allumage de l\'écran réussi !',
  },

  'mission_22': {
    checks: [
      { type: 'regex', value: 'display\\.print\\w*\\(readUltrasonic', msg: 'Il faut placer le bloc Ultrason à l\'intérieur du bloc Écrire de l\'OLED.' }
    ],
    successMsg: '📊 Les données du radar s\'affichent sur l\'écran !',
  },

  'mission_23': {
    checks: [
      { type: 'regex', value: 'display\\.(draw|fill)Circle', msg: 'Il manque le bloc Cercle !' },
      { type: 'regex', value: 'display\\.(draw|fill)Circle\\(64,\\s*32,\\s*20', msg: 'Les dimensions du cercle doivent être X:64, Y:32, Rayon:20.' }
    ],
    successMsg: '🛡️ Bouclier d\'énergie en ligne !',
  },

  'mission_24': {
    checks: [
      { type: 'includes', value: 'map(', msg: 'Il faut utiliser "convertir".' },
      { type: 'includes', value: 'display.print', msg: 'Il faut imprimer le résultat de la conversion.' }
    ],
    successMsg: '🎚️ La jauge dynamique est parfaitement réglée !',
  },

  'mission_25': {
    checks: [
      { type: 'includes', value: 'for (int', msg: 'Il faut utiliser le bloc "Répéter" (qui crée une boucle "for" en code Arduino).' },
      { type: 'regex', value: 'count < 5', msg: 'La boucle doit se répéter exactement 5 fois.' }
    ],
    successMsg: '⚡ Hyper-clignotement activé !',
  },

  'mission_26': {
    checks: [
      { type: 'includes', value: '&&', msg: 'Il faut utiliser l\'opérateur "ET" (&& en Arduino) dans ta condition.' },
      { type: 'regex', value: 'analogWrite\\(11,\\s*255\\)', msg: 'La DEL RGB Bleu (broche 11) doit être à 255.' }
    ],
    successMsg: '🔐 Code de sécurité doublement validé !',
  },

  'mission_27': {
    checks: [
      { type: 'includes', value: '||', msg: 'Il faut utiliser l\'opérateur "OU" (|| en Arduino) dans ta condition.' }
    ],
    successMsg: '🆘 Le système de survie est paré à toute éventualité.',
  },

  'mission_28': {
    checks: [
      { type: 'regex', value: '=(.*)analogRead\\(A0\\)', msg: 'Il faut utiliser "mettre Puissance à" relié au potentiomètre.' },
      { type: 'regex', value: 'display\\.print\\w*\\([A-Za-z0-9_]+\\)', msg: 'Il faut écrire la variable sur l\'écran OLED.' }
    ],
    successMsg: '🧠 La mémoire de bord fonctionne !',
  },

  'mission_29': {
    checks: [
      { type: 'regex', value: 'display\\.print\\w*\\(readUltrasonic', msg: 'Le radar doit être affiché.' },
      { type: 'regex', value: 'display\\.print\\w*\\(analogRead\\(A0\\)\\)', msg: 'Le potentiomètre doit être affiché.' },
      { type: 'regex', value: 'display\\.display\\(\\)', msg: 'Actualise l\'écran une seule fois à la fin !' }
    ],
    successMsg: '📈 Tableau de bord multi-tâches opérationnel !',
  },

  'mission_30': {
    checks: [
      { type: 'regex', value: 'display\\.begin', msg: 'OLED manquant.' },
      { type: 'regex', value: '<\\s*10', msg: 'Il manque la condition du radar à moins de 10 cm.' },
      { type: 'regex', value: 'servo_3\\.write\\(90\\)', msg: 'Le servo doit aller à 90 en cas d\'alerte.' },
      { type: 'regex', value: 'analogWrite\\(9,\\s*255\\)', msg: 'Le rouge de la RGB doit s\'allumer en cas d\'alerte.' }
    ],
    successMsg: '🌍🏆 ATTERRISSAGE RÉUSSI ! Félicitations Commandant, tu as sauvé L\'Étoile Filante et tu maîtrises maintenant la programmation de ton vaisseau !',
  }
};

class ScenarioManager {
  constructor() {
    this.activeMission = null;
    this.currentHintIndex = 0;
  }

  getMissions() {
    return MISSIONS;
  }

  getMission(id) {
    return MISSIONS.find(m => m.id === id);
  }

  getActiveMission() {
    return this.activeMission;
  }

  isActive() {
    return this.activeMission !== null;
  }

  startMission(id) {
    const mission = this.getMission(id);
    if (!mission) return null;
    this.activeMission = mission;
    this.currentHintIndex = 0;
    return mission;
  }

  exitMission() {
    this.activeMission = null;
    this.currentHintIndex = 0;
  }

  getNextHint() {
    if (!this.activeMission) return null;
    const hints = this.activeMission.hints || [];
    if (this.currentHintIndex >= hints.length) return null;
    return hints[this.currentHintIndex++];
  }

  getHintCount() {
    if (!this.activeMission) return 0;
    return this.activeMission.hints ? this.activeMission.hints.length : 0;
  }

  getUsedHints() {
    return this.currentHintIndex;
  }

  filterCategories(allCategories) {
    if (!this.activeMission || !this.activeMission.allowedCategories) {
      return allCategories;
    }
    return allCategories.filter(cat =>
      this.activeMission.allowedCategories.includes(cat.id)
    );
  }

  filterBlocks(categoryId, allBlocks) {
    if (!this.activeMission || !this.activeMission.allowedBlocks) {
      return allBlocks;
    }
    const allowed = this.activeMission.allowedBlocks[categoryId];
    if (!allowed) return allBlocks;
    return allBlocks.filter(b => allowed.includes(b.type));
  }

  validateCode(code) {
    if (!this.activeMission) {
      return { valid: false, failures: ['Aucune mission active.'], successMsg: '' };
    }

    const v = VALIDATIONS[this.activeMission.id];
    if (!v) {
      return { valid: true, failures: [], successMsg: 'Code vérifié! ✅' };
    }

    const failures = [];

    for (const check of v.checks) {
      switch (check.type) {
        case 'includes':
          if (!code.includes(check.value)) {
            failures.push(check.msg);
          }
          break;

        case 'excludes':
          if (code.includes(check.value)) {
            failures.push(check.msg);
          }
          break;

        case 'regex':
          try {
            if (!new RegExp(check.value).test(code)) {
              failures.push(check.msg);
            }
          } catch (e) {
            console.warn('Regex validation error:', e);
          }
          break;
      }
    }

    return {
      valid: failures.length === 0,
      failures,
      successMsg: v.successMsg || '🎉 Mission accomplie!',
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MISSIONS, PANEL_PINS, DIFFICULTY, ScenarioManager };
}
