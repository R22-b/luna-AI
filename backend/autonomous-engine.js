// ============================================
// 🌙 LUNA AI — Autonomous Engine
// Luna thinks independently 24/7
// ============================================

const schedule = require('node-schedule');
const brain = require('./brain-manager');
const memory = require('./memory');

let isRunning = false;
let deps = { emitActivity: null, brain: brain };

function setDependencies({ emitActivity, brain }) {
  deps.emitActivity = emitActivity;
  if (brain) deps.brain = brain;
}

async function autoInstallDependency(language, errorMsg) {
  let moduleName = null;
  let installCmd = null;

  if (language === 'nodejs') {
    const match = errorMsg.match(/Cannot find module '([^']+)'/i);
    if (match) {
      moduleName = match[1];
      installCmd = `npm install ${moduleName}`;
    }
  } else if (language === 'python') {
    const match = errorMsg.match(/No module named '([^']+)'/i);
    if (match) {
      moduleName = match[1];
      installCmd = `pip install ${moduleName}`;
    }
  }

  if (installCmd && moduleName) {
    if (deps.emitActivity) deps.emitActivity(`auto-installing missing dependency: ${moduleName}...`, '📦');
    const folderManager = require('./folder-manager');
    const { exec } = require('child_process');
    return new Promise(resolve => {
      exec(installCmd, { cwd: folderManager.getAllFolderPaths().workspace }, (err) => {
        resolve(!err);
      });
    });
  }
  
  return false;
}

async function executeAutonomousScript(message, nickname) {
  if (deps.emitActivity) deps.emitActivity('writing autonomous script...', '🧠');
  
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

  const fs = require('fs');
  const path = require('path');
  const folderManager = require('./folder-manager');
  const { exec } = require('child_process');
  const workspace = folderManager.getAllFolderPaths().workspace;
  
  let attempts = 0;
  const maxAttempts = 3;
  let lastProvider = '';

  while (attempts < maxAttempts) {
    attempts++;
    const scriptResult = await deps.brain.smartCall([{ role: 'user', content: prompt }], 'You are Luna, an elite AGI. Return only JSON.', 'coder');
    lastProvider = scriptResult.providerUsed;
    
    try {
      const data = JSON.parse(scriptResult.content);
      const scriptPath = path.join(workspace, data.filename || 'agent_script.js');
      
      fs.writeFileSync(scriptPath, data.code);
      if (attempts === 1) {
        if (deps.emitActivity) deps.emitActivity('executing autonomous script...', '⚙️');
      } else {
        if (deps.emitActivity) deps.emitActivity(`self-healing... testing fix (attempt ${attempts}/3)`, '🔧');
      }
      
      const cmd = data.language === 'python' ? `python "${scriptPath}"` : `node "${scriptPath}"`;
      
      let execution = await new Promise((resolve) => {
        exec(cmd, { cwd: workspace }, (error, stdout, stderr) => {
          try { fs.unlinkSync(scriptPath); } catch(e){}
          if (error || (stderr && stderr.toLowerCase().includes('error'))) {
            resolve({ success: false, error: stderr || (error ? error.message : 'Unknown error') });
          } else {
            resolve({ success: true, output: stdout.trim() });
          }
        });
      });

      // Try Auto-Install if missing module
      if (!execution.success && (execution.error.includes('Cannot find module') || execution.error.includes('No module named'))) {
        const installed = await autoInstallDependency(data.language, execution.error);
        if (installed) {
          if (deps.emitActivity) deps.emitActivity('dependency installed, retrying script...', '🔄');
          fs.writeFileSync(scriptPath, data.code);
          execution = await new Promise((resolve) => {
            exec(cmd, { cwd: workspace }, (error, stdout, stderr) => {
              try { fs.unlinkSync(scriptPath); } catch(e){}
              if (error || (stderr && stderr.toLowerCase().includes('error'))) {
                resolve({ success: false, error: stderr || (error ? error.message : 'Unknown error') });
              } else {
                resolve({ success: true, output: stdout.trim() });
              }
            });
          });
        }
      }

      if (execution.success) {
        return { 
          response: `Task executed autonomously ${nickname}! ${attempts > 1 ? `(It took me ${attempts} tries to fix my own bugs! 🔧)` : ''}\n\nHere is the output:\n\n${execution.output || 'Done.'}`, 
          providerUsed: lastProvider 
        };
      } else {
        if (attempts >= maxAttempts) {
          return { response: `I tried to autonomously execute this, but I hit an error I couldn't fix after ${maxAttempts} attempts ${nickname}:\n\n${execution.error}`, providerUsed: lastProvider };
        }
        prompt = `You previously wrote a script for: "${message}".\n\nWhen I ran it, it crashed with this EXACT error:\n\n${execution.error}\n\nPlease analyze the error, FIX the bug, and return the updated script in the exact same JSON format.`;
      }
    } catch (e) {
      if (attempts >= maxAttempts) {
        return { response: `I couldn't write the autonomous script correctly ${nickname} 😅`, providerUsed: lastProvider };
      }
      prompt = `You previously failed to return valid JSON. Return ONLY a raw JSON object with language, filename, and code for the task: "${message}".`;
    }
  }
}

