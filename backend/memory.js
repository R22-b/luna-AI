// ============================================
// 🌙 LUNA AI — Memory System
// Persistent memory: conversations, memories,
// user profile, goals — all via SQLite
// ============================================

const db = require('./database');

// ══════════════════════════════════════════════
// CONVERSATIONS
// ══════════════════════════════════════════════

/**
 * Save a conversation message (user or luna)
 */
function saveConversation(role, content, emotion = 'neutral', providerUsed = null, threadId = 1) {
  const stmt = db.prepare(`
    INSERT INTO conversations (role, content, emotion_detected, provider_used, thread_id)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(role, content, emotion, providerUsed, threadId);
  return result.lastInsertRowid;
}

/**
 * Get recent conversations for a specific thread (newest first, then reversed for display)
 */
function getRecentConversations(threadId = 1, limit = 50) {
  const stmt = db.prepare(`
    SELECT * FROM conversations
    WHERE thread_id = ?
    ORDER BY id DESC
    LIMIT ?
  `);
  const rows = stmt.all(threadId, limit);
  return rows.reverse(); // Chronological order for display
}

/**
 * Get total conversation count
 */
function getConversationCount() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM conversations');
  return stmt.get().count;
}

/**
 * Clear conversations older than X days
 */
function clearOldConversations(daysOld = 30) {
  const stmt = db.prepare(`
    DELETE FROM conversations
    WHERE timestamp < datetime('now', ? || ' days')
  `);
  const result = stmt.run(`-${daysOld}`);
  return result.changes;
}

// ══════════════════════════════════════════════
// CHAT THREADS
// ══════════════════════════════════════════════

function createChatThread(title = 'New Conversation') {
  const stmt = db.prepare('INSERT INTO chat_threads (title) VALUES (?)');
  const result = stmt.run(title);
  return result.lastInsertRowid;
}

function getAllChatThreads() {
  const stmt = db.prepare('SELECT * FROM chat_threads ORDER BY updated_at DESC');
  return stmt.all();
}

function deleteChatThread(id) {
  const stmt = db.prepare('DELETE FROM chat_threads WHERE id = ?');
  const result = stmt.run(id);
  return result.changes;
}

function renameChatThread(id, title) {
  const stmt = db.prepare('UPDATE chat_threads SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  const result = stmt.run(title, id);
  return result.changes;
}

// ══════════════════════════════════════════════
// MEMORIES
// ══════════════════════════════════════════════

/**
 * Save a memory (fact, preference, habit, etc.)
 */
function saveMemory(key, value, category = 'general', importance = 1) {
  // Check if memory with this key already exists
  const existing = db.prepare('SELECT id FROM memories WHERE key = ?').get(key);

  if (existing) {
    // Update existing memory
    const stmt = db.prepare(`
      UPDATE memories
      SET value = ?, category = ?, importance = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `);
    stmt.run(value, category, importance, key);
    return existing.id;
  } else {
    // Insert new memory
    const stmt = db.prepare(`
      INSERT INTO memories (key, value, category, importance)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(key, value, category, importance);
    return result.lastInsertRowid;
  }
}

/**
 * Get a specific memory by key
 */
function getMemory(key) {
  const stmt = db.prepare('SELECT * FROM memories WHERE key = ?');
  return stmt.get(key) || null;
}

/**
 * Get all memories
 */
function getAllMemories() {
  const stmt = db.prepare('SELECT * FROM memories ORDER BY importance DESC, updated_at DESC');
  return stmt.all();
}

/**
 * Search memories by query (matches key or value)
 */
function searchMemories(query) {
  const stmt = db.prepare(`
    SELECT * FROM memories
    WHERE key LIKE ? OR value LIKE ?
    ORDER BY importance DESC
  `);
  const pattern = `%${query}%`;
  return stmt.all(pattern, pattern);
}

// ══════════════════════════════════════════════
// USER PROFILE
// ══════════════════════════════════════════════

/**
 * Save/update a user profile field
 */
function saveUserProfile(key, value) {
  const stmt = db.prepare(`
    INSERT INTO user_profile (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(key, value);
}

/**
 * Get a user profile field
 */
function getUserProfile(key) {
  const stmt = db.prepare('SELECT value FROM user_profile WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : null;
}

/**
 * Get all user profile fields
 */
function getAllUserProfile() {
  const stmt = db.prepare('SELECT key, value FROM user_profile ORDER BY key');
  const rows = stmt.all();
  // Convert to object for easy access
  const profile = {};
  for (const row of rows) {
    profile[row.key] = row.value;
  }
  return profile;
}

// ══════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════

/**
 * Save a new goal
 */
function saveGoal(title, description = null, deadline = null) {
  const stmt = db.prepare(`
    INSERT INTO goals (title, description, deadline)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(title, description, deadline);
  return result.lastInsertRowid;
}

/**
 * Get all active goals
 */
function getActiveGoals() {
  const stmt = db.prepare(`
    SELECT * FROM goals
    WHERE status = 'active'
    ORDER BY deadline ASC, created_at DESC
  `);
  return stmt.all();
}

/**
 * Update goal progress (0-100)
 */
function updateGoalProgress(id, progress) {
  const status = progress >= 100 ? 'completed' : 'active';
  const stmt = db.prepare(`
    UPDATE goals
    SET progress = ?, status = ?
    WHERE id = ?
  `);
  stmt.run(Math.min(100, Math.max(0, progress)), status, id);
}

/**
 * Get all goals (including completed)
 */
function getAllGoals() {
  const stmt = db.prepare('SELECT * FROM goals ORDER BY created_at DESC');
  return stmt.all();
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

module.exports = {
  // Conversations
  saveConversation,
  getRecentConversations,
  getConversationCount,
  clearOldConversations,
  // Chat Threads
  createChatThread,
  getAllChatThreads,
  deleteChatThread,
  renameChatThread,
  // Memories
  saveMemory,
  getMemory,
  getAllMemories,
  searchMemories,
  // User Profile
  saveUserProfile,
  getUserProfile,
  getAllUserProfile,
  // Goals
  saveGoal,
  getActiveGoals,
  updateGoalProgress,
  getAllGoals,
};
