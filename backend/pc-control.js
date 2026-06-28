// ============================================
// 🌙 LUNA AI — PC Control (Ghost Mode)
// Windows control via PowerShell + spawn
// shell:false ALWAYS — no shell injection
// ============================================

const { spawn } = require('child_process');
const path = require('path');
const { dialog } = require('electron');
const folderManager = require('./folder-manager');
const db = require('./database');

// Lazy load nut-js so it doesn't crash if native module fails on boot
let nut = null;
try {
  nut = require('@nut-tree-fork/nut-js');
  // Configure nut.js defaults
  nut.keyboard.config.autoDelayMs = 50;
  nut.mouse.config.autoDelayMs = 50;
} catch (err) {
  console.error('Failed to load nut-js:', err.message);
}

// ── Security Constants (HARDCODED — NEVER BYPASS) ──
const BLOCKED_PATHS = [
  'C:\\Windows\\System32',
  'C:\\Windows\\registry',
  'C:\\Program Files\\Windows',
  'C:\\Windows\\SysWOW64',
];

const BLOCKED_COMMANDS = [
  'format', 'del /f /s', 'rm -rf', 'reg delete',
  'net user', 'taskkill /f', 'shutdown /r', 'shutdown /s',
  'Remove-Item -Recurse -Force', 'Stop-Computer', 'Restart-Computer',
];

const COMMAND_TIMEOUT = 10000; // 10 seconds

// ══════════════════════════════════════════════
// VALIDATION
// ══════════════════════════════════════════════

function validateCommand(command, args = '') {
  const fullCmd = `${command} ${args}`.toLowerCase();

  // Check blocked commands
  for (const blocked of BLOCKED_COMMANDS) {
    if (fullCmd.includes(blocked.toLowerCase())) {
      return { safe: false, reason: `blocked command: ${blocked}` };
    }
  }

  // Check blocked paths
  for (const blockedPath of BLOCKED_PATHS) {
    if (fullCmd.includes(blockedPath.toLowerCase())) {
      return { safe: false, reason: `blocked path: ${blockedPath}` };
    }
  }

  return { safe: true, reason: 'ok' };
}

function validateFilePath(filePath) {
  const paths = folderManager.getAllFolderPaths();
  const workspace = paths.workspace;
  const media = paths.media;
  const resolved = path.resolve(filePath);

  // Only allow paths within Luna workspace or media folders
  if (resolved.startsWith(workspace) || resolved.startsWith(media)) {
    return { safe: true };
  }

  return { safe: false, reason: `file access blocked — only allowed within Luna_Workspace or Luna_Media` };
}

// ══════════════════════════════════════════════
// POWERSHELL EXECUTION
// ══════════════════════════════════════════════

function runPowerShell(command) {
  return new Promise((resolve) => {
    // Validate first
    const validation = validateCommand(command);
    if (!validation.safe) {
      resolve({ success: false, output: '', error: `🔒 ${validation.reason}` });
      return;
    }

    let stdout = '';
    let stderr = '';

    const buffer = Buffer.from(command, 'utf16le');
    const base64 = buffer.toString('base64');
    const ps = spawn('powershell.exe', [
      '-NoProfile', '-NonInteractive', '-EncodedCommand', base64,
    ], {
      shell: false, // ALWAYS false — no shell injection
      timeout: COMMAND_TIMEOUT,
    });

    ps.stdout.on('data', (data) => { stdout += data.toString(); });
    ps.stderr.on('data', (data) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      ps.kill();
      resolve({ success: false, output: stdout, error: 'command timed out (10s limit)' });
    }, COMMAND_TIMEOUT);

    ps.on('close', (code) => {
      clearTimeout(timer);
      resolve({
        success: code === 0,
        output: stdout.trim(),
        error: stderr.trim() || (code !== 0 ? `exit code: ${code}` : ''),
      });
    });

    ps.on('error', (err) => {
      clearTimeout(timer);
      resolve({ success: false, output: '', error: err.message });
    });
  });
}

// ═══════════════════════════════════════════
// APP ALLOWLIST (from Luna v1 — tried and tested)
// ═══════════════════════════════════════════

