/**
 * Le Lab Robotique - Renderer Process
 * Handles: Blockly workspace, real-time code generation, sidebar,
 *          examples, missions/scenarios, OLED blocks, Arduino integration.
 */

// ═══════════════════════════════════════════════════
// Load Modules
// ═══════════════════════════════════════════════════
const Blockly = require('blockly');
require('blockly/blocks');
const Fr = require('blockly/msg/fr');
Blockly.setLocale(Fr);
const { registerBlocks } = require('./blocks/arduino-blocks');
const { registerOledBlocks, registerOledGenerators } = require('./blocks/oled-blocks');
const { ArduinoGenerator } = require('./generators/arduino-generator');
const { MISSIONS, PANEL_PINS, DIFFICULTY, ScenarioManager } = require('./scenarios');
const langData = require('./i18n/fr.json');

// ═══════════════════════════════════════════════════
// State
// ═══════════════════════════════════════════════════
let workspace = null;
let generator = new ArduinoGenerator();
let currentProjectPath = null;
let activeCategoryName = null;
let detectedBoards = [];
let isDirty = false;
let lastSavedXml = '';
const scenarioMgr = new ScenarioManager();

// Translation helper
function t(key) { return langData[key] || key; }

// Code panel toggle (hide/show Arduino code panel)
const CODE_PANEL_STORAGE_KEY = 'lab_show_code_panel';

function setCodePanelVisible(show) {
  document.body.classList.toggle('code-hidden', !show);
  const btn = document.getElementById('codeToggleBtn');
  if (btn) {
    btn.textContent = show ? '🙈 Masquer code' : '👁️ Afficher code';
    btn.classList.toggle('active', show);
  }
  try { localStorage.setItem(CODE_PANEL_STORAGE_KEY, show ? '1' : '0'); } catch (_) {}
  // Blockly needs a resize when layout width changes
  if (workspace) setTimeout(() => Blockly.svgResize(workspace), 60);
}

function initCodePanelToggle() {
  let show = false; // default: hidden (moins de distraction)
  try {
    const saved = localStorage.getItem(CODE_PANEL_STORAGE_KEY);
    if (saved !== null) show = (saved === '1');
  } catch (_) {}
  setCodePanelVisible(show);
}

// ═══════════════════════════════════════════════════
// Category Definitions (order + colors)
// ═══════════════════════════════════════════════════
const CATEGORIES = [
  { id: 'arduino',    key: 'cat_arduino',    colour: '#e8942e' },
  { id: 'digital',    key: 'cat_digital',    colour: '#4caf50' },
  { id: 'analog',     key: 'cat_analog',     colour: '#2196f3' },
  { id: 'variables',  key: 'cat_variables',  colour: '#a55b80', custom: 'VARIABLE' },
  { id: 'math',       key: 'cat_math',       colour: '#5b67a5' },
  { id: 'logic',      key: 'cat_logic',      colour: '#5ba55b' },
  { id: 'loops',      key: 'cat_loops',      colour: '#a5745b' },
  { id: 'functions',  key: 'cat_functions',  colour: '#995ba5', custom: 'PROCEDURE' },
  { id: 'serial',     key: 'cat_serial',     colour: '#e74c3c' },
  { id: 'sensors',    key: 'cat_sensors',    colour: '#00bcd4' },
  { id: 'actuators',  key: 'cat_actuators',  colour: '#ff5722' },
  { id: 'oled',       key: 'cat_oled',       colour: '#607d8b' },
];

