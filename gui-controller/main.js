const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

// Keep a global reference of the window object
let mainWindow;
let tray = null;
let serverProcess = null;
let isServerRunning = false;
let serverStartTime = null;
let serverOutputBuffer = [];
let errorOutputBuffer = [];

// Server configuration - Updated for bundled app
const APP_ROOT = app.isPackaged
  ? path.join(process.resourcesPath, '..')
  : path.join(__dirname, '..');
const SERVER_DIR = path.join(APP_ROOT, 'backend');
const SERVER_SCRIPT = path.join(SERVER_DIR, 'server.js');
const LOGS_DIR = path.join(APP_ROOT, 'logs');
const PORT = process.env.PORT || 5000;

// Get the Node.js executable path from Electron
const getNodePath = () => {
  if (app.isPackaged) {
    // In production, use Electron's bundled Node.js
    return process.execPath;
  }
  // In development, use system Node.js
  return 'node';
};

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Check if running in production (packed app)
const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 650,
    resizable: false,
    maximizable: false,
    minimizable: true,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Bunubon LTS Controller',
    backgroundColor: '#065f46'
  });

  mainWindow.loadFile('index.html');

  // Don't open DevTools in production
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle minimize to tray
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
    if (process.platform === 'win32') {
      mainWindow.setSkipTaskbar(true);
    }
  });
}

function createTray() {
  // Create tray icon (using a simple colored icon)
  const iconPath = path.join(__dirname, 'icon.png');
  let trayIcon;
  
  if (fs.existsSync(iconPath)) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    // Create a simple colored icon
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  
  updateTrayMenu();
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isServerRunning ? 'Server Running' : 'Server Stopped',
      enabled: false
    },
    { type: 'separator' },
    {
      label: isServerRunning ? 'Stop Server' : 'Start Server',
      click: () => {
        if (isServerRunning) {
          stopServer();
        } else {
          startServer();
        }
      }
    },
    {
      label: 'Show Controller',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          if (process.platform === 'win32') {
            mainWindow.setSkipTaskbar(false);
          }
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        stopServer();
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip(isServerRunning ? 'Bunubon LTS - Server Running' : 'Bunubon LTS - Server Stopped');
  tray.setContextMenu(contextMenu);
}

