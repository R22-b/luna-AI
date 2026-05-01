// ============================================
// 🌙 LUNA AI — Electron Main Process
// Built by Ravikiran | Bengaluru | 2026
// ============================================

const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

let mainWindow = null;
let tray = null;
const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://localhost:5173';

// ── Single Instance Lock ──────────────────────
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

// ── Create Main Window ────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: false,             // Custom titlebar
    transparent: false,
    backgroundColor: '#000000',
    show: false,              // Show when ready
    icon: path.join(__dirname, 'assets', 'luna-icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Show window when content is ready (no white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load content
  if (isDev) {
    loadDevServer();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  // Close → minimize to tray (not quit)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  // Window controls via IPC
  const { ipcMain } = require('electron');
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.hide());
  ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false);
}

// ── Dev Server Loading with Retry ─────────────
async function loadDevServer(retries = 20) {
  for (let i = 0; i < retries; i++) {
    try {
      await mainWindow.loadURL(VITE_DEV_URL);
      console.log('🌙 Luna dev server connected');
      return;
    } catch (err) {
      if (i === retries - 1) {
        console.error('❌ Failed to connect to Vite dev server');
        return;
      }
      console.log(`⏳ Waiting for Vite... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// ── System Tray ───────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'luna-icon.ico');
  
  // Create a simple default icon if the file doesn't exist
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Luna AI');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Luna',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Chat',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send('navigate', '/chat');
      },
    },
    {
      label: 'Project Guardian',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send('navigate', '/guardian');
      },
    },
    { type: 'separator' },
    {
      label: 'Quit Luna',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // Double-click: show/hide window
  tray.on('double-click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
}

// ── App Lifecycle ─────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();

  // Initialize backend
  const ipcBridge = require('./backend/ipc-bridge');
  ipcBridge.registerAllHandlers();

  // Start AI health checks (non-blocking)
  const brain = require('./backend/brain-manager');
  brain.startHealthChecks();

  // Start proactive engine
  try {
    const proactive = require('./backend/proactive-engine');
    proactive.startProactiveEngine('baddy', mainWindow);
  } catch (err) { console.log('⚡ Proactive engine skipped:', err.message); }

  // Load plugins
  try {
    const plugins = require('./backend/plugin-manager');
    plugins.loadAllPlugins();
  } catch (err) { console.log('🔌 Plugin manager skipped:', err.message); }

  // Clean old conversations (>30 days)
  try {
    const memory = require('./backend/memory');
    memory.clearOldConversations(30);
  } catch {}

  // Inject theme CSS variables into renderer
  try {
    const fs = require('fs');
    const themePath = path.join(__dirname, 'theme', 'theme.json');
    if (fs.existsSync(themePath)) {
      const theme = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
      mainWindow.webContents.on('did-finish-load', () => {
        const css = `:root {
          --luna-primary: ${theme.colors?.primary || '#7c3aed'};
          --luna-bg: ${theme.colors?.bg || '#000000'};
          --luna-surface: ${theme.colors?.surface || '#07070f'};
          --luna-border: ${theme.colors?.border || '#1a1a2e'};
          --luna-accent: ${theme.colors?.accent || '#1e8fa0'};
          --luna-text-primary: ${theme.colors?.textPrimary || '#c4c4d4'};
          --luna-text-muted: ${theme.colors?.textMuted || '#4a4a6a'};
          --luna-radius: ${theme.radius || '12px'};
          --luna-font-size: ${theme.fonts?.size || '13px'};
        }`;
        mainWindow.webContents.insertCSS(css);
      });
    }
  } catch {}

  console.log('🌙 Luna AI is starting...');
  console.log(`📂 Mode: ${isDev ? 'Development' : 'Production'}`);
});

app.on('window-all-closed', () => {
  // On Windows, don't quit when all windows closed (tray keeps running)
  // App only quits via tray menu
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  } else {
    mainWindow?.show();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// ── Global Error Handler ──────────────────────
process.on('uncaughtException', (err) => {
  const fs = require('fs');
  const logPath = path.join(require('os').homedir(), 'Desktop', 'Luna_Workspace', 'luna-errors.log');
  const entry = `[${new Date().toISOString()}] ${err.stack || err.message}\n`;
  try { fs.appendFileSync(logPath, entry); } catch {}
  console.error('❌ Uncaught:', err.message);
});

process.on('unhandledRejection', (reason) => {
  const fs = require('fs');
  const logPath = path.join(require('os').homedir(), 'Desktop', 'Luna_Workspace', 'luna-errors.log');
  const entry = `[${new Date().toISOString()}] REJECTION: ${reason?.stack || reason}\n`;
  try { fs.appendFileSync(logPath, entry); } catch {}
  console.error('❌ Unhandled rejection:', reason);
});
