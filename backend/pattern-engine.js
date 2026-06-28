// 🌙 LUNA AI — Pattern Detection Engine

const db = require('./database');
const brain = require('./brain-manager');
const memory = require('./memory');

async function runDailyPatternAnalysis() {
  console.log('🌙 Running daily behavioral pattern analysis...');
  try {
    // 1. Fetch data from last 24 hours
    const recentConvos = db.prepare(`
      SELECT role, content, timestamp 
      FROM conversations 
      WHERE timestamp >= datetime('now', '-24 hours')
      ORDER BY id ASC
    `).all();

    if (recentConvos.length < 5) {
      console.log('Not enough conversations to analyze today.');
      return { success: true, newPatterns: 0 };
    }

    const recentGoals = db.prepare(`
      SELECT title, progress, status, deadline
      FROM goals
      WHERE created_at >= datetime('now', '-7 days')
    `).all();

    // 2. Format context for LLM
    const logData = recentConvos.map(c => `[${c.timestamp}] ${c.role}: ${c.content}`).join('\n');
    const goalData = recentGoals.map(g => `Goal: ${g.title} (${g.progress}%) - ${g.status}`).join('\n');

    const prompt = `
Analyze the following logs and goal updates from the last 24 hours.
Identify 1-3 new, distinct, and highly insightful behavioral, temporal, or emotional patterns about the user.
Examples: "User consistently asks coding questions after 10 PM", "User procrastinates on weekend goals", "User gets frustrated when discussing UI design".

Format the response as pure JSON matching this structure exactly:
[
  { "pattern": "string describing the pattern", "importance": 5 }
]
Score importance from 1 to 10. Only return the JSON array, no markdown formatting or other text.

Data:
--- CONVERSATIONS ---
${logData}
--- GOALS ---
${goalData}
    `.trim();

    // 3. Make LLM call
    const res = await brain.smartCall(
      [{ role: 'user', content: prompt }],
      'You are an expert psychological profiler and behavioral analyst. Return ONLY valid JSON.',
      'chat' // 'chat' is fine, we just regex parse the JSON
    );

    // 4. Parse the results
    const cleanJson = res.content.match(/\\[[\\s\\S]*\\]/)?.[0] || res.content;
    let newPatterns = [];
    try {
      newPatterns = JSON.parse(cleanJson);
    } catch (err) {
      console.error('Failed to parse patterns from LLM:', res.content);
      return { success: false, error: 'JSON Parse Error' };
    }

    if (!Array.isArray(newPatterns)) newPatterns = [];

    // 5. Store patterns and enforce Max 10 rule
    let addedCount = 0;
    for (const p of newPatterns) {
      if (p.pattern) {
        memory.saveMemory(
          p.pattern.substring(0, 50), // shortened key
          p.pattern,
          'behavioral_pattern',
          p.importance || 5
        );
        addedCount++;
      }
    }

    // 6. Enforce limit of 10 patterns
    const allPatterns = db.prepare(`
      SELECT id, importance 
      FROM memories 
      WHERE category = 'behavioral_pattern' 
      ORDER BY importance ASC, id ASC
    `).all();

    if (allPatterns.length > 10) {
      const overflow = allPatterns.length - 10;
      const toDelete = allPatterns.slice(0, overflow).map(p => p.id);
      db.prepare(`DELETE FROM memories WHERE id IN (${toDelete.map(() => '?').join(',')})`).run(toDelete);
      console.log(`Deleted ${overflow} low-importance patterns to maintain limit of 10.`);
    }

    console.log(`✅ Pattern analysis complete. Added ${addedCount} new patterns.`);
    return { success: true, newPatterns: addedCount };
  } catch (err) {
    console.error('❌ Pattern analysis failed:', err.message);
    return { success: false, error: err.message };
  }
}

function getStoredPatterns() {
  return db.prepare(`
    SELECT id, value as pattern, importance, created_at 
    FROM memories 
    WHERE category = 'behavioral_pattern' 
    ORDER BY importance DESC
  `).all();
}

function deletePattern(id) {
  try {
    const p = db.prepare('SELECT category FROM memories WHERE id = ?').get(id);
    if (!p || p.category !== 'behavioral_pattern') return { success: false, error: 'Not a pattern' };
    
    db.prepare('DELETE FROM memories WHERE id = ?').run(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  runDailyPatternAnalysis,
  getStoredPatterns,
  deletePattern
};
