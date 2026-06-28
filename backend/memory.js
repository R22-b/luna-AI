// ============================================
// 🌙 LUNA AI — Memory System
// Persistent memory: conversations, memories,
// user profile, goals — all via SQLite
// ============================================

const db = require('./database');
const brain = require('./brain-manager');

// Initialize transformers.js dynamically to keep startup fast
let extractor = null;
async function getExtractor() {
  if (!extractor) {
    const { pipeline, env } = await import('@xenova/transformers');
    env.allowLocalModels = false; // Force download
    env.backends.onnx.wasm.numThreads = 1; // Prevent memory spikes
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
  }
  return extractor;
}

async function generateEmbedding(text) {
  try {
    const ext = await getExtractor();
    const output = await ext(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.error('Embedding generation failed:', err);
    return null;
  }
}

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}


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
  const insertId = result.lastInsertRowid;

  // Phase 1: Summarize every 20 messages
  if (role !== 'user') {
    const count = getConversationCountByThread(threadId);
    if (count > 0 && count % 20 === 0) {
      triggerSummarization(threadId, insertId).catch(console.error);
    }
  }

  return insertId;
}

async function triggerSummarization(threadId, msgId) {
  try {
    const latestSummary = getLatestSummary(threadId);
    const last20 = getRecentConversations(threadId, 20);
    const contextText = last20.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const summarizePrompt = `Summarize the following conversation history concisely, retaining all key facts, topics discussed, and user preferences. If there's an existing summary, integrate it.\n\nExisting Summary: ${latestSummary || 'None'}\n\nRecent Messages:\n${contextText}\n\nReturn ONLY the new summary text.`;
    
    const summaryRes = await brain.smartCall([{ role: 'user', content: summarizePrompt }], 'You are a concise conversation summarizer.', 'chat');
    if (summaryRes && summaryRes.content) {
      updateConversationSummary(msgId, summaryRes.content);
    }
  } catch (err) {
    console.error('Auto-summarization failed:', err);
  }
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
 * Get conversation count for a specific thread
 */
function getConversationCountByThread(threadId = 1) {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM conversations WHERE thread_id = ?');
  return stmt.get(threadId).count;
}

/**
 * Get the latest summary for a thread
 */
function getLatestSummary(threadId = 1) {
  const stmt = db.prepare(`
    SELECT summary FROM conversations 
    WHERE thread_id = ? AND summary IS NOT NULL 
    ORDER BY id DESC LIMIT 1
  `);
  const row = stmt.get(threadId);
  return row ? row.summary : null;
}

/**
 * Update the summary on a specific conversation record
 */
function updateConversationSummary(id, summary) {
  const stmt = db.prepare('UPDATE conversations SET summary = ? WHERE id = ?');
  stmt.run(summary, id);
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
async function saveMemory(key, value, category = 'general', importance = 1) {
  // Generate embedding asynchronously
  const embeddingArray = await generateEmbedding(`${key}: ${value}`);
  const embeddingBlob = embeddingArray ? Buffer.from(new Float32Array(embeddingArray).buffer) : null;

  // Check if memory with this key already exists
  const existing = db.prepare('SELECT id FROM memories WHERE key = ?').get(key);

  if (existing) {
    // Update existing memory
    const stmt = db.prepare(`
      UPDATE memories
      SET value = ?, category = ?, importance = ?, embedding = ?, updated_at = CURRENT_TIMESTAMP
      WHERE key = ?
    `);
    stmt.run(value, category, importance, embeddingBlob, key);
    return existing.id;
  } else {
    // Insert new memory
    const stmt = db.prepare(`
      INSERT INTO memories (key, value, category, importance, embedding)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(key, value, category, importance, embeddingBlob);
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
 * Search memories by query (Semantic Search with SQL Fallback)
 */
async function searchMemories(query) {
  const allMemories = db.prepare('SELECT * FROM memories').all();
  if (allMemories.length === 0) return [];

  const queryEmbedding = await generateEmbedding(query);

  if (!queryEmbedding) {
    // Fallback to SQL LIKE if embedding fails
    const stmt = db.prepare(`
      SELECT * FROM memories
      WHERE key LIKE ? OR value LIKE ?
      ORDER BY importance DESC
    `);
    const pattern = `%${query}%`;
    return stmt.all(pattern, pattern);
  }

  // Calculate semantic similarity for all memories
  const scoredMemories = allMemories.map(memory => {
    let similarity = 0;
    if (memory.embedding) {
      // Reconstruct Float32Array from BLOB Buffer
      const memEmbedding = new Float32Array(memory.embedding.buffer, memory.embedding.byteOffset, memory.embedding.byteLength / 4);
      similarity = cosineSimilarity(queryEmbedding, memEmbedding);
    } else {
      // Very basic fallback score if no embedding
      similarity = (memory.key.includes(query) || memory.value.includes(query)) ? 0.5 : 0;
    }
    
    // Boost score slightly by importance
    const finalScore = similarity + (memory.importance * 0.05);
    return { ...memory, _score: finalScore };
  });

  // Sort by score and filter out low relevance (score < 0.3)
  const results = scoredMemories
    .filter(m => m._score > 0.3)
    .sort((a, b) => b._score - a._score);
    
  return results.slice(0, 10);
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
  getConversationCountByThread,
  getLatestSummary,
  updateConversationSummary,
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