const APP_MAP = {
  'notepad': 'notepad.exe',
  'calculator': 'calc.exe',
  'calc': 'calc.exe',
  'paint': 'mspaint.exe',
  'explorer': 'explorer.exe',
  'file explorer': 'explorer.exe',
  'files': 'explorer.exe',
  'chrome': 'chrome.exe',
  'google chrome': 'chrome.exe',
  'firefox': 'firefox.exe',
  'edge': 'msedge.exe',
  'microsoft edge': 'msedge.exe',
  'brave': 'brave.exe',
  'opera': 'opera.exe',
  'vscode': 'code.cmd',
  'vs code': 'code.cmd',
  'visual studio code': 'code.cmd',
  'sublime': 'subl.exe',
  'sublime text': 'subl.exe',
  'spotify': 'spotify.exe',
  'discord': 'Discord.exe',
  'slack': 'slack.exe',
  'teams': 'ms-teams.exe',
  'microsoft teams': 'ms-teams.exe',
  'zoom': 'Zoom.exe',
  'obs': 'obs64.exe',
  'vlc': 'vlc.exe',
  'terminal': 'wt.exe',
  'windows terminal': 'wt.exe',
  'powershell': 'powershell.exe',
  'cmd': 'cmd.exe',
  'settings': 'ms-settings:',
  'setting': 'ms-settings:',
  'control panel': 'control',
  'steam': 'steam.exe',
  'blender': 'blender.exe',
  'gimp': 'gimp-2.10.exe',
  'postman': 'Postman.exe',
  'figma': 'Figma.exe',
  'notion': 'Notion.exe',
  'word': 'WINWORD.EXE',
  'excel': 'EXCEL.EXE',
  'powerpoint': 'POWERPNT.EXE',
  'pycharm': 'pycharm64.exe',
  'android studio': 'studio64.exe',
  'audacity': 'audacity.exe',
  'telegram': 'Telegram.exe',
  'whatsapp': 'whatsapp:', // Windows 10/11 UWP App URI
  'file manager': 'explorer.exe',
  'downloads': 'explorer.exe shell:Downloads',
  'documents': 'explorer.exe shell:Personal',
  'pictures': 'explorer.exe shell:My Pictures',
  'videos': 'explorer.exe shell:My Video',
  'desktop': 'explorer.exe shell:Desktop',
  'music': 'explorer.exe shell:My Music',
};

async function openApp(appName, urlArg) {
  if (!appName) return { success: false, error: 'app name required' };

  const lower = appName.toLowerCase().trim();

  // Try to find the app in our allowlist
  let exe = APP_MAP[lower];
  if (exe) {
    // If it's a shell folder command (e.g. explorer.exe shell:Downloads)
    if (exe.includes('explorer.exe shell:')) {
      return await runPowerShell(exe); // Run directly
    }
    if (urlArg) {
      return await runPowerShell(`Start-Process "${exe}" "${urlArg}"`);
    }
    return await runPowerShell(`Start-Process "${exe}"`);
  }

  // Smart: "open youtube" → open in default browser
  if (lower.match(/^[a-z0-9]+$/) && !lower.includes(' ') && lower.length < 20) {
    const url = `https://${lower}.com`;
    return await runPowerShell(`Start-Process "${url}"`);
  }

  // Fallback: try Start-Process with the raw name
  return await runPowerShell(`Start-Process "${appName}"`);
}

async function takeScreenshot() {
  const fs = require('fs');
  const paths = folderManager.getAllFolderPaths();
  const screenshotPath = path.join(paths.images, `screenshot_${Date.now()}.png`);

  const cmd = `
    Add-Type -AssemblyName System.Windows.Forms
    $screen = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
    $bitmap = New-Object System.Drawing.Bitmap($screen.Width, $screen.Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.CopyFromScreen($screen.Location, [System.Drawing.Point]::Empty, $screen.Size)
    $bitmap.Save("${screenshotPath.replace(/\\/g, '\\\\')}")
    $graphics.Dispose()
    $bitmap.Dispose()
  `;

  const result = await runPowerShell(cmd);

  if (result.success && fs.existsSync(screenshotPath)) {
    return { success: true, path: screenshotPath };
  }

  return { success: false, error: result.error || 'screenshot failed' };
}

async function getRunningApps() {
  const result = await runPowerShell(
    'Get-Process | Where-Object {$_.MainWindowTitle -ne ""} | Select-Object Name, Id, MainWindowTitle | ConvertTo-Json'
  );

  if (result.success) {
    try {
      let apps = JSON.parse(result.output);
      if (!Array.isArray(apps)) apps = [apps];
      return { success: true, apps: apps.map(a => ({ name: a.Name, id: a.Id, title: a.MainWindowTitle })) };
    } catch {
      return { success: true, apps: [] };
    }
  }

  return { success: false, apps: [], error: result.error };
}

