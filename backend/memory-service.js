const memory = require('./memory');

// Auto-extract important info from user messages
function autoExtractMemories(message, nickname) {
  const lower = message.toLowerCase();

  // Name
  const nameMatch = message.match(/(?:call me|my name is)\s+(\w+)/i);
  if (nameMatch) { 
    memory.saveUserProfile('nickname', nameMatch[1]); 
    memory.saveMemory('user_preferred_name', nameMatch[1], 'preference', 8); 
  }

  // Location
  const locMatch = message.match(/(?:i live in|i'm from|i am from)\s+(.+?)[\.\,\!]?$/i);
  if (locMatch) memory.saveMemory('user_location', locMatch[1].trim(), 'preference', 6);

  // Birthday
  const bdayMatch = message.match(/(?:my birthday is|i was born on)\s+(.+?)[\.\,\!]?$/i);
  if (bdayMatch) memory.saveMemory('user_birthday', bdayMatch[1].trim(), 'fact', 5);

  // Family
  const familyMatch = message.match(/(?:my (mom|dad|brother|sister|sibling|parents) is|name is)\s+(.+?)[\.\,\!]?$/i);
  if (familyMatch) memory.saveMemory(`family_${familyMatch[1]}`, familyMatch[2].trim(), 'family', 4);

  // Dreams / Goals
  const goalMatch = message.match(/(?:i want to|my goal is to|i'm trying to|i hope to|i need to|i'm building|i want a job as)\s+(.+?)[\.\,\!]?$/i);
  if (goalMatch) {
    const goalTitle = goalMatch[1].trim();
    memory.saveGoal(goalTitle, `Added automatically via chat: "${message}"`);
    memory.saveMemory(`casual_goal_${Date.now()}`, goalTitle, 'goal', 5);
  }

  // Tech stack
  const techWords = ['python', 'javascript', 'react', 'node', 'java', 'c++', 'flutter', 'django', 'mongodb', 'mysql', 'typescript', 'kotlin', 'swift', 'next.js', 'electron', 'tailwind', 'vite'];
  const foundTech = techWords.filter(t => lower.includes(t));
  if (foundTech.length > 0) memory.saveMemory(`tech_preference`, foundTech.join(', '), 'technical', 5);

  // Mood Patterns
  const emotions = ['happy', 'sad', 'stressed', 'tired', 'bored', 'excited', 'angry', 'annoyed'];
  const foundEmotion = emotions.find(e => lower.includes(`i am ${e}`) || lower.includes(`i'm ${e}`) || lower.includes(`feeling ${e}`));
  if (foundEmotion) memory.saveMemory(`mood_pattern_${new Date().getDay()}`, foundEmotion, 'behaviour', 3);

  // Procrastination patterns
  const procrastWords = ['later', 'tomorrow', 'not now', "i'll do it", 'maybe later', 'not today', 'cba', 'lazy'];
  if (procrastWords.some(w => lower.includes(w))) memory.saveMemory(`procrastination_log`, `User showed lazy pattern on ${new Date().toDateString()}: "${message}"`, 'behaviour', 6);

  // Current project
  const projectMatch = message.match(/(?:working on|building|making|my project(?:\s+is)?)\s+(.+?)[\.\,\!]?$/i);
  if (projectMatch) memory.saveMemory(`current_project`, projectMatch[1].trim(), 'project', 7);

  // Academic/Student Context
  if (/exam|college|assignment|semester|bca|mca|btec|degree|university|study|homework/.test(lower)) {
    memory.saveMemory(`academic_context`, message, 'academic', 5);
  }

  // Interests
  const interestMatch = message.match(/(?:i love|i like|my favorite|i enjoy)\s+(.+?)[\.\,\!]?$/i);
  if (interestMatch) memory.saveMemory(`interest_${Date.now()}`, interestMatch[1].trim(), 'preference', 4);
}

module.exports = {
  autoExtractMemories
};