// Blocks in each category
const CATEGORY_BLOCKS = {
  arduino: [
    //{ type: 'arduino_setup_loop' },
    { type: 'arduino_delay', values: { TIME: { type: 'math_number', fields: { NUM: 1000 } } } },
    { type: 'arduino_delay_micro', values: { TIME: { type: 'math_number', fields: { NUM: 100 } } } },
    { type: 'arduino_millis' },
    { type: 'arduino_map',
      values: {
        FROMLOW: { type: 'math_number', fields: { NUM: 0 } },
        FROMHIGH: { type: 'math_number', fields: { NUM: 1023 } },
        TOLOW: { type: 'math_number', fields: { NUM: 0 } },
        TOHIGH: { type: 'math_number', fields: { NUM: 255 } },
      }
    },
  ],
  digital: [
    { type: 'digital_write' },
    { type: 'digital_read' },
    { type: 'pin_mode' },
  ],
  analog: [
    { type: 'analog_write', values: { VALUE: { type: 'math_number', fields: { NUM: 128 } } } },
    { type: 'analog_read' },
  ],
  math: [
    { type: 'math_number', fields: { NUM: 0 } },
    { type: 'math_arithmetic' },
    { type: 'math_random_int',
      values: {
        FROM: { type: 'math_number', fields: { NUM: 1 } },
        TO: { type: 'math_number', fields: { NUM: 100 } },
      }
    },
    { type: 'math_constrain',
      values: {
        LOW: { type: 'math_number', fields: { NUM: 0 } },
        HIGH: { type: 'math_number', fields: { NUM: 255 } },
      }
    },
    { type: 'math_modulo' },
  ],
  logic: [
    { type: 'controls_if' },
    { type: 'controls_if', extraState: { hasElse: true } },
    { type: 'logic_compare' },
    { type: 'logic_operation' },
    { type: 'logic_negate' },
    { type: 'logic_boolean' },
  ],
  loops: [
    { type: 'controls_repeat_ext', values: { TIMES: { type: 'math_number', fields: { NUM: 10 } } } },
    { type: 'controls_whileUntil' },
    { type: 'controls_for',
      values: {
        FROM: { type: 'math_number', fields: { NUM: 1 } },
        TO: { type: 'math_number', fields: { NUM: 10 } },
        BY: { type: 'math_number', fields: { NUM: 1 } },
      }
    },
    { type: 'controls_flow_statements' },
  ],
  serial: [
    { type: 'serial_begin', values: { BAUD: { type: 'math_number', fields: { NUM: 9600 } } } },
    { type: 'serial_print' },
    { type: 'serial_println' },
    { type: 'serial_available' },
    { type: 'serial_read' },
  ],
  sensors: [
    { type: 'sensor_ultrasonic' },
    { type: 'sensor_temperature' },
    { type: 'sensor_button' },
    { type: 'sensor_potentiometer' },
    { type: 'sensor_light' },
  ],
  actuators: [
    { type: 'actuator_led' },
    { type: 'actuator_servo', values: { ANGLE: { type: 'math_number', fields: { NUM: 90 } } } },
    { type: 'actuator_buzzer',
      values: {
        FREQ: { type: 'math_number', fields: { NUM: 440 } },
        DUR: { type: 'math_number', fields: { NUM: 500 } },
      }
    },
    { type: 'actuator_motor' },
    { type: 'actuator_rgb_led' },
  ],
  oled: [
    { type: 'oled_init' },
    { type: 'oled_clear' },
    { type: 'oled_display' },
    { type: 'oled_set_cursor' },
    { type: 'oled_set_text_size' },
    { type: 'oled_print' },
    { type: 'oled_println' },
    { type: 'oled_draw_rect' },
    { type: 'oled_draw_circle' },
    { type: 'oled_draw_line' },
    { type: 'oled_draw_pixel' },
  ],
};

// ═══════════════════════════════════════════════════
// Build Toolbox XML (with scenario filtering)
// ═══════════════════════════════════════════════════
function buildToolboxXml() {
  const filteredCategories = scenarioMgr.filterCategories(CATEGORIES);
  let xml = '<xml>';
  for (const cat of filteredCategories) {
    const attrs = `name="${t(cat.key)}" colour="${cat.colour}"${cat.custom ? ` custom="${cat.custom}"` : ''}`;
    xml += `<category ${attrs}>`;
    if (CATEGORY_BLOCKS[cat.id]) {
      const filteredBlocks = scenarioMgr.filterBlocks(cat.id, CATEGORY_BLOCKS[cat.id]);
      for (const bdef of filteredBlocks) {
        xml += blockDefToXml(bdef);
      }
    }
    xml += '</category>';
  }
  xml += '</xml>';
  return xml;
}

function blockDefToXml(bdef) {
  let xml = `<block type="${bdef.type}">`;
  if (bdef.fields) {
    for (const [k, v] of Object.entries(bdef.fields)) {
      xml += `<field name="${k}">${v}</field>`;
    }
  }
  if (bdef.extraState) {
    let mutation = '<mutation';
    if (bdef.extraState.hasElse) mutation += ' else="1"';
    if (bdef.extraState.elseif) mutation += ` elseif="${bdef.extraState.elseif}"`;
    mutation += '></mutation>';
    xml += mutation;
  }
  if (bdef.values) {
    for (const [inputName, shadow] of Object.entries(bdef.values)) {
      xml += `<value name="${inputName}"><shadow type="${shadow.type}">`;
      if (shadow.fields) {
        for (const [k, v] of Object.entries(shadow.fields)) {
          xml += `<field name="${k}">${v}</field>`;
        }
      }
      xml += '</shadow></value>';
    }
  }
  xml += '</block>';
  return xml;
}

// ═══════════════════════════════════════════════════
// Blockly Initialization
// ═══════════════════════════════════════════════════
function initBlockly() {
  // Register custom blocks with i18n
  registerBlocks(Blockly, langData);
  registerOledBlocks(Blockly, langData);

  // Register OLED code generators via plugin API
  registerOledGenerators(generator);

  // Build toolbox
  const toolboxXml = buildToolboxXml();
  const toolboxDom = Blockly.utils.xml.textToDom(toolboxXml);

  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxDom,
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ddd',
      snap: true,
    },
    zoom: {
      controls: true,
      wheel: true,
      startScale: 0.92,
      maxScale: 2.0,
      minScale: 0.25,
      scaleSpeed: 1.1,
    },
    trashcan: true,
    scrollbars: true,
    sounds: false,
    renderer: 'zelos',
    theme: Blockly.Theme.defineTheme('labrobotique', {
      base: Blockly.Themes.Classic,
      fontStyle: {
        family: 'Nunito, sans-serif',
        weight: 'bold',
        size: 11,
      },
      startHats: true,
    }),
  });

  // Add default setup/loop block
  addDefaultBlocks();

  // Real-time code generation + dirty tracking on every change
  workspace.addChangeListener((event) => {
    if (event.isUiEvent && event.type !== Blockly.Events.FINISHED_LOADING) return;
    updateCode();
    // Track unsaved changes
    const currentXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    isDirty = (currentXml !== lastSavedXml);
    updateTitleDirtyIndicator();
  });

  // Build sidebar
  buildSidebar();
}

