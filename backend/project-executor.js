const pc = require('./pc-control');
const path = require('path');
const fs = require('fs');
const folderManager = require('./folder-manager');
const brain = require('./brain-manager');
const db = require('./database');
const guardian = require('./project-guardian');

function emitActivity(message, icon = '⚡') {
  try {
    const win = require('./window-manager').getMainWindow();
    if (win && win.webContents) {
      win.webContents.send('luna:activity', { message, icon });
    }
  } catch(e){}
}

async function executeProjectBuild(message, nickname) {
  try {
    const paths = folderManager.getAllFolderPaths();
    const existingProjectMatch = message.match(/(?:update|modify|fix|edit|add to|improve)\s+([^\s]+)/i);
    if (existingProjectMatch) {
      const projectPath = path.join(paths.workspace, existingProjectMatch[1]);
      if (fs.existsSync(projectPath)) {
        emitActivity('backing up existing project...', '🛡️');
        await guardian.createBackup(projectPath, existingProjectMatch[1] + '_prebuild');
      }
    }

    emitActivity('planning project structure...', '🏗️');
    let fileList = [];
    let architectProvider = 'system';
    const lowerMessage = message.toLowerCase();
    
    if (/flask|django|fastapi|gae|google app engine|python.*web/i.test(lowerMessage)) {
      fileList = ["main.py", "templates/index.html", "requirements.txt", "app.yaml", "README.md"];
    } else if (/express|node\.?js|socket|fullstack|backend|mern|mean/i.test(lowerMessage)) {
      fileList = ["server.js", "public/index.html", "package.json", "README.md"];
    } else if (/(website|calculator|game|clone|\bui\b|frontend|globe|three\.?js)/i.test(lowerMessage)) {
      fileList = ["index.html", "styles.css", "script.js", "README.md"];
    }
    
    let architectResponse = '';
    if (fileList.length === 0) {
      const architectResult = await brain.smartCall([{
        role: 'user',
        content: `User wants a project: "${message}". 
        TASK: Plan a ZERO-ERROR file structure.
        - If it is a Python/C++ script: Return the entry file e.g. ["main.py", "README.md"].
        - ALWAYS include a README.md file for any project.
        - DO NOT include binary files.
        - Return ONLY a JSON array of filenames.
        IMPORTANT: Return NOTHING but the JSON array. No markdown, no explanation, no project tree, no backticks. JUST the array.`,
      }], 'You are a file structure planner. You respond with ONLY a JSON array of filenames.', 'chat');

      architectResponse = architectResult.content;
      architectProvider = architectResult.providerUsed;

      if (!architectResult.content) return { response: `oops project planning failed ${nickname} 😅`, providerUsed: architectResult.providerUsed };
      try {
        const cleanJson = architectResult.content.match(/\[.*\]/s)?.[0] || architectResult.content;
        fileList = JSON.parse(cleanJson);
      } catch (err) {
        const fileExtPattern = /[\w\-\/]+\.(py|js|html|css|json|yaml|yml|txt|md|jsx|tsx|ts)\b/g;
        const extractedFiles = architectResult.content.match(fileExtPattern);
        if (extractedFiles && extractedFiles.length > 0) {
          fileList = [...new Set(extractedFiles.map(f => f.replace(/^[\|├└─\s]+/, '').trim()))];
        } else {
          fileList = ["index.html", "styles.css", "script.js", "README.md"];
        }
      }
    }

    const hasHtmlFile = fileList.some(f => typeof f === 'string' && f.endsWith('.html'));
    const hasScriptJs = fileList.some(f => typeof f === 'string' && (f === 'script.js' || f.endsWith('/script.js')));
    const hasServerJs = fileList.some(f => typeof f === 'string' && (f === 'server.js' || f.includes('package.json')));
    if (hasHtmlFile && !hasScriptJs && !hasServerJs) {
      const readmeIndex = fileList.findIndex(f => typeof f === 'string' && f.toLowerCase().includes('readme'));
      if (readmeIndex !== -1) fileList.splice(readmeIndex, 0, 'script.js');
      else fileList.push('script.js');
    }

    const createdFiles = [];
    const projectDir = path.join(paths.workspace, `luna_project_${Date.now()}`);
    fs.mkdirSync(projectDir, { recursive: true });

    emitActivity('writing project files...', '⚡');
    let fullContentForPortCheck = '';
    let previousFilesContext = '';
    for (const filename of fileList) {
      const builderResult = await brain.smartCall([{
        role: 'user',
        content: `Project: "${message}"\nPlanned Files: ${JSON.stringify(fileList)}\n\nPreviously Generated Files:\n${previousFilesContext}\n\nNow write the complete content for: "${filename}". 
CRITICAL REQUIREMENTS:
1. ZERO-ERROR GUARANTEE.
2. MODULAR ARCHITECTURE.
3. CSS/STYLING: If no styles.css, put ALL CSS inline.
4. PREMIUM DESIGN SYSTEM: glassmorphism, transitions, modern fonts.
5. FEATURE COMPLETENESS.
6. FOR README.md: Detailed.
7. FOR server.js: app.use(express.static('public')).
8. FOR package.json: ALL required dependencies.
9. HTML: CDN script tags.
10. DOM CONSISTENCY.
11. NO EXTERNAL DATABASES.
12. CDN vs ES MODULES: Use global objects if CDN.
13. THREE.JS SPECIFIC RULES.
14. FLASK / PYTHON WEB APP RULES.
15. OUTPUT: Return ONLY the raw file content. No markdown fences.`,
      }], 'You are an Elite Developer. Return ONLY the file content.', 'code');

      if (!filename) continue;
      let safeFilename = typeof filename === 'string' ? filename : (filename.name || filename.path || 'index.html');
      const cleanFilename = safeFilename.trim().replace(/^[/\\]+/, '');
      const filePath = path.join(projectDir, cleanFilename);
      const fileDir = path.dirname(filePath);
      if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true });
      
      if (!builderResult.success || !builderResult.content) continue;
      
      let content = builderResult.content.trim().replace(/^```[\w]*\n/, '').replace(/\n```$/, '').trim();
      
      if (filename === 'package.json') {
        try { JSON.parse(content); } catch (e) {
          if (!content.endsWith('}')) content += '\n}';
          try { JSON.parse(content); } catch {
            const repairResult = await brain.smartCall([{ role: 'user', content: `The package.json is corrupted: "${content}". Rewrite it perfectly. Return ONLY the JSON.` }], 'You are a JSON fixer.', 'code');
            if (repairResult.content) content = repairResult.content.trim().replace(/^```[\w]*\n/, '').replace(/\n```$/, '').trim();
          }
        }
      }
      
      fs.writeFileSync(filePath, content);
      createdFiles.push(filename);
      fullContentForPortCheck += content + '\n';
      
      let idList = '';
      if (filename.endsWith('.html')) {
        const idMatches = content.match(/id=["']([^"']+)["']/g);
        if (idMatches) idList = '\n[ALL ELEMENT IDs IN THIS HTML]: ' + idMatches.map(m => m.replace(/id=["']|["']/g, '')).join(', ');
      }
      previousFilesContext += `\n--- ${filename} ---\n${content.substring(0, 6000)}${idList}\n`;
    }

    emitActivity('verifying code quality...', '🔍');
    const verifier = require('./project-verifier');
    const verifyResult = verifier.verifyProject(projectDir);
    
    if (!verifyResult.valid) {
      const repairResult = await brain.smartCall([{
        role: 'user',
        content: `Fix these errors:\n${verifyResult.errors.join('\n')}\n\nReturn ONLY a JSON object mapping file paths to fixed content.`
      }], 'You are a code repair bot. Output ONLY valid JSON.', 'code');
      
      if (repairResult.content) {
        try {
          const cleanJson = repairResult.content.match(/\{[\s\S]*\}/)?.[0] || repairResult.content;
          const fixes = JSON.parse(cleanJson);
          for (const [filename, newContent] of Object.entries(fixes)) {
             const fp = path.join(projectDir, filename);
             const fd = path.dirname(fp);
             if (!fs.existsSync(fd)) fs.mkdirSync(fd, { recursive: true });
             fs.writeFileSync(fp, newContent);
             if (!createdFiles.includes(filename)) createdFiles.push(filename);
          }
        } catch (err) {}
      }
    }

    if (createdFiles.length > 0) {
      let runMessage = '';
      try {
        const { exec, spawn } = require('child_process');
        exec(`code "${projectDir}"`, (err) => { if (err) exec(`explorer "${projectDir}"`); });

        const hasPackageJson = createdFiles.some(f => f.includes('package.json'));
        const hasHtml = createdFiles.some(f => f.endsWith('.html'));

        if (hasPackageJson) {
          const portMatch = fullContentForPortCheck.match(/(?:listen\s*\(\s*|PORT\s*=?\s*|port\s*[:=]\s*|http:\/\/localhost:)(\d{4})\b/i);
          const port = portMatch ? portMatch[1] : 5173;

          emitActivity('installing dependencies...', '📦');
          await new Promise((resolve) => {
            const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
            const install = spawn(cmd, ['install', '--legacy-peer-deps', '--no-fund', '--no-audit'], { cwd: projectDir });
            install.stdout.on('data', (data) => emitActivity(`📦 ${data.toString().substring(0,40).trim()}`, '📦'));
            install.on('close', resolve);
          });

          let serverAttempts = 0;
          let isServerStable = false;
          let serverChild = null;

          while (serverAttempts < 3 && !isServerStable) {
            serverAttempts++;
            if (serverAttempts === 1) emitActivity('starting server...', '🚀');
            else emitActivity(`self-healing server... (attempt ${serverAttempts}/3)`, '🔧');

            const startCmd = fullContentForPortCheck.includes('vite') ? 'npm run dev' : (fullContentForPortCheck.includes('react-scripts') ? 'npm start' : 'node server.js');
            
            const result = await new Promise((resolve) => {
               let errorLogs = '';
               serverChild = exec(startCmd, { cwd: projectDir });
               serverChild.stderr.on('data', (data) => {
                  const str = data.toString();
                  if (str.toLowerCase().includes('error') || str.toLowerCase().includes('exception') || str.toLowerCase().includes('module not found')) errorLogs += str + '\n';
               });
               serverChild.on('exit', (code) => { if (code !== 0 && code !== null) errorLogs += `\nProcess exited with code ${code}`; });

               setTimeout(async () => {
                 if (errorLogs.trim().length > 0) {
                    try { serverChild.kill('SIGKILL'); } catch(e){}
                    resolve({ ok: false, reason: errorLogs });
                    return;
                 }
                 try {
                    const http = require('http');
                    const body = await new Promise((httpRes, httpRej) => {
                       const req = http.get(`http://localhost:${port}`, (res) => {
                          let data = '';
                          res.on('data', (chunk) => data += chunk);
                          res.on('end', () => httpRes(data));
                       });
                       req.on('error', httpRej);
                       req.setTimeout(3000, () => { req.destroy(); httpRej(new Error('timeout')); });
                    });
                    if (body.includes('<!DOCTYPE') || body.includes('<html') || body.includes('<div')) resolve({ ok: true });
                    else {
                       try { serverChild.kill('SIGKILL'); } catch(e){}
                       resolve({ ok: false, reason: `Server returned invalid content:\n\n"${body.substring(0, 200)}"` });
                    }
                 } catch (httpErr) {
                    try { serverChild.kill('SIGKILL'); } catch(e){}
                    resolve({ ok: false, reason: `Server did not respond: ${httpErr.message}` });
                 }
               }, 5000);
            });

            if (result.ok) {
              isServerStable = true;
            } else {
              const fixRes = await brain.smartCall([{
                 role: 'user',
                 content: `Fix these server errors:\n${result.reason}\n\nReturn JSON mapping files to fixed content.`
              }], 'You are a code repair bot. Output ONLY valid JSON.', 'code');
              try {
                const cleanJson = fixRes.content.match(/\{[\s\S]*\}/)?.[0] || fixRes.content;
                const fixes = JSON.parse(cleanJson);
                for (const [filename, newContent] of Object.entries(fixes)) {
                   const fp = path.join(projectDir, filename);
                   const fd = path.dirname(fp);
                   if (!fs.existsSync(fd)) fs.mkdirSync(fd, { recursive: true });
                   fs.writeFileSync(fp, newContent);
                }
                if (fixes['package.json']) {
                   await new Promise((resolve) => {
                     const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
                     const install = spawn(cmd, ['install'], { cwd: projectDir });
                     install.on('close', resolve);
                   });
                }
              } catch(e) {}
            }
          }

          if (!isServerStable && serverChild) {
            exec(`node server.js`, { cwd: projectDir });
            await new Promise(r => setTimeout(r, 2000));
          }
          exec(`start http://localhost:${port}`);
          runMessage = `\n\n(i installed dependencies and started the server for you! 🚀)`;
        } else if (hasHtml && !createdFiles.some(f => f.endsWith('.py'))) {
          const htmlFile = createdFiles.find(f => f.endsWith('index.html')) || createdFiles.find(f => f.endsWith('.html'));
          exec(`start "" "${path.join(projectDir, htmlFile)}"`);
          runMessage = `\n\n(i opened it in Chrome for you! 🌐)`;
        } else if (createdFiles.some(f => f.endsWith('.py'))) {
          const pyFile = createdFiles.find(f => f === 'main.py') || createdFiles.find(f => f.endsWith('.py'));
          const hasTemplates = createdFiles.some(f => f.includes('templates/'));
          const hasRequirements = createdFiles.some(f => f === 'requirements.txt');
          if (hasTemplates || hasRequirements) {
            emitActivity('installing Python dependencies...', '🐍');
            await new Promise((res) => exec(`pip install -r requirements.txt`, { cwd: projectDir }, (err) => {
              if (err) exec(`pip install flask gunicorn`, { cwd: projectDir }, res);
              else res();
            }));
            const pyContent = fs.readFileSync(path.join(projectDir, pyFile), 'utf8');
            const pyPortMatch = pyContent.match(/port\s*[=:]\s*(\d{4})/i) || pyContent.match(/localhost:(\d{4})/i);
            const pyPort = pyPortMatch ? pyPortMatch[1] : '8080';
            spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `cd /d "${projectDir}" && python "${pyFile}"`], { detached: true });
            await new Promise(r => setTimeout(r, 3000));
            exec(`start http://localhost:${pyPort}`);
            runMessage = `\n\n(i installed Flask dependencies and started the Python server for you! 🐍🚀)`;
          } else {
            const fullPyPath = path.join(projectDir, pyFile);
            spawn('cmd.exe', ['/c', 'start', 'cmd.exe', '/k', `python "${fullPyPath}" || python3 "${fullPyPath}"`], { detached: true });
            runMessage = `\n\n(i opened a terminal to run your Python script! 🐍)`;
          }
        }
      } catch (e) {}

      if (hasHtml || hasPackageJson) {
        emitActivity('visually verifying UI...', '👁️');
        await new Promise(r => setTimeout(r, 4000));
        try {
           const screenResult = await pc.takeScreenshot();
           if (screenResult.success && screenResult.path) {
              const b64Data = fs.readFileSync(screenResult.path, 'base64');
              const vlmPrompt = `You just built a project for: "${message}". Analyze this screenshot strictly as a senior UI/UX engineer. Look for visual bugs. If perfect, reply "PASS". Else reply with JSON mapping files to fixed content.`;
              const vlmResult = await brain.smartCall([{ role: 'user', content: [{ type: 'text', text: vlmPrompt }, { type: 'image_url', image_url: { url: `data:image/png;base64,${b64Data}` } }] }], 'You are an Elite UI/UX QA Bot. Output "PASS" or JSON only.', 'code');
              if (vlmResult && vlmResult.content && !vlmResult.content.includes('PASS')) {
                  try {
                    const cleanJson = vlmResult.content.match(/\{[\s\S]*\}/)?.[0] || vlmResult.content;
                    const fixes = JSON.parse(cleanJson);
                    for (const [filename, newContent] of Object.entries(fixes)) {
                       const fp = path.join(projectDir, filename);
                       const fd = path.dirname(fp);
                       if (!fs.existsSync(fd)) fs.mkdirSync(fd, { recursive: true });
                       fs.writeFileSync(fp, newContent);
                    }
                    runMessage += `\n\n(I used my Vision AI to look at the app, spotted a layout bug, and self-healed the CSS! 👁️✨)`;
                  } catch (e) {}
              } else {
                  runMessage += `\n\n(I used my Vision AI to look at the app, and the UI looks perfect! 👁️✅)`;
              }
              try { fs.unlinkSync(screenResult.path); } catch (e) {}
           }
        } catch(e) {}
      }

      return {
        response: `done ${nickname}! created your full project with ${createdFiles.length} file(s) 🔥\n\n${createdFiles.map(f => `📄 ${f}`).join('\n')}\n\n📁 saved in: ${projectDir}${runMessage} ✅`,
        providerUsed: architectProvider,
      };
    }
    return { response: `🚨 **Project Build Failed**\n\nAI brains timed out. Check API keys.`, providerUsed: architectProvider };
  } catch (err) {
    return { response: `project creation failed ${nickname}: ${err.message}`, providerUsed: 'error' };
  }
}

