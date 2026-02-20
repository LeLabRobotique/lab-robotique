/**
 * Le Lab Robotique — Système de Missions (Scénarios)
 * 
 * Aventure spatiale : « Le Voyage de l'Étoile Filante »
 * ─────────────────────────────────────────────────────
 * Les jeunes recrues viennent de monter à bord du vaisseau spatial
 * « L'Étoile Filante ». L'IA de bord, NOVA, les guide à travers
 * 18 missions pour réparer les systèmes du vaisseau et atteindre
 * la planète Kepler-442b.
 *
 * Progression pédagogique (1 nouveau concept par mission, progression graduelle) :
 *   Niveau 1 — Apprenti Spatial   (Missions 1-6)  : LED, clignotement, séquences, boutons, buzzer
 *   Niveau 2 — Technicien de Bord (Missions 7-12) : analogique, conversion, servo, PWM/RGB, logique de modes
 *   Niveau 3 — Commandant         (Missions 13-18): ultrason, conditions, états, automatisation, intégration
 *
 * ⚠️ IMPORTANT : Tout le vocabulaire des briefings et indices utilise les
 *   termes FRANÇAIS des blocs Blockly (broche, ALLUMER/ÉTEINDRE, attendre,
 *   convertir, etc.) et NON les termes Arduino (pin, HIGH/LOW, delay, map).
 */

// ═══════════════════════════════════════════════════
// Configuration des broches du panneau de contrôle
// (Câblage fixe – ne pas modifier côté matériel)
// ═══════════════════════════════════════════════════
const PANEL_PINS = {
  // Entrées
  POT: 'A0',           // Potentiomètre
  BTN1: 2,             // Bouton 1
  BTN2: 4,             // Bouton 2
  ULTRA_TRIG: 12,      // Capteur ultrasonique - Trigger
  ULTRA_ECHO: 13,      // Capteur ultrasonique - Echo

  // Sorties
  LED_R: 5,            // DEL Rouge
  LED_Y: 6,            // DEL Jaune
  LED_G: 8,            // DEL Verte
  RGB_R: 9,            // DEL RGB - Rouge (PWM)
  RGB_G: 10,           // DEL RGB - Vert (PWM)
  RGB_B: 11,           // DEL RGB - Bleu (PWM)
  SERVO: 3,            // Servo moteur
  BUZZER: 7,           // Buzzer (haut-parleur piezo)

  // I2C (OLED) — fixe sur Uno
  SDA: 'A4',
  SCL: 'A5',
};

// ═══════════════════════════════════════════════════
// Niveaux de difficulté (servent aussi de groupes)
// ═══════════════════════════════════════════════════
const DIFFICULTY = {
  APPRENTI:      { label: '🌟 Apprenti Spatial',    stars: 1, color: '#4caf50' },
  TECHNICIEN:    { label: '🔧 Technicien de Bord',  stars: 2, color: '#ff9800' },
  COMMANDANT:    { label: '🚀 Commandant',          stars: 3, color: '#e74c3c' },
};

// ═══════════════════════════════════════════════════
// Personnage récurrent : NOVA (IA du vaisseau)
// ═══════════════════════════════════════════════════
const NOVA = 'NOVA';