function addDefaultBlocks() {
  const xml = '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false" movable="true"></block></xml>';
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), workspace);
}

function snapshotCleanState() {
  lastSavedXml = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
  isDirty = false;
  updateTitleDirtyIndicator();
}

function updateTitleDirtyIndicator() {
  const baseTitle = scenarioMgr.isActive()
    ? `🚀 ${scenarioMgr.getActiveMission().title}`
    : 'Le Lab Robotique - Codage Visuel';
  document.title = isDirty ? '● ' + baseTitle : baseTitle;
}

// ═══════════════════════════════════════════════════
// Toolbox Refresh (for scenario filtering)
// ═══════════════════════════════════════════════════
function refreshToolbox() {
  const toolboxXml = buildToolboxXml();
  const toolboxDom = Blockly.utils.xml.textToDom(toolboxXml);
  workspace.updateToolbox(toolboxDom);
  activeCategoryName = null;
  buildSidebar();
}

// ═══════════════════════════════════════════════════
// Real-Time Code Generation
// ═══════════════════════════════════════════════════
function updateCode() {
  if (!workspace) return;
  try {
    const code = generator.generate(workspace);
    const codeEl = document.querySelector('#codeOutput code');
    codeEl.innerHTML = highlightArduinoCode(code);
  } catch (e) {
    console.warn('Code gen error:', e.message);
  }
}

function highlightArduinoCode(code) {
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // ── Placeholder approach: extract strings & comments FIRST ──
  // This prevents regexes from matching inside HTML span attributes.
  const tokens = [];
  function stash(cls, text) {
    const idx = tokens.length;
    tokens.push(`<span class="${cls}">${text}</span>`);
    return `\x00T${idx}\x00`;
  }

  // 1. Extract strings
  html = html.replace(/("(?:[^"\\]|\\.)*")/g, (m) => stash('str', m));
  // 2. Extract single-line comments
  html = html.replace(/(\/\/.*$)/gm, (m) => stash('cm', m));
  // 3. Extract multi-line comments
  html = html.replace(/(\/\*[\s\S]*?\*\/)/g, (m) => stash('cm', m));
  // 4. Extract preprocessor directives
  html = html.replace(/^(#\w+.*$)/gm, (m) => stash('pp', m));

  // 5. Keywords (safe now — no string/comment/pp content to interfere)
  const keywords = ['void', 'int', 'long', 'float', 'double', 'bool', 'char', 'byte', 'unsigned',
    'if', 'else', 'for', 'while', 'do', 'return', 'break', 'continue', 'switch', 'case',
    'true', 'false', 'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP',
    'const', 'static', 'volatile', 'Servo', 'Adafruit_SSD1306'];
  const kwRegex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'g');
  html = html.replace(kwRegex, '<span class="kw">$1</span>');

  // 6. Functions
  const functions = ['setup', 'loop', 'pinMode', 'digitalWrite', 'digitalRead',
    'analogWrite', 'analogRead', 'delay', 'delayMicroseconds', 'millis', 'micros',
    'Serial\\.begin', 'Serial\\.print', 'Serial\\.println', 'Serial\\.available', 'Serial\\.read',
    'tone', 'noTone', 'pulseIn', 'map', 'constrain', 'random', 'randomSeed',
    'pow', 'sqrt', 'abs', 'min', 'max', 'attach', 'write', 'read',
    'display\\.begin', 'display\\.clearDisplay', 'display\\.display',
    'display\\.setCursor', 'display\\.setTextSize', 'display\\.setTextColor',
    'display\\.print', 'display\\.println',
    'display\\.drawRect', 'display\\.fillRect',
    'display\\.drawCircle', 'display\\.fillCircle',
    'display\\.drawLine', 'display\\.drawPixel'];
  const fnRegex = new RegExp('\\b(' + functions.join('|') + ')(?=\\s*\\()', 'g');
  html = html.replace(fnRegex, '<span class="fn">$1</span>');

  // 7. Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');

  // 8. Re-insert all stashed tokens
  html = html.replace(/\x00T(\d+)\x00/g, (_, idx) => tokens[Number(idx)]);

  return html;
}

// ═══════════════════════════════════════════════════
// Sidebar
// ═══════════════════════════════════════════════════
function buildSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.innerHTML = '';
  const filteredCategories = scenarioMgr.filterCategories(CATEGORIES);

  for (const cat of filteredCategories) {
    const el = document.createElement('div');
    el.className = 'sidebar-cat' + (activeCategoryName === cat.id ? ' active' : '');
    el.innerHTML = `<span class="dot" style="background:${cat.colour}"></span>${t(cat.key)}`;
    el.addEventListener('click', () => toggleCategory(cat, filteredCategories));
    sidebar.appendChild(el);
  }
}

