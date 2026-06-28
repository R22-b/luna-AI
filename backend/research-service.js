const searchEngine = require('./search-engine');
const studentTools = require('./student-tools');

function setDependencies({ emitActivity }) {
  this.emitActivity = emitActivity;
}

async function executeResearch(message, nickname) {
  try {
    const query = message.replace(/^(search|research|find|look up|what'?s the latest)\s*(for|about|on)?\s*/i, '').trim();

    if (!query || query.length < 3) return null;

    if (this.emitActivity) this.emitActivity(`searching the web for "${query}"...`, '🔍');
    const result = await searchEngine.searchAndSummarize(query, `You are Luna, a Gen-Z AI. Summarize these search results for ${nickname}. Be concise, cite sources.`);

    if (result && result.answer) {
      let response = result.answer;
      if (result.success && result.sources && result.sources.length > 0) {
        response += '\n\n📎 sources:\n' + result.sources.slice(0, 3).map(s => `• ${s.title} — ${s.url}`).join('\n');
      }
      return { response, providerUsed: result.provider || 'search+ai' };
    }

    return null;
  } catch (err) {
    return { response: `oops, my search engine crashed: ${err.message}`, providerUsed: 'error' };
  }
}

async function executeSummarizeLink(message, nickname) {
  try {
    const urlMatch = message.match(/(https?:\/\/[^\s]+)/i);
    if (!urlMatch) return null;
    const url = urlMatch[1];

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (this.emitActivity) this.emitActivity('fetching YouTube transcript...', '🎬');
      const result = await studentTools.summarizeYouTube(url);
      if (result && result.success) {
        return { 
          response: `yo ${nickname}, i watched that video for you! 🎬\n\n**${result.title}**\n\n${result.summary}`, 
          providerUsed: result.providerUsed || 'youtube-transcript' 
        };
      }
    }

    if (this.emitActivity) this.emitActivity(`fetching and summarizing link...`, '🌐');
    
    const result = await searchEngine.summarizeLink(url);
    if (result && result.success) {
      return { 
        response: `yo ${nickname}, i checked that link for you! 🌐\n\n**${result.title || 'Link Summary'}**\n\n${result.summary}`, 
        providerUsed: 'link-summary' 
      };
    }
    
    return { response: `oops ${nickname}, i tried to read that link but it blocked me or it's down 😅`, providerUsed: 'system' };
  } catch (err) {
    return { response: `oops ${nickname}, link summary failed: ${err.message}`, providerUsed: 'error' };
  }
}

module.exports = {
  setDependencies,
  executeResearch,
  executeSummarizeLink
};
