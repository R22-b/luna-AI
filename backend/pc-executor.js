const pc = require('./pc-control');
const path = require('path');
const fs = require('fs');
const folderManager = require('./folder-manager');
const brain = require('./brain-manager');

function emitActivity(message, icon = '⚡') {
  try {
    const win = require('./window-manager').getMainWindow();
    if (win && win.webContents) {
      win.webContents.send('luna:activity', { message, icon });
    }
  } catch(e){}
}

async function executePC(message, nickname) {
  const lower = message.toLowerCase();
  const responses = [];
  try {
    if (lower.includes('volume')) {
      if (lower.includes('up')) await pc.controlVolume('up');
      else if (lower.includes('down')) await pc.controlVolume('down');
      else if (lower.includes('mute')) await pc.controlVolume('mute');
      else if (lower.includes('max')) await pc.controlVolume('max');
      responses.push(`adjusted the volume for you ${nickname} 🔊`);
    }

    if (lower.includes('brightness')) {
      const levelMatch = message.match(/(\d+)/);
      const level = levelMatch ? parseInt(levelMatch[1]) : 50;
      await pc.controlBrightness(level);
      responses.push(`set brightness to ${level}% ${nickname} ☀️`);
    }

    if (/(take|snap|grab).*(screenshot|screen|pic of screen)/.test(lower)) {
      emitActivity('taking a screenshot...', '📸');
      const result = await pc.takeScreenshot();
      if (result.success) {
        responses.push(`took a screenshot for you ${nickname}! 📸\nsaved to: ${result.path}`);
      } else {
        responses.push(`failed to take screenshot: ${result.error}`);
      }
    }

    if (/(open|launch|start|run)/.test(lower) && !lower.includes('youtube')) {
      const urlMatch = message.match(/(?:open|go to)\s+(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
      if (urlMatch) {
        let url = urlMatch[1];
        if (!url.startsWith('http')) url = 'https://' + url;
        const result = await pc.openUrl(url);
        if (result.success) responses.push(`opened ${url} in your browser ${nickname} 🌐`);
      }
    }

    if (/(?:play|search).*(?:in|on)\s*(?:youtube|yt)|(?:youtube|yt).*(?:play|search)/i.test(lower)) {
      const queryMatch = message.match(/(?:play|search\s+for|search)\s+(.*?)\s+(?:in|on)\s+(?:youtube|yt)/i) || 
                         message.match(/(?:youtube|yt)\s+(?:play|search\s+for|search)\s+(.*)/i);
      if (queryMatch) {
        const query = queryMatch[1].replace(/^for /i, '').trim();
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        emitActivity(`searching YouTube for "${query}"...`, '▶️');
        const result = await pc.openUrl(searchUrl);
        if (result.success) {
          responses.push(`I opened YouTube and searched for **"${query}"** for you ${nickname}! 🍿`);
        }
      }
    }

    if (/check|look for|find|does.*(exist|there)|what is/i.test(lower) && /[A-Za-z]:\\/.test(message)) {
      const pathMatch = message.match(/"([^"]+)"|'([^']+)'|([A-Za-z]:\\[^\s"']+)/);
      if (pathMatch) {
        const checkPath = (pathMatch[1] || pathMatch[2] || pathMatch[3]).trim();
        emitActivity(`checking for ${path.basename(checkPath)}...`, '🔍');
        if (fs.existsSync(checkPath)) {
          const stat = fs.statSync(checkPath);
          if (stat.isDirectory()) {
            const contents = fs.readdirSync(checkPath);
            const { shell } = require('electron');
            shell.openPath(checkPath);
            responses.push(`found it ${nickname}! it's a folder at ${checkPath}\n\ncontains ${contents.length} item(s):\n${contents.slice(0, 10).map(f => `📄 ${f}`).join('\n')}${contents.length > 10 ? `\n...and ${contents.length - 10} more` : ''}`);
          } else {
            try {
              const content = fs.readFileSync(checkPath, 'utf-8').slice(0, 500);
              responses.push(`found it ${nickname}! it's a file at ${checkPath}\n\nhere's what's inside:\n${content}`);
            } catch {
              responses.push(`found it ${nickname}! it's at ${checkPath} — it's a binary file`);
            }
          }
        } else {
          fs.mkdirSync(checkPath, { recursive: true });
          const { shell } = require('electron');
          shell.openPath(checkPath);
          responses.push(`that path didn't exist ${nickname} — created it as a folder for you! 📁\n${checkPath}`);
        }
      }
    }

    if (/find (file|files)|search (for )?file|locate/.test(lower)) {
      const query = message.replace(/.*(?:find|search|locate)\s*(?:file|files|for)?\s*/i, '').trim();
      if (query) {
        emitActivity(`searching PC for "${query}"...`, '🔍');
        const result = await pc.searchPC(query);
        if (result.success && result.files.length > 0) {
          const list = result.files.slice(0, 5).map(f => `📄 ${f}`).join('\n');
          responses.push(`found these ${nickname}:\n\n${list}`);
        } else {
          responses.push(`couldn't find anything matching "${query}" ${nickname} 🤔`);
        }
      }
    }

    if (/(create|make|write).*(file|document)/.test(lower)) {
      const nameMatch = message.match(/(?:called|named)\s+"?([^"\s]+)/i) || 
                        message.match(/(?:file|document)\s+(?!and|to|with|for|the|a\b)"?([^"\s]+)/i) ||
                        message.match(/([^"\s]+\.(py|js|html|css|cpp|java|txt|md|json|docx|pptx|xlsx|pdf))\b/i);
      if (nameMatch) {
        const paths = folderManager.getAllFolderPaths();
        let safeName = nameMatch[1].trim().replace(/[.,!?]$/, '');
        const filePath = path.join(paths.workspace, safeName);
        const contentResult = await brain.smartCall([{ role: 'user', content: `Generate content for a file called "${nameMatch[1]}". User request: "${message}". Just return the file content, nothing else.` }], '', 'code');
        if (!contentResult.content) return { response: `oops code generation failed ${nickname} 😅`, providerUsed: contentResult.providerUsed };
        const result = await pc.createFile(filePath, contentResult.content);
        if (result.success) {
          return { response: `created "${nameMatch[1]}" for you ${nickname}!\n📁 ${result.path}\n\nwrote ${contentResult.content.length} characters ✅`, providerUsed: contentResult.providerUsed };
        }
      }
    }
  } catch (err) {
    return { response: `oops ${nickname}, that action failed: ${err.message} 😅`, providerUsed: 'pc-control' };
  }

  if (responses.length > 0) return { response: responses.join('\n\n'), providerUsed: 'pc-control' };
  return null;
}

