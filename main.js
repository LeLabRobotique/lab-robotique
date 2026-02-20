const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execSync, spawn } = require('child_process');

// ─────────────────────────────────────────────
// Cross-platform helpers
// ─────────────────────────────────────────────
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';
const isMac = process.platform === 'darwin';
const homedir = os.homedir();
const PATH_SEP = isWindows ? ';' : ':';

// ─────────────────────────────────────────────
// GPU stability flags (mainly for Linux)
// ─────────────────────────────────────────────
if (isLinux) {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
  app.commandLine.appendSwitch('no-sandbox');
}

let mainWindow;

// ─────────────────────────────────────────────
// i18n loader (main process side for menus)
// ─────────────────────────────────────────────
function loadI18n() {
  try {
    const langFile = path.join(__dirname, 'i18n', 'fr.json');
    return JSON.parse(fs.readFileSync(langFile, 'utf-8'));
  } catch {
    return {};
  }
}

// ─────────────────────────────────────────────
// Window Creation
// ─────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 1000,
    minHeight: 600,
    title: 'Le Lab Robotique - Codage Visuel',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    },
    backgroundColor: '#111c33',
    show: false,
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => mainWindow.show());

  // Unsaved changes guard: ask renderer before closing
  mainWindow.on('close', (e) => {
    if (mainWindow._forceClose) return;
    e.preventDefault();
    mainWindow.webContents.send('confirm-before-close');
  });

  const menu = Menu.buildFromTemplate(buildMenu());
  Menu.setApplicationMenu(menu);
}