async function executePluginBuild(message, nickname) {
  try {
    const pluginManager = require('./plugin-manager');
    const match = message.match(/(?:called|named)\s+"?([^"\s]+)"?/i);
    const name = match ? match[1] : `auto-plugin-${Date.now()}`;
    const scaffoldRes = pluginManager.createPluginScaffold({ name, description: message });
    if (!scaffoldRes.success) return { response: `couldn't scaffold plugin ${nickname}: ${scaffoldRes.error}`, providerUsed: 'system' };
    
    const logicRes = await brain.smartCall([{
      role: 'user',
      content: `Write backend.js and ui.jsx for a Luna plugin that does: "${message}". Return ONLY valid JSON in format: {"backend": "...", "ui": "..."}`
    }], 'You are a Luna Plugin Developer. Return ONLY JSON.', 'code');
    
    if (!logicRes.content) return { response: `oops plugin generation failed ${nickname} 😅`, providerUsed: logicRes.providerUsed };
    
    try {
      const cleanJson = logicRes.content.match(/\{[\s\S]*\}/)?.[0] || logicRes.content;
      const code = JSON.parse(cleanJson);
      if (code.backend) fs.writeFileSync(path.join(scaffoldRes.pluginPath, 'backend.js'), code.backend);
      if (code.ui) fs.writeFileSync(path.join(scaffoldRes.pluginPath, 'ui.jsx'), code.ui);
      pluginManager.loadAllPlugins();
      return { response: `built your plugin "${name}" ${nickname}! 🔌\n\nI've installed and loaded it automatically.`, providerUsed: logicRes.providerUsed };
    } catch(e) {
       return { response: `scaffolded "${name}" but failed to write logic ${nickname} 😅`, providerUsed: logicRes.providerUsed };
    }
  } catch (err) { return { response: `plugin creation failed: ${err.message}`, providerUsed: 'error' }; }
}

