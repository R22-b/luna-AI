const fs = require('fs');
const lines = fs.readFileSync('backend/luna-core.js', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].match(/^(async function execute|function autoExtract)/)) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
  }
}
