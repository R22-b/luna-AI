// 🌙 LUNA AI — Evolution Sandbox (safe code testing)

const ivm = require('isolated-vm');

const FORBIDDEN_FILES = ['main.js', 'preload.js', 'backend/ipc-bridge.js', 'backend/database.js'];

function testCode(code, testScript, filename = '') {
  const errors = [];
  if (FORBIDDEN_FILES.some(f => filename.endsWith(f)) || filename.includes('node_modules')) {
    errors.push(`Modification of ${filename} is strictly forbidden by core safety rules.`);
    return { passed: false, errors, output: '' };
  }

  let isolate;
  try {
    // 64MB hard memory limit
    isolate = new ivm.Isolate({ memoryLimit: 64 });
    const context = isolate.createContextSync();
    const global = context.global;

    // Provide a mocked safe console
    global.setSync('global', global.derefInto());
    const logBuffer = [];
    context.evalSync(`
      global.console = {
        log: function(...args) {
          _log(args.join(' '));
        }
      };
    `);
    
    global.setSync('_log', function(msg) {
      logBuffer.push(String(msg));
    });

    // Compile and run the proposed code first to ensure it's syntactically valid and initializes safely
    const compiledCode = isolate.compileScriptSync(code);
    compiledCode.runSync(context, { timeout: 1000 }); // 1 second timeout

    // Now run the verification test against it
    if (testScript) {
      const compiledTest = isolate.compileScriptSync(testScript);
      compiledTest.runSync(context, { timeout: 1000 });
    }

    return { passed: true, errors: [], output: logBuffer.join('\n') || 'Verification passed' };
  } catch (err) {
    errors.push(err.message);
    return { passed: false, errors, output: '' };
  } finally {
    if (isolate) {
      isolate.dispose();
    }
  }
}

module.exports = { testCode };
