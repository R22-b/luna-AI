// ============================================
// 🌙 LUNA AI — Secure IPC Bridge (Preload)
// Context-isolated bridge between renderer ↔ main
// ============================================

const { contextBridge, ipcRenderer } = require('electron');

// ── Allowed IPC Channels ──────────────────────
const ALLOWED_SEND = [
  'window:minimize',
  'window:maximize',
  'window:close',
];

const ALLOWED_INVOKE = [
  // Chat
  'luna:chat',
  'luna:getHistory',
  'luna:clearHistory',
  'luna:createThread',
  'luna:getThreads',
  'luna:deleteThread',
  'luna:renameThread',
  'luna:runAutomation',
  // Memory
  'luna:getMemories',
  'luna:saveMemory',
  'luna:searchMemories',
  'luna:getProfile',
  'luna:setProfile',
  // Goals
  'luna:getGoals',
  'luna:addGoal',
  'luna:updateGoal',
  'luna:getAllGoals',
  // AI Stats
  'luna:getStats',
  // PC Control
  'luna:pcControl',
  // Search
  'luna:search',
  'luna:summarizeLink',
  // System
  'luna:getSystemInfo',
  'luna:getFolderPaths',
  'luna:isFirstRun',
  'luna:completeSetup',
  'luna:getWeather',
  'luna:getNews',
  'luna:getStartupState',
  'luna:toggleStartup',
  // Guardian
  'guardian:addProject',
  'guardian:removeProject',
  'guardian:getProjects',
  'guardian:getBackups',
  'guardian:restore',
  'guardian:manualBackup',
  'guardian:getStorage',
  // Evolution
  'evolution:getHistory',
  'evolution:rollback',
  'evolution:getAnalysis',
  'evolution:runCycle',
  'evolution:applyProposal',
  'evolution:rejectProposal',
  'pattern:getAll',
  'pattern:delete',
  // Voice
  'voice:speak',
  'voice:getStatus',
  // Theme
  'theme:get',
  'theme:set',
  'theme:getLayout',
  'theme:setLayout',
  // Window
  'window:isMaximized',
  // Dialogs
  'dialog:openFolder',
  'dialog:openFile',
  // API Keys
  'luna:getApiKeys',
  'luna:saveApiKey',
  // Settings
  'settings:save-key',
  'settings:get-key',
  'settings:get-all-keys',
  // Folder
  'luna:openFolder',
  // Student tools
  'student:summarizePDF',
  'student:summarizeYouTube',
  'student:generateQuestions',
  'student:feynmanExplain',
  'student:activeRecall',
  // Plugins
  'plugins:reload',
  'plugins:getInstalled',
  'plugins:unload',
  'plugins:enable',
  'plugins:remove',
  'plugins:validate',
  'plugins:importFolder',
  'plugins:getDir',
  'plugins:createScaffold',
  // Security
  'security:getData',
  'security:setStrictMode',
  'security:addWhitelistFolder',
  'security:removeWhitelistFolder',
];

const ALLOWED_ON = [
  'navigate',
  'luna:activity',
  'luna:notification',
  'luna:themeChanged',
  'window:maximized-changed',
];

// ── Safe IPC Wrapper ──────────────────────────
function safeSend(channel, ...args) {
  if (ALLOWED_SEND.includes(channel)) {
    ipcRenderer.send(channel, ...args);
  } else {
    console.warn(`[Luna IPC] Blocked send on channel: ${channel}`);
  }
}

function safeInvoke(channel, ...args) {
  if (ALLOWED_INVOKE.includes(channel)) {
    return ipcRenderer.invoke(channel, ...args);
  } else {
    console.warn(`[Luna IPC] Blocked invoke on channel: ${channel}`);
    return Promise.reject(new Error(`Channel not allowed: ${channel}`));
  }
}

function safeOn(channel, callback) {
  if (ALLOWED_ON.includes(channel)) {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  } else {
    console.warn(`[Luna IPC] Blocked listener on channel: ${channel}`);
    return () => {};
  }
}

// ── Expose APIs to Renderer ───────────────────
contextBridge.exposeInMainWorld('luna', {
  // Chat
  chat: (data) => safeInvoke('luna:chat', data),
  getHistory: (data) => safeInvoke('luna:getHistory', data),
  clearHistory: (data) => safeInvoke('luna:clearHistory', data),
  createThread: (data) => safeInvoke('luna:createThread', data),
  getThreads: () => safeInvoke('luna:getThreads'),
  deleteThread: (id) => safeInvoke('luna:deleteThread', { id }),
  renameThread: (id, title) => safeInvoke('luna:renameThread', { id, title }),
  runAutomation: (actions) => safeInvoke('luna:runAutomation', { actions }),

  // Memory
  getMemories: () => safeInvoke('luna:getMemories'),
  saveMemory: (data) => safeInvoke('luna:saveMemory', data),
  searchMemories: (data) => safeInvoke('luna:searchMemories', data),
  getProfile: () => safeInvoke('luna:getProfile'),
  setProfile: (data) => safeInvoke('luna:setProfile', data),

  // Goals
  getGoals: () => safeInvoke('luna:getGoals'),
  addGoal: (data) => safeInvoke('luna:addGoal', data),
  updateGoal: (data) => safeInvoke('luna:updateGoal', data),
  getAllGoals: () => safeInvoke('luna:getAllGoals'),

  // AI
  getStats: () => safeInvoke('luna:getStats'),

  // PC Control
  pcControl: (data) => safeInvoke('luna:pcControl', data),

  // Search
  search: (data) => safeInvoke('luna:search', data),
  summarizeLink: (data) => safeInvoke('luna:summarizeLink', data),

  // System
  getSystemInfo: () => safeInvoke('luna:getSystemInfo'),
  getFolderPaths: () => safeInvoke('luna:getFolderPaths'),
  isFirstRun: () => safeInvoke('luna:isFirstRun'),
  completeSetup: () => safeInvoke('luna:completeSetup'),
  openFolderDialog: () => safeInvoke('dialog:openFolder'),
  openFileDialog: (filters) => safeInvoke('dialog:openFile', filters),
  getApiKeys: () => safeInvoke('luna:getApiKeys'),
  saveApiKey: (data) => safeInvoke('luna:saveApiKey', data),
  openFolder: (data) => safeInvoke('luna:openFolder', data),
  getWeather: () => safeInvoke('luna:getWeather'),
  getNews: () => safeInvoke('luna:getNews'),

  // Events
  on: (channel, callback) => safeOn(channel, callback),
});

