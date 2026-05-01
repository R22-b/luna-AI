// 🌙 LUNA AI — Voice Manager (TTS via edge-tts)
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let isSpeaking = false;

async function speak(text) {
  if (!text || isSpeaking) return;
  isSpeaking = true;
  const tmpFile = path.join(os.tmpdir(), `luna_tts_${Date.now()}.wav`);
  try {
    await new Promise((resolve, reject) => {
      const edgeTts = spawn('npx', ['edge-tts', '--voice', 'en-US-AriaNeural', '--text', text, '--write-media', tmpFile], { shell: true, timeout: 15000 });
      edgeTts.on('close', (code) => code === 0 ? resolve() : reject(new Error(`edge-tts exit ${code}`)));
      edgeTts.on('error', reject);
    });
    if (fs.existsSync(tmpFile)) {
      await new Promise((resolve) => {
        const player = spawn('powershell.exe', ['-NoProfile', '-Command',
          `$p = New-Object System.Media.SoundPlayer("${tmpFile}"); $p.PlaySync()`], { shell: false });
        player.on('close', resolve);
        player.on('error', resolve);
      });
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  } catch (err) { console.error('Voice error:', err.message); }
  isSpeaking = false;
}

function stopSpeaking() { isSpeaking = false; }

module.exports = { speak, stopSpeaking, get isSpeaking() { return isSpeaking; } };
