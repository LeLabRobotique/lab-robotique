const { ipcRenderer } = require('electron');

// With contextIsolation disabled (see main.js), we can attach directly.
window.labApi = {
  // Project management
  saveProject: (data, filePath) => ipcRenderer.invoke('save-project', { data, filePath }),
  loadProject: () => ipcRenderer.invoke('load-project'),
  exportCode: (code) => ipcRenderer.invoke('export-code', code),

  // Arduino
  detectArduino: () => ipcRenderer.invoke('detect-arduino'),
  uploadArduino: (code, port, fqbn) => ipcRenderer.invoke('upload-arduino', { code, port, fqbn }),
  listSerialPorts: () => ipcRenderer.invoke('list-serial-ports'),

  // Serial Monitor
  openSerialMonitor: (port, baudRate) => ipcRenderer.invoke('open-serial-monitor', { port, baudRate }),
  closeSerialMonitor: () => ipcRenderer.invoke('close-serial-monitor'),
  onSerialData: (callback) => ipcRenderer.on('serial-data', (_, data) => callback(data)),
  onSerialError: (callback) => ipcRenderer.on('serial-error', (_, data) => callback(data)),
  onSerialClosed: (callback) => ipcRenderer.on('serial-closed', () => callback()),

  // Unsaved changes guard
  confirmClose: () => ipcRenderer.invoke('confirm-close'),

  // Events from main process
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (_, action) => callback(action)),
  onProjectLoaded: (callback) => ipcRenderer.on('project-loaded', (_, data) => callback(data)),
  onArduinoStatus: (callback) => ipcRenderer.on('arduino-status', (_, status) => callback(status)),
  onUploadProgress: (callback) => ipcRenderer.on('upload-progress', (_, progress) => callback(progress)),
  onToast: (callback) => ipcRenderer.on('toast', (_, msg) => callback(msg)),
  onConfirmBeforeClose: (callback) => ipcRenderer.on('confirm-before-close', (_, data) => callback(data)),
};
