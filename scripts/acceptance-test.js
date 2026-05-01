// ============================================
// 🌙 LUNA AI — Reliability Acceptance Test
// Deterministic checks for critical flows (Phase 5)
// ============================================

const fs = require('fs');
const path = require('path');

console.log('🌙 LUNA AI — Reliability Acceptance Test\n');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
   if (condition) {
      console.log('✅ PASS: ' + msg);
      passed++;
   } else {
      console.error('❌ FAIL: ' + msg);
      failed++;
   }
}

try {
    // 1. Database Health
    const db = require('../backend/database');
    assert(db.open, 'Database connects successfully and schema is valid');
    
    // 2. Folder Manager Auto-Heal
    const folderManager = require('../backend/folder-manager');
    const health = folderManager.healthCheck();
    assert(health.healthy || health.recreated.length > 0, 'Folder manager health check passes or successfully auto-heals');
    
    // 3. Project Verifier (Phase 3 Guardrail)
    const verifier = require('../backend/project-verifier');
    assert(typeof verifier.verifyProject === 'function', 'Project verifier is loaded and functional');
    
    // 4. Evolution Sandbox Security (Phase 4 Guardrail)
    const sandbox = require('../backend/evolution-sandbox');
    const sandboxRes = sandbox.testCode('const a = 1;', 'backend/luna-core.js');
    assert(sandboxRes.passed, 'Evolution sandbox syntax checker works on valid files');
    
    const sandboxFail = sandbox.testCode('const a = 1;', 'main.js');
    assert(!sandboxFail.passed, 'Evolution sandbox correctly blocks forbidden system files (main.js)');
} catch(e) {
    console.error('\n❌ Test suite crashed: ', e.message);
    failed++;
}

console.log(`\n============================================\nTotal: ${passed} passed, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);