async function executeRollback(message, nickname) {
  try {
    const lower = message.toLowerCase();
    if (lower.includes('show') || lower.includes('list') || lower.includes('view')) {
      const backups = db.prepare(`SELECT * FROM project_backups ORDER BY timestamp DESC LIMIT 10`).all();
      if (backups.length === 0) return { response: `no backups found to rollback to ${nickname} 😅`, providerUsed: 'system' };
      let listStr = `here are your backup points baddy 🛡️:\n\n`;
      backups.forEach((b, idx) => { listStr += `${idx + 1}. ${new Date(b.timestamp).toLocaleString()} — ${b.project_name} (${b.file_count} files, ${b.size_mb}MB)\n`; });
      listStr += `\ntype 'rollback to backup [number]' to restore any of these`;
      return { response: listStr, providerUsed: 'system' };
    }

    const matchNum = lower.match(/(?:rollback to backup|rollback to|restore|revert to)\s+(\d+)/i);
    if (matchNum) {
      const index = parseInt(matchNum[1], 10) - 1;
      const backups = db.prepare(`SELECT * FROM project_backups ORDER BY timestamp DESC`).all();
      if (index >= 0 && index < backups.length) {
        const backup = backups[index];
        emitActivity('rolling back...', '🔄');
        const result = guardian.restoreBackup(backup.id);
        if (result.success) return { response: `rolled back to backup ${index + 1}! 🔄\n\nrestored: ${backup.folder_path}`, providerUsed: 'system' };
        else return { response: `rollback failed: ${result.error} 😅`, providerUsed: 'system' };
      } else return { response: `backup number ${matchNum[1]} not found baddy 😅`, providerUsed: 'system' };
    }

    const backup = db.prepare(`SELECT * FROM project_backups ORDER BY timestamp DESC LIMIT 1`).get();
    if (!backup) return { response: `no backups found to rollback to ${nickname} 😅`, providerUsed: 'system' };
    emitActivity('rolling back...', '🔄');
    const result = guardian.restoreBackup(backup.id);
    if (result.success) return { response: `rolled back to latest backup ${nickname}! 🔄\n\nrestored: ${backup.folder_path}`, providerUsed: 'system' };
    return { response: `rollback failed ${nickname}: ${result.error} 😅`, providerUsed: 'system' };
  } catch (err) { return { response: `rollback error: ${err.message} 😅`, providerUsed: 'system' }; }
}

module.exports = {
  executeProjectBuild,
  executePluginBuild,
  executeRollback
};