function toggleCategory(cat, filteredCats) {
  const cats = filteredCats || scenarioMgr.filterCategories(CATEGORIES);
  if (activeCategoryName === cat.id) {
    activeCategoryName = null;
    workspace.getToolbox().clearSelection();
  } else {
    activeCategoryName = cat.id;
    const toolbox = workspace.getToolbox();
    const items = toolbox.getToolboxItems();
    const catIndex = cats.findIndex(c => c.id === cat.id);
    if (catIndex >= 0 && items[catIndex]) {
      toolbox.setSelectedItem(items[catIndex]);
    }
  }
  buildSidebar();
}

// ═══════════════════════════════════════════════════
// Mission System
// ═══════════════════════════════════════════════════
function showMissionsModal() {
  const list = document.getElementById('missionsList');
  list.innerHTML = '';
  const missions = scenarioMgr.getMissions();

  // Group by difficulty
  const groups = {};
  missions.forEach(m => {
    const key = m.difficulty.label;
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  });

  for (const [label, groupMissions] of Object.entries(groups)) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'mission-group';
    groupDiv.innerHTML = `<h3 class="mission-group-title">${label}</h3>`;
    list.appendChild(groupDiv);

    for (const mission of groupMissions) {
      const card = document.createElement('div');
      card.className = 'mission-card';
      card.innerHTML = `
        <div class="mission-card-icon">${mission.icon}</div>
        <div class="mission-card-content">
          <h4>${mission.title}</h4>
          <p>${mission.objective}</p>
        </div>
        <div class="mission-card-stars">${'⭐'.repeat(mission.difficulty.stars)}</div>
      `;
      card.addEventListener('click', () => startMission(mission.id));
      list.appendChild(card);
    }
  }

  document.getElementById('missionsModal').classList.add('show');
}

function closeMissionsModal() {
  document.getElementById('missionsModal').classList.remove('show');
}

function startMission(id) {
  const mission = scenarioMgr.startMission(id);
  if (!mission) return;
  closeMissionsModal();

  // Refresh toolbox with filtered categories
  refreshToolbox();

  // Clear workspace and load mission starting code
  workspace.clear();
  if (mission.startXml) {
    try {
      Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(mission.startXml), workspace);
    } catch (e) {
      console.warn('Error loading mission XML:', e);
      addDefaultBlocks();
    }
  } else {
    addDefaultBlocks();
  }

  updateCode();
  snapshotCleanState();
  showBriefingPanel(mission);
  showToast(`🚀 ${mission.title} — C'est parti!`);
}

function showBriefingPanel(mission) {
  const panel = document.getElementById('briefingPanel');
  if (!panel) return;
  document.getElementById('briefingTitle').textContent = `${mission.icon} ${mission.title}`;
  document.getElementById('briefingText').textContent = mission.briefing;
  document.getElementById('briefingObjective').textContent = mission.objective;
  document.getElementById('hintCounter').textContent = `0 / ${scenarioMgr.getHintCount()}`;
  document.getElementById('hintContent').classList.remove('show');
  document.getElementById('hintContent').textContent = '';
  // Clear previous validation result
  const validateResult = document.getElementById('validateResult');
  if (validateResult) {
    validateResult.className = 'validate-result';
    validateResult.innerHTML = '';
  }
  _displayedHintIndex = -1;
  panel.classList.remove('peek');
  panel.classList.add('show');
  updateBriefingToggleIcon();
  updateNextMissionBtnState();
}

function hideBriefingPanel() {
  const panel = document.getElementById('briefingPanel');
  if (panel) {
    panel.classList.remove('show');
    panel.classList.remove('peek');
  }
  updateBriefingToggleIcon();
  updateNextMissionBtnState();
}

function updateNextMissionBtnState() {
  const btn = document.getElementById('nextMissionBtn');
  if (!btn) return;

  if (!scenarioMgr || !scenarioMgr.isActive()) {
    btn.style.display = 'none';
    btn.disabled = true;
    return;
  }

  btn.style.display = 'inline-flex';
  const missions = scenarioMgr.getMissions();
  const current = scenarioMgr.getActiveMission();
  const idx = missions.findIndex(m => m.id === (current && current.id));
  const hasNext = (idx >= 0) && (idx < missions.length - 1);
  btn.disabled = !hasNext;
  btn.title = hasNext ? 'Mission suivante' : 'Dernière mission';
}

function updateBriefingToggleIcon() {
  const panel = document.getElementById('briefingPanel');
  const btn = document.getElementById('briefingToggle');
  if (!panel || !btn) return;

  // Keep the "Next mission" button in sync with mission state
  updateNextMissionBtnState();

  // If no mission is active, keep the panel fully hidden (no handle)
  if (!scenarioMgr || !scenarioMgr.isActive()) {
    btn.style.display = 'none';
    return;
  }
  btn.style.display = 'block';

  const expanded = panel.classList.contains('show');
  // Right-side panel: arrow points RIGHT when expanded (to hide), LEFT when collapsed (to show)
  btn.textContent = expanded ? '▶' : '◀';
}