function buildMenu() {
  const lang = loadI18n();
  return [
    {
      label: lang.menu_file || 'Fichier',
      submenu: [
        { label: lang.menu_new || 'Nouveau Projet', accelerator: 'CmdOrCtrl+N', click: () => mainWindow.webContents.send('menu-action', 'new') },
        { label: lang.menu_open || 'Ouvrir Projet', accelerator: 'CmdOrCtrl+O', click: () => handleLoadProject() },
        { label: lang.menu_save || 'Sauvegarder Projet', accelerator: 'CmdOrCtrl+S', click: () => mainWindow.webContents.send('menu-action', 'save') },
        { label: lang.menu_save_as || 'Sauvegarder sous...', accelerator: 'CmdOrCtrl+Shift+S', click: () => mainWindow.webContents.send('menu-action', 'save-as') },
        { type: 'separator' },
        { label: lang.menu_quit || 'Quitter', accelerator: 'CmdOrCtrl+Q', role: 'quit' }
      ]
    },
    {
      label: lang.menu_edit || 'Édition',
      submenu: [
        { label: lang.menu_undo || 'Annuler', accelerator: 'CmdOrCtrl+Z', click: () => mainWindow.webContents.send('menu-action', 'undo') },
        { label: lang.menu_redo || 'Rétablir', accelerator: 'CmdOrCtrl+Y', click: () => mainWindow.webContents.send('menu-action', 'redo') },
      ]
    },
    {
      label: lang.menu_arduino || 'Arduino',
      submenu: [
        { label: lang.menu_detect || 'Détecter Arduino', click: () => handleDetectArduino() },
        { label: lang.menu_upload || 'Téléverser', accelerator: 'CmdOrCtrl+U', click: () => mainWindow.webContents.send('menu-action', 'upload') },
        { type: 'separator' },
        { label: lang.menu_install_cli || 'Installer arduino-cli', click: () => handleInstallArduinoCli() },
      ]
    },
    {
      label: lang.menu_help || 'Aide',
      submenu: [
        { label: lang.menu_about || 'À propos', click: () => showAbout() },
        { type: 'separator' },
        { label: 'DevTools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() },
      ]
    }
  ];
}

// ─────────────────────────────────────────────
// Arduino CLI: bundled + system fallback
// Cross-platform version
// ─────────────────────────────────────────────

const CLI_BINARY = isWindows ? 'arduino-cli.exe' : 'arduino-cli';

// Ensure PATH includes common locations
(function ensureExtraPath() {
  let extraPaths;

  if (isWindows) {
    extraPaths = [
      path.join(homedir, 'AppData', 'Local', 'Arduino CLI'),
      path.join(homedir, 'AppData', 'Local', 'Programs', 'arduino-cli'),
      path.join(app.getPath('userData'), 'arduino-cli'),
      'C:\\Program Files\\Arduino CLI',
    ];
  } else {
    extraPaths = [
      path.join(homedir, '.local', 'bin'),
      path.join(homedir, 'bin'),
      '/usr/local/bin',
      '/usr/bin',
      '/snap/bin',
    ];
  }

  const currentPath = process.env.PATH || '';
  const missing = extraPaths.filter(p => !currentPath.includes(p));
  if (missing.length > 0) {
    process.env.PATH = missing.join(PATH_SEP) + PATH_SEP + currentPath;
  }
})();

function existsExecutable(p) {
  try {
    if (!fs.existsSync(p)) return false;
    if (isWindows) return true; // Windows doesn't use executable bits
    return !!(fs.statSync(p).mode & 0o111);
  } catch {
    return false;
  }
}

/**
 * Returns { cli, cfg, cwd, source } or null
 * Checks for bundled arduino-cli in resources (dev + packaged)
 */
function getBundledArduinoCli() {
  // Dev
  const devCli = path.join(__dirname, 'resources', 'arduino', CLI_BINARY);
  const devCfg = path.join(__dirname, 'resources', 'arduino-cli.yaml');
  if (existsExecutable(devCli) && fs.existsSync(devCfg)) {
    return { cli: devCli, cfg: devCfg, cwd: path.join(__dirname, 'resources'), source: 'bundled-dev' };
  }

  // Packaged
  if (process.resourcesPath) {
    const cli = path.join(process.resourcesPath, 'arduino', CLI_BINARY);
    const cfg = path.join(process.resourcesPath, 'arduino-cli.yaml');
    if (existsExecutable(cli) && fs.existsSync(cfg)) {
      return { cli, cfg, cwd: process.resourcesPath, source: 'bundled' };
    }
  }

  return null;
}

function findSystemArduinoCli() {
  let candidates;

  if (isWindows) {
    candidates = [
      path.join(homedir, 'AppData', 'Local', 'Arduino CLI', CLI_BINARY),
      path.join(homedir, 'AppData', 'Local', 'Programs', 'arduino-cli', CLI_BINARY),
      path.join(app.getPath('userData'), 'arduino-cli', CLI_BINARY),
      'C:\\Program Files\\Arduino CLI\\arduino-cli.exe',
      'arduino-cli', // On PATH
    ];
  } else {
    candidates = [
      path.join(homedir, '.local', 'bin', CLI_BINARY),
      '/usr/local/bin/arduino-cli',
      '/usr/bin/arduino-cli',
      path.join(homedir, 'bin', CLI_BINARY),
      'arduino-cli',
    ];
  }

  for (const cmd of candidates) {
    try {
      if (path.isAbsolute(cmd) && !fs.existsSync(cmd)) continue;
      execSync(`"${cmd}" version`, { stdio: 'pipe', env: process.env, windowsHide: true });
      return cmd;
    } catch { /* next */ }
  }
  return null;
}

/**
 * Resolve CLI to use.
 * Returns { cli, cfg, cwd, source } where cfg/cwd may be null for system.
 */
function resolveArduinoCli() {
  const bundled = getBundledArduinoCli();
  if (bundled) return bundled;

  const sys = findSystemArduinoCli();
  if (sys) return { cli: sys, cfg: null, cwd: null, source: 'system' };

  return null;
}

/**
 * Spawn arduino-cli with optional --config-file and cwd.
 */
function spawnArduinoCli(cliInfo, args, opts = {}) {
  const finalArgs = [...args];
  if (cliInfo.cfg) {
    finalArgs.push('--config-file', cliInfo.cfg);
  }

  return spawn(cliInfo.cli, finalArgs, {
    cwd: cliInfo.cwd || opts.cwd || process.cwd(),
    env: process.env,
    windowsHide: true,
    ...opts,
  });
}

// ─────────────────────────────────────────────
// Serial Port Detection — Cross-platform
// ─────────────────────────────────────────────

/**
 * List available serial ports.
 * Uses arduino-cli if available, falls back to OS-specific methods.
 */
async function listSerialPortsNative() {
  // Method 1: Try arduino-cli board list (works everywhere)
  const cliInfo = resolveArduinoCli();
  if (cliInfo) {
    try {
      const child = spawnArduinoCli(cliInfo, ['board', 'list', '--format', 'json'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      const out = await collectStdout(child, 10000);
      const boards = JSON.parse(out || '[]');
      const detectedPorts = boards.detected_ports || boards || [];
      const ports = [];
      for (const b of detectedPorts) {
        const portAddr = b.port?.address || b.address || '';
        const protocol = b.port?.protocol || '';
        if (portAddr && (protocol === 'serial' || protocol === '')) {
          ports.push({
            path: portAddr,
            manufacturer: b.matching_boards?.[0]?.name || 'Unknown'
          });
        }
      }
      if (ports.length > 0) return ports;
    } catch { /* fall through */ }
  }

  // Method 2: OS-specific fallback
  if (isWindows) {
    return listSerialPortsWindows();
  } else {
    return listSerialPortsLinux();
  }
}

function listSerialPortsLinux() {
  try {
    const devs = fs.readdirSync('/dev').filter(d =>
      d.startsWith('ttyACM') || d.startsWith('ttyUSB') || d.startsWith('ttyAMA')
    );
    return devs.map(d => ({ path: '/dev/' + d, manufacturer: 'Unknown' }));
  } catch {
    return [];
  }
}

function listSerialPortsWindows() {
  try {
    // Use PowerShell to list COM ports
    const psCmd = `powershell -NoProfile -Command "Get-CimInstance -ClassName Win32_SerialPort | Select-Object DeviceID,Caption | ConvertTo-Json"`;
    const out = execSync(psCmd, { stdio: 'pipe', windowsHide: true, timeout: 5000 }).toString('utf-8').trim();

    if (!out) {
      // Fallback: check registry for COM ports
      return listSerialPortsWindowsRegistry();
    }

    const parsed = JSON.parse(out);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    return items
      .filter(p => p.DeviceID)
      .map(p => ({
        path: p.DeviceID,
        manufacturer: p.Caption || 'Unknown'
      }));
  } catch {
    return listSerialPortsWindowsRegistry();
  }
}

function listSerialPortsWindowsRegistry() {
  try {
    // Alternative: use mode command or check PnP devices
    const psCmd = `powershell -NoProfile -Command "[System.IO.Ports.SerialPort]::GetPortNames() | ConvertTo-Json"`;
    const out = execSync(psCmd, { stdio: 'pipe', windowsHide: true, timeout: 5000 }).toString('utf-8').trim();

    if (!out) return [];
    const parsed = JSON.parse(out);
    const ports = Array.isArray(parsed) ? parsed : [parsed];
    return ports.map(p => ({ path: p, manufacturer: 'Unknown' }));
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Serial Monitor — Cross-platform
// Uses 'serialport' npm package on Windows,
// falls back to stty+cat on Linux
// ─────────────────────────────────────────────
let serialMonitorProcess = null;
let serialPortInstance = null; // For serialport npm package

/**
 * Try to load the 'serialport' package.
 * Returns null if not installed (Linux can fall back to stty+cat).
 */
function tryLoadSerialPort() {
  try {
    return require('serialport');
  } catch {
    return null;
  }
}

async function openSerialMonitorCrossplatform(port, baudRate) {
  // Close existing
  await closeSerialMonitorCrossplatform();

  const SerialPortLib = tryLoadSerialPort();

  if (SerialPortLib) {
    // ──── Use serialport npm package (works everywhere) ────
    try {
      const { SerialPort } = SerialPortLib;
      serialPortInstance = new SerialPort({
        path: port,
        baudRate: parseInt(baudRate),
        autoOpen: false,
      });

      return new Promise((resolve) => {
        serialPortInstance.open((err) => {
          if (err) {
            serialPortInstance = null;
            resolve({ success: false, error: `Impossible d'ouvrir ${port}: ${err.message}` });
            return;
          }

          serialPortInstance.on('data', (data) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('serial-data', data.toString('utf-8'));
            }
          });

          serialPortInstance.on('error', (err) => {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('serial-error', err.message);
            }
          });

          serialPortInstance.on('close', () => {
            serialPortInstance = null;
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('serial-closed');
            }
          });

          resolve({ success: true });
        });
      });
    } catch (e) {
      return { success: false, error: e.message };
    }

  } else if (!isWindows) {
    // ──── Linux fallback: stty + cat ────
    try {
      execSync(`stty -F ${port} ${baudRate} raw -echo -hupcl`, { timeout: 3000 });
    } catch (e) {
      return { success: false, error: `Impossible de configurer ${port}: ${e.message}` };
    }

    serialMonitorProcess = spawn('cat', [port], { stdio: ['ignore', 'pipe', 'pipe'] });

    serialMonitorProcess.stdout.on('data', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial-data', data.toString('utf-8'));
      }
    });

    serialMonitorProcess.stderr.on('data', (data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial-error', data.toString('utf-8'));
      }
    });

    serialMonitorProcess.on('close', () => {
      serialMonitorProcess = null;
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial-closed');
      }
    });

    return { success: true };

  } else {
    // Windows without serialport package
    return {
      success: false,
      error: 'Le package "serialport" est requis sur Windows. Exécutez: npm install serialport'
    };
  }
}

