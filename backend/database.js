// ============================================
// 🌙 LUNA AI — Database System
// SQLite database with all tables + WAL mode
// ============================================

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// ── Database Path ─────────────────────────────
const DB_DIR = path.join(__dirname, '..', 'database');
const DB_PATH = path.join(DB_DIR, 'luna.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// ── Connect ───────────────────────────────────
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

console.log('🌙 Database connected:', DB_PATH);

// ── Create Tables ─────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_threads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT 'New Conversation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    thread_id INTEGER DEFAULT 1,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    emotion_detected TEXT DEFAULT 'neutral',
    provider_used TEXT,
    summary TEXT,
    FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    importance INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    deadline DATETIME,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS self_evolution_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_type TEXT NOT NULL,
    description TEXT NOT NULL,
    file_changed TEXT,
    backup_path TEXT,
    success INTEGER DEFAULT 0,
    rolled_back INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_backups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    folder_path TEXT NOT NULL,
    backup_path TEXT NOT NULL,
    file_count INTEGER DEFAULT 0,
    size_mb REAL DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tool_registry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT UNIQUE NOT NULL,
    tool_code TEXT NOT NULL,
    description TEXT,
    created_by_luna INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS watched_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT NOT NULL,
    folder_path TEXT NOT NULL,
    last_backup DATETIME,
    backup_count INTEGER DEFAULT 0,
    is_watching INTEGER DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ── Migration: Add thread_id to conversations if missing ────────────────
try {
  db.prepare('ALTER TABLE conversations ADD COLUMN thread_id INTEGER DEFAULT 1').run();
  console.log('📦 Database Migrated: Added thread_id to conversations');
} catch (err) {
  // If column already exists, this will fail silently which is fine
}

// ── Migration: Ensure at least one thread exists ────────────────────────
const threadCount = db.prepare('SELECT COUNT(*) as count FROM chat_threads').get().count;
if (threadCount === 0) {
  db.prepare("INSERT INTO chat_threads (id, title) VALUES (1, 'Main Chat')").run();
  console.log('📦 Database Seeded: Created default chat thread');
}

// ── Migration: Self-Evolution Safety Columns ────────────────────────────
try {
  db.prepare('ALTER TABLE self_evolution_log ADD COLUMN proposed_code TEXT').run();
  db.prepare('ALTER TABLE self_evolution_log ADD COLUMN risk_score TEXT DEFAULT "low"').run();
} catch (err) {}

console.log('✅ All 9 database tables ready');

// ── Export ─────────────────────────────────────
module.exports = db;
