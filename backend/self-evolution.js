// 🌙 LUNA AI — Self Evolution Engine
const fs = require('fs');
const path = require('path');
const db = require('./database');
const brain = require('./brain-manager');
const memory = require('./memory');

const FORBIDDEN_FILES = ['main.js', 'preload.js', 'backend/ipc-bridge.js'];

function analysePerformance() {
  const convos = db.prepare(`
    SELECT role, content, timestamp
    FROM conversations
    ORDER BY id DESC
    LIMIT 100
  `).all();
  const weaknesses = [], strengths = [];
  let tooLong = 0, failed = 0, corrections = 0;
  for (const c of convos) {
    if (c.role === 'user') {
      const l = c.content.toLowerCase();
      if (l.includes('too long') || l.includes('keep it short')) tooLong++;
      if (l.includes('wrong') || l.includes('no that')) corrections++;
    }
    if (c.role === 'luna' && c.content.includes("can't")) failed++;
  }
  if (tooLong > 3) weaknesses.push(`User asked shorter responses ${tooLong} times`);
  if (failed > 2) weaknesses.push(`Failed ${failed} tasks`);
  if (corrections > 3) weaknesses.push(`Corrected ${corrections} times`);
  if (tooLong === 0) strengths.push('Good response length');
  if (failed === 0) strengths.push('All tasks completed');
  if (weaknesses.length === 0) {
    strengths.push('No major friction signals found in recent conversations');
  }

  return {
    success: true,
    weaknesses,
    strengths,
    suggestions: weaknesses.map((w) => `Investigate and improve: ${w}`),
    conversationCount: convos.length
  };
}

function createBackup(filePath) {
  const dir = path.join(__dirname, '..', 'database', 'backups');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const bp = path.join(dir, `${Date.now()}_${path.basename(filePath)}`);
  fs.copyFileSync(filePath, bp);
  return bp;
}

function rollback(logId) {
  const e = db.prepare('SELECT * FROM self_evolution_log WHERE id = ?').get(logId);
  if (!e?.backup_path) return { success: false, error: 'invalid' };
  try { fs.copyFileSync(e.backup_path, e.file_changed); db.prepare('UPDATE self_evolution_log SET rolled_back=1 WHERE id=?').run(logId); return { success: true }; }
  catch (err) { return { success: false, error: err.message }; }
}

function getEvolutionHistory() {
  return db.prepare('SELECT * FROM self_evolution_log ORDER BY timestamp DESC LIMIT 50').all()
    .map(e => {
       let status = 'failed';
       if (e.rolled_back) status = 'rolled_back';
       else if (e.success === 1) status = 'applied';
       else if (e.success === 0 && e.change_type === 'proposal') status = 'proposed';
       else if (e.success === -1) status = 'rejected';
       return { ...e, status };
    });
}

async function runEvolutionCycle() {
  const analysis = analysePerformance();
  const loggedWeaknesses = analysis.weaknesses.slice(0, 3);
  for (const w of loggedWeaknesses) {
    const prompt = `You are Luna's self-evolution engine. Weakness found: "${w}". Propose a fix for a specific file in the backend or src folder. Return ONLY valid JSON: {"file": "backend/luna-core.js", "description": "Improve X by doing Y", "code": "// full file code with fix applied", "test": "// test function to verify logic", "risk": "low|medium|high"}`;
    const res = await brain.smartCall([{role: 'user', content: prompt}], 'You are an expert JS dev. Return ONLY valid JSON.', 'code');
    
    try {
      const cleanJson = res.content.match(/\{[\s\S]*\}/)?.[0] || res.content;
      const proposal = JSON.parse(cleanJson);
      
      if (FORBIDDEN_FILES.some(f => proposal.file.endsWith(f)) || proposal.file.includes('node_modules')) {
         continue; // Silently skip forbidden bounds
      }
      
      db.prepare('INSERT INTO self_evolution_log (change_type, description, file_changed, proposed_code, proposed_test, risk_score, success) VALUES (?,?,?,?,?,?,?)')
        .run('proposal', proposal.description, proposal.file, proposal.code, proposal.test || '', proposal.risk || 'low', 0);
    } catch(e) {
      db.prepare('INSERT INTO self_evolution_log (change_type, description, success) VALUES (?,?,?)').run('proposal', `Failed to generate parseable proposal for: ${w}`, -1);
    }
  }
  if (loggedWeaknesses.length === 0) {
    db.prepare('INSERT INTO self_evolution_log (change_type, description, success) VALUES (?,?,?)')
      .run('analysis', 'No actionable weaknesses found in current cycle', 1);
  }

  console.log('Evolution cycle complete');
  return {
    success: true,
    analysis,
    message: `analyzed ${analysis.conversationCount} convos, found ${analysis.weaknesses.length} issues`
  };
}

function applyProposal(logId) {
  const row = db.prepare('SELECT * FROM self_evolution_log WHERE id = ?').get(logId);
  if (!row || !row.proposed_code) return { success: false, error: 'Invalid proposal' };
  
  const sandbox = require('./evolution-sandbox');
  const check = sandbox.testCode(row.proposed_code, row.proposed_test, row.file_changed);
  if (!check.passed) {
     db.prepare('UPDATE self_evolution_log SET success = -1 WHERE id = ?').run(logId);
     return { success: false, error: 'Sandbox verification failed: ' + check.errors.join(', ') };
  }
  
  try {
    const targetPath = path.join(__dirname, '..', row.file_changed);
    if (!fs.existsSync(targetPath)) return { success: false, error: 'Target file does not exist' };
    
    const bp = createBackup(targetPath);
    fs.writeFileSync(targetPath, row.proposed_code, 'utf-8');
    db.prepare('UPDATE self_evolution_log SET success = 1, backup_path = ? WHERE id = ?').run(bp, logId);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function rejectProposal(logId) {
  db.prepare('UPDATE self_evolution_log SET success = -1 WHERE id = ?').run(logId);
  return { success: true };
}

module.exports = { analysePerformance, createBackup, rollback, getEvolutionHistory, runEvolutionCycle, applyProposal, rejectProposal };