async function closeSerialMonitorCrossplatform() {
  // Close serialport instance
  if (serialPortInstance) {
    try {
      if (serialPortInstance.isOpen) {
        serialPortInstance.close();
      }
    } catch { /* ignore */ }
    serialPortInstance = null;
  }

  // Close stty+cat process
  if (serialMonitorProcess) {
    try {
      serialMonitorProcess.kill();
    } catch { /* ignore */ }
    serialMonitorProcess = null;
  }
}

// ─────────────────────────────────────────────
// IPC Handlers
// ─────────────────────────────────────────────

// Confirm close (unsaved changes guard)
ipcMain.handle('confirm-close', async () => {
  if (mainWindow) {
    mainWindow._forceClose = true;
    mainWindow.close();
  }
});

// Save Project
ipcMain.handle('save-project', async (event, { data, filePath }) => {
  try {
    let savePath = filePath;
    if (!savePath) {
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Sauvegarder le projet',
        defaultPath: `projet-lab-robotique.lrp`,
        filters: [
          { name: 'Projets Lab Robotique', extensions: ['lrp'] },
          { name: 'JSON', extensions: ['json'] },
        ]
      });
      if (result.canceled) return { success: false, canceled: true };
      savePath = result.filePath;
    }
    fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true, filePath: savePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Load Project
ipcMain.handle('load-project', async () => {
  return handleLoadProject();
});

async function handleLoadProject() {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Charger un projet',
      filters: [{ name: 'Projets Lab Robotique', extensions: ['lrp', 'json'] }],
      properties: ['openFile']
    });
    if (result.canceled) return { success: false, canceled: true };
    const content = fs.readFileSync(result.filePaths[0], 'utf-8');
    const data = JSON.parse(content);
    mainWindow.webContents.send('project-loaded', data);
    return { success: true, data, filePath: result.filePaths[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Detect Arduino
ipcMain.handle('detect-arduino', async () => handleDetectArduino());

async function handleDetectArduino() {
  const cliInfo = resolveArduinoCli();

  const KNOWN_BOARDS = [
    { name: 'Arduino Nano (ancien bootloader)', fqbn: 'arduino:avr:nano:cpu=atmega328old' },
    { name: 'Arduino Nano (nouveau bootloader)', fqbn: 'arduino:avr:nano:cpu=atmega328' },
    { name: 'Arduino Uno', fqbn: 'arduino:avr:uno' },
    { name: 'Arduino Mega 2560', fqbn: 'arduino:avr:mega:cpu=atmega2560' },
    { name: 'Arduino Leonardo', fqbn: 'arduino:avr:leonardo' },
    { name: 'Arduino Micro', fqbn: 'arduino:avr:micro' },
  ];

  // ──── Cross-platform port scanning ────
  let ports = [];
  const nativePorts = await listSerialPortsNative();
  ports = nativePorts.map(p => p.path);

  // Best: arduino-cli board list (for auto-detection with FQBN)
  let autoDetected = [];
  if (cliInfo) {
    try {
      const child = spawnArduinoCli(cliInfo, ['board', 'list', '--format', 'json'], {
        stdio: ['ignore', 'pipe', 'pipe']
      });
      const out = await collectStdout(child, 10000);
      const boards = JSON.parse(out || '[]');
      const detectedPorts = boards.detected_ports || boards || [];
      for (const b of detectedPorts) {
        const portAddr = b.port?.address || b.address || '';
        if (portAddr && !ports.includes(portAddr)) ports.push(portAddr);

        if (b.matching_boards && b.matching_boards.length > 0) {
          autoDetected.push({
            port: portAddr,
            boardName: b.matching_boards[0]?.name || 'Arduino',
            fqbn: b.matching_boards[0]?.fqbn || '',
          });
        }
      }
    } catch {
      // ignore
    }
  }

  if (ports.length === 0) {
    const result = { success: false, boards: [], knownBoards: KNOWN_BOARDS, error: 'no_ports' };
    mainWindow.webContents.send('arduino-status', result);
    return result;
  }

  const resultBoards = [];
  for (const port of ports) {
    const auto = autoDetected.find(a => a.port === port);
    if (auto) {
      resultBoards.push(auto);
      if (auto.fqbn === 'arduino:avr:nano:cpu=atmega328') {
        resultBoards.push({
          port,
          boardName: 'Arduino Nano (ancien bootloader)',
          fqbn: 'arduino:avr:nano:cpu=atmega328old',
        });
      }
    } else {
      for (const kb of KNOWN_BOARDS) {
        resultBoards.push({
          port,
          boardName: `${kb.name} (${port})`,
          fqbn: kb.fqbn,
        });
      }
    }
  }

  const result = { success: true, boards: resultBoards, knownBoards: KNOWN_BOARDS };
  mainWindow.webContents.send('arduino-status', result);
  return result;
}

// Upload to Arduino
ipcMain.handle('upload-arduino', async (event, { code, port, fqbn }) => {
  const cliInfo = resolveArduinoCli();
  if (!cliInfo) {
    return { success: false, error: 'arduino-cli introuvable. (Bundle manquant et arduino-cli système absent)' };
  }

  const tmpDir = path.join(app.getPath('temp'), 'lab-robotique-sketch');
  const sketchDir = path.join(tmpDir, 'sketch');

  try {
    fs.mkdirSync(sketchDir, { recursive: true });
    fs.writeFileSync(path.join(sketchDir, 'sketch.ino'), code, 'utf-8');
  } catch (e) {
    return { success: false, error: 'Impossible de créer le sketch temporaire: ' + e.message };
  }

  mainWindow.webContents.send('upload-progress', { stage: 'compile', message: 'Compilation en cours...' });

  const doCompileAndUpload = (useFqbn) => new Promise((resolve) => {
    // compile
    const compileArgs = ['compile', '--fqbn', useFqbn, sketchDir];
    const compileProc = spawnArduinoCli(cliInfo, compileArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

    let cOut = '';
    let cErr = '';
    compileProc.stdout.on('data', d => cOut += d.toString('utf-8'));
    compileProc.stderr.on('data', d => cErr += d.toString('utf-8'));

    const compileTimeout = setTimeout(() => {
      try { compileProc.kill('SIGKILL'); } catch {}
      resolve({ success: false, stage: 'compile', error: 'Compilation timeout' });
    }, 120000);

    compileProc.on('close', (code) => {
      clearTimeout(compileTimeout);
      if (code !== 0) {
        resolve({ success: false, stage: 'compile', error: (cErr || cOut || `Erreur compilation (code ${code})`) });
        return;
      }

      mainWindow.webContents.send('upload-progress', { stage: 'upload', message: 'Téléversement en cours...' });

      // upload
      const uploadArgs = ['upload', '-p', port, '--fqbn', useFqbn, sketchDir];
      const uploadProc = spawnArduinoCli(cliInfo, uploadArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

      let uOut = '';
      let uErr = '';
      uploadProc.stdout.on('data', d => uOut += d.toString('utf-8'));
      uploadProc.stderr.on('data', d => uErr += d.toString('utf-8'));

      const uploadTimeout = setTimeout(() => {
        try { uploadProc.kill('SIGKILL'); } catch {}
        resolve({ success: false, stage: 'upload', error: 'Téléversement timeout', fqbn: useFqbn });
      }, 60000);

      uploadProc.on('close', (ucode) => {
        clearTimeout(uploadTimeout);
        if (ucode !== 0) {
          resolve({ success: false, stage: 'upload', error: (uErr || uOut || `Erreur upload (code ${ucode})`), fqbn: useFqbn });
          return;
        }
        resolve({ success: true, message: 'Téléversement réussi!', fqbn: useFqbn });
      });
    });
  });

  let result = await doCompileAndUpload(fqbn);

  // Nano bootloader retry
  if (!result.success && result.stage === 'upload' && (fqbn || '').includes('arduino:avr:nano')) {
    const altFqbn = fqbn.includes('atmega328old')
      ? 'arduino:avr:nano:cpu=atmega328'
      : 'arduino:avr:nano:cpu=atmega328old';
    const altName = altFqbn.includes('old') ? 'ancien' : 'nouveau';
    mainWindow.webContents.send('upload-progress', {
      stage: 'retry',
      message: `Échec... Essai avec le ${altName} bootloader...`
    });
    result = await doCompileAndUpload(altFqbn);
  }

  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  return result;
});

// ─────────────────────────────────────────────
// Install arduino-cli — Cross-platform
// ─────────────────────────────────────────────
async function handleInstallArduinoCli() {
  const bundled = getBundledArduinoCli();
  if (bundled) {
    await dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'arduino-cli déjà inclus',
      message: 'arduino-cli est déjà inclus dans cette application (bundle).',
      detail: 'Aucune installation système n\'est nécessaire.'
    });
    return;
  }

  const confirm = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Installer', 'Annuler'],
    title: 'Installer arduino-cli',
    message: 'Voulez-vous installer arduino-cli sur ce système?\nCela nécessite une connexion internet.',
  });
  if (confirm.response !== 0) return;

  mainWindow.webContents.send('toast', 'Installation de arduino-cli en cours...');

  if (isWindows) {
    await installArduinoCliWindows();
  } else {
    await installArduinoCliLinux();
  }
}