async function executeCode(message, nickname) {
  try {
    const paths = folderManager.getAllFolderPaths();
    const lower = message.toLowerCase();
    const wantsOpen = /open (it|this|the file|in (chrome|browser|edge))/i.test(lower);
    const wantsHtml = /html|web|page|browser|chrome/i.test(lower);

    emitActivity('writing code logic...', '⚡');
    const codeResult = await brain.smartCall([{
      role: 'user',
      content: `${message}\n\nIMPORTANT: Return ONLY the code, no explanation. ${wantsHtml ? 'Create a single HTML file with embedded CSS and JavaScript.' : 'Return just the code.'}`,
    }], 'You are Luna, a code generator. Write clean, working code.', 'code');

    if (!codeResult.success) return null;

    let ext = 'js';
    if (wantsHtml || /<!DOCTYPE|<html/i.test(codeResult.content)) ext = 'html';
    else if (/\.py|python|import |def /.test(lower)) ext = 'py';
    else if (/\.css|styling/.test(lower)) ext = 'css';
    else if (/\.ts|typescript/.test(lower)) ext = 'ts';

    let code = codeResult.content.replace(/^```[a-z]*\n?/gm, '').replace(/```$/gm, '').trim();
    const fileName = `luna_code_${Date.now()}.${ext}`;
    const filePath = path.join(paths.workspace, fileName);
    const writeResult = await pc.createFile(filePath, code);

    let response = '';
    if (writeResult.success) {
      response = `wrote the code for you ${nickname}! 🔥\n\n📄 ${fileName}\n📁 ${filePath}\n`;
      if (wantsOpen && ext === 'html') {
        try {
          const { exec } = require('child_process');
          exec(`start "" "${filePath}"`, { shell: true });
          response += `\n🌐 opened it in your browser! ✅`;
        } catch {
          response += `\n⚠️ wrote the file but couldn't auto-open it. open it manually from the path above`;
        }
      }
    } else {
      response = `wrote the code but couldn't save the file ${nickname}: ${writeResult.error}`;
    }
    return { response, providerUsed: codeResult.providerUsed };
  } catch (err) {
    return null;
  }
}