async function getSystemInfo() {
  const cmd = `
    $os = Get-CimInstance Win32_OperatingSystem
    $cpu = (Get-CimInstance Win32_Processor).LoadPercentage
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    @{
      ram = @{
        total = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
        used = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 2)
        percentage = [math]::Round(100 - ($os.FreePhysicalMemory / $os.TotalVisibleMemorySize * 100), 1)
      }
      cpu = @{ percentage = if($cpu) { $cpu } else { 0 } }
      disk = @{
        total = [math]::Round($disk.Size / 1GB, 2)
        used = [math]::Round(($disk.Size - $disk.FreeSpace) / 1GB, 2)
        percentage = [math]::Round(100 - ($disk.FreeSpace / $disk.Size * 100), 1)
      }
    } | ConvertTo-Json -Depth 3
  `;

  const result = await runPowerShell(cmd);

  if (result.success) {
    try {
      const info = JSON.parse(result.output);
      return { success: true, ...info };
    } catch {
      return { success: false, error: 'failed to parse system info' };
    }
  }

  return { success: false, error: result.error };
}

async function controlVolume(action) {
  const commands = {
    up: '(New-Object -ComObject WScript.Shell).SendKeys([char]175)',
    down: '(New-Object -ComObject WScript.Shell).SendKeys([char]174)',
    mute: '(New-Object -ComObject WScript.Shell).SendKeys([char]173)',
  };

  const cmd = commands[action];
  if (!cmd) return { success: false, error: `unknown action: ${action}. use: up, down, mute` };

  return await runPowerShell(cmd);
}

async function setVolume(percentage) {
  // Use PowerShell Audio API to reliably set volume
  const normalized = Math.min(100, Math.max(0, percentage)) / 100;
  const cmd = `
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
[Guid("5CDF2C82-841E-4546-9722-0CF74078229A"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IAudioEndpointVolume {
  int NotImpl1(); int NotImpl2(); int NotImpl3(); int NotImpl4();
  int SetMasterVolumeLevelScalar(float fLevel, System.Guid pguidEventContext);
  int GetMasterVolumeLevelScalar(out float pfLevel);
}
[Guid("D666063F-1587-4E43-81F1-B948E807363F"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDevice { int Activate(ref Guid iid, int dwClsCtx, IntPtr pActivationParams, [MarshalAs(UnmanagedType.IUnknown)] out object ppInterface); }
[Guid("A95664D2-9614-4F35-A746-DE8DB63617E6"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
interface IMMDeviceEnumerator { int GetDefaultAudioEndpoint(int dataFlow, int role, out IMMDevice ppDevice); }
[ComImport, Guid("BCDE0395-E52F-467C-8E3D-C4579291692E")] class MMDeviceEnumerator {}
public class Audio {
  public static void SetVolume(float level) {
    var enumerator = new MMDeviceEnumerator() as IMMDeviceEnumerator;
    IMMDevice dev; enumerator.GetDefaultAudioEndpoint(0, 1, out dev);
    var iid = typeof(IAudioEndpointVolume).GUID;
    object o; dev.Activate(ref iid, 23, IntPtr.Zero, out o);
    var vol = (IAudioEndpointVolume)o;
    vol.SetMasterVolumeLevelScalar(level, Guid.Empty);
  }
}
'@
'@
try {
  [Audio]::SetVolume(${normalized})
  Write-Output 'Volume set to ${percentage}%'
} catch {
  Write-Error $_
  exit 1
}
`;
  const result = await runPowerShell(cmd);
  // Fallback: use SendKeys if the COM approach fails
  if (!result.success) {
    const obj = new Array(50).fill('(New-Object -ComObject WScript.Shell).SendKeys([char]174)').join(';');
    const up = new Array(Math.round(percentage/2)).fill('(New-Object -ComObject WScript.Shell).SendKeys([char]175)').join(';');
    return await runPowerShell(`${obj};${up}`);
  }
  return result;
}

async function controlMedia(action) {
  const commands = {
    play: '(New-Object -ComObject WScript.Shell).SendKeys([char]179)',
    pause: '(New-Object -ComObject WScript.Shell).SendKeys([char]179)',
    next: '(New-Object -ComObject WScript.Shell).SendKeys([char]176)',
    prev: '(New-Object -ComObject WScript.Shell).SendKeys([char]177)',
  };

  const cmd = commands[action];
  if (!cmd) return { success: false, error: `unknown action: ${action}` };

  return await runPowerShell(cmd);
}

async function openUrl(url) {
  if (!url || typeof url !== 'string') return { success: false, error: 'valid URL required' };

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return { success: false, error: 'invalid URL format' };
  }

  return await runPowerShell(`Start-Process "${url}"`);
}