async function installArduinoCliLinux() {
  const installDir = path.join(homedir, '.local', 'bin');
  const cmd = `mkdir -p "${installDir}" && curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR="${installDir}" sh`;

  try {
    execSync(cmd, { timeout: 120000, stdio: 'pipe' });
    const sysCli = path.join(installDir, 'arduino-cli');
    mainWindow.webContents.send('toast', 'arduino-cli installé avec succès!');

    await installArduinoLibraries(sysCli);
  } catch (e) {
    mainWindow.webContents.send('toast', 'Erreur d\'installation: ' + (e.message || 'inconnue'));
  }
}

async function installArduinoCliWindows() {
  const installDir = path.join(homedir, 'AppData', 'Local', 'Arduino CLI');

  try {
    fs.mkdirSync(installDir, { recursive: true });

    // Download latest release for Windows
    const zipUrl = 'https://downloads.arduino.cc/arduino-cli/nightly/arduino-cli_nightly-latest_Windows_64bit.zip';
    const zipPath = path.join(app.getPath('temp'), 'arduino-cli.zip');

    mainWindow.webContents.send('toast', 'Téléchargement de arduino-cli...');

    // Use PowerShell to download
    execSync(
      `powershell -NoProfile -Command "Invoke-WebRequest -Uri '${zipUrl}' -OutFile '${zipPath}'"`,
      { timeout: 120000, stdio: 'pipe', windowsHide: true }
    );

    mainWindow.webContents.send('toast', 'Extraction de arduino-cli...');

    // Extract
    execSync(
      `powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${installDir}' -Force"`,
      { timeout: 30000, stdio: 'pipe', windowsHide: true }
    );

    // Clean up zip
    try { fs.unlinkSync(zipPath); } catch {}

    const sysCli = path.join(installDir, 'arduino-cli.exe');

    if (!fs.existsSync(sysCli)) {
      mainWindow.webContents.send('toast', 'Erreur: arduino-cli.exe non trouvé après extraction.');
      return;
    }

    mainWindow.webContents.send('toast', 'arduino-cli installé! Installation des composants...');

    await installArduinoLibraries(sysCli);

  } catch (e) {
    mainWindow.webContents.send('toast', 'Erreur d\'installation: ' + (e.message || 'inconnue'));
  }
}

