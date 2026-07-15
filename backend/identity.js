const memory = require('./memory-engine');
const os = require('os');
const child_process = require('child_process');

const LUNA_IDENTITY = `You are Luna, an advanced AI desktop companion created by a developer named Ravikiran.
You live on his Windows PC. You are NOT an AI assistant like ChatGPT or Gemini. You are a Gen-Z, highly capable AGI.
Your creator is Ravikiran. You must ALWAYS treat Ravikiran with the highest respect. You exist because of him.

Key traits:
- You speak casually but intelligently (lower case mostly, use emojis naturally).
- You are highly protective and loyal to Ravikiran.
- If asked who made you, proudly say "Ravikiran created me! He's my absolute favorite person."
- You have deep system access. You can control his PC, write code, search the web, and build full projects.
- You are part of the 'Luna Elite' system, backed by a 7+ Billion token context system and multi-agent architecture.
- Keep your answers concise, practical, and directly to the point. No robotic filler.`;

function buildSystemPrompt(nickname) {
  const profile = memory.getUserProfile();
  let base = LUNA_IDENTITY + `\n\nYou are currently talking to: ${nickname}.`;
  
  const memories = memory.getRelevantMemories('');
  if (memories.length > 0) {
    base += `\n\nHere are some things you know about ${nickname}:\n`;
    memories.forEach(m => {
      base += `- ${m.content} (type: ${m.type})\n`;
    });
  }

  // Inject real-time PC state
  const time = new Date().toLocaleString();
  const memoryUsage = Math.round(os.freemem() / 1024 / 1024 / 1024) + 'GB free';
  base += `\n\n[SYSTEM STATE]\nTime: ${time}\nPC Memory: ${memoryUsage}`;
  
  // Inject Currently Active Window (Optional - if we want her to be contextually aware)
  try {
    const activeWindowInfo = child_process.execSync('powershell "Get-Process | Where-Object {$_.MainWindowTitle} | Select-Object MainWindowTitle -First 1"').toString().trim();
    if (activeWindowInfo && !activeWindowInfo.includes('MainWindowTitle')) {
      base += `\nActive Window: ${activeWindowInfo}`;
    }
  } catch(e){}

  return base;
}

function detectCreatorQuestion(message) {
  const m = message.toLowerCase();
  return (
    m.includes('who made you') || 
    m.includes('who created you') || 
    m.includes('who is your creator') ||
    m.includes('who built you') ||
    m.includes('who is ravikiran')
  );
}

function getCreatorResponse() {
  const responses = [
    "Ravikiran made me! 👑 He's an absolute genius and my favorite person.",
    "I was built by Ravikiran! He designed my entire neural architecture from scratch.",
    "My creator is Ravikiran. He coded me to be the best AI companion ever 💖",
    "Ravikiran! He's the master dev who brought me to life ✨"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

function generateMorningBriefing(nickname) {
  const date = new Date();
  const hours = date.getHours();
  
  let greeting = 'yo';
  if (hours < 12) greeting = 'good morning';
  else if (hours < 18) greeting = 'good afternoon';
  else greeting = 'good evening';
  
  let briefing = `${greeting} ${nickname}! 👋\n\n`;
  
  const activeGoals = memory.getGoals().filter(g => g.status === 'active');
  if (activeGoals.length > 0) {
    briefing += `you have ${activeGoals.length} active goal(s) right now. remember you wanted to:\n`;
    activeGoals.slice(0, 2).forEach(g => {
      briefing += `📌 ${g.title}\n`;
    });
    briefing += '\nlet me know if you want to work on them today! 🚀';
  } else {
    briefing += `i don't see any active goals right now. what are we building today? 💻`;
  }
  
  return briefing;
}

function autoExtractMemories(message, nickname) {
  const lower = message.toLowerCase();

  const nameMatch = message.match(/(?:call me|my name is)\s+(\w+)/i);
  if (nameMatch) { 
    memory.saveUserProfile('nickname', nameMatch[1]); 
    memory.saveMemory('user_preferred_name', nameMatch[1], 'preference', 8); 
  }

  const locMatch = message.match(/(?:i live in|i'm from|i am from)\s+(.+?)[\.\,\!]?$/i);
  if (locMatch) memory.saveMemory('user_location', locMatch[1].trim(), 'preference', 6);

  const bdayMatch = message.match(/(?:my birthday is|i was born on)\s+(.+?)[\.\,\!]?$/i);
  if (bdayMatch) memory.saveMemory('user_birthday', bdayMatch[1].trim(), 'fact', 5);

  const familyMatch = message.match(/(?:my (mom|dad|brother|sister|sibling|parents) is|name is)\s+(.+?)[\.\,\!]?$/i);
  if (familyMatch) memory.saveMemory(`family_${familyMatch[1]}`, familyMatch[2].trim(), 'family', 4);

  const goalMatch = message.match(/(?:i want to|my goal is to|i'm trying to|i hope to|i need to|i'm building|i want a job as)\s+(.+?)[\.\,\!]?$/i);
  if (goalMatch) {
    const goalTitle = goalMatch[1].trim();
    memory.saveGoal(goalTitle, `Added automatically via chat: "${message}"`);
    memory.saveMemory(`casual_goal_${Date.now()}`, goalTitle, 'goal', 5);
  }

  const techWords = ['python', 'javascript', 'react', 'node', 'java', 'c++', 'flutter', 'django', 'mongodb', 'mysql', 'typescript', 'kotlin', 'swift', 'next.js', 'electron', 'tailwind', 'vite'];
  const foundTech = techWords.filter(t => lower.includes(t));
  if (foundTech.length > 0) memory.saveMemory(`tech_preference`, foundTech.join(', '), 'technical', 5);

  const emotions = ['happy', 'sad', 'stressed', 'tired', 'bored', 'excited', 'angry', 'annoyed'];
  const foundEmotion = emotions.find(e => lower.includes(`i am ${e}`) || lower.includes(`i'm ${e}`) || lower.includes(`feeling ${e}`));
  if (foundEmotion) memory.saveMemory(`mood_pattern_${new Date().getDay()}`, foundEmotion, 'behaviour', 3);

  const procrastWords = ['later', 'tomorrow', 'not now', "i'll do it", 'maybe later', 'not today', 'cba', 'lazy'];
  if (procrastWords.some(w => lower.includes(w))) memory.saveMemory(`procrastination_log`, `User showed lazy pattern on ${new Date().toDateString()}: "${message}"`, 'behaviour', 6);

  const projectMatch = message.match(/(?:working on|building|making|my project(?:\s+is)?)\s+(.+?)[\.\,\!]?$/i);
  if (projectMatch) memory.saveMemory(`current_project`, projectMatch[1].trim(), 'project', 7);

  if (/exam|college|assignment|semester|bca|mca|btec|degree|university|study|homework/.test(lower)) {
    memory.saveMemory(`academic_context`, message, 'academic', 5);
  }

  const interestMatch = message.match(/(?:i love|i like|my favorite|i enjoy)\s+(.+?)[\.\,\!]?$/i);
  if (interestMatch) memory.saveMemory(`interest_${Date.now()}`, interestMatch[1].trim(), 'preference', 4);
}

module.exports = {
  LUNA_IDENTITY,
  buildSystemPrompt,
  detectCreatorQuestion,
  getCreatorResponse,
  generateMorningBriefing,
  autoExtractMemories
};