async function createFile(filePath, content) {
  if (!filePath || content === undefined) {
    return { success: false, error: 'filePath and content required' };
  }

  const validation = validateFilePath(filePath);
  if (!validation.safe) {
    return { success: false, error: `🔒 ${validation.reason}` };
  }

  const fs = require('fs');
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function readFile(filePath) {
  if (!filePath) return { success: false, error: 'filePath required' };

  const validation = validateFilePath(filePath);
  if (!validation.safe) {
    return { success: false, error: `🔒 ${validation.reason}` };
  }

  const fs = require('fs');
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function searchPC(query) {
  if (!query) return { success: false, error: 'search query required' };

  const userHome = require('os').homedir();
  const cmd = `Get-ChildItem -Path "${userHome}" -Recurse -Name -Filter "*${query}*" -ErrorAction SilentlyContinue | Select-Object -First 20`;

  const result = await runPowerShell(cmd);

  if (result.success) {
    const files = result.output.split('\n').filter(f => f.trim()).map(f => path.join(userHome, f.trim()));
    return { success: true, files };
  }

  return { success: false, files: [], error: result.error };
}

// ══════════════════════════════════════════════
// MOUSE AND KEYBOARD AUTOMATION
// ══════════════════════════════════════════════

async function runAutomationSequence(actions) {
  if (!nut) {
    return { success: false, error: 'Automation library not loaded (native module failed)' };
  }

  // Check strict mode
  try {
    const strictRow = db.prepare('SELECT value FROM security_settings WHERE key = ?').get('strict_mode');
    if (strictRow && strictRow.value === 'true') {
      return { success: false, error: '🔒 Strict Mode is ON. Mouse and Keyboard automation is disabled.' };
    }
  } catch (err) {}

  if (!Array.isArray(actions) || actions.length === 0) {
    return { success: false, error: 'No actions provided' };
  }

  if (actions.length > 5) {
    return { success: false, error: '🔒 Security constraint: Cannot chain more than 5 actions per request.' };
  }

  // Ask for confirmation via Electron dialog
  const actionListStr = actions.map((a, i) => `${i+1}. ${a.type} ${JSON.stringify(a)}`).join('\n');
  const response = dialog.showMessageBoxSync({
    type: 'warning',
    buttons: ['Allow', 'Block'],
    defaultId: 1,
    title: 'Luna Guardian Protocol — Automation Request',
    message: 'Luna is requesting permission to take control of your mouse/keyboard.',
    detail: `Action Sequence:\n${actionListStr}\n\nDo you want to allow this? Press Ctrl+Shift+L anytime to abort.`,
  });

  if (response !== 0) { // User clicked Block or closed
    db.prepare(`INSERT INTO security_log (action, details, risk_level) VALUES (?, ?, ?)`).run('AUTOMATION_BLOCKED', 'User denied mouse/keyboard automation sequence.', 'high');
    return { success: false, error: 'User denied automation request' };
  }

  // Execute the sequence
  try {
    for (const action of actions) {
      db.prepare(`INSERT INTO security_log (action, details, risk_level) VALUES (?, ?, ?)`).run('AUTOMATION_EXEC', `Running: ${action.type}`, 'medium');
      
      if (action.type === 'mouseMove') {
        const p = new nut.Point(action.x, action.y);
        await nut.mouse.setPosition(p);
      } else if (action.type === 'click') {
        let btn = nut.Button.LEFT;
        if (action.button === 'right') btn = nut.Button.RIGHT;
        if (action.button === 'middle') btn = nut.Button.MIDDLE;
        if (action.double) {
          await nut.mouse.doubleClick(btn);
        } else {
          await nut.mouse.click(btn);
        }
      } else if (action.type === 'typeText') {
        await nut.keyboard.type(action.text);
      } else if (action.type === 'pressKey') {
        // Simple mapping, can be expanded
        let keyMap = {
          'enter': nut.Key.Enter, 'escape': nut.Key.Escape,
          'tab': nut.Key.Tab, 'space': nut.Key.Space,
          'win': nut.Key.LeftSuper, 'cmd': nut.Key.LeftSuper
        };
        let mapped = keyMap[action.key?.toLowerCase()];
        if (mapped !== undefined) {
          await nut.keyboard.type(mapped);
        }
      }
      // Small delay between actions
      await new Promise(r => setTimeout(r, 200));
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: `Automation failed: ${err.message}` };
  }
}

// ══════════════════════════════════════════════
// EXPORTS
// ══════════════════════════════════════════════

module.exports = {
  validateCommand,
  runPowerShell,
  openApp,
  takeScreenshot,
  runAutomationSequence,
  getRunningApps,
  getSystemInfo,
  controlVolume,
  setVolume,
  controlMedia,
  openUrl,
  createFile,
  readFile,
  searchPC,
};