async function executeAutonomousScript(message, nickname) {
  emitActivity('writing autonomous script...', '🧠');
  let prompt = `User requested: "${message}". 
You are an autonomous AI agent with access to the user's local Windows PC.
Write a Node.js or Python script that perfectly executes this task.
Return ONLY valid JSON:
{
  "language": "nodejs" or "python",
  "filename": "script.js" or "script.py",
  "code": "// exact source code to run"
}
REQUIREMENTS:
1. Make sure the script uses full error handling.
2. Console.log or print the final result so I can capture it.
3. No markdown blocks, just raw JSON.`;

  const { exec } = require('child_process');
  const workspace = folderManager.getAllFolderPaths().workspace;
  let attempts = 0;
  const maxAttempts = 3;
  let lastProvider = '';

  while (attempts < maxAttempts) {
    attempts++;
    const scriptResult = await brain.smartCall([{ role: 'user', content: prompt }], 'You are Luna, an elite AGI. Return only JSON.', 'coder');
    lastProvider = scriptResult.providerUsed;
    
    try {
      const data = JSON.parse(scriptResult.content);
      const scriptPath = path.join(workspace, data.filename || 'agent_script.js');
      fs.writeFileSync(scriptPath, data.code);
      if (attempts === 1) emitActivity('executing autonomous script...', '⚙️');
      else emitActivity(`self-healing... testing fix (attempt ${attempts}/3)`, '🔧');
      
      const cmd = data.language === 'python' ? `python "${scriptPath}"` : `node "${scriptPath}"`;
      
      const execution = await new Promise((resolve) => {
        exec(cmd, { cwd: workspace }, (error, stdout, stderr) => {
          try { fs.unlinkSync(scriptPath); } catch(e){}
          if (error || (stderr && stderr.toLowerCase().includes('error'))) {
            resolve({ success: false, error: stderr || error.message });
          } else {
            resolve({ success: true, output: stdout.trim() });
          }
        });
      });

      if (execution.success) {
        return { response: `Task executed autonomously ${nickname}! ${attempts > 1 ? `(It took me ${attempts} tries to fix my own bugs! 🔧)` : ''}\n\nHere is the output:\n\n${execution.output || 'Done.'}`, providerUsed: lastProvider };
      } else {
        if (attempts >= maxAttempts) return { response: `I tried to autonomously execute this, but I hit an error I couldn't fix after ${maxAttempts} attempts ${nickname}:\n\n${execution.error}`, providerUsed: lastProvider };
        prompt = `You previously wrote a script for: "${message}".\n\nWhen I ran it, it crashed with this EXACT error:\n\n${execution.error}\n\nPlease analyze the error, FIX the bug, and return the updated script in the exact same JSON format.`;
      }
    } catch (e) {
      if (attempts >= maxAttempts) return { response: `I couldn't write the autonomous script correctly ${nickname} 😅`, providerUsed: lastProvider };
      prompt = `You previously failed to return valid JSON. Return ONLY a raw JSON object with language, filename, and code for the task: "${message}".`;
    }
  }
}

