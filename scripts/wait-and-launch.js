// Wait for Vite dev server to be ready, then launch Electron
const { execSync, spawn } = require('child_process');
const http = require('http');

const VITE_URL = 'http://127.0.0.1:5173';
const MAX_RETRIES = 30;
const RETRY_INTERVAL = 1000;

let retries = 0;

function checkVite() {
  http.get(VITE_URL, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Vite dev server is ready — launching Electron...');
      const electron = spawn('npx', ['electron', '.'], {
        stdio: 'inherit',
        shell: true,
        cwd: process.cwd(),
      });
      electron.on('close', () => process.exit(0));
    } else {
      retry();
    }
  }).on('error', () => {
    retry();
  });
}

function retry() {
  retries++;
  if (retries >= MAX_RETRIES) {
    console.error('❌ Vite dev server did not start in time');
    process.exit(1);
  }
  console.log(`⏳ Waiting for Vite... (${retries}/${MAX_RETRIES})`);
  setTimeout(checkVite, RETRY_INTERVAL);
}

checkVite();