function toggleBriefingPanel() {
  const panel = document.getElementById('briefingPanel');
  if (!panel) return;
  if (!scenarioMgr || !scenarioMgr.isActive()) return;

  if (panel.classList.contains('show')) {
    panel.classList.remove('show');
    panel.classList.add('peek');
  } else {
    panel.classList.add('show');
    panel.classList.remove('peek');
  }
  updateBriefingToggleIcon();
}

// ── Hint navigation state ──
let _displayedHintIndex = -1;  // which hint is currently shown (-1 = none)

function requestNextHint() {
  const mission = scenarioMgr.getActiveMission();
  if (!mission) return;
  const hints = mission.hints || [];
  const revealed = scenarioMgr.getUsedHints();

  // If we're viewing an older hint, just move forward in revealed hints
  if (_displayedHintIndex < revealed - 1) {
    _displayedHintIndex++;
    _showHintAtIndex(_displayedHintIndex, hints);
    return;
  }

  // Otherwise, reveal the next hint
  const hint = scenarioMgr.getNextHint();
  if (hint) {
    _displayedHintIndex = scenarioMgr.getUsedHints() - 1;
    _showHintAtIndex(_displayedHintIndex, hints);
    showToast(`Indice ${scenarioMgr.getUsedHints()} / ${hints.length}`);
  } else {
    showToast('Tu as vu tous les indices!', true);
  }
}

function requestPreviousHint() {
  const mission = scenarioMgr.getActiveMission();
  if (!mission) return;
  const hints = mission.hints || [];
  if (_displayedHintIndex > 0) {
    _displayedHintIndex--;
    _showHintAtIndex(_displayedHintIndex, hints);
  }
}

function showAllHints() {
  const mission = scenarioMgr.getActiveMission();
  if (!mission) return;
  const hints = mission.hints || [];
  const revealed = scenarioMgr.getUsedHints();

  if (revealed === 0) {
    showToast('Clique d\'abord sur Indice pour en debloquer!', true);
    return;
  }

  const hintEl = document.getElementById('hintContent');
  let html = '<div class="all-hints"><strong>Tous les indices :</strong><ol>';
  for (let i = 0; i < revealed; i++) {
    html += `<li>${hints[i]}</li>`;
  }
  html += '</ol></div>';
  hintEl.innerHTML = html;
  hintEl.classList.add('show');
  _displayedHintIndex = revealed - 1;
  _updateHintNav();
}

function _showHintAtIndex(index, hints) {
  const hintEl = document.getElementById('hintContent');
  hintEl.innerHTML = `<strong>Indice ${index + 1} :</strong> ${hints[index]}`;
  hintEl.classList.add('show');
  document.getElementById('hintCounter').textContent =
    `${index + 1} / ${scenarioMgr.getHintCount()}`;
  _updateHintNav();
}

function _updateHintNav() {
  const revealed = scenarioMgr.getUsedHints();
  const prevBtn = document.getElementById('hintPrevBtn');
  const nextBtn = document.getElementById('hintNextBtn');
  if (prevBtn) prevBtn.disabled = (_displayedHintIndex <= 0);
  if (nextBtn) nextBtn.disabled = false;
}

// Keep old name as alias for backwards compat
function requestHint() { requestNextHint(); }

function exitMission() {
  if (!confirm('Quitter la mission et revenir au mode libre?')) return;
  scenarioMgr.exitMission();
  hideBriefingPanel();
  refreshToolbox();
  workspace.clear();
  addDefaultBlocks();
  updateCode();
  snapshotCleanState();
  showToast('Mode libre activé');
}

function nextMission() {
  if (!scenarioMgr || !scenarioMgr.isActive()) return;

  const missions = scenarioMgr.getMissions();
  const current = scenarioMgr.getActiveMission();
  const idx = missions.findIndex(m => m.id === (current && current.id));
  if (idx < 0) {
    showToast('Impossible de trouver la mission courante', true);
    return;
  }
  if (idx >= missions.length - 1) {
    showToast('Tu es déjà à la dernière mission!', true);
    return;
  }

  // Start next mission (reuses the exact same flow as selecting from the modal)
  startMission(missions[idx + 1].id);
  updateNextMissionBtnState();
}

// ═══════════════════════════════════════════════════
// Mission Validation
// ═══════════════════════════════════════════════════

function validateMission() {
  if (!scenarioMgr || !scenarioMgr.isActive()) {
    showToast('Aucune mission active!', true);
    return;
  }

  // Get the current generated code
  const code = generator.generate(workspace);
  const result = scenarioMgr.validateCode(code);
  const resultEl = document.getElementById('validateResult');

  if (result.valid) {
    // Hide the inline result
    resultEl.className = 'validate-result';
    resultEl.innerHTML = '';

    // Show success overlay
    showSuccessOverlay(result.successMsg);
  } else {
    // Show failures inline
    resultEl.className = 'validate-result show fail';
    let html = '<strong>🔍 Pas tout à fait :</strong><ul>';
    result.failures.forEach(f => {
      html += `<li>${f}</li>`;
    });
    html += '</ul>';
    resultEl.innerHTML = html;

    // Shake the validate button
    const btn = document.getElementById('validateBtn');
    btn.classList.add('shake');
    setTimeout(() => btn.classList.remove('shake'), 500);
  }
}