contextBridge.exposeInMainWorld('guardian', {
  addProject: (data) => safeInvoke('guardian:addProject', data),
  removeProject: (data) => safeInvoke('guardian:removeProject', data),
  getProjects: () => safeInvoke('guardian:getProjects'),
  getBackups: (data) => safeInvoke('guardian:getBackups', data),
  restore: (data) => safeInvoke('guardian:restore', data),
  manualBackup: (data) => safeInvoke('guardian:manualBackup', data),
  getStorage: () => safeInvoke('guardian:getStorage'),
});

contextBridge.exposeInMainWorld('evolution', {
  getHistory: () => safeInvoke('evolution:getHistory'),
  rollback: (data) => safeInvoke('evolution:rollback', data),
  getAnalysis: () => safeInvoke('evolution:getAnalysis'),
  runCycle: () => safeInvoke('evolution:runCycle'),
  applyProposal: (data) => safeInvoke('evolution:applyProposal', data),
  rejectProposal: (data) => safeInvoke('evolution:rejectProposal', data),
  getPatterns: () => safeInvoke('pattern:getAll'),
  deletePattern: (id) => safeInvoke('pattern:delete', id),
});

contextBridge.exposeInMainWorld('voice', {
  speak: (data) => safeInvoke('voice:speak', data),
  getStatus: () => safeInvoke('voice:getStatus'),
});

contextBridge.exposeInMainWorld('theme', {
  get: () => safeInvoke('theme:get'),
  set: (data) => safeInvoke('theme:set', data),
  getLayout: () => safeInvoke('theme:getLayout'),
  setLayout: (data) => safeInvoke('theme:setLayout', data),
});

contextBridge.exposeInMainWorld('system', {
  isFirstRun: () => safeInvoke('luna:isFirstRun'),
  completeSetup: () => safeInvoke('luna:completeSetup'),
  getSystemInfo: () => safeInvoke('luna:getSystemInfo'),
  getFolderPaths: () => safeInvoke('luna:getFolderPaths'),
  getStartupState: () => safeInvoke('luna:getStartupState'),
  toggleStartup: (data) => safeInvoke('luna:toggleStartup', data),
});

contextBridge.exposeInMainWorld('student', {
  summarizePDF: (data) => safeInvoke('student:summarizePDF', data),
  summarizeYouTube: (data) => safeInvoke('student:summarizeYouTube', data),
  generateQuestions: (data) => safeInvoke('student:generateQuestions', data),
  feynmanExplain: (data) => safeInvoke('student:feynmanExplain', data),
  activeRecall: (data) => safeInvoke('student:activeRecall', data),
});

contextBridge.exposeInMainWorld('settings', {
  saveKey: (data) => safeInvoke('settings:save-key', data),
  getKey: (data) => safeInvoke('settings:get-key', data),
  getAllKeys: () => safeInvoke('settings:get-all-keys'),
});

contextBridge.exposeInMainWorld('plugins', {
  reload: () => safeInvoke('plugins:reload'),
  getInstalled: () => safeInvoke('plugins:getInstalled'),
  unload: (data) => safeInvoke('plugins:unload', data),
  enable: (data) => safeInvoke('plugins:enable', data),
  remove: (data) => safeInvoke('plugins:remove', data),
  validate: (data) => safeInvoke('plugins:validate', data),
  importFolder: (data) => safeInvoke('plugins:importFolder', data),
  getDir: () => safeInvoke('plugins:getDir'),
  createScaffold: (data) => safeInvoke('plugins:createScaffold', data),
});

contextBridge.exposeInMainWorld('security', {
  getData: () => safeInvoke('security:getData'),
  setStrictMode: (enabled) => safeInvoke('security:setStrictMode', enabled),
  addWhitelistFolder: (folderPath) => safeInvoke('security:addWhitelistFolder', folderPath),
  removeWhitelistFolder: (folderPath) => safeInvoke('security:removeWhitelistFolder', folderPath),
});

// ── Window Controls ───────────────────────────
contextBridge.exposeInMainWorld('windowControls', {
  minimize: () => safeSend('window:minimize'),
  maximize: () => safeSend('window:maximize'),
  close: () => safeSend('window:close'),
  isMaximized: () => safeInvoke('window:isMaximized'),
  onMaximizedChange: (callback) => safeOn('window:maximized-changed', callback),
});
