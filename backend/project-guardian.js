// ============================================
// 🌙 LUNA AI — Project Guardian
// Auto-backup engine with file watching
// ============================================

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const db = require('./database');
const folderManager = require('./folder-manager');

const watchers = {};
const debounceTimers = {};

function watchFolder(folderPath, projectName) {
  if (watchers[projectName]) return;

  const watcher = chokidar.watch(folderPath, {
    ignored: /(node_modules|\.git|\.log$)/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', () => debouncedBackup(folderPath, projectName));
  watcher.on('add', () => debouncedBackup(folderPath, projectName));
  watcher.on('unlink', () => debouncedBackup(folderPath, projectName));

  watchers[projectName] = watcher;
  console.log(`🛡️ Watching: ${projectName} at ${folderPath}`);
}

function debouncedBackup(folderPath, projectName) {
  if (debounceTimers[projectName]) clearTimeout(debounceTimers[projectName]);
  debounceTimers[projectName] = setTimeout(() => {
    createBackup(folderPath, projectName);
  }, 30000); // 30 second debounce
}

function copyDirRecursive(src, dest, excludes = ['node_modules', '.git']) {
  let fileCount = 0;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (excludes.includes(entry.name)) continue;
    if (entry.name.endsWith('.log')) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fileCount += copyDirRecursive(srcPath, destPath, excludes);
    } else {
      fs.copyFileSync(srcPath, destPath);
      fileCount++;
    }
  }
  return fileCount;
}

function createBackup(folderPath, projectName) {
  try {
    const paths = folderManager.getAllFolderPaths();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDest = path.join(paths.projectBackups, projectName, timestamp);

    const fileCount = copyDirRecursive(folderPath, backupDest);
    const sizeMb = folderManager.getFolderSize(backupDest);

    db.prepare(`INSERT INTO project_backups (project_name, folder_path, backup_path, file_count, size_mb) VALUES (?, ?, ?, ?, ?)`).run(projectName, folderPath, backupDest, fileCount, sizeMb);
    db.prepare(`UPDATE watched_projects SET last_backup = CURRENT_TIMESTAMP, backup_count = backup_count + 1 WHERE project_name = ?`).run(projectName);

    console.log(`🛡️ Backup complete: ${projectName} (${fileCount} files, ${sizeMb}MB)`);
    return { success: true, backupPath: backupDest, fileCount, sizeMb };
  } catch (err) {
    console.error(`🛡️ Backup failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

function restoreBackup(backupId) {
  const backup = db.prepare('SELECT * FROM project_backups WHERE id = ?').get(backupId);
  if (!backup) return { success: false, error: 'backup not found' };

  try {
    copyDirRecursive(backup.backup_path, backup.folder_path, []);
    return { success: true, restoredTo: backup.folder_path };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function getWatchedProjects() {
  return db.prepare('SELECT * FROM watched_projects WHERE is_watching = 1 ORDER BY added_at DESC').all();
}

function getBackupsForProject(projectName) {
  return db.prepare('SELECT * FROM project_backups WHERE project_name = ? ORDER BY timestamp DESC').all(projectName);
}

function addProject(projectName, folderPath) {
  if (!fs.existsSync(folderPath)) return { success: false, error: 'folder not found' };

  db.prepare('INSERT OR REPLACE INTO watched_projects (project_name, folder_path) VALUES (?, ?)').run(projectName, folderPath);
  watchFolder(folderPath, projectName);

  return { success: true };
}

function removeProject(projectName) {
  if (watchers[projectName]) { watchers[projectName].close(); delete watchers[projectName]; }
  db.prepare('UPDATE watched_projects SET is_watching = 0 WHERE project_name = ?').run(projectName);
  return { success: true };
}

function getTotalBackupSize() {
  const result = db.prepare('SELECT COALESCE(SUM(size_mb), 0) as total FROM project_backups').get();
  return result.total;
}

function getProjectStatus(projectName) {
  const project = db.prepare('SELECT last_backup FROM watched_projects WHERE project_name = ?').get(projectName);
  if (!project || !project.last_backup) return 'red';
  const hoursSince = (Date.now() - new Date(project.last_backup).getTime()) / 3600000;
  if (hoursSince < 1) return 'green';
  if (hoursSince < 3) return 'orange';
  return 'red';
}

// Resume watching saved projects on load
const savedProjects = db.prepare('SELECT * FROM watched_projects WHERE is_watching = 1').all();
for (const p of savedProjects) {
  if (fs.existsSync(p.folder_path)) watchFolder(p.folder_path, p.project_name);
}

module.exports = { watchFolder, createBackup, restoreBackup, getWatchedProjects, getBackupsForProject, addProject, removeProject, getTotalBackupSize, getProjectStatus };