function showSuccessOverlay(message) {
  const overlay = document.getElementById('successOverlay');
  const msgEl = document.getElementById('successMessage');
  const starsEl = document.getElementById('successStars');
  const titleEl = document.getElementById('successTitle');

  // Get mission info for title
  const mission = scenarioMgr.getActiveMission();
  titleEl.textContent = mission ? `${mission.icon} ${mission.title}` : 'Mission Accomplie!';
  msgEl.textContent = message;

  // Create particle stars
  starsEl.innerHTML = '';
  const emojis = ['⭐', '🌟', '✨', '💫', '🎉', '🚀', '🎊'];
  for (let i = 0; i < 30; i++) {
    const span = document.createElement('span');
    span.className = 'success-particle';
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = Math.random() * 100 + '%';
    span.style.animationDelay = (Math.random() * 1.5) + 's';
    span.style.animationDuration = (2 + Math.random() * 2) + 's';
    starsEl.appendChild(span);
  }

  // Check if there's a next mission
  const missions = scenarioMgr.getMissions();
  const idx = missions.findIndex(m => m.id === mission.id);
  const hasNext = idx >= 0 && idx < missions.length - 1;
  const nextBtn = document.getElementById('successNextBtn');
  nextBtn.style.display = hasNext ? 'inline-flex' : 'none';

  overlay.classList.add('show');

  // Play a little "ding" feedback via Web Audio (optional, no-op if unavailable)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.15;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 1318;
      gain2.gain.value = 0.15;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    }, 200);
  } catch (e) { /* Audio not available, that's fine */ }
}

function closeSuccessOverlay() {
  const overlay = document.getElementById('successOverlay');
  overlay.classList.remove('show');
}

function successAndNextMission() {
  closeSuccessOverlay();
  nextMission();
}

