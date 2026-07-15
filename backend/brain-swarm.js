// ============================================
// 🧠 LUNA AI — Brain Swarm Routing
// Elite Squads & Context Pruning
// ============================================

const SQUADS = {
  coding: [
    'nvidia_deepseek_v4_flash', 'nvidia_deepseek_v4_pro', 'nvidia_qwen25_coder', 
    'nvidia_kimi_k2', 'nvidia_glm5_1', 'openrouter_qwen', 'openrouter_llama_70b', 
    'openrouter', 'gemini', 'nvidia_nim', 'deepseek', 'sambanova', 'together_qwen'
  ],
  research: [
    'nvidia_deepseek_r1', 'nvidia_llama33_70b', 'nvidia_glm5_2', 'nvidia_nemotron_ultra',
    'openrouter_llama_70b', 'openrouter_deepseek_r1', 'openrouter', 'gemini', 
    'sambanova', 'nvidia_nim', 'deepseek', 'cohere'
  ],
  creative: [
    'nvidia_mistral_large3', 'nvidia_mixtral_8x7b', 'nvidia_dracarys', 'nvidia_minimax_m3',
    'nvidia_mistral_medium', 'openrouter_mistral', 'openrouter_liquid', 'gemini',
    'openrouter', 'sambanova', 'together', 'huggingface_mistral', 'pollinations'
  ],
  fast: [
    'nvidia_llama31_8b', 'nvidia_mistral_nemo', 'nvidia_gemma3n_e2b', 'nvidia_gemma2_2b',
    'openrouter_phi', 'openrouter_llama', 'openrouter_gemma3', 'groq', 'cerebras', 'huggingface'
  ],
  chat: [
    'nvidia_minimax_m27', 'nvidia_mistral_large3', 'nvidia_llama31_8b', 'nvidia_gemma2_2b',
    'openrouter_llama_70b', 'groq', 'gemini', 'sambanova', 'openrouter_mistral',
    'openrouter_gemini', 'nvidia_nim', 'openrouter_llama', 'cohere', 'cerebras'
  ]
};

function routeToSquad(taskType) {
  const map = {
    code: 'coding',
    project_build: 'coding',
    plugin_build: 'coding',
    research: 'research',
    reasoning: 'research',
    student: 'research',
    creative: 'creative',
    image_gen: 'creative',
    video_gen: 'creative',
    doc_create: 'creative',
    summarize: 'fast',
    pc_control: 'fast',
    automation: 'fast',
    chat: 'chat'
  };
  const squadName = map[taskType] || 'chat';
  return SQUADS[squadName] || SQUADS.chat;
}

/**
 * Token Capacity Optimization
 * Ensures the payload doesn't exceed 4K tokens (~16,000 characters) to prevent crashes
 * during high-volume multi-agent delegation.
 */
function pruneContext(messages, maxTokens = 4000) {
  const maxChars = maxTokens * 4;
  let currentChars = 0;
  const pruned = [];
  
  let systemMsg = null;
  if (messages.length > 0 && messages[0].role === 'system') {
    systemMsg = messages[0];
    currentChars += systemMsg.content.length;
  }
  
  for (let i = messages.length - 1; i >= (systemMsg ? 1 : 0); i--) {
    const msg = messages[i];
    const msgLength = typeof msg.content === 'string' ? msg.content.length : JSON.stringify(msg.content).length;
    
    if (currentChars + msgLength > maxChars) {
      if (pruned.length === 0) {
        // If even the first most recent message is too long, truncate it
        const truncatedContent = typeof msg.content === 'string' 
          ? msg.content.substring(0, maxChars - currentChars) + '... [TRUNCATED]'
          : msg.content;
        pruned.unshift({ ...msg, content: truncatedContent });
      }
      break; 
    }
    pruned.unshift(msg);
    currentChars += msgLength;
  }
  
  if (systemMsg) pruned.unshift(systemMsg);
  return pruned;
}

module.exports = {
  SQUADS,
  routeToSquad,
  pruneContext
};
