// ============================================
// 🌙 LUNA AI — Folder Manager
// Auto-create, health check, and auto-heal
// all Luna workspace folders
// ============================================

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Default Paths ─────────────────────────────
let customBasePath = null;

/**
 * Get user's Desktop path (aware of OneDrive)
 */
function getDesktopPath() {
  const home = os.homedir();
  const oneDriveDesktop = path.join(home, 'OneDrive', 'Desktop');
  
  // Windows 11 often moves the actual Desktop into OneDrive
  if (fs.existsSync(oneDriveDesktop)) {
    return oneDriveDesktop;
  }
  
  return path.join(home, 'Desktop');
}

/**
 * Get current workspace base path (Desktop or custom)
 */
function getWorkspacePath() {
  return customBasePath || getDesktopPath();
}

/**
 * Get all Luna folder paths based on a base path
 */
function getAllFolderPaths(basePath = null) {
  const base = basePath || getWorkspacePath();
  return {
    workspace: path.join(base, 'Luna_Workspace'),
    projects: path.join(base, 'Luna_Workspace', 'projects'),
    docs: path.join(base, 'Luna_Workspace', 'docs'),
    exports: path.join(base, 'Luna_Workspace', 'exports'),
    plugins: path.join(base, 'Luna_Workspace', 'plugins'),
    media: path.join(base, 'Luna_Media'),
    images: path.join(base, 'Luna_Media', 'images'),
    videos: path.join(base, 'Luna_Media', 'videos'),
    backups: path.join(base, 'Luna_Backups'),
    projectBackups: path.join(base, 'Luna_Backups', 'projects'),
    evolutionBackups: path.join(base, 'Luna_Backups', 'evolution'),
  };
}

/**
 * Create all required folders silently
 */
function createAllFolders(basePath = null) {
  const paths = getAllFolderPaths(basePath);
  const created = [];

  for (const [name, folderPath] of Object.entries(paths)) {
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
        created.push(name);
      }
    } catch (err) {
      // Silent — Luna never crashes from folder issues
      console.error(`[FolderManager] Failed to create ${name}:`, err.message);
    }
  }

  if (created.length > 0) {
    console.log(`📁 Created folders: ${created.join(', ')}`);
  }

  return created;
}

/**
 * Health check — verify all folders exist, auto-heal if missing
 * Returns severity: 'ok' | 'minor' | 'major' | 'critical'
 */
function healthCheck() {
  const paths = getAllFolderPaths();
  const missing = [];
  const recreated = [];
  let severity = 'ok';

  // Main folders (major if missing)
  const mainFolders = ['workspace', 'media', 'backups'];
  // Sub folders (minor if missing)
  const subFolders = ['projects', 'docs', 'exports', 'plugins', 'images', 'videos', 'projectBackups', 'evolutionBackups'];

  // Check all folders
  for (const [name, folderPath] of Object.entries(paths)) {
    if (!fs.existsSync(folderPath)) {
      missing.push(name);

      // Auto-recreate
      try {
        fs.mkdirSync(folderPath, { recursive: true });
        recreated.push(name);
      } catch (err) {
        console.error(`[HealthCheck] Cannot recreate ${name}:`, err.message);
      }

      // Determine severity
      if (name === 'backups' || name === 'projectBackups' || name === 'evolutionBackups') {
        severity = 'critical';
      } else if (mainFolders.includes(name) && severity !== 'critical') {
        severity = 'major';
      } else if (subFolders.includes(name) && severity === 'ok') {
        severity = 'minor';
      }
    }
  }

  return {
    healthy: missing.length === 0,
    missing,
    recreated,
    severity,
  };
}

/**
 * Get notification message based on severity
 */
function getNotificationMessage(severity, missingFolders) {
  switch (severity) {
    case 'minor':
      return null; // Silent recreate, no notification
    case 'major':
      return `baddy I noticed some folders were missing 👀 recreated them for you. your old files might be gone though — check Luna_Backups if you need them!`;
    case 'critical':
      return `⚠️ baddy Luna_Backups is missing — no rollback available right now. recreating the folder. future backups are safe. but old backups are gone permanently.`;
    default:
      return null;
  }
}

/**
 * Set a new workspace base path and move existing folders
 */
function setWorkspacePath(newPath) {
  const oldPaths = getAllFolderPaths();
  const errors = [];
  const moved = [];

  // Create new folders first
  createAllFolders(newPath);

  // Move files from old to new
  const newPaths = getAllFolderPaths(newPath);

  for (const [name, oldFolder] of Object.entries(oldPaths)) {
    const newFolder = newPaths[name];
    if (oldFolder === newFolder) continue;

    try {
      if (fs.existsSync(oldFolder)) {
        // Copy contents
        const files = fs.readdirSync(oldFolder);
        for (const file of files) {
          const srcPath = path.join(oldFolder, file);
          const destPath = path.join(newFolder, file);
          const stat = fs.statSync(srcPath);

          if (stat.isFile()) {
            fs.copyFileSync(srcPath, destPath);
          }
          // Skip directories for simplicity (deep copy would be needed for full move)
        }
        moved.push(name);
      }
    } catch (err) {
      errors.push({ folder: name, error: err.message });
    }
  }

  // Update custom path
  customBasePath = newPath;

  return { success: errors.length === 0, moved, errors };
}

/**
 * Get total size of a folder in MB (recursive)
 */
function getFolderSize(folderPath) {
  let totalSize = 0;

  try {
    if (!fs.existsSync(folderPath)) return 0;

    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      try {
        const stat = fs.statSync(itemPath);
        if (stat.isFile()) {
          totalSize += stat.size;
        } else if (stat.isDirectory()) {
          totalSize += getFolderSize(itemPath);
        }
      } catch {
        // Skip inaccessible files
      }
    }
  } catch {
    return 0;
  }

  return Math.round((totalSize / (1024 * 1024)) * 100) / 100; // MB with 2 decimals
}

// ── Run health check on module load ───────────
const initResult = healthCheck();
if (initResult.healthy) {
  console.log('📁 All Luna folders healthy ✅');
} else {
  console.log(`📁 Folder health: ${initResult.severity} — recreated: ${initResult.recreated.join(', ')}`);
  const msg = getNotificationMessage(initResult.severity, initResult.missing);
  if (msg) console.log(`📁 ${msg}`);
}

// ── Export ─────────────────────────────────────
module.exports = {
  getDesktopPath,
  getWorkspacePath,
  getAllFolderPaths,
  createAllFolders,
  healthCheck,
  getNotificationMessage,
  setWorkspacePath,
  getFolderSize,
};
