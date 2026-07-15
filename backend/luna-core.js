// ============================================
// 🌙 LUNA AI — Core Personality & Reasoning
// Identity, emotion detection, task routing,
// and the main think() engine (REFACTORED)
// ============================================

const brain = require('./brain-manager');
const memory = require('./memory');
const pcControl = require('./pc-control');
const memoryService = require('./memory-service');

const taskRouter = require('./task-router');
const identity = require('./identity');
const emotionDetector = require('./emotion-detector');
const pcExecutor = require('./pc-executor');
const projectExecutor = require('./project-executor');
const mediaExecutor = require('./media-executor');

// Legacy imports that might still be used by old systems (if any)
const researchService = require('./research-service');
const studyService = require('./study-service');
const documentService = require('./document-service');
const autonomousEngine = require('./autonomous-engine');

// ── Live Activity Feed ──
function emitActivity(step, icon = '⚡') {
  try {
    const { BrowserWindow } = require('electron');
    const wins = BrowserWindow.getAllWindows();
    if (wins.length > 0) {
      wins[0].webContents.send('luna:activity', { step, icon, timestamp: Date.now() });
    }
  } catch { /* ignore */ }
}

// Inject dependencies into extracted services (Legacy)
researchService.setDependencies({ emitActivity });
studyService.setDependencies({ emitActivity });
documentService.setDependencies({ emitActivity, brain });
autonomousEngine.setDependencies({ emitActivity, brain });


// ══════════════════════════════════════════════
// EXPORTS (Legacy compatibility & Core Engine)
// ══════════════════════════════════════════════

// Re-export identity functions to preserve backwards compatibility for any modules that import them from luna-core
const {
  LUNA_IDENTITY,
  buildSystemPrompt,
  detectCreatorQuestion,
  getCreatorResponse,
  generateMorningBriefing,
  autoExtractMemories
} = identity;

const { detectEmotion } = emotionDetector;
const { detectTaskType, mapTaskType } = taskRouter;


// ══════════════════════════════════════════════
// MAIN REASONING ENGINE — think()
// ══════════════════════════════════════════════

