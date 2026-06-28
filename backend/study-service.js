const student = require('./student-tools');

function setDependencies({ emitActivity }) {
  this.emitActivity = emitActivity;
}

async function executeStudent(message, nickname) {
  try {
    const lower = message.toLowerCase();
    
    if (/youtube\.com|youtu\.be/i.test(message)) {
      const urlMatch = message.match(/(https?:\/\/[^\s]+youtube[^\s]+|https?:\/\/youtu\.be\/[^\s]+)/i);
      if (urlMatch) {
        if (this.emitActivity) this.emitActivity('fetching YouTube transcript...', '📺');
        const result = await student.summarizeYouTube(urlMatch[1]);
        if (result.success) {
          return { response: `yo ${nickname}, i watched that video for you! 📺\n\n${result.summary}`, providerUsed: result.providerUsed };
        } else {
          return { response: `sorry ${nickname}, tried to grab the YouTube transcript but failed: ${result.error}`, providerUsed: 'system' };
        }
      }
    }
    
    if (/feynman|explain.*like.*10|analog/i.test(lower)) {
      const topic = message.replace(/.*(?:feynman|explain)\s*(?:about|on|what is)?\s*/i, '').trim();
      if (this.emitActivity) this.emitActivity('simplifying topic with Feynman technique...', '🧠');
      const result = await student.feynmanExplain(topic || 'Quantum Physics');
      if (result.success) {
        return { response: result.explanation, providerUsed: result.providerUsed };
      }
    }
    
    if (/recall|quiz|test me/i.test(lower)) {
      const topic = message.replace(/.*(?:recall|quiz|test me)\s*(?:on|about)?\s*/i, '').trim();
      if (this.emitActivity) this.emitActivity('generating active recall question...', '❓');
      const result = await student.activeRecall(topic || 'General Science');
      if (result.success) {
        return { response: `let's do active recall ${nickname}! 🧠\n\n**Question:** ${result.question}`, providerUsed: 'active-recall' };
      }
    }
    
    return null;
  } catch (err) {
    return { response: `student tools failed: ${err.message}`, providerUsed: 'error' };
  }
}

module.exports = {
  setDependencies,
  executeStudent
};
