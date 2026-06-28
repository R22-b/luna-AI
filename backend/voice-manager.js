// 🌙 LUNA AI — Voice Manager (TTS via edge-tts)
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

let isSpeaking = false;

async function speak(text) {
  if (!text || isSpeaking) return;
  isSpeaking = true;
  
  const cleanText = text.replace(/"/g, '\\"').replace(/\n/g, ' ');
  const tmpFile = path.join(os.tmpdir(), `luna_tts_${Date.now()}.wav`);
  let edgeTtsSuccess = false;

  try {
    // Attempt high-quality edge-tts (optional enhancement)
    await new Promise((resolve, reject) => {
      const edgeTts = spawn('npx', ['edge-tts', '--voice', 'en-US-AriaNeural', '--text', text, '--write-media', tmpFile], { shell: true, timeout: 8000 });
      edgeTts.on('close', (code) => code === 0 ? resolve() : reject(new Error(`exit ${code}`)));
      edgeTts.on('error', reject);
    });
    
    if (fs.existsSync(tmpFile)) {
      await new Promise((resolve) => {
        const player = spawn('powershell.exe', ['-NoProfile', '-Command',
          `$p = New-Object System.Media.SoundPlayer("${tmpFile}"); $p.PlaySync()`], { shell: false });
        player.on('close', resolve);
        player.on('error', resolve);
      });
      edgeTtsSuccess = true;
      try { fs.unlinkSync(tmpFile); } catch {}
    }
  } catch (err) {
    // Silently catch npx/edge-tts failures. It's an optional enhancement.
  }

  // Fallback to built-in Windows TTS (guaranteed to exist)
  if (!edgeTtsSuccess) {
    try {
      await new Promise((resolve) => {
        const psCmd = `Add-Type -AssemblyName System.Speech; $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer; $synth.Speak("${cleanText}")`;
        const player = spawn('powershell.exe', ['-NoProfile', '-Command', psCmd], { shell: false });
        player.on('close', resolve);
        player.on('error', resolve);
      });
    } catch (fallbackErr) {
      // Only log if the ultimate fallback fails
      console.error('[Voice] Critical TTS failure:', fallbackErr.message);
    }
  }
  
  isSpeaking = false;
}

function stopSpeaking() { isSpeaking = false; }

module.exports = { speak, stopSpeaking, get isSpeaking() { return isSpeaking; } };
