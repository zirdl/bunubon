const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  startServer: () => ipcRenderer.invoke('start-server'),
  stopServer: () => ipcRenderer.invoke('stop-server'),
  getServerStatus: () => ipcRenderer.invoke('get-server-status'),
  getUptime: () => ipcRenderer.invoke('get-uptime'),
  isServerRunning: () => ipcRenderer.invoke('is-server-running'),
  getServerLogs: () => ipcRenderer.invoke('get-server-logs'),
  getErrorLogs: () => ipcRenderer.invoke('get-error-logs'),
  clearActivityLog: () => ipcRenderer.invoke('clear-activity-log'),
  onServerStatus: (callback) => {
    ipcRenderer.on('server-status', (event, data) => callback(data));
  },
  onServerStateChange: (callback) => {
    ipcRenderer.on('server-state-change', (event, isRunning) => callback(isRunning));
  },
  removeServerStatusListener: () => {
    ipcRenderer.removeAllListeners('server-status');
  },
  removeServerStateChangeListener: () => {
    ipcRenderer.removeAllListeners('server-state-change');
  }
});