// ═══════════════════════════════════════════════════
// Examples
// ═══════════════════════════════════════════════════
const EXAMPLES = [
  {
    title: t('ex_blink_title'),
    desc: t('ex_blink_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="actuator_led"><field name="PIN">13</field><field name="STATE">HIGH</field><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="actuator_led"><field name="PIN">13</field><field name="STATE">LOW</field><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></statement></block></xml>'
  },
  {
    title: t('ex_buzzer_title'),
    desc: t('ex_buzzer_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="pin_mode"><field name="PIN">8</field><field name="MODE">OUTPUT</field></block></statement><statement name="LOOP"><block type="actuator_buzzer"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">262</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value><next><block type="actuator_buzzer"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">330</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">600</field></shadow></value><next><block type="actuator_buzzer"><field name="PIN">8</field><value name="FREQ"><shadow type="math_number"><field name="NUM">392</field></shadow></value><value name="DUR"><shadow type="math_number"><field name="NUM">500</field></shadow></value><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
  },
  {
    title: t('ex_button_title'),
    desc: t('ex_button_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="pin_mode"><field name="PIN">13</field><field name="MODE">OUTPUT</field><next><block type="pin_mode"><field name="PIN">2</field><field name="MODE">INPUT_PULLUP</field></block></next></block></statement><statement name="LOOP"><block type="controls_if"><value name="IF0"><block type="sensor_button"><field name="PIN">2</field></block></value><statement name="DO0"><block type="actuator_led"><field name="PIN">13</field><field name="STATE">HIGH</field></block></statement></block></statement></block></xml>'
  },
  {
    title: t('ex_serial_title'),
    desc: t('ex_serial_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="serial_begin"><value name="BAUD"><shadow type="math_number"><field name="NUM">9600</field></shadow></value></block></statement><statement name="LOOP"><block type="serial_println"><value name="TEXT"><block type="sensor_potentiometer"><field name="PIN">A0</field></block></value><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">250</field></shadow></value></block></next></block></statement></block></xml>'
  },
  {
    title: t('ex_rgb_title'),
    desc: t('ex_rgb_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="pin_mode"><field name="PIN">9</field><field name="MODE">OUTPUT</field><next><block type="pin_mode"><field name="PIN">10</field><field name="MODE">OUTPUT</field><next><block type="pin_mode"><field name="PIN">11</field><field name="MODE">OUTPUT</field></block></next></block></next></block></statement><statement name="LOOP"><block type="actuator_rgb_led"><field name="PINR">9</field><field name="R">255</field><field name="PING">10</field><field name="G">0</field><field name="PINB">11</field><field name="B">0</field><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="actuator_rgb_led"><field name="PINR">9</field><field name="R">0</field><field name="PING">10</field><field name="G">255</field><field name="PINB">11</field><field name="B">0</field><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value><next><block type="actuator_rgb_led"><field name="PINR">9</field><field name="R">0</field><field name="PING">10</field><field name="G">0</field><field name="PINB">11</field><field name="B">255</field><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">1000</field></shadow></value></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block></xml>'
  },
  {
    title: t('ex_ultrasonic_title'),
    desc: t('ex_ultrasonic_desc'),
    xml: '<xml><block type="arduino_setup_loop" x="30" y="30" deletable="false"><statement name="SETUP"><block type="serial_begin"><value name="BAUD"><shadow type="math_number"><field name="NUM">9600</field></shadow></value></block></statement><statement name="LOOP"><block type="serial_println"><value name="TEXT"><block type="sensor_ultrasonic"><field name="TRIG">7</field><field name="ECHO">6</field></block></value><next><block type="arduino_delay"><value name="TIME"><shadow type="math_number"><field name="NUM">500</field></shadow></value></block></next></block></statement></block></xml>'
  },
];

// ═══════════════════════════════════════════════════
// App Actions
// ═══════════════════════════════════════════════════
const labApp = {};

labApp.showExamples = function() {
  const list = document.getElementById('examplesList');
  list.innerHTML = '';
  EXAMPLES.forEach((ex, idx) => {
    const card = document.createElement('div');
    card.className = 'example-card';
    card.innerHTML = `<h3>${ex.title}</h3><p>${ex.desc}</p>`;
    card.addEventListener('click', () => labApp.loadExample(idx));
    list.appendChild(card);
  });
  document.getElementById('examplesModal').classList.add('show');
};

labApp.closeExamples = function() {
  document.getElementById('examplesModal').classList.remove('show');
};

labApp.loadExample = function(idx) {
  const ex = EXAMPLES[idx];
  workspace.clear();
  Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(ex.xml), workspace);
  updateCode();
  labApp.closeExamples();
  snapshotCleanState();
  showToast(t('toast_example_loaded'));
};

labApp.newProject = function() {
  if (!confirm(t('confirm_new'))) return;
  scenarioMgr.exitMission();
  hideBriefingPanel();
  refreshToolbox();
  workspace.clear();
  currentProjectPath = null;
  addDefaultBlocks();
  updateCode();
  snapshotCleanState();
  showToast(t('toast_new_project'));
};

labApp.saveProject = async function(forceDialog = false) {
  const xml = Blockly.Xml.workspaceToDom(workspace);
  const data = {
    version: '2.0',
    app: 'Le Lab Robotique',
    timestamp: new Date().toISOString(),
    blocks: Blockly.Xml.domToText(xml),
    mission: scenarioMgr.isActive() ? scenarioMgr.getActiveMission().id : null,
  };

  const savePath = forceDialog ? null : currentProjectPath;
  const result = await window.labApi.saveProject(data, savePath);

  if (result.success) {
    currentProjectPath = result.filePath;
    snapshotCleanState();
    showToast(t('toast_saved'));
  }
};

labApp.loadProjectDialog = async function() {
  await window.labApi.loadProject();
};

labApp.toggleCodePanel = function() {
  const hidden = document.body.classList.contains('code-hidden');
  setCodePanelVisible(hidden);
};

labApp.copyCode = function() {
  const code = document.querySelector('#codeOutput code').textContent;
  navigator.clipboard.writeText(code).then(() => {
    showToast(t('toast_copied'));
  });
};

labApp.exportCode = async function() {
  const code = document.querySelector('#codeOutput code').textContent;
  const result = await window.labApi.exportCode(code);
  if (result.success) {
    showToast(t('toast_exported'));
  }
};

labApp.detectArduino = async function() {
  showToast(t('toast_detecting'));
  const result = await window.labApi.detectArduino();
  const select = document.getElementById('serialSelect');

  if (result.success && result.boards && result.boards.length > 0) {
    detectedBoards = result.boards;
    select.innerHTML = '';
    for (const board of result.boards) {
      const opt = document.createElement('option');
      opt.value = board.port;
      opt.dataset.fqbn = board.fqbn;
      opt.textContent = `${board.boardName}`;
      select.appendChild(opt);
    }
    showToast(t('toast_arduino_found'));
  } else if (result.error === 'no_ports') {
    select.innerHTML = `<option value="">${t('no_arduino')}</option>`;
    showToast(t('toast_no_arduino'), true);
  }
};

labApp.uploadToArduino = async function() {
  const select = document.getElementById('serialSelect');
  const selectedOpt = select.selectedOptions[0];
  if (!selectedOpt || !selectedOpt.value) {
    showToast(t('toast_no_arduino'), true);
    return;
  }
  const port = selectedOpt.value;
  const fqbn = selectedOpt.dataset.fqbn || 'arduino:avr:uno';
  const code = document.querySelector('#codeOutput code').textContent;

  showToast(t('toast_compiling'));
  const result = await window.labApi.uploadArduino(code, port, fqbn);

  if (result.success) {
    showToast(t('toast_upload_ok'));
  } else {
    showToast(`${t('toast_upload_fail')}: ${result.error}`, true);
  }
};

// Mission functions
labApp.showMissions = showMissionsModal;
labApp.closeMissions = closeMissionsModal;
labApp.startMission = startMission;

// ── Serial Monitor ──
let serialConnected = false;

labApp.toggleSerialPanel = function() {
  const output = document.getElementById('serialOutput');
  if (output.style.display === 'none' || output.style.display === '') {
    output.style.display = 'block';
  } else {
    output.style.display = 'none';
  }
};

labApp.toggleSerialConnection = async function() {
  if (serialConnected) {
    await window.labApi.closeSerialMonitor();
    serialConnected = false;
    const btn = document.getElementById('serialConnectBtn');
    btn.textContent = 'Connecter';
    btn.classList.remove('connected');
    showToast('Moniteur série déconnecté');
    return;
  }

  // Find port
  const select = document.getElementById('serialSelect');
  const port = select.value;
  if (!port) {
    showToast('Aucun Arduino détecté. Détectez un Arduino d\'abord!', true);
    return;
  }

  const baud = document.getElementById('serialBaud').value;
  const result = await window.labApi.openSerialMonitor(port, parseInt(baud));

  if (result.success) {
    serialConnected = true;
    const btn = document.getElementById('serialConnectBtn');
    btn.textContent = 'Déconnecter';
    btn.classList.add('connected');
    // Show the output area
    document.getElementById('serialOutput').style.display = 'block';
    showToast('Moniteur série connecté');
  } else {
    showToast('Erreur: ' + (result.error || 'connexion impossible'), true);
  }
};

labApp.clearSerialOutput = function() {
  document.getElementById('serialOutput').textContent = '';
};

// Listen for incoming serial data
if (window.labApi && window.labApi.onSerialData) {
  window.labApi.onSerialData((data) => {
    const output = document.getElementById('serialOutput');
    if (!output) return;
    output.style.display = 'block';
    // Limit buffer size (keep last ~500 lines)
    const maxLen = 20000;
    if (output.textContent.length > maxLen) {
      output.textContent = output.textContent.slice(-maxLen / 2);
    }
    output.textContent += data;
    output.scrollTop = output.scrollHeight;
  });

  window.labApi.onSerialClosed(() => {
    serialConnected = false;
    const btn = document.getElementById('serialConnectBtn');
    if (btn) {
      btn.textContent = 'Connecter';
      btn.classList.remove('connected');
    }
  });
}
labApp.requestHint = requestHint;
labApp.requestNextHint = requestNextHint;
labApp.requestPreviousHint = requestPreviousHint;
labApp.showAllHints = showAllHints;
labApp.exitMission = exitMission;
labApp.nextMission = nextMission;
labApp.validateMission = validateMission;
labApp.closeSuccess = closeSuccessOverlay;
labApp.successAndNext = successAndNextMission;

// Make available globally for onclick handlers
window.labApp = labApp;

// Briefing panel handle (collapse/expand in mission mode)
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('briefingToggle');
  if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); toggleBriefingPanel(); });
  updateBriefingToggleIcon();
});