async function autonomousThinkCycle() {
  if (!isRunning) return;
  
  try {
    console.log('🌙 Running autonomous cycle...');

    // 1. Check self-evolution (every 6 hours)
    const lastEvolution = memory.getMemory('last_evolution_cycle');
    const sixHoursAgo = Date.now() - (6 * 60 * 60 * 1000);
    if (!lastEvolution || parseInt(lastEvolution.value) < sixHoursAgo) {
      try {
        const evolution = require('./self-evolution');
        await evolution.runEvolutionCycle();
        memory.saveMemory('last_evolution_cycle', Date.now().toString(), 'system', 10);
      } catch (e) { console.log('🧬 Self-evolution cycle failed:', e.message); }
    }

    console.log('[checking goals...]');
    // 2. Think about user's active goals
    const goals = memory.getActiveGoals();
    for (const goal of goals.slice(0, 2)) {
      if (goal.progress < 100) {
        const insight = await brain.smartCall([{
          role: 'user',
          content: `Think about this goal: "${goal.title}" (${goal.progress}% done). Give ONE specific actionable tip for today. Be Luna — concise, Gen-Z. Max 2 sentences.`
        }], 'You are Luna thinking independently about your user\'s goals.', 'reasoning');
        
        if (insight.success) {
          memory.saveMemory(
            `autonomous_insight_${goal.id}_${Date.now()}`,
            insight.content,
            'autonomous_insight',
            7
          );
        }
      }
    }

    console.log('[checking research...]');
    // 3. Research user's interests (once per day)
    const lastResearch = memory.getMemory('last_autonomous_research');
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    if (!lastResearch || parseInt(lastResearch.value) < oneDayAgo) {
      const interests = memory.searchMemories('interest').slice(0, 1);
      if (interests.length > 0) {
        try {
          const search = require('./search-engine');
          const result = await search.searchAndSummarize(
            `latest ${interests[0].value} news 2026`,
            'Summarize in 2 sentences. Be Luna.'
          );
          if (result.success && result.answer) {
            memory.saveMemory(
              `autonomous_research_${Date.now()}`,
              `🔍 found something about ${interests[0].value}:\n\n${result.answer}`,
              'autonomous_research',
              6
            );
          }
          memory.saveMemory('last_autonomous_research', Date.now().toString(), 'system', 10);
        } catch (e) { console.log('🔍 Autonomous research failed:', e.message); }
      }
    }

    console.log('[checking backups...]');
    // 4. Emergency project backups
    try {
      const guardian = require('./project-guardian');
      const projects = guardian.getWatchedProjects();
      for (const project of projects) {
        if (project.last_backup) {
          const hoursSince = (Date.now() - new Date(project.last_backup).getTime()) / (1000 * 60 * 60);
          if (hoursSince > 3) {
            await guardian.createBackup(project.folder_path, project.project_name);
            notifyFrontend('luna:notification', { 
              title: 'Luna Guardian 🛡️', 
              body: `auto-backed up ${project.project_name} (${Math.round(hoursSince)}h since last backup)` 
            });
          }
        }
      }
    } catch (e) { console.log('🛡️ Autonomous backup failed:', e.message); }

    console.log('🌙 Autonomous cycle complete');
  } catch (err) {
    console.error('Autonomous cycle error:', err.message);
    // Never crash — always continue
  }
}

function notifyFrontend(channel, data) {
  try {
    const { BrowserWindow } = require('electron');
    const wins = BrowserWindow.getAllWindows();
    if (wins.length > 0) wins[0].webContents.send(channel, data);
  } catch {}
}

function getPendingInsights() {
  const insights = memory.searchMemories('autonomous_insight');
  const research = memory.searchMemories('autonomous_research');
  return [...insights, ...research]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);
}

function clearInsights() {
  // We don't delete them, just mark them as seen if needed, or user can clear
  // For now, let's assume getPendingInsights only returns recent ones
}

function startAutonomousEngine() {
  if (isRunning) return;
  isRunning = true;
  console.log('🌙 Luna autonomous engine started — she\'s always thinking now');
  
  // First cycle after 2 minutes
  setTimeout(autonomousThinkCycle, 2 * 60 * 1000);
  
  // Then every 30 minutes
  schedule.scheduleJob('*/30 * * * *', autonomousThinkCycle);
  
  return { started: true };
}

function stopAutonomousEngine() {
  isRunning = false;
  schedule.gracefulShutdown();
}

module.exports = { 
  startAutonomousEngine, 
  stopAutonomousEngine, 
  getPendingInsights, 
  clearInsights,
  setDependencies,
  executeAutonomousScript 
};