async function think(userMessage, conversationHistory = [], userNickname = 'baddy', threadId = 1) {
  // Fetch real nickname if default
  let realNickname = userNickname;
  if (realNickname === 'baddy' || !realNickname) {
    const storedName = memory.getUserProfile('nickname');
    if (storedName) realNickname = storedName;
  }

  // 1. Detect emotion
  const emotion = detectEmotion(userMessage);

  // Multi-Task Orchestrator Interceptor
  // True Dynamic Multi-Task Orchestrator
  let lines = userMessage.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  let isMultiTaskPrompt = /tasks|list|run these|execute these|point test|do four things|four things/i.test(lines[0]) || 
                          lines.filter(l => /^(?:\d+\.?\s*|-|\*|\[.*\])/.test(l)).length >= 3 ||
                          /,?\s+(then|second|third|finally)\s*,?/i.test(userMessage) ||
                          /(first|1st).*?(second|2nd).*?(third|3rd)/i.test(userMessage) ||
                          lines.length > 3;

  if (isMultiTaskPrompt && lines.length === 1 && /,?\s+then\s+/i.test(userMessage)) {
    lines = userMessage.split(/,?\s+then\s+/i).map(l => l.trim()).filter(l => l.length > 0);
  } else if (isMultiTaskPrompt && lines.length === 1 && userMessage.length > 100) {
    emitActivity('parsing giant paragraph into tasks...', '🧠');
    const parseRes = await brain.smartCall([{
      role: 'user',
      content: `Extract all distinct tasks from this text into a JSON array of strings.\n\nText: "${userMessage}"\n\nExample Output:\n[\n  "Task 1 description",\n  "Task 2 description"\n]\n\nReturn ONLY the JSON array starting with [ and ending with ]. No markdown, no backticks, no explanation.`
    }], 'You are a strict JSON task extractor. Output ONLY raw JSON array. DO NOT WRAP IN ```json.', 'code');
    
    try {
      const startIdx = parseRes.content.indexOf('[');
      const endIdx = parseRes.content.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = parseRes.content.substring(startIdx, endIdx + 1);
        const extractedTasks = JSON.parse(jsonStr);
        if (Array.isArray(extractedTasks) && extractedTasks.length > 1) {
          lines = extractedTasks;
        }
      } else {
        throw new Error("No brackets found");
      }
    } catch(e) {
      console.log('Failed to parse giant paragraph via AI, using fallback:', e.message);
      const splitRegex = /(?=\b(?:Show me|Open Chrome|Build a|Create a|Scaffold a|Create an|Generate a|Summarize this|Explain "|Search for|Scrape and|Complete 100|Fetch the|Write a|Save that|Open Command)\b)/i;
      const chunks = userMessage.replace(/^.*?execute this massive.*?list:\s*/i, '').split(splitRegex).map(s => s.trim()).filter(s => s.length > 5);
      if (chunks.length >= 3) {
        lines = chunks;
      }
    }
  }

  if (isMultiTaskPrompt && lines.length >= 2) {
    if (/^(?:hey\s+)?(?:luna)?\s*[,:!]*\s*(?:run|execute|do)\s*(?:these|the following)?\s*(?:tasks|commands)?\s*[:!]*\s*$/i.test(lines[0])) {
      lines.shift();
    }
    
    emitActivity(`Analyzing ${lines.length} tasks dynamically...`, '🧠');
    const responses = [];
    let taskNumber = 1;
    
    for (const taskLine of lines) {
      const taskMessage = taskLine.replace(/^(?:\d+\.?\s*)?(?:\[.*?\])?\s*[:-]?\s*/, '').trim();
      const taskType = detectTaskType(taskMessage);
      
      emitActivity(`Executing task ${taskNumber}: ${taskType}...`, '⚡');
      
      let result = null;
      let taskResponse = '';
      
      try {
        if (taskType === 'pdf_read') {
          result = await mediaExecutor.executePdfRead(taskMessage, realNickname);
        } else if (taskType === 'pc_control') {
          result = await pcExecutor.executePC(taskMessage, realNickname);
        } else if (taskType === 'code') {
          result = await pcExecutor.executeCode(taskMessage, realNickname);
        } else if (taskType === 'research') {
          result = await mediaExecutor.executeResearch(taskMessage, realNickname);
        } else if (taskType === 'autonomous_script') {
          result = await pcExecutor.executeAutonomousScript(taskMessage, realNickname);
        } else if ((taskType === 'summarize' || taskType === 'student') && /https?:\/\/[^\s]+/.test(taskMessage) && !/youtube\.com|youtu\.be/i.test(taskMessage)) {
          result = await mediaExecutor.executeSummarizeLink(taskMessage, realNickname);
        } else if (taskType === 'student') {
          result = await mediaExecutor.executeStudent(taskMessage, realNickname);
        } else if (taskType === 'image_gen') {
          result = await mediaExecutor.executeImageGen(taskMessage, realNickname);
        } else if (taskType === 'video_gen') {
          result = await mediaExecutor.executeVideoGen(taskMessage, realNickname);
        } else if (taskType === 'plugin_build') {
          result = await projectExecutor.executePluginBuild(taskMessage, realNickname);
        } else if (taskType === 'doc_create') {
          result = await mediaExecutor.executeDocCreate(taskMessage, realNickname);
        } else if (taskType === 'project_build') {
          result = await projectExecutor.executeProjectBuild(taskMessage, realNickname);
        } else if (taskType === 'spotify') {
          result = await pcExecutor.executeSpotify(taskMessage, realNickname);
        } else if (taskType === 'theme') {
          result = await pcExecutor.executeTheme(taskMessage, realNickname);
        } else if (taskType === 'automation') {
          result = await pcExecutor.executeAutomation(taskMessage, realNickname);
        } else if (taskType === 'rollback') {
          result = await projectExecutor.executeRollback(taskMessage, realNickname);
        } else {
           // chat fallback using brain
           const messages = [{ role: 'user', content: taskMessage }];
           const systemPrompt = `You are Luna. Your creator is Ravikiran. Answer the user's task directly.`;
           const brainTaskType = typeof mapTaskType === 'function' ? mapTaskType(taskType) : 'chat';
           result = await brain.smartCall(messages, systemPrompt, brainTaskType);
        }
        
        if (result && result.response) {
            taskResponse = result.response;
        } else if (result && result.content) {
            taskResponse = result.content;
        } else {
            taskResponse = "Task completed successfully.";
        }
        responses.push(`### Task ${taskNumber}: ${taskType.toUpperCase()} ✅\n${taskResponse}`);
      } catch (err) {
        responses.push(`### Task ${taskNumber}: ${taskType.toUpperCase()} ❌\nFailed: ${err.message}`);
      }
      taskNumber++;
      
      if (taskNumber <= lines.length) {
        emitActivity(`cooldown before task ${taskNumber}...`, '⏳');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    const finalResponse = `## 🌙 LUNA AI — DYNAMIC MULTI-TASK COMPLETE!\n\nHey **${realNickname}**, I have processed all ${lines.length} of your tasks completely autonomously using true swarm routing!\n\n${responses.join('\n\n')}\n\nAll tasks routed dynamically. Let me know if you want me to do anything else! 🚀`;
    memory.saveConversation('user', userMessage, emotion, null, threadId);
    memory.saveConversation('luna', finalResponse, 'neutral', 'multi-orchestrator', threadId);
    return { response: finalResponse, emotion, taskType: 'multi-task', providerUsed: 'Luna Dynamic Orchestrator' };
  }

  // 2. Detect task type
  const taskType = detectTaskType(userMessage);

  // 3. Check if asking about creator
  if (detectCreatorQuestion(userMessage)) {
    const responses = getCreatorResponse(realNickname, userMessage);
    if (typeof responses === 'string') {
      memory.saveConversation('user', userMessage || '...', emotion, null, threadId);
      memory.saveConversation('luna', responses || '...', 'neutral', 'hardcoded', threadId);
      return { response: responses, emotion, taskType: 'chat', providerUsed: 'Luna (hardcoded)' };
    }
    const isDeep = userMessage.toLowerCase().includes('tell me about') || (userMessage.length > 30 && userMessage.toLowerCase().includes('everything'));
    const response = isDeep ? responses.deep : responses.casual;

    memory.saveConversation('user', userMessage || '...', emotion, null, threadId);
    memory.saveConversation('luna', response || '...', 'neutral', 'hardcoded', threadId);

    return { response, emotion, taskType: 'chat', providerUsed: 'Luna (hardcoded)' };
  }

  // ═══════════════════════════════════════════
  // AGENTIC EXECUTION — Luna DOES things, not just talks
  // ═══════════════════════════════════════════

  const executors = {
    pdf_read: mediaExecutor.executePdfRead,
    pc_control: pcExecutor.executePC,
    automation: pcExecutor.executeAutomation,
    code: pcExecutor.executeCode,
    research: mediaExecutor.executeResearch,
    student: mediaExecutor.executeStudent,
    summarize: (m, n) => /https?:\/\//.test(m) ? mediaExecutor.executeSummarizeLink(m, n) : null,
    image_gen: mediaExecutor.executeImageGen,
    video_gen: mediaExecutor.executeVideoGen,
    plugin_build: projectExecutor.executePluginBuild,
    doc_create: mediaExecutor.executeDocCreate,
    spotify: pcExecutor.executeSpotify,
    theme: pcExecutor.executeTheme,
    project_build: projectExecutor.executeProjectBuild,
    rollback: projectExecutor.executeRollback,
    autonomous_script: pcExecutor.executeAutonomousScript
  };

  if (executors[taskType]) {
    const result = await executors[taskType](userMessage, realNickname, conversationHistory);
    if (result) {
      memory.saveConversation('user', userMessage || '...', emotion, null, threadId);
      memory.saveConversation('luna', result.response || '...', 'neutral', result.providerUsed || taskType, threadId);
      return { response: result.response, emotion, taskType, providerUsed: result.providerUsed || taskType };
    }
  } else if ((taskType === 'summarize' || taskType === 'student' || taskType === 'research') && /https?:\/\//.test(userMessage)) {
    const result = await mediaExecutor.executeSummarizeLink(userMessage, realNickname);
    if (result) {
      memory.saveConversation('user', userMessage || '...', emotion, null, threadId);
      memory.saveConversation('luna', result.response || '...', 'neutral', result.providerUsed || 'link-summary', threadId);
      return { response: result.response, emotion, taskType, providerUsed: result.providerUsed || 'link-summary' };
    }
  }

  // ═══════════════════════════════════════════
  // NORMAL CHAT — AI response for everything else
  // ═══════════════════════════════════════════

  // 4. Get context (memories + goals + summary)
  const recentMemories = (await memory.searchMemories(userMessage)).slice(0, 5);
  const activeGoals = memory.getActiveGoals().slice(0, 5);
  const latestSummary = memory.getLatestSummary(threadId);

  // 5. Build system prompt
  const systemPrompt = buildSystemPrompt(userNickname, emotion, recentMemories, activeGoals, latestSummary);

  // 6. Prepare message history for AI
  const messages = [];
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    messages.push({
      role: msg.role === 'luna' ? 'assistant' : 'user',
      content: msg.content,
    });
  }
  messages.push({ role: 'user', content: userMessage });

  // 7. Map task type to brain task type
  const brainTaskType = typeof mapTaskType === 'function' ? mapTaskType(taskType) : 'chat';

  // 8. Call the brain
  const result = await brain.smartCall(messages, systemPrompt, brainTaskType);

  // 9. Save to memory
  memory.saveConversation('user', userMessage || '...', emotion, null, threadId);
  memory.saveConversation('luna', result.content || '...', 'neutral', result.providerUsed || 'brain', threadId);

  // 10. Auto-extract memories from conversation
  autoExtractMemories(userMessage, userNickname);

  return {
    response: result.content,
    emotion,
    taskType,
    providerUsed: result.providerUsed,
  };
}

module.exports = {
  buildSystemPrompt,
  detectEmotion,
  detectTaskType,
  think,
  detectCreatorQuestion,
  getCreatorResponse,
  generateMorningBriefing,
  LUNA_IDENTITY,
};
