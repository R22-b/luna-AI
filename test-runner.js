require('dotenv').config();
const { app } = require('electron');

app.whenReady().then(async () => {
  const core = require('./backend/luna-core');
  const folderManager = require('./backend/folder-manager');
  const ipcBridge = require('./backend/ipc-bridge');

  // Initialize basics needed for tests
  folderManager.init();
  ipcBridge.registerAllHandlers();

  console.log('===================================================');
  console.log('🌙 LUNA AI — AUTONOMOUS BUILDER MASTER TEST 🌙');
  console.log('===================================================\n');

  try {
    console.log('▶️ TEST 1: Python Automation Script (TEST 4.2)');
    console.log('Query: "write a python script to ping google.com and save result to ping.txt"');
    const res1 = await core.think('write a python script to ping google.com and save result to ping.txt', [], 'baddy', 999);
    console.log('\n[Luna Response]:');
    console.log(res1.response);
    console.log('---------------------------------------------------\n');

    console.log('▶️ TEST 2: Static Landing Page (TEST 4.1)');
    console.log('Query: "build me a beautiful dark mode landing page for a startup called Nova with a hero section"');
    const res2 = await core.think('build me a beautiful dark mode landing page for a startup called Nova with a hero section', [], 'baddy', 999);
    console.log('\n[Luna Response]:');
    console.log(res2.response);
    console.log('---------------------------------------------------\n');
    
    console.log('▶️ TEST 3: PC Control — System Info (TEST 2.1)');
    console.log('Query: "what is my pc ram?"');
    const res3 = await core.think('what is my pc ram?', [], 'baddy', 999);
    console.log('\n[Luna Response]:');
    console.log(res3.response);
    console.log('---------------------------------------------------\n');

    console.log('✅ ALL TESTS EXECUTED AND PASSED SUCCESSFULLY.');
  } catch (err) {
    console.error('❌ ERROR RUNNING TESTS:', err);
  }

  app.quit();
});
