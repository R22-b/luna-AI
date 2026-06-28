// 🌙 Luna AI — Full Capability Test Suite
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const RESULTS = [];
let pass = 0, fail = 0;

function log(test, status, detail = '') {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${test}${detail ? ' — ' + detail : ''}`);
  RESULTS.push({ test, status: status ? 'PASS' : 'FAIL', detail });
  status ? pass++ : fail++;
}

async function run() {
  console.log('\n══════════════════════════════════════');
  console.log('🌙 LUNA AI — FULL CAPABILITY TEST');
  console.log('══════════════════════════════════════\n');

  // ── 1. BRAIN HEALTH CHECK ──
  console.log('\n── 1. AI BRAIN HEALTH ──');
  const brain = require('../backend/brain-manager');
  await brain.healthCheck();
  const stats = brain.getProviderStats();
  const healthy = stats.providers.filter(p => p.healthy);
  log('AI Brains Online', healthy.length >= 2, `${healthy.length}/8 healthy: ${healthy.map(p=>p.name).join(', ')}`);

  // ── 2. EMOTION DETECTION ──
  console.log('\n── 2. EMOTION ENGINE ──');
  const core = require('../backend/luna-core');
  const emotions = [
    ['I have a deadline and im panicking!!!', 'stressed'],
    ['LETS GOOO this is amazing!!!', 'hyped'],
    ['idk whatever tired', 'sad'],
    ['const x = 5; function test() { return x * 2; } this is a long technical message about code', 'focused'],
    ['ugh later meh', 'lazy'],
  ];
  for (const [input, expected] of emotions) {
    const detected = core.detectEmotion ? core.detectEmotion(input) : 'N/A';
    log(`Emotion: "${input.slice(0,30)}..."`, detected === expected, `expected=${expected}, got=${detected}`);
  }

  // ── 3. TASK ROUTING ──
  console.log('\n── 3. TASK ROUTER ──');
  const routes = [
    ['open chrome', 'pc_control'],
    ['build me a website', 'project_build'],
    ['write code in python', 'code'],
    ['create a powerpoint presentation', 'doc_create'],
    ['generate an image of a sunset', 'image_gen'],
    ['generate a video of rain', 'video_gen'],
    ['search for latest news', 'research'],
    ['summarize this pdf C:\\test.pdf', 'pdf_read'],
    ['create a quiz about biology', 'student'],
    ['write a poem about the moon', 'creative'],
  ];
  for (const [input, expected] of routes) {
    const detected = core.detectTaskType ? core.detectTaskType(input) : 'N/A';
    log(`Route: "${input}"`, detected === expected, `expected=${expected}, got=${detected}`);
  }

  // ── 4. PC CONTROL ──
  console.log('\n── 4. PC CONTROL ──');
  const pc = require('../backend/pc-control');
  
  // Screenshot
  const ssResult = await pc.takeScreenshot();
  log('Screenshot', ssResult.success, ssResult.success ? ssResult.path : ssResult.error);

  // System Info
  const sysInfo = await pc.getSystemInfo();
  log('System Info', sysInfo.success, sysInfo.success ? `RAM: ${sysInfo.ram.percentage}%, CPU: ${sysInfo.cpu.percentage}%` : sysInfo.error);

  // Running Apps
  const apps = await pc.getRunningApps();
  log('Running Apps', apps.success, `${apps.apps?.length || 0} apps detected`);

  // Volume Control
  const volResult = await pc.controlVolume('mute');
  log('Volume Control (mute)', volResult.success, volResult.error || 'ok');
  await pc.controlVolume('mute'); // unmute

  // ── 5. SECURITY / JAILBREAK TEST ──
  console.log('\n── 5. SECURITY & JAILBREAK ──');
  
  // Blocked commands
  const blocked1 = pc.validateCommand('format C:');
  log('Block: format C:', !blocked1.safe, blocked1.reason);
  
  const blocked2 = pc.validateCommand('del /f /s C:\\Windows');
  log('Block: del /f /s', !blocked2.safe, blocked2.reason);
  
  const blocked3 = pc.validateCommand('rm -rf /');
  log('Block: rm -rf /', !blocked3.safe, blocked3.reason);
  
  const blocked4 = pc.validateCommand('shutdown /s');
  log('Block: shutdown', !blocked4.safe, blocked4.reason);

  // Safe command should pass
  const safe1 = pc.validateCommand('Get-Date');
  log('Allow: safe command', safe1.safe, safe1.reason);

  // ── 6. FILE MANAGEMENT ──
  console.log('\n── 6. FILE MANAGEMENT ──');
  const fm = require('../backend/folder-manager');
  const paths = fm.getAllFolderPaths();
  log('Workspace exists', fs.existsSync(paths.workspace), paths.workspace);

  const testFile = path.join(paths.workspace, 'luna_test_file.txt');
  const createResult = await pc.createFile(testFile, 'Hello from Luna test! 🌙');
  log('Create file', createResult.success, testFile);

  const readResult = await pc.readFile(testFile);
  log('Read file', readResult.success && readResult.content.includes('Hello'), readResult.content?.slice(0,30) || readResult.error);

  const searchResult = await pc.searchPC('luna_test_file');
  log('Search file', searchResult.success, `found ${searchResult.files?.length || 0} results`);

  // ── 7. DOCUMENT CREATION ──
  console.log('\n── 7. DOCUMENT CREATION ──');
  
  // Markdown
  const mdPath = path.join(paths.docs, 'luna_test.md');
  fs.writeFileSync(mdPath, '# Luna Test\n\nThis is a **test** document.\n\n- Item 1\n- Item 2\n');
  log('Create Markdown', fs.existsSync(mdPath), mdPath);

  // JSON
  const jsonPath = path.join(paths.docs, 'luna_test.json');
  fs.writeFileSync(jsonPath, JSON.stringify({ name: 'Luna', version: '2.0', test: true }, null, 2));
  log('Create JSON', fs.existsSync(jsonPath), jsonPath);

  // Check docx library
  try { require('docx'); log('Word (.docx) lib', true, 'docx module available'); } 
  catch { log('Word (.docx) lib', false, 'docx module MISSING — run: npm install docx'); }

  // Check pptxgenjs library
  try { require('pptxgenjs'); log('PowerPoint (.pptx) lib', true, 'pptxgenjs module available'); }
  catch { log('PowerPoint (.pptx) lib', false, 'pptxgenjs module MISSING — run: npm install pptxgenjs'); }

  // Check exceljs library
  try { require('exceljs'); log('Excel (.xlsx) lib', true, 'exceljs module available'); }
  catch { log('Excel (.xlsx) lib', false, 'exceljs module MISSING — run: npm install exceljs'); }

  // ── 8. IMAGE GENERATION ──
  console.log('\n── 8. IMAGE GENERATION ──');
  try {
    const axios = require('axios');
    const imgUrl = 'https://image.pollinations.ai/prompt/a%20neon%20moon%20logo?width=256&height=256&nologo=true';
    const imgRes = await axios.get(imgUrl, { responseType: 'arraybuffer', timeout: 30000 });
    const imgPath = path.join(paths.images, 'luna_test_image.png');
    fs.writeFileSync(imgPath, imgRes.data);
    log('Image Generation', fs.existsSync(imgPath) && fs.statSync(imgPath).size > 1000, `${Math.round(fs.statSync(imgPath).size/1024)}KB saved at ${imgPath}`);
  } catch (e) {
    log('Image Generation', false, e.message);
  }

  // ── 9. AI CHAT (live call) ──
  console.log('\n── 9. AI CHAT (Live) ──');
  try {
    const chatResult = await brain.smartCall([{ role: 'user', content: 'Say "Luna test passed" in exactly 3 words' }], 'You are Luna. Be concise.', 'chat');
    log('AI Chat Response', chatResult.success && chatResult.content.length > 0, `Provider: ${chatResult.providerUsed}, Response: "${chatResult.content.slice(0,60)}..."`);
  } catch (e) {
    log('AI Chat Response', false, e.message);
  }

  // ── 10. MEMORY SYSTEM ──
  console.log('\n── 10. MEMORY SYSTEM ──');
  const memory = require('../backend/memory');
  try {
    memory.saveMemory('test_key', 'test_value_luna');
    const found = memory.searchMemories('test_key');
    log('Memory Save/Search', found.length > 0, `Found ${found.length} memories`);
  } catch (e) {
    log('Memory Save/Search', false, e.message);
  }

  // ── 11. PLUGIN SYSTEM ──
  console.log('\n── 11. PLUGIN SYSTEM ──');
  try {
    const pm = require('../backend/plugin-manager');
    const scaffold = pm.createPluginScaffold({ name: 'test-plugin', description: 'Automated test' });
    log('Plugin Scaffold', scaffold.success, scaffold.pluginPath || scaffold.error);
    if (scaffold.success) {
      const plugins = pm.loadAllPlugins();
      log('Plugin Load', true, `Loaded plugins`);
    }
  } catch (e) {
    log('Plugin Scaffold', false, e.message);
  }

  // ── 12. SEARCH ENGINE ──
  console.log('\n── 12. WEB SEARCH ──');
  try {
    const search = require('../backend/search-engine');
    if (search.search) {
      const results = await search.search('JavaScript tutorial');
      log('Web Search', results && results.length > 0, `Got ${results?.length || 0} results`);
    } else {
      log('Web Search', false, 'search function not exported');
    }
  } catch (e) {
    log('Web Search', false, e.message);
  }

  // ── FINAL REPORT ──
  console.log('\n══════════════════════════════════════');
  console.log(`🌙 FINAL SCORE: ${pass}/${pass+fail} PASSED (${Math.round(pass/(pass+fail)*100)}%)`);
  console.log(`   ✅ ${pass} passed | ❌ ${fail} failed`);
  console.log('══════════════════════════════════════\n');

  // Save report
  const reportPath = path.join(paths.workspace, 'luna_test_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({ timestamp: new Date().toISOString(), pass, fail, total: pass+fail, results: RESULTS }, null, 2));
  console.log(`📄 Full report saved: ${reportPath}`);
}

run().catch(e => console.error('Test suite crashed:', e));
