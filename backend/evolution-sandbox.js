// 🌙 LUNA AI — Evolution Sandbox (safe code testing)

const FORBIDDEN_FILES = ['main.js', 'preload.js', 'backend/ipc-bridge.js', 'backend/database.js'];

function testCode(code, filename = '') {
  const errors = [];
  if (FORBIDDEN_FILES.some(f => filename.endsWith(f)) || filename.includes('node_modules')) {
    errors.push(`Modification of ${filename} is strictly forbidden by core safety rules.`);
    return { passed: false, errors, output: '' };
  }

  try {
    new Function(code); // syntax check only
  } catch (err) {
    errors.push(err.message);
    return { passed: false, errors, output: '' };
  }
  return { passed: true, errors: [], output: 'syntax ok, security bounds checked' };
}

module.exports = { testCode };