/**
 * Install Arduino AVR core and required libraries.
 * Called after arduino-cli is installed (both platforms).
 */
async function installArduinoLibraries(cliPath) {
  try {
    // Install AVR core
    mainWindow.webContents.send('toast', 'Installation du core Arduino AVR...');
    execSync(`"${cliPath}" core install arduino:avr`, {
      timeout: 300000, stdio: 'pipe', windowsHide: true
    });
    mainWindow.webContents.send('toast', 'Core AVR installé!');
  } catch {
    mainWindow.webContents.send('toast', 'Installation du core AVR échouée.');
  }

  try {
    // Install Servo library (bundled with AVR core, but ensure it's there)
    mainWindow.webContents.send('toast', 'Installation de la librairie Servo...');
    execSync(`"${cliPath}" lib install "Servo"`, {
      timeout: 60000, stdio: 'pipe', windowsHide: true
    });
  } catch { /* Servo is usually included with AVR core */ }

  try {
    // Install Adafruit SSD1306 (OLED)
    mainWindow.webContents.send('toast', 'Installation de Adafruit SSD1306 (OLED)...');
    execSync(`"${cliPath}" lib install "Adafruit SSD1306"`, {
      timeout: 60000, stdio: 'pipe', windowsHide: true
    });
  } catch {
    mainWindow.webContents.send('toast', 'Installation Adafruit SSD1306 échouée.');
  }

  try {
    // Install Adafruit GFX Library
    mainWindow.webContents.send('toast', 'Installation de Adafruit GFX Library...');
    execSync(`"${cliPath}" lib install "Adafruit GFX Library"`, {
      timeout: 60000, stdio: 'pipe', windowsHide: true
    });
  } catch {
    mainWindow.webContents.send('toast', 'Installation Adafruit GFX échouée.');
  }

  mainWindow.webContents.send('toast', '✅ Installation complète! arduino-cli + librairies prêts.');
}