// ═══════════════════════════════════════════════════
// Missions (Scénarios)
// ═══════════════════════════════════════════════════
const MISSIONS = [

  // ╔═══════════════════════════════════════════╗
  // ║  NIVEAU 1 — APPRENTI SPATIAL (Missions 1-6) ║
  // ║  Un seul concept nouveau par mission       ║
  // ╚═══════════════════════════════════════════╝

  // ─── MISSION 1: La Balise de Secours ───
  // Concept : « configurer broche » + « LED broche ALLUMER » + bons numéros de broche
  {
    id: 'mission_01',
    title: 'Mission 1 : La Balise de Secours',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '💡',
    briefing:
`${NOVA} : « Recrue, bienvenue à bord de L'Étoile Filante! Je suis NOVA, l'intelligence artificielle du vaisseau. »
« On vient de sortir d'un saut à travers l'espace et nos systèmes se réveillent un peu n'importe comment. Notre premier problème : la balise de secours est éteinte! Sans elle, aucun vaisseau allié ne peut nous repérer dans le noir de l'espace. »
« La DEL Rouge est branchée sur la broche ${PANEL_PINS.LED_R}, mais quelqu'un a écrit le mauvais numéro dans le code. Trouve l'erreur et rallume notre signal! »`,
    objective: `Allumer la DEL Rouge (broche ${PANEL_PINS.LED_R}) en corrigeant les numéros de broche.`,
    hints: [
      `💡 Regarde bien les blocs : quel numéro de broche est écrit? Est-ce le bon?`,
      `💡 La DEL Rouge est branchée sur la broche ${PANEL_PINS.LED_R}, pas sur la broche 13.`,
      `💡 Il y a DEUX blocs à corriger : le « configurer broche » dans la Configuration ET le « LED broche » dans la Boucle.`,
      `💡 Change le 13 par ${PANEL_PINS.LED_R} dans les deux blocs. C'est tout!`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">13</field>
            <field name="MODE">OUTPUT</field>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led">
            <field name="PIN">13</field>
            <field name="STATE">HIGH</field>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 2: Le Clignotant d'Urgence ───
  // Concept : ALLUMER/ÉTEINDRE + « attendre (ms) » pour faire clignoter
  {
    id: 'mission_02',
    title: 'Mission 2 : Le Clignotant d\'Urgence',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔴',
    briefing:
`${NOVA} : « Super, la balise est allumée! Mais un signal fixe, ça ne se voit pas bien dans l'immensité de l'espace. »
« Il faut que la lumière clignote : elle s'allume, attend un peu, s'éteint, attend encore, et recommence. Comme un phare dans la nuit! »
« Le technicien précédent a oublié les pauses et l'extinction. Ajoute les blocs manquants pour faire clignoter la DEL Rouge (broche ${PANEL_PINS.LED_R}). »`,
    objective: `Faire clignoter la DEL Rouge (${PANEL_PINS.LED_R}) : 1 seconde allumée, 1 seconde éteinte.`,
    hints: [
      `💡 Tu as besoin de deux actions : ALLUMER puis ÉTEINDRE.`,
      `⏱️ Entre les actions, ajoute « attendre (ms) ». 1000 ms = 1 seconde.`,
      `✅ Séquence complète : ALLUMER → attendre 1000 → ÉTEINDRE → attendre 1000.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="MODE">OUTPUT</field>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="STATE">HIGH</field>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 3: Feux de Navigation ───
  // Concept : séquences avec plusieurs DEL + bon ordre + bonnes durées
  {
    id: 'mission_03',
    title: 'Mission 3 : Feux de Navigation',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🚦',
    briefing:
`${NOVA} : « On nous repère enfin! Mais les feux de navigation du vaisseau sont tout mélangés. »
« Le tableau de bord a trois voyants, comme un feu de circulation : Vert = tout va bien, Jaune = attention, Rouge = danger. Ils doivent s'allumer dans le bon ordre, chacun leur tour. »
« Un ancien pilote a inversé l'ordre et les durées dans le code! Remets les DEL (Verte broche ${PANEL_PINS.LED_G}, Jaune broche ${PANEL_PINS.LED_Y}, Rouge broche ${PANEL_PINS.LED_R}) dans le bon ordre avec les bonnes durées. »`,
    objective: `Programmer la séquence des DEL : Vert 3s → Jaune 1s → Rouge 3s.`,
    hints: [
      `🔎 Vérifie l'ordre : on veut Vert d'abord, puis Jaune, puis Rouge.`,
      `⏱️ 3000 ms = 3 secondes et 1000 ms = 1 seconde.`,
      `✅ Astuce : éteins une DEL avant d'allumer la suivante pour éviter d'en avoir 2 allumées en même temps.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <field name="MODE">OUTPUT</field>
                <next>
                  <block type="pin_mode">
                    <field name="PIN">${PANEL_PINS.LED_G}</field>
                    <field name="MODE">OUTPUT</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="STATE">HIGH</field>
            <next>
              <block type="arduino_delay">
                <value name="TIME">
                  <shadow type="math_number"><field name="NUM">1000</field></shadow>
                </value>
                <next>
                  <block type="actuator_led">
                    <field name="PIN">${PANEL_PINS.LED_G}</field>
                    <field name="STATE">HIGH</field>
                    <next>
                      <block type="arduino_delay">
                        <value name="TIME">
                          <shadow type="math_number"><field name="NUM">1000</field></shadow>
                        </value>
                        <next>
                          <block type="actuator_led">
                            <field name="PIN">${PANEL_PINS.LED_Y}</field>
                            <field name="STATE">HIGH</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 4: Boutons de Commande ───
  // Concept : entrée numérique (bouton) + condition « si/alors »
  {
    id: 'mission_04',
    title: 'Mission 4 : Les Boutons de Commande',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔘',
    briefing:
`${NOVA} : « Les feux marchent! Mais j'ai un souci avec les boutons de la console de pilotage. »
« Le panneau de commande a deux boutons : le bouton 1 (broche ${PANEL_PINS.BTN1}) et le bouton 2 (broche ${PANEL_PINS.BTN2}). Quand on appuie sur un bouton, la bonne lumière doit s'allumer. »
« Sauf que quelqu'un a inversé les fils! Le bouton 1 allume la mauvaise DEL et le bouton 2 aussi. Échange les DEL pour que chaque bouton contrôle la bonne lumière. »`,
    objective: `Le bouton 1 contrôle la DEL Rouge (${PANEL_PINS.LED_R}) et le bouton 2 contrôle la DEL Jaune (${PANEL_PINS.LED_Y}).`,
    hints: [
      `🔁 Les DEL sont inversées : échange les numéros de broche dans les blocs « LED broche ».`,
      `✅ Bouton 1 → DEL Rouge (broche ${PANEL_PINS.LED_R}) et Bouton 2 → DEL Jaune (broche ${PANEL_PINS.LED_Y}).`,
      `ℹ️ Pas besoin de toucher aux boutons eux-mêmes, seulement aux DEL.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <field name="MODE">OUTPUT</field>
                <next>
                  <block type="pin_mode">
                    <field name="PIN">${PANEL_PINS.BTN1}</field>
                    <field name="MODE">INPUT_PULLUP</field>
                    <next>
                      <block type="pin_mode">
                        <field name="PIN">${PANEL_PINS.BTN2}</field>
                        <field name="MODE">INPUT_PULLUP</field>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>

        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="sensor_button">
                <field name="PIN">${PANEL_PINS.BTN1}</field>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <field name="STATE">HIGH</field>
              </block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="sensor_button">
                    <field name="PIN">${PANEL_PINS.BTN2}</field>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="actuator_led">
                    <field name="PIN">${PANEL_PINS.LED_R}</field>
                    <field name="STATE">HIGH</field>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 5: Alarme de Bord ───
  // Concept : buzzer (tone) + timing simple (attendre ms)
  {
    id: 'mission_05',
    title: 'Mission 5 : L\'Alarme de Bord',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🔊',
    briefing:
`${NOVA} : « Bien joué, recrue! Les boutons fonctionnent. Maintenant, parlons du son. »
« Chaque vaisseau spatial a besoin d'une alarme sonore. Le buzzer, c'est un petit haut-parleur qui fait des bips. Il sert à prévenir l'équipage en cas de danger! »
« Le problème : le code envoie le son sur la mauvaise broche. Le buzzer est branché sur la broche ${PANEL_PINS.BUZZER}, mais le code pointe sur une DEL! Corrige ça et fais retentir l'alarme. »`,
    objective: `Faire sonner le buzzer (broche ${PANEL_PINS.BUZZER}) en même temps que la DEL Rouge (broche ${PANEL_PINS.LED_R}).`,
    hints: [
      `🔎 Regarde la broche dans le bloc « buzzer » : est-ce la bonne?`,
      `🔔 Le buzzer est sur la broche ${PANEL_PINS.BUZZER}, pas sur une DEL!`,
      `✅ Change la broche du buzzer pour ${PANEL_PINS.BUZZER} et le tour est joué.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="MODE">OUTPUT</field>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="actuator_led">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="STATE">HIGH</field>
            <next>
              <block type="actuator_buzzer">
                <field name="PIN">${PANEL_PINS.LED_G}</field>
                <value name="FREQ">
                  <shadow type="math_number"><field name="NUM">880</field></shadow>
                </value>
                <value name="DUR">
                  <shadow type="math_number"><field name="NUM">200</field></shadow>
                </value>
                <next>
                  <block type="actuator_led">
                    <field name="PIN">${PANEL_PINS.LED_R}</field>
                    <field name="STATE">LOW</field>
                    <next>
                      <block type="arduino_delay">
                        <value name="TIME">
                          <shadow type="math_number"><field name="NUM">800</field></shadow>
                        </value>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 6: Procédure de Démarrage ───
  // Concept : combiner bouton + DEL + buzzer (révision du niveau 1)
  {
    id: 'mission_06',
    title: 'Mission 6 : Procédure de Démarrage',
    difficulty: DIFFICULTY.APPRENTI,
    icon: '🚀',
    briefing:
`${NOVA} : « Félicitations, recrue! Tu as presque terminé ta formation de base. »
« Dernière épreuve avant le Niveau 2 : la procédure de démarrage du vaisseau! Quand le pilote appuie sur le bouton 1 (broche ${PANEL_PINS.BTN1}), les systèmes doivent se lancer : DEL Verte allumée, petit bip de confirmation, puis extinction. »
« Mais attention : le code vérifie le mauvais bouton! Il écoute le bouton 2 au lieu du bouton 1. Trouve l'erreur et corrige-la pour que le décollage soit possible! »`,
    objective: `Lancer la procédure de démarrage avec le bouton 1 (broche ${PANEL_PINS.BTN1}).`,
    hints: [
      `🔎 Regarde le bloc « bouton pressé » dans le SI : quel numéro de broche est écrit?`,
      `💡 Le bouton 1 est sur la broche ${PANEL_PINS.BTN1}, pas la broche ${PANEL_PINS.BTN2}.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_G}</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.BTN1}</field>
                <field name="MODE">INPUT_PULLUP</field>
              </block>
            </next>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="sensor_button">
                <field name="PIN">${PANEL_PINS.BTN2}</field>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_G}</field>
                <field name="STATE">HIGH</field>
                <next>
                  <block type="arduino_delay">
                    <value name="TIME">
                      <shadow type="math_number"><field name="NUM">1000</field></shadow>
                    </value>
                    <next>
                      <block type="actuator_buzzer">
                        <field name="PIN">${PANEL_PINS.BUZZER}</field>
                        <value name="FREQ">
                          <shadow type="math_number"><field name="NUM">880</field></shadow>
                        </value>
                        <value name="DUR">
                          <shadow type="math_number"><field name="NUM">200</field></shadow>
                        </value>
                        <next>
                          <block type="actuator_led">
                            <field name="PIN">${PANEL_PINS.LED_G}</field>
                            <field name="STATE">LOW</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },


  // ╔══════════════════════════════════════════════════╗
  // ║  NIVEAU 2 — TECHNICIEN DE BORD (Missions 7-12)   ║
  // ╚══════════════════════════════════════════════════╝

  // ─── MISSION 7: Variateur de Puissance ───
  // Concept : lecture analogique (potentiomètre) + affichage (Moniteur Série)
  {
    id: 'mission_07',
    title: 'Mission 7 : Le Variateur de Puissance',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🎚️',
    briefing:
`${NOVA} : « Bienvenue au Niveau 2, technicien! Les choses deviennent plus intéressantes. »
« Le vaisseau a un potentiomètre — c'est une molette qu'on tourne pour régler la puissance des moteurs. Quand on la tourne, elle envoie un nombre entre 0 et 1023. »
« On veut voir ce nombre sur le Moniteur Série (l'écran de données). Mais le code lit la mauvaise broche! Le potentiomètre est branché sur ${PANEL_PINS.POT}. Corrige la broche et vérifie que les valeurs s'affichent correctement. »`,
    objective: `Afficher la valeur du potentiomètre (${PANEL_PINS.POT}) dans le Moniteur Série.`,
    hints: [
      `🔎 Le potentiomètre est sur la broche ${PANEL_PINS.POT}, pas sur A1.`,
      `📟 Vérifie qu'il y a bien « série commencer » (9600) dans la Configuration.`,
      `✅ Dans le bloc « potentiomètre broche », choisis ${PANEL_PINS.POT}.`,
    ],
    allowedCategories: ['arduino', 'analog', 'sensors', 'serial', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="serial_begin">
            <value name="BAUD">
              <shadow type="math_number"><field name="NUM">9600</field></shadow>
            </value>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="serial_println">
            <value name="TEXT">
              <block type="sensor_potentiometer">
                <field name="PIN">A1</field>
              </block>
            </value>
            <next>
              <block type="arduino_delay">
                <value name="TIME">
                  <shadow type="math_number"><field name="NUM">200</field></shadow>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 8: Pilotage Automatique ───
  // Concept : conversion 0-1023 → 0-180 (convertir/map) + servo
  {
    id: 'mission_08',
    title: 'Mission 8 : Le Pilotage Automatique',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🧭',
    briefing:
`${NOVA} : « Le potentiomètre fonctionne. Maintenant, utilisons-le pour piloter quelque chose de concret! »
« Le servo-moteur contrôle une trappe d'aération du vaisseau. Il peut bouger entre 0° et 180°. Mais le potentiomètre, lui, envoie des valeurs de 0 à 1023... c'est beaucoup trop grand! »
« Si on envoie 1023 au servo directement, il va se bloquer. Il faut transformer la valeur : convertir 0-1023 en 0-180. Utilise le bloc « convertir » pour que la molette contrôle la trappe en douceur! »`,
    objective: `Convertir le potentiomètre (0-1023) en angle (0-180) et piloter le servo (broche ${PANEL_PINS.SERVO}).`,
    hints: [
      `🔎 Utilise le bloc « convertir » pour transformer les valeurs.`,
      `✅ Convertir : de min 0, de max 1023, à min 0, à max 180.`,
      `✅ Place le bloc « convertir » autour de la lecture du potentiomètre, puis branche le résultat dans le bloc servo.`,
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_servo">
            <field name="PIN">${PANEL_PINS.SERVO}</field>
            <value name="ANGLE">
              <block type="sensor_potentiometer">
                <field name="PIN">${PANEL_PINS.POT}</field>
              </block>
            </value>
            <next>
              <block type="arduino_delay">
                <value name="TIME">
                  <shadow type="math_number"><field name="NUM">20</field></shadow>
                </value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 9: Limiteur de Sécurité ───
  // Concept : contraindre (math_constrain) pour limiter l'angle
  {
    id: 'mission_09',
    title: 'Mission 9 : Le Limiteur de Sécurité',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🛡️',
    briefing:
`${NOVA} : « La trappe bouge bien grâce à la molette, mais il y a un problème de sécurité! »
« Si le servo tourne trop loin (en dessous de 30° ou au-dessus de 150°), il va forcer contre les parois du vaisseau et risque de se casser. Pas idéal dans l'espace! »
« On doit mettre des limites : jamais en dessous de 30° et jamais au-dessus de 150°. Utilise le bloc « contraindre » de la catégorie Mathématiques pour ajouter des bornes de sécurité. »`,
    objective: `Limiter l'angle du servo entre 30° et 150° en ajoutant le bloc « contraindre ».`,
    hints: [
      `🔎 Le bloc « contraindre » se trouve dans la catégorie Mathématiques.`,
      `✅ Contraindre(angle, 30, 150) — ça empêche la valeur de sortir de cette plage.`,
      `✅ Place le bloc « contraindre » autour du résultat de « convertir », puis envoie ça au servo.`,
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors', 'time', 'logic'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_servo">
            <field name="PIN">${PANEL_PINS.SERVO}</field>
            <value name="ANGLE">
              <block type="arduino_map">
                <value name="VALUE">
                  <block type="sensor_potentiometer">
                    <field name="PIN">${PANEL_PINS.POT}</field>
                  </block>
                </value>
                <value name="FROM_MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="FROM_MAX"><shadow type="math_number"><field name="NUM">1023</field></shadow></value>
                <value name="TO_MIN"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="TO_MAX"><shadow type="math_number"><field name="NUM">180</field></shadow></value>
              </block>
            </value>
            <next>
              <block type="arduino_delay">
                <value name="TIME"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 10: Feu de Position RGB ───
  // Concept : PWM (intensité 0-255) — une seule couleur
  {
    id: 'mission_10',
    title: 'Mission 10 : Le Feu de Position',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🌈',
    briefing:
`${NOVA} : « Le vaisseau a une DEL spéciale : la DEL RGB. Elle peut afficher n'importe quelle couleur en mélangeant Rouge, Vert et Bleu, comme de la peinture! »
« Chaque couleur a une intensité de 0 (éteinte) à 255 (maximum). Par exemple, Rouge à fond + Vert à zéro + Bleu à zéro = rouge pur. »
« En ce moment, les trois couleurs sont au maximum et ça fait du blanc. On veut plutôt un feu de position rouge discret : Rouge à 128, Vert à 0, Bleu à 0. Ajuste les valeurs! »`,
    objective: `Régler la DEL RGB : Rouge = 128, Vert = 0, Bleu = 0.`,
    hints: [
      `🔎 Chaque intensité va de 0 (éteint) à 255 (maximum).`,
      `✅ Mets Rouge à 128, et les deux autres à 0.`,
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_rgb_led">
            <field name="PINR">${PANEL_PINS.RGB_R}</field>
            <field name="PING">${PANEL_PINS.RGB_G}</field>
            <field name="PINB">${PANEL_PINS.RGB_B}</field>
            <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
            <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 11: Intensité contrôlée ───
  // Concept : potentiomètre → convertir → PWM (RGB)
  {
    id: 'mission_11',
    title: 'Mission 11 : Intensité Contrôlée',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🎛️',
    briefing:
`${NOVA} : « Et si on pouvait régler la luminosité avec la molette? Comme un variateur de lumière! »
« L'idée : tourner le potentiomètre pour augmenter ou diminuer l'intensité du rouge sur la DEL RGB. Plus on tourne, plus c'est lumineux. »
« Petit détail important : le potentiomètre donne des valeurs de 0 à 1023, mais la DEL RGB accepte seulement de 0 à 255. Il faut convertir! Le code actuel envoie la valeur brute — ajoute le bloc « convertir » pour que ça fonctionne. »`,
    objective: `Convertir la lecture du potentiomètre (0-1023) en intensité (0-255) pour contrôler le rouge de la DEL RGB.`,
    hints: [
      `🔎 Utilise « convertir » : de 0-1023 vers 0-255.`,
      `✅ Le Vert et le Bleu restent à 0.`,
    ],
    allowedCategories: ['arduino', 'analog', 'actuators', 'math', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="actuator_rgb_led">
            <field name="PINR">${PANEL_PINS.RGB_R}</field>
            <field name="PING">${PANEL_PINS.RGB_G}</field>
            <field name="PINB">${PANEL_PINS.RGB_B}</field>
            <value name="R">
              <block type="sensor_potentiometer">
                <field name="PIN">${PANEL_PINS.POT}</field>
              </block>
            </value>
            <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
            <next>
              <block type="arduino_delay">
                <value name="TIME"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 12: Mode Manuel / Mode Automatique ───
  // Concept : 2 boutons = choix de mode (logique)
  {
    id: 'mission_12',
    title: 'Mission 12 : Deux Modes de Vol',
    difficulty: DIFFICULTY.TECHNICIEN,
    icon: '🧩',
    briefing:
`${NOVA} : « Dernière épreuve du Niveau 2! Ici on combine tout ce qu'on a appris. »
« Le vaisseau a deux modes de vol : le bouton 1 (broche ${PANEL_PINS.BTN1}) active le mode normal (DEL Verte). Le bouton 2 (broche ${PANEL_PINS.BTN2}) active le mode alerte (DEL Jaune + bip du buzzer). »
« Mais les DEL sont inversées dans le code! Le bouton 1 allume la Jaune au lieu de la Verte, et le bouton 2 allume la Verte au lieu de la Jaune. Corrige les couleurs! »`,
    objective: `Bouton 1 → DEL Verte. Bouton 2 → DEL Jaune + bip du buzzer.`,
    hints: [
      `🔎 Vérifie quelles DEL s'allument dans chaque condition.`,
      `✅ Bouton 1 = DEL Verte, Bouton 2 = DEL Jaune + buzzer.`,
      `ℹ️ Si les deux boutons sont relâchés, tu peux tout éteindre (c'est un bonus!).`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_G}</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <field name="MODE">OUTPUT</field>
                <next>
                  <block type="pin_mode">
                    <field name="PIN">${PANEL_PINS.BTN1}</field>
                    <field name="MODE">INPUT_PULLUP</field>
                    <next>
                      <block type="pin_mode">
                        <field name="PIN">${PANEL_PINS.BTN2}</field>
                        <field name="MODE">INPUT_PULLUP</field>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>

        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block>
            </value>
            <statement name="DO0">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <field name="STATE">HIGH</field>
              </block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN2}</field></block>
                </value>
                <statement name="DO0">
                  <block type="actuator_led">
                    <field name="PIN">${PANEL_PINS.LED_G}</field>
                    <field name="STATE">HIGH</field>
                    <next>
                      <block type="actuator_buzzer">
                        <field name="PIN">${PANEL_PINS.BUZZER}</field>
                        <value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value>
                        <value name="DUR"><shadow type="math_number"><field name="NUM">150</field></shadow></value>
                      </block>
                    </next>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },


  // ╔══════════════════════════════════════════════════╗
  // ║  NIVEAU 3 — COMMANDANT (Missions 13-18)          ║
  // ╚══════════════════════════════════════════════════╝

  // ─── MISSION 13: Le Radar Spatial ───
  // Concept : capteur ultrason + affichage série
  {
    id: 'mission_13',
    title: 'Mission 13 : Le Radar Spatial',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '📡',
    briefing:
`${NOVA} : « Bienvenue au Niveau 3, commandant! À partir d'ici, on entre dans le vif du sujet. »
« Le vaisseau a un radar qui mesure les distances avec des ultrasons — un peu comme une chauve-souris! Il envoie un son, écoute l'écho, et calcule la distance. »
« Le capteur utilise deux broches : une pour envoyer le signal (broche ${PANEL_PINS.ULTRA_TRIG}) et une pour écouter l'écho (broche ${PANEL_PINS.ULTRA_ECHO}). Mais dans le code, les deux sont inversées! Le radar essaie d'envoyer par l'oreille et d'écouter par la bouche... Corrige les broches! »`,
    objective: `Afficher la distance du capteur ultrason dans le Moniteur Série en inversant les broches.`,
    hints: [
      `🔁 Les broches sont inversées : échange-les dans le bloc « distance ultrason ».`,
      `📟 Vérifie que « série commencer 9600 » est dans la Configuration.`,
      `✅ Envoi (TRIG) = broche ${PANEL_PINS.ULTRA_TRIG}, Écoute (ECHO) = broche ${PANEL_PINS.ULTRA_ECHO}.`,
    ],
    allowedCategories: ['arduino', 'sensors', 'serial', 'time', 'math'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="serial_begin">
            <value name="BAUD"><shadow type="math_number"><field name="NUM">9600</field></shadow></value>
          </block>
        </statement>
        <statement name="LOOP">
          <block type="serial_println">
            <value name="TEXT">
              <block type="sensor_ultrasonic">
                <field name="TRIG">${PANEL_PINS.ULTRA_ECHO}</field>
                <field name="ECHO">${PANEL_PINS.ULTRA_TRIG}</field>
              </block>
            </value>
            <next>
              <block type="arduino_delay">
                <value name="TIME"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 14: Alerte Collision ───
  // Concept : condition sur distance
  {
    id: 'mission_14',
    title: 'Mission 14 : Alerte Collision!',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '⚠️',
    briefing:
`${NOVA} : « Le radar fonctionne! Mais regarder des chiffres défiler, c'est trop lent en cas de danger. On a besoin d'une alerte automatique! »
« Voici le plan : si un objet est à moins de 15 cm du vaisseau, la DEL Rouge s'allume et le buzzer sonne. Si la voie est libre, la DEL Verte s'allume pour dire que tout va bien. »
« Le code a presque tout bon, mais le seuil de distance est beaucoup trop petit (5 cm au lieu de 15 cm). À 5 cm, on n'a plus le temps de réagir! Corrige le seuil. »`,
    objective: `Déclencher l'alerte (DEL Rouge + buzzer) quand la distance est inférieure à 15 cm.`,
    hints: [
      `🔎 Regarde la comparaison : le nombre devrait être 15, pas 5.`,
      `🔔 Vérifie que le buzzer est sur la broche ${PANEL_PINS.BUZZER}.`,
      `✅ Rouge = danger (trop proche), Vert = tout va bien (assez loin).`,
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'digital', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.LED_R}</field>
            <field name="MODE">OUTPUT</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.LED_G}</field>
                <field name="MODE">OUTPUT</field>
              </block>
            </next>
          </block>
        </statement>

        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A">
                  <block type="sensor_ultrasonic">
                    <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                    <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                  </block>
                </value>
                <value name="B">
                  <shadow type="math_number"><field name="NUM">5</field></shadow>
                </value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_R}</field>
                <field name="STATE">HIGH</field>
                <next>
                  <block type="actuator_buzzer">
                    <field name="PIN">${PANEL_PINS.BUZZER}</field>
                    <value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value>
                    <value name="DUR"><shadow type="math_number"><field name="NUM">150</field></shadow></value>
                  </block>
                </next>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_G}</field>
                <field name="STATE">HIGH</field>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 15: Freinage Automatique ───
  // Concept : capteur → servo (automatisation simple)
  {
    id: 'mission_15',
    title: 'Mission 15 : Le Freinage Automatique',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🧯',
    briefing:
`${NOVA} : « On a l'alerte visuelle et sonore, c'est bien. Mais il faudrait aussi que le vaisseau freine tout seul quand un obstacle approche! »
« La règle est simple : si un obstacle est à moins de 20 cm, le servo passe à 0° (frein activé). Sinon, il reste à 90° (vitesse de croisière). »
« Le problème : les deux blocs servo utilisent la mauvaise broche! Le servo-moteur est branché sur la broche ${PANEL_PINS.SERVO}. Corrige la broche dans les deux blocs. »`,
    objective: `Piloter le servo automatiquement : obstacle à moins de 20 cm → 0° (frein), sinon → 90° (croisière). Servo sur broche ${PANEL_PINS.SERVO}.`,
    hints: [
      `🔎 Regarde les blocs servo : quelle broche est écrite? Ce n'est pas la bonne.`,
      `✅ Change la broche du servo pour ${PANEL_PINS.SERVO} dans les DEUX blocs (le frein ET la croisière).`,
      `⏱️ Tu peux ajouter un petit « attendre » de 20 ms à la fin si le servo vibre.`,
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A">
                  <block type="sensor_ultrasonic">
                    <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                    <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                  </block>
                </value>
                <value name="B"><shadow type="math_number"><field name="NUM">20</field></shadow></value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_servo">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <value name="ANGLE"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_servo">
                <field name="PIN">${PANEL_PINS.LED_Y}</field>
                <value name="ANGLE"><shadow type="math_number"><field name="NUM">90</field></shadow></value>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 16: Statut Couleur (3 états) ───
  // Concept : états multiples via RGB (OK / ATTENTION / DANGER)
  {
    id: 'mission_16',
    title: 'Mission 16 : Statut en Couleurs',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🚦',
    briefing:
`${NOVA} : « Le freinage automatique est en place. Maintenant j'aimerais voir d'un coup d'œil si tout va bien, sans lire des chiffres. »
« Avec la DEL RGB, on peut afficher 3 états selon la distance détectée par le radar : Vert quand c'est loin (plus de 30 cm), Jaune quand on se rapproche (entre 15 et 30 cm), et Rouge quand c'est trop proche (moins de 15 cm). »
« Le code a la bonne structure, mais toutes les couleurs sont réglées sur rouge! Il manque les bonnes valeurs pour le jaune et le vert. Corrige-les! »`,
    objective: `Afficher 3 couleurs selon la distance : Vert (loin) / Jaune (moyen) / Rouge (proche).`,
    hints: [
      `🔎 Tu as besoin de plusieurs conditions : SI / SINON SI / SINON.`,
      `✅ Deux seuils à vérifier : moins de 15 cm = Rouge, moins de 30 cm = Jaune, sinon = Vert.`,
      `✅ Jaune = Rouge 255, Vert 255, Bleu 0. Vert pur = Rouge 0, Vert 255, Bleu 0.`,
    ],
    allowedCategories: ['arduino', 'sensors', 'logic', 'math', 'analog', 'actuators', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="logic_compare">
                <field name="OP">LT</field>
                <value name="A">
                  <block type="sensor_ultrasonic">
                    <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                    <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                  </block>
                </value>
                <value name="B"><shadow type="math_number"><field name="NUM">30</field></shadow></value>
              </block>
            </value>
            <statement name="DO0">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field>
                <field name="PING">${PANEL_PINS.RGB_G}</field>
                <field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
            <statement name="ELSE">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field>
                <field name="PING">${PANEL_PINS.RGB_G}</field>
                <field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 17: Priorité Manuelle ───
  // Concept : boutons forcent un état par-dessus l'automatique
  {
    id: 'mission_17',
    title: 'Mission 17 : La Priorité Manuelle',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🕹️',
    briefing:
`${NOVA} : « Le système automatique fonctionne bien, mais parfois l'équipage doit pouvoir reprendre le contrôle! »
« Voici la règle : si le bouton 1 (broche ${PANEL_PINS.BTN1}) est appuyé, on force la couleur verte (tout va bien, je gère!). Si le bouton 2 (broche ${PANEL_PINS.BTN2}) est appuyé, on force la couleur rouge (attention danger!). Si aucun bouton n'est appuyé, c'est le radar qui décide tout seul. »
« Le problème : les deux boutons sont inversés dans le code! Le bouton 1 force le rouge au lieu du vert. Échange les couleurs des boutons pour rétablir la bonne logique. »`,
    objective: `Bouton 1 → forcer Vert. Bouton 2 → forcer Rouge. Sinon → le radar décide automatiquement.`,
    hints: [
      `🔎 Bouton 1 = broche ${PANEL_PINS.BTN1}, Bouton 2 = broche ${PANEL_PINS.BTN2}.`,
      `✅ Les boutons doivent être vérifiés EN PREMIER, avant la logique du radar.`,
      `ℹ️ Échange les couleurs RGB dans les deux premiers blocs SI pour corriger l'inversion.`,
    ],
    allowedCategories: ['arduino', 'digital', 'actuators', 'logic', 'sensors', 'math', 'analog'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.BTN1}</field>
            <field name="MODE">INPUT_PULLUP</field>
            <next>
              <block type="pin_mode">
                <field name="PIN">${PANEL_PINS.BTN2}</field>
                <field name="MODE">INPUT_PULLUP</field>
              </block>
            </next>
          </block>
        </statement>

        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN2}</field></block>
            </value>
            <statement name="DO0">
              <block type="actuator_rgb_led">
                <field name="PINR">${PANEL_PINS.RGB_R}</field>
                <field name="PING">${PANEL_PINS.RGB_G}</field>
                <field name="PINB">${PANEL_PINS.RGB_B}</field>
                <value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
              </block>
            </statement>
            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block>
                </value>
                <statement name="DO0">
                  <block type="actuator_rgb_led">
                    <field name="PINR">${PANEL_PINS.RGB_R}</field>
                    <field name="PING">${PANEL_PINS.RGB_G}</field>
                    <field name="PINB">${PANEL_PINS.RGB_B}</field>
                    <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                    <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                    <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                  </block>
                </statement>
                <next>
                  <block type="controls_if">
                    <value name="IF0">
                      <block type="logic_compare">
                        <field name="OP">LT</field>
                        <value name="A">
                          <block type="sensor_ultrasonic">
                            <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                            <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                          </block>
                        </value>
                        <value name="B"><shadow type="math_number"><field name="NUM">15</field></shadow></value>
                      </block>
                    </value>
                    <statement name="DO0">
                      <block type="actuator_rgb_led">
                        <field name="PINR">${PANEL_PINS.RGB_R}</field>
                        <field name="PING">${PANEL_PINS.RGB_G}</field>
                        <field name="PINB">${PANEL_PINS.RGB_B}</field>
                        <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                        <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                        <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      </block>
                    </statement>
                    <statement name="ELSE">
                      <block type="actuator_rgb_led">
                        <field name="PINR">${PANEL_PINS.RGB_R}</field>
                        <field name="PING">${PANEL_PINS.RGB_G}</field>
                        <field name="PINB">${PANEL_PINS.RGB_B}</field>
                        <value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                        <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                        <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      </block>
                    </statement>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },

  // ─── MISSION 18: Système Principal ───
  // Concept : intégration (capteurs + actionneurs + états)
  {
    id: 'mission_18',
    title: 'Mission 18 : Le Système Principal du Vaisseau',
    difficulty: DIFFICULTY.COMMANDANT,
    icon: '🛰️',
    briefing:
`${NOVA} : « C'est la mission finale, commandant. Le grand test avant d'atteindre Kepler-442b! »
« Tous les systèmes doivent fonctionner ensemble : le radar mesure la distance, la DEL RGB change de couleur selon le danger, le buzzer sonne quand c'est critique, et le bouton 1 permet de confirmer le décollage. »
« Le code est presque complet, mais il reste deux erreurs cachées : la broche du buzzer est mauvaise (ce n'est pas la broche ${PANEL_PINS.LED_R}!) et le seuil de danger devrait être 15 cm, pas 10 cm. Trouve les erreurs, corrige-les, et on fonce vers Kepler-442b! »`,
    objective: `Corriger la broche du buzzer (doit être ${PANEL_PINS.BUZZER}) et le seuil de danger (doit être 15 cm), puis valider que tout fonctionne.`,
    hints: [
      `🔔 Le buzzer doit être sur la broche ${PANEL_PINS.BUZZER}. Cherche les blocs buzzer et vérifie leur broche.`,
      `⚠️ Le seuil de danger doit être 15, pas 10. Cherche le nombre dans la comparaison.`,
      `✅ Jaune = Rouge 255, Vert 255, Bleu 0.`,
      `✅ Vert = Rouge 0, Vert 255, Bleu 0.`,
    ],
    allowedCategories: ['arduino', 'digital', 'analog', 'actuators', 'logic', 'math', 'sensors', 'time'],
    allowedBlocks: null,
    startXml: `<xml>
      <block type="arduino_setup_loop" x="30" y="30" deletable="false">
        <statement name="SETUP">
          <block type="pin_mode">
            <field name="PIN">${PANEL_PINS.BTN1}</field>
            <field name="MODE">INPUT_PULLUP</field>
          </block>
        </statement>

        <statement name="LOOP">
          <block type="controls_if">
            <value name="IF0">
              <block type="sensor_button"><field name="PIN">${PANEL_PINS.BTN1}</field></block>
            </value>
            <statement name="DO0">
              <block type="actuator_led">
                <field name="PIN">${PANEL_PINS.LED_G}</field>
                <field name="STATE">HIGH</field>
                <next>
                  <block type="actuator_buzzer">
                    <field name="PIN">${PANEL_PINS.LED_R}</field>
                    <value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value>
                    <value name="DUR"><shadow type="math_number"><field name="NUM">200</field></shadow></value>
                    <next>
                      <block type="actuator_led">
                        <field name="PIN">${PANEL_PINS.LED_G}</field>
                        <field name="STATE">LOW</field>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>

            <next>
              <block type="controls_if">
                <value name="IF0">
                  <block type="logic_compare">
                    <field name="OP">LT</field>
                    <value name="A">
                      <block type="sensor_ultrasonic">
                        <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                        <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                      </block>
                    </value>
                    <value name="B">
                      <shadow type="math_number"><field name="NUM">10</field></shadow>
                    </value>
                  </block>
                </value>
                <statement name="DO0">
                  <block type="actuator_rgb_led">
                    <field name="PINR">${PANEL_PINS.RGB_R}</field>
                    <field name="PING">${PANEL_PINS.RGB_G}</field>
                    <field name="PINB">${PANEL_PINS.RGB_B}</field>
                    <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                    <value name="G"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                    <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                    <next>
                      <block type="actuator_buzzer">
                        <field name="PIN">${PANEL_PINS.LED_R}</field>
                        <value name="FREQ"><shadow type="math_number"><field name="NUM">880</field></shadow></value>
                        <value name="DUR"><shadow type="math_number"><field name="NUM">150</field></shadow></value>
                      </block>
                    </next>
                  </block>
                </statement>
                <statement name="ELSE">
                  <block type="controls_if">
                    <value name="IF0">
                      <block type="logic_compare">
                        <field name="OP">LT</field>
                        <value name="A">
                          <block type="sensor_ultrasonic">
                            <field name="TRIG">${PANEL_PINS.ULTRA_TRIG}</field>
                            <field name="ECHO">${PANEL_PINS.ULTRA_ECHO}</field>
                          </block>
                        </value>
                        <value name="B"><shadow type="math_number"><field name="NUM">30</field></shadow></value>
                      </block>
                    </value>
                    <statement name="DO0">
                      <block type="actuator_rgb_led">
                        <field name="PINR">${PANEL_PINS.RGB_R}</field>
                        <field name="PING">${PANEL_PINS.RGB_G}</field>
                        <field name="PINB">${PANEL_PINS.RGB_B}</field>
                        <value name="R"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                        <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                        <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      </block>
                    </statement>
                    <statement name="ELSE">
                      <block type="actuator_rgb_led">
                        <field name="PINR">${PANEL_PINS.RGB_R}</field>
                        <field name="PING">${PANEL_PINS.RGB_G}</field>
                        <field name="PINB">${PANEL_PINS.RGB_B}</field>
                        <value name="R"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                        <value name="G"><shadow type="math_number"><field name="NUM">255</field></shadow></value>
                        <value name="B"><shadow type="math_number"><field name="NUM">0</field></shadow></value>
                      </block>
                    </statement>
                  </block>
                </statement>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`,
  },
];

// ═══════════════════════════════════════════════════
// Validation des Missions
// Chaque mission a des vérifications automatiques
// pour confirmer que l'élève a corrigé le bon bug.
// ═══════════════════════════════════════════════════
const VALIDATIONS = {

// Mission 1 — Corriger la broche 13 → 5 et allumer la LED rouge
'mission_01': {
  checks: [
    { type: 'includes', value: 'pinMode(5,', msg: 'La broche dans « configurer broche » doit être 5, pas 13.' },
    { type: 'excludes', value: 'pinMode(13,', msg: 'Ne configure pas la broche 13 pour cette mission.' },
    { type: 'regex', value: 'void loop\\(\\)[\\s\\S]*digitalWrite\\(5,\\s*HIGH\\)\\s*;', msg: 'Il faut allumer la DEL rouge (broche 5) dans la boucle.' },
  ],
  successMsg: '🎉 La balise de secours brille de nouveau!',
},

// Mission 2 — Clignotement 1s ON puis 1s OFF (dans l’ordre)
'mission_02': {
  checks: [
    {
      type: 'regex',
      value:
        'void loop\\(\\)\\s*\\{[\\s\\S]*?' +
        'digitalWrite\\(5,\\s*HIGH\\)\\s*;[\\s\\S]*?' +
        'delay\\(1000\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(5,\\s*LOW\\)\\s*;[\\s\\S]*?' +
        'delay\\(1000\\)\\s*;[\\s\\S]*?' +
        '\\}',
      msg: 'Séquence complète requise : ALLUMER → attendre 1000 → ÉTEINDRE → attendre 1000.',
    },
  ],
  successMsg: '🎉 La balise clignote correctement!',
},

// Mission 3 — (remplacée par la version robuste envoyée plus haut)
'mission_03': {
  checks: [
    { type: 'includes', value: 'pinMode(8,', msg: 'La DEL Verte (broche 8) doit être configurée.' },
    { type: 'includes', value: 'pinMode(6,', msg: 'La DEL Jaune (broche 6) doit être configurée.' },
    { type: 'includes', value: 'pinMode(5,', msg: 'La DEL Rouge (broche 5) doit être configurée.' },
    {
      type: 'regex',
      value:
        'void loop\\(\\)\\s*\\{[\\s\\S]*?' +
        'digitalWrite\\(8,\\s*HIGH\\)\\s*;[\\s\\S]*?' +
        'delay\\(3000\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(8,\\s*LOW\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(6,\\s*HIGH\\)\\s*;[\\s\\S]*?' +
        'delay\\(1000\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(6,\\s*LOW\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(5,\\s*HIGH\\)\\s*;[\\s\\S]*?' +
        'delay\\(3000\\)\\s*;[\\s\\S]*?' +
        'digitalWrite\\(5,\\s*LOW\\)\\s*;[\\s\\S]*?' +
        '\\}',
      msg: 'Vert 3s (éteindre) → Jaune 1s (éteindre) → Rouge 3s (éteindre).',
    },
  ],
  successMsg: '🎉 Feux de navigation OK!',
},

// Mission 4 — Bouton 1 (2) contrôle Rouge (5) ET Bouton 2 (4) contrôle Jaune (6)
'mission_04': {
  checks: [
    // On exige le lien lecture bouton → écriture bonne DEL
    { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]{0,250}?digitalWrite\\(5,\\s*(HIGH|LOW)\\)', msg: 'Le bouton 1 (broche 2) doit contrôler la DEL Rouge (broche 5).' },
    { type: 'regex', value: 'digitalRead\\(4\\)[\\s\\S]{0,250}?digitalWrite\\(6,\\s*(HIGH|LOW)\\)', msg: 'Le bouton 2 (broche 4) doit contrôler la DEL Jaune (broche 6).' },
  ],
  successMsg: '🎉 Chaque bouton contrôle la bonne lumière!',
},

// Mission 5 — Buzzer sur 7 + DEL rouge sur 5 (et pas tone sur une DEL)
'mission_05': {
  checks: [
    { type: 'includes', value: 'tone(7,', msg: 'Le buzzer doit être sur la broche 7.' },
    { type: 'excludes', value: 'tone(8,', msg: 'Ne fais pas jouer le buzzer sur la broche 8 (c’est une DEL).' },
    { type: 'regex', value: 'void loop\\(\\)[\\s\\S]*digitalWrite\\(5,\\s*HIGH\\)', msg: 'La DEL rouge (broche 5) doit s’allumer pendant l’alarme.' },
  ],
  successMsg: '🎉 Alarme sonore + lumière rouge : OK!',
},

// Mission 6 — Lire le bouton 1 (2) et exécuter la séquence (vert + bip + vert OFF)
'mission_06': {
  checks: [
    // Lire bouton 1
    { type: 'regex', value: 'digitalRead\\(2\\)', msg: 'Il faut vérifier le bouton 1 (broche 2), pas le bouton 2.' },

    // Et s’assurer que la procédure existe vraiment (vert on -> tone -> vert off)
    {
      type: 'regex',
      value:
        'digitalRead\\(2\\)[\\s\\S]{0,400}?' +
        'digitalWrite\\(8,\\s*HIGH\\)[\\s\\S]{0,400}?' +
        'tone\\(7,\\s*\\d+[\\s\\S]{0,200}?\\)\\s*;?[\\s\\S]{0,400}?' +
        'digitalWrite\\(8,\\s*LOW\\)',
      msg: 'Après appui sur bouton 1 : allumer DEL verte, faire un bip, puis éteindre la DEL verte.',
    },
  ],
  successMsg: '🎉 Procédure de démarrage réussie!',
},


  // Mission 7 — Potentiomètre sur A0 (pas A1)
  'mission_07': {
    checks: [
      { type: 'includes', value: 'analogRead(A0)', msg: 'Le potentiomètre est branché sur A0, pas sur A1.' },
      { type: 'excludes', value: 'analogRead(A1)', msg: 'Enlève la lecture sur A1 — le potentiomètre est sur A0.' },
    ],
    successMsg: '🎉 Le variateur de puissance affiche ses valeurs! Tu peux voir les nombres changer en tournant la molette.',
  },

  // Mission 8 — Ajouter map() pour convertir pot → servo
  'mission_08': {
    checks: [
      { type: 'includes', value: 'map(', msg: 'Il faut utiliser le bloc « convertir » pour transformer 0-1023 en 0-180.' },
      { type: 'includes', value: 'servo_3.write(', msg: 'Le servo doit être sur la broche 3.' },
    ],
    successMsg: '🎉 La trappe d\'aération répond à la molette en douceur! Pilotage automatique activé.',
  },

  // Mission 9 — Ajouter constrain()
  'mission_09': {
    checks: [
      { type: 'includes', value: 'constrain(', msg: 'Il faut utiliser le bloc « contraindre » pour limiter l\'angle entre 30 et 150.' },
    ],
    successMsg: '🎉 Le limiteur de sécurité est en place! Le servo ne dépassera jamais les bornes.',
  },

  // Mission 10 — RGB: Rouge=128, Vert=0, Bleu=0
  'mission_10': {
    checks: [
      { type: 'includes', value: 'analogWrite(9, 128)', msg: 'Le Rouge (broche 9) doit être réglé à 128.' },
      { type: 'includes', value: 'analogWrite(10, 0)', msg: 'Le Vert (broche 10) doit être à 0.' },
      { type: 'includes', value: 'analogWrite(11, 0)', msg: 'Le Bleu (broche 11) doit être à 0.' },
    ],
    successMsg: '🎉 Le feu de position rouge discret est activé! Parfait pour naviguer sans se faire repérer.',
  },

  // Mission 11 — Ajouter map() pour pot → RGB
  'mission_11': {
    checks: [
      { type: 'includes', value: 'map(', msg: 'Il faut convertir la valeur du potentiomètre (0-1023) en intensité (0-255) avec « convertir ».' },
      { type: 'includes', value: 'analogWrite(9,', msg: 'Le Rouge de la DEL RGB (broche 9) doit être utilisé.' },
    ],
    successMsg: '🎉 Le variateur de lumière fonctionne! La luminosité suit la molette en temps réel.',
  },

  // Mission 12 — Bouton 1 → Vert (pin 8), Bouton 2 → Jaune (pin 6) + buzzer
  'mission_12': {
    checks: [
      { type: 'regex', value: 'digitalRead\\(2\\)[\\s\\S]{0,120}?digitalWrite\\(8,', msg: 'Le bouton 1 (broche 2) doit allumer la DEL Verte (broche 8).' },
      { type: 'regex', value: 'digitalRead\\(4\\)[\\s\\S]{0,120}?digitalWrite\\(6,', msg: 'Le bouton 2 (broche 4) doit allumer la DEL Jaune (broche 6).' },
    ],
    successMsg: '🎉 Les deux modes de vol sont opérationnels! Bravo, tu as terminé le Niveau 2!',
  },

  // Mission 13 — Inverser TRIG/ECHO (12,13 pas 13,12)
  'mission_13': {
    checks: [
      { type: 'includes', value: 'readUltrasonic(12, 13)', msg: 'Les broches du radar sont inversées! Envoi = 12, Écoute = 13.' },
    ],
    successMsg: '🎉 Le radar spatial détecte les obstacles! Les distances s\'affichent correctement.',
  },

  // Mission 14 — Seuil 15 cm (pas 5 cm)
  'mission_14': {
    checks: [
      { type: 'regex', value: '<\\s*15\\)', msg: 'Le seuil de danger doit être 15 cm, pas 5 cm.' },
    ],
    successMsg: '🎉 L\'alerte collision fonctionne! Rouge et buzzer quand c\'est trop proche, Vert quand c\'est bon.',
  },

  // Mission 15 — Servo sur broche 3 (pas 6)
  'mission_15': {
    checks: [
      { type: 'includes', value: 'servo_3.write(', msg: 'Le servo doit être sur la broche 3, pas sur une autre broche.' },
      { type: 'excludes', value: 'servo_6.write(', msg: 'La broche 6, c\'est une DEL, pas le servo!' },
    ],
    successMsg: '🎉 Le freinage automatique est actif! Le vaisseau freine tout seul quand un obstacle approche.',
  },

  // Mission 16 — Trois couleurs différentes (pas tout rouge)
  'mission_16': {
    checks: [
      { type: 'regex', value: 'analogWrite\\(10,\\s*255\\)', msg: 'Il faut du Vert (broche 10 à 255) pour l\'état "tout va bien".' },
      { type: 'regex', value: 'analogWrite\\(9,\\s*255\\)[\\s\\S]*analogWrite\\(10,\\s*255\\)[\\s\\S]*analogWrite\\(11,\\s*0\\)', msg: 'Le Jaune se fait avec Rouge 255, Vert 255, Bleu 0.' },
    ],
    successMsg: '🎉 Le statut en couleurs fonctionne! Vert = OK, Jaune = attention, Rouge = danger.',
  },

  // Mission 17 — Boutons inversés : corriger les couleurs
  'mission_17': {
    checks: [
      { type: 'includes', value: 'digitalRead(2)', msg: 'Le bouton 1 (broche 2) doit être vérifié.' },
      { type: 'includes', value: 'digitalRead(4)', msg: 'Le bouton 2 (broche 4) doit être vérifié.' },
      { type: 'regex', value: 'readUltrasonic\\(12,\\s*13\\)', msg: 'Le radar doit utiliser les bonnes broches : envoi 12, écoute 13.' },
    ],
    successMsg: '🎉 La priorité manuelle est en place! L\'équipage peut reprendre le contrôle à tout moment.',
  },

  // Mission 18 — Buzzer pin 7 + seuil 15 cm
  'mission_18': {
    checks: [
      { type: 'includes', value: 'tone(7,', msg: 'Le buzzer doit être sur la broche 7, pas sur une DEL.' },
      { type: 'excludes', value: 'tone(5,', msg: 'La broche 5 c\'est la DEL Rouge, pas le buzzer!' },
      { type: 'regex', value: '<\\s*15\\)', msg: 'Le seuil de danger doit être 15 cm.' },
    ],
    successMsg: '🛰️🎉 MISSION FINALE ACCOMPLIE! Tous les systèmes sont opérationnels. Cap sur Kepler-442b! Tu es officiellement Commandant de L\'Étoile Filante!',
  },
};

// ═══════════════════════════════════════════════════
// Scenario Manager (utilisé par renderer.js)
// ═══════════════════════════════════════════════════
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

  /**
   * Valide le code Arduino généré par rapport aux règles de la mission active.
   * @param {string} code — le code Arduino généré
   * @returns {{ valid: boolean, failures: string[], successMsg: string }}
   */
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

// ═══════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MISSIONS, PANEL_PINS, DIFFICULTY, ScenarioManager };
}