function checkServerStatus() {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}`, (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer() {
  if (isServerRunning) {
    sendStatusToWindow('Server is already running', 'warning');
    return;
  }

  try {
    // Create log file for this session
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFile = path.join(LOGS_DIR, `server-${timestamp}.log`);
    const errorLogFile = path.join(LOGS_DIR, `error-${timestamp}.log`);

    // Clear buffers
    serverOutputBuffer = [];
    errorOutputBuffer = [];

    // Get the correct Node.js path
    const nodePath = getNodePath();

    // Start the Node.js server using Electron's bundled Node.js in production
    serverProcess = spawn(nodePath, [SERVER_SCRIPT], {
      cwd: SERVER_DIR,
      env: { ...process.env, NODE_ENV: 'production' },
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[Server] ${output}`);
      
      // Store in buffer (keep last 500 lines)
      serverOutputBuffer.push({ time: new Date().toLocaleTimeString('en-US', { hour12: false }), message: output.trim() });
      if (serverOutputBuffer.length > 500) serverOutputBuffer.shift();
      
      // Write to log file
      fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${output}`);

      // Check for successful start message
      if (output.includes('Server running')) {
        isServerRunning = true;
        serverStartTime = new Date();
        sendStatusToWindow('Server started successfully', 'success');
        updateTrayMenu();
        sendServerStatusToWindow(true);

        // Show notification
        new Notification({
          title: 'Server Started',
          body: `Bunubon LTS is now running on port ${PORT}`
        }).show();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      console.error(`[Server Error] ${error}`);
      
      // Store in buffer (keep last 500 lines)
      errorOutputBuffer.push({ time: new Date().toLocaleTimeString('en-US', { hour12: false }), message: error.trim() });
      if (errorOutputBuffer.length > 500) errorOutputBuffer.shift();
      
      // Write to error log file
      fs.appendFileSync(errorLogFile, `[${new Date().toISOString()}] ${error}`);
      
      sendStatusToWindow(error, 'error');
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
      isServerRunning = false;
      serverStartTime = null;
      updateTrayMenu();
      sendServerStatusToWindow(false);

      if (code !== 0 && code !== null) {
        sendStatusToWindow(`Server exited with code ${code}`, 'error');
      }
    });

    sendStatusToWindow('Starting server...', 'info');
    updateTrayMenu();

  } catch (error) {
    console.error('Failed to start server:', error);
    sendStatusToWindow(`Failed to start server: ${error.message}`, 'error');
    isServerRunning = false;
    updateTrayMenu();
  }
}

function stopServer() {
  if (!isServerRunning || !serverProcess) {
    sendStatusToWindow('Server is not running', 'warning');
    isServerRunning = false;
    updateTrayMenu();
    sendServerStatusToWindow(false);
    return;
  }

  try {
    sendStatusToWindow('Stopping server...', 'info');
    
    // Gracefully shutdown
    serverProcess.kill('SIGTERM');
    
    // Force kill after timeout if still running
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        serverProcess.kill('SIGKILL');
      }
    }, 5000);
    
    isServerRunning = false;
    serverStartTime = null;
    updateTrayMenu();
    sendServerStatusToWindow(false);
    
    // Show notification
    new Notification({
      title: 'Server Stopped',
      body: 'Bunubon LTS has been stopped'
    }).show();
    
  } catch (error) {
    console.error('Failed to stop server:', error);
    sendStatusToWindow(`Error stopping server: ${error.message}`, 'error');
  }
}

function getServerUptime() {
  if (!isServerRunning || !serverStartTime) {
    return 'Not running';
  }
  
  const now = new Date();
  const diff = now - serverStartTime;
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function sendStatusToWindow(message, type) {
  if (mainWindow) {
    mainWindow.webContents.send('server-status', { message, type });
  }
}

function sendServerStatusToWindow(running) {
  if (mainWindow) {
    mainWindow.webContents.send('server-state-change', running);
  }
}

// IPC Handlers
ipcMain.handle('start-server', async () => {
  startServer();
  return { success: true };
});

ipcMain.handle('stop-server', async () => {
  stopServer();
  return { success: true };
});

ipcMain.handle('get-server-status', async () => {
  const isRunning = await checkServerStatus();
  return {
    isRunning,
    uptime: getServerUptime(),
    port: PORT
  };
});

ipcMain.handle('get-uptime', async () => {
  return getServerUptime();
});

ipcMain.handle('is-server-running', async () => {
  return isServerRunning;
});

ipcMain.handle('get-server-logs', async () => {
  // Return buffered logs
  return serverOutputBuffer;
});

ipcMain.handle('get-error-logs', async () => {
  // Return buffered error logs
  return errorOutputBuffer;
});

ipcMain.handle('clear-activity-log', async () => {
  // Clear is handled in renderer
  return { success: true };
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  // Auto-start server on app launch (optional)
  // startServer();
  
  // Check server status periodically
  setInterval(async () => {
    const actuallyRunning = await checkServerStatus();
    if (actuallyRunning !== isServerRunning) {
      isServerRunning = actuallyRunning;
      updateTrayMenu();
      sendServerStatusToWindow(isServerRunning);
    }
  }, 5000);
});

app.on('window-all-closed', () => {
  // Don't quit on Windows - keep running in tray
  if (process.platform !== 'darwin') {
    // Keep the app running
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Cleanup on quit
app.on('will-quit', () => {
  stopServer();
  if (tray) {
    tray.destroy();
  }
});

// Handle Ctrl+C and other termination signals
process.on('SIGINT', () => {
  stopServer();
  app.quit();
});

process.on('SIGTERM', () => {
  stopServer();
  app.quit();
});