// ═══════════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════════
let toastTimer = null;

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// ═══════════════════════════════════════════════════
// IPC Event Listeners (from main process)
// ═══════════════════════════════════════════════════
if (window.labApi) {
  window.labApi.onMenuAction((action) => {
    switch (action) {
      case 'new': labApp.newProject(); break;
      case 'save': labApp.saveProject(); break;
      case 'save-as': labApp.saveProject(true); break;
      case 'upload': labApp.uploadToArduino(); break;
      case 'undo': workspace && workspace.undo(false); break;
      case 'redo': workspace && workspace.undo(true); break;
    }
  });

  window.labApi.onProjectLoaded((data) => {
    try {
      // If project had an active mission, restore it
      if (data.mission) {
        const mission = scenarioMgr.startMission(data.mission);
        if (mission) {
          refreshToolbox();
          showBriefingPanel(mission);
        }
      } else {
        scenarioMgr.exitMission();
        hideBriefingPanel();
        refreshToolbox();
      }

      workspace.clear();
      const xml = Blockly.utils.xml.textToDom(data.blocks);
      Blockly.Xml.domToWorkspace(xml, workspace);
      updateCode();
      snapshotCleanState();
      showToast(t('toast_loaded'));
    } catch (e) {
      showToast('Erreur: ' + e.message, true);
    }
  });

  window.labApi.onArduinoStatus((status) => {
    if (!status.success && status.error) {
      showToast(status.error, true);
    }
  });

  window.labApi.onUploadProgress((progress) => {
    showToast(progress.message);
  });

  window.labApi.onToast((msg) => {
    showToast(msg);
  });

  // Unsaved changes guard
  window.labApi.onConfirmBeforeClose(() => {
    if (!isDirty) {
      window.labApi.confirmClose();
      return;
    }
    if (confirm(t('confirm_close'))) {
      window.labApi.confirmClose();
    }
  });
}

// ═══════════════════════════════════════════════════
// Window events
// ═══════════════════════════════════════════════════
window.addEventListener('resize', () => {
  if (workspace) Blockly.svgResize(workspace);
});

// Close modals on overlay click
document.getElementById('examplesModal').addEventListener('click', function(e) {
  if (e.target === this) labApp.closeExamples();
});
document.getElementById('missionsModal').addEventListener('click', function(e) {
  if (e.target === this) labApp.closeMissions();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    labApp.closeExamples();
    labApp.closeMissions();
    closeSuccessOverlay();
  }
});

// ═══════════════════════════════════════════════════
// Init on DOM ready
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initBlockly();
  initCodePanelToggle();
  updateCode();
  snapshotCleanState();
});

