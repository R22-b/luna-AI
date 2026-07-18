const fs = require('fs');
const path = require('path');

function checkFile(filePath, searchString) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ Missing: ${filePath}`);
    return false;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const found = content.includes(searchString);
  console.log(`${found ? '✅' : '❌'} ${filePath}: ${searchString.substring(0, 30)}...`);
  return found;
}

console.log('🏁 Final Verification of Fixes:');

// 1. Security
checkFile('main.js', 'webSecurity: true');
checkFile('backend/search-engine.js', 'getSearchKey(\'SERPER_API_KEY\')');

// 2. Health Checks
checkFile('backend/brain-manager.js', 'setInterval(healthCheck, 5 * 60 * 1000)');

// 3. UI Gaps
checkFile('src/pages/PluginsPage.jsx', 'createScaffold(plugin.name, plugin.desc)');
checkFile('src/pages/GuardianPage.jsx', 'PROJECT GUARDIAN');
const guardianContent = fs.readFileSync('src/pages/GuardianPage.jsx', 'utf-8');
if (guardianContent.includes('Upcoming Feature')) {
  console.log('❌ GuardianPage still has placeholder');
} else {
  console.log('✅ GuardianPage placeholder removed');
}

// 4. README
checkFile('README.md', '~7.7 Billion tokens/month');

console.log('\nVerification Complete!');
