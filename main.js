// ============================================
// 🌙 LUNA AI — Electron Main Process
// Built by Ravikiran | Bengaluru | 2026
// ============================================

const { app, BrowserWindow, Tray, Menu, nativeImage, globalShortcut } = require('electron');
const path = require('path');

// Disable hardware acceleration to fix potential black screen issues on some Windows systems
app.disableHardwareAcceleration();

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

let mainWindow = null;
let tray = null;
const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://127.0.0.1:5173';

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

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`❌ Electron failed to load: ${errorDescription} (${errorCode}) at ${validatedURL}`);
  });

  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error(`❌ Renderer process gone: ${details.reason} (${details.exitCode})`);
  });

  // Show window when content is ready (no white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) {
      console.log(`[BROWSER ERROR] ${message} (at ${sourceId}:${line})`);
    } else {
      console.log(`[BROWSER] ${message}`);
    }
  });

  mainWindow.webContents.on('did-finish-load', async () => {
    try {
      const html = await mainWindow.webContents.executeJavaScript('document.documentElement.outerHTML');
      console.log('--- RENDERED HTML ---');
      console.log(html.substring(0, 1500));
      console.log('---------------------');
    } catch(err) {}
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

// ── Cleanup ───────────────────────────────────
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

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
  // --- Boot-Time Lockfile & Rollback ---
  const fs = require('fs');
  const lockfilePath = path.join(__dirname, 'database', '.booting');
  
  if (fs.existsSync(lockfilePath)) {
    console.error('⚠️ Boot lockfile found! Previous launch crashed. Rolling back self-evolution...');
    try {
      const evolution = require('./backend/self-evolution');
      const db = require('./backend/database');
      const lastProposal = db.prepare('SELECT id FROM self_evolution_log WHERE success = 1 ORDER BY timestamp DESC LIMIT 1').get();
      if (lastProposal) {
        evolution.rollback(lastProposal.id);
        console.log('✅ Rollback successful. Safe to boot.');
      }
    } catch (err) {
      console.error('❌ Rollback failed:', err.message);
    }
  }
  
  // Create lockfile for this boot
  try {
    if (!fs.existsSync(path.join(__dirname, 'database'))) fs.mkdirSync(path.join(__dirname, 'database'), { recursive: true });
    fs.writeFileSync(lockfilePath, 'booting', 'utf-8');
  } catch(e) {}

  try {
    createWindow();
    createTray();

  // Initialize folder manager and health check
  const folderManager = require('./backend/folder-manager');
  folderManager.init();
  const healthResult = folderManager.healthCheck();
  if (healthResult.severity !== 'ok') {
    const memory = require('./backend/memory');
    const msg = folderManager.getNotificationMessage(healthResult.severity, healthResult.missing);
    if (msg) memory.saveMemory('startup_notification', msg, 'system', 10);
  }

  // Initialize backend
  const ipcBridge = require('./backend/ipc-bridge');
  ipcBridge.registerAllHandlers();

  // Start AI health checks (non-blocking)
  const brain = require('./backend/brain-manager');
  brain.startHealthChecks();

  // Start autonomous engine
  try {
    const autonomous = require('./backend/autonomous-engine');
    autonomous.startAutonomousEngine();
  } catch (err) { console.log('🌙 Autonomous engine skipped:', err.message); }

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

  // ── Register Global Kill Switch ──────────────
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    console.log('🛑 KILL SWITCH ACTIVATED 🛑');
    const db = require('./backend/database');
    db.prepare(`INSERT OR REPLACE INTO security_settings (key, value) VALUES (?, ?)`).run('strict_mode', 'true');
    db.prepare(`INSERT INTO security_log (action, details, risk_level) VALUES (?, ?, ?)`).run('KILL_SWITCH', 'User triggered Ctrl+Shift+L. Strict mode enabled automatically.', 'high');
    if (mainWindow) {
      mainWindow.webContents.send('luna:activity', { step: 'KILL SWITCH ACTIVATED. Strict mode ON.', icon: '🛑', timestamp: Date.now() });
    }
  });

  console.log('🌙 Luna AI Core initialized');
  console.log(`📂 Mode: ${isDev ? 'Development' : 'Production'}`);
  } finally {
    // Safe boot complete - delete lockfile
    try {
      const lockfilePath = path.join(__dirname, 'database', '.booting');
      if (fs.existsSync(lockfilePath)) fs.unlinkSync(lockfilePath);
    } catch (err) {}
  }
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
