// ============================================
// 🌙 LUNA AI — IPC Bridge
// All ipcMain handlers connecting renderer ↔ backend
// Rate limited, validated, error-wrapped
// ============================================

const { ipcMain } = require('electron');
const memory = require('./memory');
const lunaCore = require('./luna-core');
const brain = require('./brain-manager');
const searchEngine = require('./search-engine');
const folderManager = require('./folder-manager');
const Store = require('electron-store');
const store = new Store();

// Lazy-loaded modules (initialized when needed)
let pcControl = null;
let projectGuardian = null;
let selfEvolution = null;
let voiceManager = null;
let themeManager = null;
let studentTools = null;
let pluginManager = null;

// ── Web Server Bridge (For Phone/Chrome Access) ──
const express = require('express');
const cors = require('cors');
const webApp = express();
webApp.use(cors());
webApp.use(express.json({ limit: '50mb' }));

const WEB_PORT = 3000;
try {
  const server = webApp.listen(WEB_PORT, '127.0.0.1', () => {
    console.log(`\n🌐 Remote Web Bridge active on port ${WEB_PORT} (Secured to localhost)`);
    console.log(`📱 Web Bridge fallback disabled for security.`);
  });
  
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${WEB_PORT} is already in use. Web Bridge fallback disabled.`);
    } else {
      console.error('🌐 Web Bridge Server Error:', err.message);
    }
  });
} catch (err) {
  console.log('🌐 Web Bridge Server failed to start:', err.message);
}

// ── Rate Limiter ──────────────────────────────
const rateLimits = {};
const RATE_LIMIT = 50; // max requests
const RATE_WINDOW = 5000; // per 5 seconds

function checkRateLimit(channel) {
  const now = Date.now();
  if (!rateLimits[channel]) rateLimits[channel] = [];
  rateLimits[channel] = rateLimits[channel].filter(t => now - t < RATE_WINDOW);
  if (rateLimits[channel].length >= RATE_LIMIT) return false;
  rateLimits[channel].push(now);
  return true;
}

// ── Safe Handler Wrapper (Dual IPC + HTTP) ─────
function safeHandle(channel, handler) {
  // 1. Register Electron IPC
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      if (!checkRateLimit(channel)) return { success: false, error: 'whoa slow down baddy 😅 too many requests' };
      return await handler(event, ...args);
    } catch (err) {
      console.error(`[IPC Error] ${channel}:`, err.message);
      return { success: false, error: `oops something broke 😅 ${err.message}` };
    }
  });

  // 2. Register Web REST API
  const route = '/api/' + channel.replace(':', '/');
  webApp.post(route, async (req, res) => {
    try {
      if (!checkRateLimit(channel)) return res.json({ success: false, error: 'whoa slow down baddy 😅 too many requests' });
      // Pass null for event, req.body for data
      const result = await handler(null, req.body);
      res.json(result || { success: true });
    } catch (err) {
      console.error(`[Web Error] ${channel}:`, err.message);
      res.json({ success: false, error: `oops something broke 😅 ${err.message}` });
    }
  });
}

// ══════════════════════════════════════════════
// REGISTER ALL HANDLERS
// ══════════════════════════════════════════════

function registerAllHandlers() {
  // ── CHAT ────────────────────────────────────
  safeHandle('luna:chat', async (_event, data) => {
    const { message, nickname, threadId } = data || {};
    if (!message || typeof message !== 'string') {
      return { success: false, error: 'no message provided' };
    }

    const tid = threadId || 1;
    const history = memory.getRecentConversations(tid, 20);
    const result = await lunaCore.think(message, history, nickname || 'baddy', tid);

    return {
      success: true,
      response: result.response,
      emotion: result.emotion,
      taskType: result.taskType,
      providerUsed: result.providerUsed,
    };
  });

  safeHandle('luna:getHistory', async (_event, data) => {
    const { threadId } = data || {};
    const history = memory.getRecentConversations(threadId || 1, 50);
    return { success: true, history };
  });

  safeHandle('luna:clearHistory', async (_event, data) => {
    const { threadId } = data || {};
    // Currently clearOldConversations clears everything or by date, 
    // let's add thread-specific deletion later if needed.
    const cleared = memory.clearOldConversations(0); 
    return { success: true, cleared };
  });

  // ── CHAT THREADS ─────────────────────────────
  safeHandle('luna:createThread', async (_event, data) => {
    const id = memory.createChatThread(data?.title);
    return { success: true, id };
  });

  safeHandle('luna:getThreads', async () => {
    const threads = memory.getAllChatThreads();
    return { success: true, threads };
  });

  safeHandle('luna:deleteThread', async (_event, data) => {
    if (!data?.id) return { success: false, error: 'id required' };
    const changes = memory.deleteChatThread(data.id);
    return { success: true, changes };
  });

  safeHandle('luna:renameThread', async (_event, data) => {
    if (!data?.id || !data?.title) return { success: false, error: 'id and title required' };
    const changes = memory.renameChatThread(data.id, data.title);
    return { success: true, changes };
  });

  // ── MEMORY ──────────────────────────────────
  safeHandle('luna:getMemories', async () => {
    const memories = memory.getAllMemories();
    return { success: true, memories };
  });

  safeHandle('luna:saveMemory', async (_event, data) => {
    const { key, value, category } = data || {};
    if (!key || !value) return { success: false, error: 'key and value required' };
    const id = memory.saveMemory(key, value, category);
    return { success: true, id };
  });

  safeHandle('luna:searchMemories', async (_event, data) => {
    const { query } = data || {};
    if (!query) return { success: false, error: 'query required' };
    const results = await memory.searchMemories(query);
    return { success: true, results };
  });

  safeHandle('luna:getProfile', async () => {
    const profile = memory.getAllUserProfile();
    return { success: true, profile };
  });

  safeHandle('luna:setProfile', async (_event, data) => {
    const { key, value } = data || {};
    if (!key || value === undefined) return { success: false, error: 'key and value required' };
    memory.saveUserProfile(key, String(value));
    return { success: true };
  });

  // ── GOALS ───────────────────────────────────
  safeHandle('luna:getGoals', async () => {
    const goals = memory.getActiveGoals();
    return { success: true, goals };
  });

  safeHandle('luna:addGoal', async (_event, data) => {
    const { title, description, deadline } = data || {};
    if (!title) return { success: false, error: 'title required' };
    const id = memory.saveGoal(title, description, deadline);
    return { success: true, id };
  });

  safeHandle('luna:updateGoal', async (_event, data) => {
    const { id, progress } = data || {};
    if (!id || progress === undefined) return { success: false, error: 'id and progress required' };
    memory.updateGoalProgress(id, progress);
    return { success: true };
  });

  safeHandle('luna:getAllGoals', async () => {
    const goals = memory.getAllGoals();
    return { success: true, goals };
  });

  // ── AI STATS & PROVIDERS ────────────────────
  safeHandle('luna:getStats', async () => {
    const stats = brain.getProviderStats();
    return { success: true, stats };
  });
  
  safeHandle('luna:getProviders', async () => {
    // Group providers for UI
    const allProviders = Object.entries(brain.PROVIDERS).map(([id, p]) => ({
      id,
      name: p.name,
      category: p.category || 'other'
    }));
    return { success: true, providers: allProviders };
  });

  safeHandle('luna:getManualModel', async () => {
    const store = new (require('electron-store'))();
    const model = store.get('manual_model_override', 'auto');
    return { success: true, model };
  });

  safeHandle('luna:setManualModel', async (_event, modelId) => {
    const store = new (require('electron-store'))();
    store.set('manual_model_override', modelId);
    return { success: true };
  });

  safeHandle('luna:getAutonomousUpdates', async () => {
    try {
      const autonomous = require('./autonomous-engine');
      const updates = await autonomous.getPendingInsights();
      autonomous.clearInsights();
      return { success: true, updates };
    } catch {
      return { success: false, updates: [] };
    }
  });

  // ── PC CONTROL ──────────────────────────────
  safeHandle('luna:pcControl', async (_event, data) => {
    if (!pcControl) {
      try { pcControl = require('./pc-control'); } catch { return { success: false, error: 'PC control not loaded yet' }; }
    }
    const { command, args } = data || {};
    if (!command) return { success: false, error: 'command required' };

    // Route to appropriate function
    switch (command) {
      case 'openApp': return await pcControl.openApp(args?.appName || args);
      case 'openUrl': return await pcControl.openUrl(args?.url || args);
      case 'screenshot': return await pcControl.takeScreenshot();
      case 'systemInfo': return await pcControl.getSystemInfo();
      case 'runningApps': return await pcControl.getRunningApps();
      case 'volume': return await pcControl.controlVolume(args?.action || args);
      case 'createFile': return await pcControl.createFile(args?.path, args?.content);
      case 'readFile': return await pcControl.readFile(args?.path);
      case 'searchPC': return await pcControl.searchPC(args?.query || args);
      default: return { success: false, error: `unknown command: ${command}` };
    }
  });

  // ── SEARCH ──────────────────────────────────
  safeHandle('luna:search', async (_event, data) => {
    const { query } = data || {};
    if (!query) return { success: false, error: 'query required' };
    return await searchEngine.searchAndSummarize(query);
  });

  safeHandle('luna:summarizeLink', async (_event, data) => {
    const { url } = data || {};
    if (!url) return { success: false, error: 'url required' };
    return await searchEngine.summarizeLink(url);
  });

  // ── GUARDIAN ─────────────────────────────────
  safeHandle('guardian:addProject', async (_event, data) => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: false, error: 'Guardian not loaded yet' }; }
    }
    const { name, folderPath } = data || {};
    if (!name || !folderPath) return { success: false, error: 'name and folderPath required' };
    return await projectGuardian.addProject(name, folderPath);
  });

  safeHandle('guardian:removeProject', async (_event, data) => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: false, error: 'Guardian not loaded yet' }; }
    }
    return await projectGuardian.removeProject(data?.name);
  });

  safeHandle('guardian:getProjects', async () => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: true, projects: [] }; }
    }
    const projects = projectGuardian.getWatchedProjects();
    return { success: true, projects };
  });

  safeHandle('guardian:getBackups', async (_event, data) => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: true, backups: [] }; }
    }
    const backups = projectGuardian.getBackupsForProject(data?.projectName);
    return { success: true, backups };
  });

  safeHandle('guardian:restore', async (_event, data) => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: false, error: 'Guardian not loaded yet' }; }
    }
    return await projectGuardian.restoreBackup(data?.backupId);
  });

  safeHandle('guardian:manualBackup', async (_event, data) => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: false, error: 'Guardian not loaded yet' }; }
    }
    return await projectGuardian.createBackup(data?.folderPath, data?.projectName);
  });

  safeHandle('guardian:getStorage', async () => {
    if (!projectGuardian) {
      try { projectGuardian = require('./project-guardian'); } catch { return { success: true, sizeMb: 0 }; }
    }
    const sizeMb = projectGuardian.getTotalBackupSize();
    return { success: true, sizeMb };
  });

  // ── EVOLUTION ───────────────────────────────
  safeHandle('evolution:getHistory', async () => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: true, history: [] }; }
    }
    const history = selfEvolution.getEvolutionHistory();
    return { success: true, history };
  });

  safeHandle('evolution:rollback', async (_event, data) => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: false, error: 'Evolution not loaded yet' }; }
    }
    return await selfEvolution.rollback(data?.logId);
  });

  safeHandle('evolution:getAnalysis', async () => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: false, error: 'Evolution not loaded yet' }; }
    }
    return await selfEvolution.analysePerformance();
  });

  safeHandle('evolution:runCycle', async () => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: false, error: 'Evolution not loaded yet' }; }
    }
    return await selfEvolution.runEvolutionCycle();
  });

  safeHandle('evolution:applyProposal', async (_event, data) => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: false, error: 'Evolution not loaded yet' }; }
    }
    return selfEvolution.applyProposal(data?.logId);
  });

  safeHandle('evolution:rejectProposal', async (_event, data) => {
    if (!selfEvolution) {
      try { selfEvolution = require('./self-evolution'); } catch { return { success: false, error: 'Evolution not loaded yet' }; }
    }
    return selfEvolution.rejectProposal(data?.logId);
  });

  // ── VOICE ───────────────────────────────────
  safeHandle('voice:speak', async (_event, data) => {
    if (!voiceManager) {
      try { voiceManager = require('./voice-manager'); } catch { return { success: false, error: 'Voice not loaded yet' }; }
    }
    const { text } = data || {};
    if (!text) return { success: false, error: 'text required' };
    await voiceManager.speak(text);
    return { success: true };
  });

  safeHandle('voice:getStatus', async () => {
    if (!voiceManager) return { success: true, ready: false, speaking: false };
    return { success: true, ready: true, speaking: voiceManager.isSpeaking || false };
  });

  // ── STUDENT TOOLS ───────────────────────────
  safeHandle('student:summarizePDF', async (_event, data) => {
    if (!studentTools) {
      try { studentTools = require('./student-tools'); } catch { return { success: false, error: 'Student tools not loaded yet' }; }
    }
    const filePath = data?.filePath;
    if (!filePath) return { success: false, error: 'filePath required' };
    return await studentTools.summarizePDF(filePath);
  });

  safeHandle('student:summarizeYouTube', async (_event, data) => {
    if (!studentTools) {
      try { studentTools = require('./student-tools'); } catch { return { success: false, error: 'Student tools not loaded yet' }; }
    }
    const url = data?.url;
    if (!url) return { success: false, error: 'url required' };
    return await studentTools.summarizeYouTube(url);
  });

  safeHandle('student:generateQuestions', async (_event, data) => {
    if (!studentTools) {
      try { studentTools = require('./student-tools'); } catch { return { success: false, error: 'Student tools not loaded yet' }; }
    }
    const content = data?.content;
    const count = data?.count || 10;
    if (!content) return { success: false, error: 'content required' };
    return await studentTools.generateQuestions(content, count);
  });

  safeHandle('student:feynmanExplain', async (_event, data) => {
    if (!studentTools) {
      try { studentTools = require('./student-tools'); } catch { return { success: false, error: 'Student tools not loaded yet' }; }
    }
    const topic = data?.topic;
    if (!topic) return { success: false, error: 'topic required' };
    return await studentTools.feynmanExplain(topic);
  });

  safeHandle('student:activeRecall', async (_event, data) => {
    if (!studentTools) {
      try { studentTools = require('./student-tools'); } catch { return { success: false, error: 'Student tools not loaded yet' }; }
    }
    const topic = data?.topic;
    const userAnswer = data?.userAnswer || null;
    if (!topic) return { success: false, error: 'topic required' };
    return await studentTools.activeRecall(topic, userAnswer);
  });

  // ── THEME ───────────────────────────────────
  safeHandle('theme:get', async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const themePath = path.join(__dirname, '..', 'theme', 'theme.json');
      const data = JSON.parse(fs.readFileSync(themePath, 'utf-8'));
      return { success: true, theme: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('theme:set', async (_event, data) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const themePath = path.join(__dirname, '..', 'theme', 'theme.json');
      fs.writeFileSync(themePath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('theme:getLayout', async () => {
    try {
      const fs = require('fs');
      const path = require('path');
      const layoutPath = path.join(__dirname, '..', 'theme', 'layout.json');
      const data = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));
      return { success: true, layout: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('theme:setLayout', async (_event, data) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const layoutPath = path.join(__dirname, '..', 'theme', 'layout.json');
      fs.writeFileSync(layoutPath, JSON.stringify(data, null, 2));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('luna:getSystemInfo', async () => {
    if (!pcControl) {
      try { pcControl = require('./pc-control'); } catch { return { success: false, error: 'PC control not loaded' }; }
    }
    return await pcControl.getSystemInfo();
  });

  safeHandle('luna:getStartupState', async () => {
    const { app } = require('electron');
    return { success: true, startup: app.getLoginItemSettings().openAtLogin };
  });

  safeHandle('luna:toggleStartup', async (_event, data) => {
    const { app } = require('electron');
    app.setLoginItemSettings({ openAtLogin: !!data?.enable });
    return { success: true };
  });

  safeHandle('luna:getFolderPaths', async () => {
    const paths = folderManager.getAllFolderPaths();
    return { success: true, paths };
  });

  safeHandle('luna:isFirstRun', async () => {
    const setupDone = memory.getUserProfile('setup_completed');
    return { success: true, isFirstRun: !setupDone };
  });

  safeHandle('luna:completeSetup', async () => {
    memory.saveUserProfile('setup_completed', 'true');
    memory.saveUserProfile('setup_date', new Date().toISOString());
    return { success: true };
  });

  safeHandle('luna:getWeather', async () => {
    const key = process.env.OPENWEATHER_KEY;
    if (!key) return { success: false, error: 'No key' };
    try {
      const axios = require('axios');
      const url = `https://api.openweathermap.org/data/2.5/weather?q=Bengaluru&appid=${key}&units=metric`;
      const res = await axios.get(url, { timeout: 5000 });
      return { success: true, temp: res.data.main.temp, condition: res.data.weather[0].description };
    } catch {
      return { success: false, error: 'Failed to fetch' };
    }
  });

  safeHandle('luna:getNews', async () => {
    const key = process.env.NEWS_API_KEY;
    if (!key) return { success: false, error: 'No key' };
    try {
      const axios = require('axios');
      const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${key}`;
      const res = await axios.get(url, { timeout: 5000 });
      return { success: true, articles: res.data.articles.slice(0, 3) };
    } catch {
      return { success: false, error: 'Failed to fetch' };
    }
  });

  // ── DIALOGS ─────────────────────────────────
  safeHandle('dialog:openFolder', async () => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Folder',
    });
    if (result.canceled || !result.filePaths[0]) return { success: false, canceled: true };
    return { success: true, path: result.filePaths[0] };
  });

  safeHandle('dialog:openFile', async (_event, filters) => {
    const { dialog } = require('electron');
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: 'Select File',
      filters: filters || [
        { name: 'PDF Files', extensions: ['pdf'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (result.canceled || !result.filePaths[0]) return { success: false, canceled: true };
    return { success: true, path: result.filePaths[0] };
  });

  // ── API KEY MANAGEMENT ──────────────────────
  safeHandle('luna:getApiKeys', async () => {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    const keys = {};
    try {
      if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        content.split('\n').forEach(line => {
          const [key, ...valParts] = line.split('=');
          const val = valParts.join('=').trim();
          if (key && val) {
            keys[key.trim()] = val ? '••••' + val.slice(-4) : '';
            keys[key.trim() + '_exists'] = val.length > 0;
          }
        });
      }
    } catch {}
    return { success: true, keys };
  });

  safeHandle('luna:saveApiKey', async (_event, data) => {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.join(__dirname, '..', '.env');
    const { keyName, keyValue } = data || {};
    if (!keyName) return { success: false, error: 'key name required' };

    let lines = [];
    try {
      if (fs.existsSync(envPath)) {
        lines = fs.readFileSync(envPath, 'utf-8').split('\n');
      }
    } catch {}

    let found = false;
    lines = lines.map(line => {
      if (line.startsWith(keyName + '=')) {
        found = true;
        return `${keyName}=${keyValue}`;
      }
      return line;
    });
    if (!found) lines.push(`${keyName}=${keyValue}`);

    fs.writeFileSync(envPath, lines.filter(l => l.trim()).join('\n') + '\n');

    // Reload into process.env
    process.env[keyName] = keyValue;

    return { success: true };
  });

  // ── SETTINGS (electron-store) ───────────────
  safeHandle('settings:save-key', async (_event, data) => {
    const { key, value } = data || {};
    if (!key) return { success: false, error: 'key required' };
    store.set(key, value);
    return { success: true };
  });

  safeHandle('settings:get-key', async (_event, data) => {
    const { key } = data || {};
    if (!key) return { success: false, error: 'key required' };
    return { success: true, value: store.get(key) || null };
  });

  safeHandle('settings:get-all-keys', async () => {
    return { success: true, keys: store.store };
  });

  // ── OPEN FOLDER IN EXPLORER ────────────────
  safeHandle('luna:openFolder', async (_event, data) => {
    const { shell } = require('electron');
    const folderPath = data?.path;
    if (!folderPath) return { success: false, error: 'path required' };
    shell.openPath(folderPath);
    return { success: true };
  });

  // ── PATTERN DETECTION ───────────────────────
  safeHandle('pattern:getAll', async () => {
    try {
      const patternEngine = require('./pattern-engine');
      return { success: true, patterns: patternEngine.getStoredPatterns() };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('pattern:delete', async (_event, id) => {
    if (!id) return { success: false, error: 'Pattern ID required' };
    try {
      const patternEngine = require('./pattern-engine');
      return patternEngine.deletePattern(id);
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ── PLUGINS ─────────────────────────────────
  safeHandle('plugins:reload', async () => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    const result = pluginManager.loadAllPlugins();
    return { success: true, ...result };
  });

  safeHandle('plugins:getInstalled', async () => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: true, plugins: [] }; }
    }
    const plugins = pluginManager.getInstalledPlugins();
    return { success: true, plugins };
  });

  safeHandle('plugins:getDir', async () => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    return { success: true, path: pluginManager.getPluginsDir() };
  });

  safeHandle('plugins:validate', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    const pluginPath = data?.pluginPath;
    if (!pluginPath) return { success: false, error: 'pluginPath required' };
    const result = pluginManager.validatePlugin(pluginPath);
    return { success: true, ...result };
  });

  safeHandle('plugins:importFolder', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    const sourcePath = data?.sourcePath;
    if (!sourcePath) return { success: false, error: 'sourcePath required' };
    const result = pluginManager.importPluginFolder(sourcePath);
    if (!result.success) return result;
    pluginManager.loadAllPlugins();
    return result;
  });

  safeHandle('plugins:enable', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    if (!data?.name) return { success: false, error: 'name required' };
    const result = pluginManager.enablePlugin(data.name);
    return { success: true, ...result };
  });

  safeHandle('plugins:unload', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    if (!data?.name) return { success: false, error: 'name required' };
    return pluginManager.unloadPlugin(data.name);
  });

  safeHandle('plugins:remove', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    if (!data?.name) return { success: false, error: 'name required' };
    const result = pluginManager.removePlugin(data.name);
    if (result.success) pluginManager.loadAllPlugins();
    return result;
  });

  safeHandle('plugins:createScaffold', async (_event, data) => {
    if (!pluginManager) {
      try { pluginManager = require('./plugin-manager'); } catch { return { success: false, error: 'Plugin manager not loaded yet' }; }
    }
    const result = pluginManager.createPluginScaffold({
      name: data?.name,
      description: data?.description,
      author: data?.author
    });
    if (!result.success) return result;
    pluginManager.loadAllPlugins();
    return result;
  });

  safeHandle('luna:runAutomation', async (_event, data) => {
    if (!pcControl) pcControl = require('./pc-control');
    const { actions } = data || {};
    return await pcControl.runAutomationSequence(actions);
  });

  // ── SECURITY CENTER ─────────────────────────
  safeHandle('security:getData', async () => {
    try {
      const db = require('./database');
      const logs = db.prepare('SELECT * FROM security_log ORDER BY timestamp DESC LIMIT 50').all();
      
      const strictRow = db.prepare('SELECT value FROM security_settings WHERE key = ?').get('strict_mode');
      const strictMode = strictRow ? strictRow.value === 'true' : false;
      
      const wlRow = db.prepare('SELECT value FROM security_settings WHERE key = ?').get('whitelist');
      const whitelist = wlRow ? JSON.parse(wlRow.value) : [];
      
      const countRow = db.prepare('SELECT COUNT(*) as c FROM security_log WHERE timestamp >= date("now")').get();
      const blockedCount = countRow ? countRow.c : 0;
      
      return { success: true, logs, strictMode, whitelist, blockedCount };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('security:setStrictMode', async (_event, enabled) => {
    try {
      const db = require('./database');
      db.prepare('INSERT OR REPLACE INTO security_settings (key, value) VALUES (?, ?)').run('strict_mode', enabled ? 'true' : 'false');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('security:addWhitelistFolder', async (_event, folderPath) => {
    try {
      const db = require('./database');
      const wlRow = db.prepare('SELECT value FROM security_settings WHERE key = ?').get('whitelist');
      const whitelist = wlRow ? JSON.parse(wlRow.value) : [];
      
      if (!whitelist.includes(folderPath)) {
        whitelist.push(folderPath);
        db.prepare('INSERT OR REPLACE INTO security_settings (key, value) VALUES (?, ?)').run('whitelist', JSON.stringify(whitelist));
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  safeHandle('security:removeWhitelistFolder', async (_event, folderPath) => {
    try {
      const db = require('./database');
      const wlRow = db.prepare('SELECT value FROM security_settings WHERE key = ?').get('whitelist');
      let whitelist = wlRow ? JSON.parse(wlRow.value) : [];
      
      whitelist = whitelist.filter(p => p !== folderPath);
      db.prepare('INSERT OR REPLACE INTO security_settings (key, value) VALUES (?, ?)').run('whitelist', JSON.stringify(whitelist));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  console.log('✅ All IPC handlers registered');
}

// ══════════════════════════════════════════════
// EXPORT
// ══════════════════════════════════════════════

module.exports = { registerAllHandlers };
