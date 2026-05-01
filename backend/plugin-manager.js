// 🌙 LUNA AI — Plugin Manager
const fs = require('fs');
const path = require('path');
const folderManager = require('./folder-manager');

const loadedPlugins = {};
const pluginState = {};

function getPluginsDir() {
  const paths = folderManager.getAllFolderPaths();
  const dir = path.join(paths.workspace, 'plugins');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getStatePath() {
  return path.join(getPluginsDir(), 'state.json');
}

function loadState() {
  try {
    if (fs.existsSync(getStatePath())) {
      return JSON.parse(fs.readFileSync(getStatePath(), 'utf-8'));
    }
  } catch (err) {
    console.error('Failed to load plugin state:', err.message);
  }
  return {};
}

function saveState(state) {
  try {
    fs.writeFileSync(getStatePath(), JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save plugin state:', err.message);
  }
}

function getManifestPath(pluginPath) {
  return path.join(pluginPath, 'plugin.json');
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase().replace(/\s+/g, '-');
}

function loadAllPlugins() {
  const loaded = [], failed = [];
  Object.keys(loadedPlugins).forEach((key) => delete loadedPlugins[key]);

  const state = loadState();
  Object.assign(pluginState, state);

  const pluginsDir = getPluginsDir();
  const dirs = fs.readdirSync(pluginsDir, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const dir of dirs) {
    const pluginPath = path.join(pluginsDir, dir.name);
    const result = validatePlugin(pluginPath);
    if (result.valid) {
      try {
        const manifest = JSON.parse(fs.readFileSync(getManifestPath(pluginPath), 'utf-8'));
        const key = normalizeName(manifest.name);
        const isEnabled = pluginState[key] !== false; // Default true if undefined
        
        loadedPlugins[key] = { manifest, path: pluginPath, enabled: isEnabled };
        if (isEnabled) {
          loaded.push(manifest.name || dir.name);
        }
      } catch { failed.push(dir.name); }
    } else {
      failed.push(`${dir.name}: ${result.errors.join(', ')}`);
    }
  }
  if (loaded.length > 0) console.log(`🔌 Plugins loaded: ${loaded.join(', ')}`);
  return { loaded, failed, pluginsDir };
}

function validatePlugin(pluginPath) {
  const errors = [];
  const manifestPath = getManifestPath(pluginPath);
  if (!fs.existsSync(manifestPath)) errors.push('missing plugin.json');
  else {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      if (!m.name) errors.push('missing name');
      if (!m.version) errors.push('missing version');
      if (!/^[a-zA-Z0-9._-]+$/.test(m.version || '')) errors.push('invalid version format');
      if (m.entryBackend && !fs.existsSync(path.join(pluginPath, m.entryBackend))) errors.push(`missing backend entry: ${m.entryBackend}`);
      if (m.entryUI && !fs.existsSync(path.join(pluginPath, m.entryUI))) errors.push(`missing ui entry: ${m.entryUI}`);
      if (m.permissions && !Array.isArray(m.permissions)) errors.push('permissions must be an array');
    } catch { errors.push('invalid plugin.json'); }
  }
  return { valid: errors.length === 0, errors };
}

function getInstalledPlugins() {
  return Object.entries(loadedPlugins).map(([name, p]) => ({ id: name, name: p.manifest.name || name, ...p.manifest, path: p.path, enabled: p.enabled }));
}

function unloadPlugin(name) {
  const key = normalizeName(name);
  pluginState[key] = false;
  saveState(pluginState);
  if (loadedPlugins[key]) {
    loadedPlugins[key].enabled = false;
  }
  return { success: true };
}

function enablePlugin(name) {
  const key = normalizeName(name);
  pluginState[key] = true;
  saveState(pluginState);
  return loadAllPlugins();
}

function removePlugin(name) {
  const key = normalizeName(name);
  const pluginsDir = getPluginsDir();
  const target = path.join(pluginsDir, key);
  if (!fs.existsSync(target)) {
    return { success: false, error: 'plugin folder not found' };
  }
  fs.rmSync(target, { recursive: true, force: true });
  delete loadedPlugins[key];
  delete pluginState[key];
  saveState(pluginState);
  return { success: true };
}

function importPluginFolder(sourcePath) {
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    return { success: false, error: 'source plugin folder not found' };
  }
  const stats = fs.statSync(sourcePath);
  if (!stats.isDirectory()) {
    return { success: false, error: 'source path must be a folder' };
  }
  const validation = validatePlugin(sourcePath);
  if (!validation.valid) {
    return { success: false, error: `invalid plugin: ${validation.errors.join(', ')}` };
  }
  const manifest = JSON.parse(fs.readFileSync(getManifestPath(sourcePath), 'utf-8'));
  const key = normalizeName(manifest.name);
  const dest = path.join(getPluginsDir(), key);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.cpSync(sourcePath, dest, { recursive: true });
  pluginState[key] = true;
  saveState(pluginState);
  return { success: true, name: manifest.name, destination: dest };
}

function createPluginScaffold({ name, description = '', author = 'Luna User' }) {
  if (!name) return { success: false, error: 'name required' };
  const key = normalizeName(name);
  const pluginPath = path.join(getPluginsDir(), key);
  if (fs.existsSync(pluginPath)) {
    return { success: false, error: 'plugin already exists' };
  }
  fs.mkdirSync(pluginPath, { recursive: true });
  const manifest = {
    name: key,
    version: '1.0.0',
    description: description || `Plugin ${key}`,
    author,
    permissions: ['memory:read'],
    entryBackend: 'backend.js',
    entryUI: 'ui.jsx',
    icon: 'icon.png'
  };
  fs.writeFileSync(path.join(pluginPath, 'plugin.json'), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(pluginPath, 'backend.js'), "module.exports = {\n  init() { return true; },\n  handlers: {}\n};\n");
  fs.writeFileSync(path.join(pluginPath, 'ui.jsx'), "import React from 'react';\n\nexport default function PluginPage() {\n  return <div style={{ padding: 16, color: '#c4c4d4' }}>Plugin scaffold is ready.</div>;\n}\n");
  return { success: true, pluginPath, manifest };
}

module.exports = {
  loadAllPlugins,
  validatePlugin,
  getInstalledPlugins,
  unloadPlugin,
  enablePlugin,
  removePlugin,
  importPluginFolder,
  createPluginScaffold,
  getPluginsDir
};