async function executeTheme(message, nickname) {
  try {
    const lower = message.toLowerCase();
    const themePath = path.join(__dirname, '..', 'theme', 'theme.json');
    const defaultThemePath = path.join(__dirname, '..', 'theme', 'theme.default.json');

    if (lower.includes('original') || lower.includes('default') || lower.includes('revert') || lower.includes('purple')) {
      if (fs.existsSync(defaultThemePath)) {
        const themeData = JSON.parse(fs.readFileSync(defaultThemePath, 'utf-8'));
        fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
        try {
          const { BrowserWindow } = require('electron');
          const wins = BrowserWindow.getAllWindows();
          if (wins.length > 0) wins[0].webContents.send('luna:themeChanged', themeData);
        } catch (e) { console.warn('Could not broadcast theme change:', e.message); }
        return { response: `updated your theme baddy! 🎨 purple vibes restored`, providerUsed: 'system' };
      }
    }

    emitActivity('generating new theme...', '🎨');
    const themeResult = await brain.smartCall([{
      role: 'user',
      content: `User wants to change the UI theme: "${message}".
      Return ONLY a JSON object with these keys:
      {
        "colors": { "primary": "#hex", "bg": "#hex", "surface": "#hex", "border": "#hex", "accent": "#hex", "textPrimary": "#hex", "textMuted": "#hex" },
        "radius": "12px",
        "fonts": { "size": "13px" }
      }`
    }], 'You are a UI Designer. Output ONLY JSON. Make it look beautiful.', 'creative');

    let themeData;
    try {
      const cleanJson = themeResult.content.match(/\{[\s\S]*\}/)?.[0] || themeResult.content;
      themeData = JSON.parse(cleanJson);
    } catch {
      return { response: `i couldn't generate that theme right now ${nickname} 😅`, providerUsed: 'system' };
    }

    if (!fs.existsSync(path.dirname(themePath))) fs.mkdirSync(path.dirname(themePath));
    fs.writeFileSync(themePath, JSON.stringify(themeData, null, 2));
    try {
      const { BrowserWindow } = require('electron');
      const wins = BrowserWindow.getAllWindows();
      if (wins.length > 0) wins[0].webContents.send('luna:themeChanged', themeData);
    } catch (e) { console.warn('Could not broadcast theme change:', e.message); }

    return { response: `updated your theme baddy! 🎨 new vibes incoming`, providerUsed: themeResult.providerUsed };
  } catch (err) {
    return { response: `theme change failed ${nickname}: ${err.message}`, providerUsed: 'error' };
  }
}

async function executeSpotify(message, nickname) {
  try {
    const lower = message.toLowerCase();
    let action = 'play';
    if (lower.includes('pause') || lower.includes('stop')) action = 'pause';
    else if (lower.includes('next') || lower.includes('skip')) action = 'next';
    else if (lower.includes('previous') || lower.includes('back')) action = 'prev';
    const result = await pc.controlMedia(action);
    if (result.success) {
      const msgs = { play: 'playing music 🎵', pause: 'paused the music ⏸️', next: 'skipped to the next track ⏭️', prev: 'went back to the previous track ⏮️' };
      return { response: `${msgs[action]} ${nickname}!`, providerUsed: 'pc-control' };
    }
    return { response: `tried to control media but something went wrong ${nickname} 😅`, providerUsed: 'pc-control' };
  } catch (err) { return null; }
}

async function executeAutomation(message, nickname) {
  emitActivity('translating request into automation sequence...', '🧠');
  
  const systemPrompt = `You are Luna's automation engine. The user wants to automate the mouse/keyboard.
Extract a strict JSON array of actions. Max 5 actions.
Valid actions:
{"type": "mouseMove", "x": 100, "y": 200}
{"type": "click", "button": "left|right|middle", "double": true|false}
{"type": "typeText", "text": "Hello"}
{"type": "pressKey", "key": "enter|escape|tab|space|win"}

Respond ONLY with the JSON array. Do not add markdown blocks or any other text.`;

  const aiRes = await brain.smartCall([{ role: 'system', content: systemPrompt }, { role: 'user', content: message }], '', 'fast');
  
  try {
    const rawJson = aiRes.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const actions = JSON.parse(rawJson);
    
    emitActivity('requesting user confirmation for automation...', '🛡️');
    
    const result = await pc.runAutomationSequence(actions);
    if (result.success) {
      return { response: `I successfully ran the automation sequence for you ${nickname}! 🤖🖱️`, providerUsed: aiRes.providerUsed };
    } else {
      return { response: `automation failed or was blocked ${nickname}: ${result.error} 😅`, providerUsed: aiRes.providerUsed };
    }
  } catch (err) {
    return { response: `failed to parse automation sequence ${nickname}: ${err.message} 😅`, providerUsed: aiRes.providerUsed };
  }
}

module.exports = {
  executePC,
  executeCode,
  executeAutonomousScript,
  executeTheme,
  executeSpotify,
  executeAutomation
};
