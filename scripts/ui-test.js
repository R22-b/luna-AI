// 🌙 Luna AI — UI Test Automation
const { _electron: electron } = require('playwright');
const path = require('path');
const fs = require('fs');

async function run() {
  console.log('🚀 Starting Electron UI Automated Test...');
  const workspacePath = path.join(require('os').homedir(), 'OneDrive', 'Desktop', 'Luna_Workspace', 'proofs');
  if (!fs.existsSync(workspacePath)) fs.mkdirSync(workspacePath, { recursive: true });

  // Launch Electron app
  const electronApp = await electron.launch({ 
    args: ['.'],
    env: process.env 
  });
  
  // Get the first window
  const window = await electronApp.firstWindow();
  console.log('✅ Window captured. Starting navigation...');

  // Wait for React to load
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(3000); // Give Vite time to render

  // 1. Dashboard Proof
  console.log('📸 Taking Dashboard screenshot...');
  await window.screenshot({ path: path.join(workspacePath, '1-dashboard.png') });

  // 2. Chat Navigation & Typing Proof
  console.log('💬 Testing Chat interface...');
  await window.click('text=Chat');
  await window.waitForTimeout(1000);
  await window.fill('input[type="text"], textarea', 'Hello Luna, this is an automated UI test.');
  await window.screenshot({ path: path.join(workspacePath, '2-chat-typing.png') });
  
  // Submit message
  await window.keyboard.press('Enter');
  await window.waitForTimeout(2000);
  await window.screenshot({ path: path.join(workspacePath, '3-chat-submitted.png') });

  // 3. Settings & Buttons Proof
  console.log('⚙️ Testing Settings and Buttons...');
  await window.click('text=Settings');
  await window.waitForTimeout(1000);
  await window.screenshot({ path: path.join(workspacePath, '4-settings-page.png') });

  // 4. Student Mode Navigation
  console.log('📚 Testing Student Mode...');
  await window.click('text=Student Mode');
  await window.waitForTimeout(1000);
  await window.screenshot({ path: path.join(workspacePath, '5-student-mode.png') });

  console.log('🎉 UI tests complete. Closing app.');
  await electronApp.close();
  
  console.log('\n======================================');
  console.log('✅ UI TEST PASS: All screens rendered.');
  console.log('📸 PROOFS SAVED TO: ' + workspacePath);
  console.log('======================================\n');
}

run().catch(e => {
  console.error('❌ UI Test Failed:', e);
  process.exit(1);
});