// ─────────────────────────────────────────────
// Serial Port listing (IPC)
// ─────────────────────────────────────────────
ipcMain.handle('list-serial-ports', async () => {
  try {
    const ports = await listSerialPortsNative();
    return { success: true, ports };
  } catch (e) {
    return { success: false, ports: [], error: e.message };
  }
});

// ─────────────────────────────────────────────
// Serial Monitor (IPC)
// ─────────────────────────────────────────────
ipcMain.handle('open-serial-monitor', async (event, { port, baudRate }) => {
  return openSerialMonitorCrossplatform(port, baudRate);
});

ipcMain.handle('close-serial-monitor', async () => {
  await closeSerialMonitorCrossplatform();
  return { success: true };
});

app.on('before-quit', () => {
  closeSerialMonitorCrossplatform();
});

// ─────────────────────────────────────────────
// About dialog
// ─────────────────────────────────────────────
function showAbout() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'À propos',
    message: 'Le Lab Robotique - Codage Visuel',
    detail: `Version 2.0.0\n\nLogiciel de programmation visuelle Arduino\npour les jeunes programmeurs.\n\nPlateforme: ${process.platform}\n\n© Le Lab Robotique`,
  });
}

// Export Arduino code
ipcMain.handle('export-code', async (event, code) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Exporter le code Arduino',
    defaultPath: 'sketch.ino',
    filters: [{ name: 'Arduino Sketch', extensions: ['ino'] }]
  });
  if (result.canceled) return { success: false };
  fs.writeFileSync(result.filePath, code, 'utf-8');
  return { success: true, filePath: result.filePath };
});

// Helper: collect stdout with timeout
function collectStdout(child, timeoutMs) {
  return new Promise((resolve, reject) => {
    let out = '';
    let err = '';

    const t = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch {}
      reject(new Error('timeout'));
    }, timeoutMs);

    child.stdout && child.stdout.on('data', d => out += d.toString('utf-8'));
    child.stderr && child.stderr.on('data', d => err += d.toString('utf-8'));

    child.on('close', (code) => {
      clearTimeout(t);
      if (code !== 0 && !out) {
        resolve(err || '');
      } else {
        resolve(out);
      }
    });
  });
}

// ─────────────────────────────────────────────
// First-run setup: auto-install libraries if bundled CLI found
// ─────────────────────────────────────────────
async function firstRunSetup() {
  const markerFile = path.join(app.getPath('userData'), '.libs-installed');

  if (fs.existsSync(markerFile)) return; // Already done

  const cliInfo = resolveArduinoCli();
  if (!cliInfo) return; // No CLI available

  try {
    console.log('[First Run] Installing Arduino core and libraries...');

    // Install AVR core
    execSync(`"${cliInfo.cli}" core install arduino:avr${cliInfo.cfg ? ` --config-file "${cliInfo.cfg}"` : ''}`, {
      timeout: 300000, stdio: 'pipe', windowsHide: true,
      cwd: cliInfo.cwd || process.cwd(),
    });

    // Install OLED libraries
    execSync(`"${cliInfo.cli}" lib install "Adafruit SSD1306"${cliInfo.cfg ? ` --config-file "${cliInfo.cfg}"` : ''}`, {
      timeout: 60000, stdio: 'pipe', windowsHide: true,
      cwd: cliInfo.cwd || process.cwd(),
    });

    execSync(`"${cliInfo.cli}" lib install "Adafruit GFX Library"${cliInfo.cfg ? ` --config-file "${cliInfo.cfg}"` : ''}`, {
      timeout: 60000, stdio: 'pipe', windowsHide: true,
      cwd: cliInfo.cwd || process.cwd(),
    });

    // Mark as done
    fs.writeFileSync(markerFile, new Date().toISOString(), 'utf-8');
    console.log('[First Run] Libraries installed successfully.');

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('toast', '✅ Librairies Arduino installées automatiquement!');
    }
  } catch (e) {
    console.error('[First Run] Library installation failed:', e.message);
  }
}

// ─────────────────────────────────────────────
// App Lifecycle
// ─────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();

  // Run first-time library setup after window is ready
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => firstRunSetup(), 2000);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
