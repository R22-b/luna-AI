// ============================================
// 🌙 LUNA AI — 8-Brain AI Orchestration
// Multi-provider cascade with health checks,
// auto-fallback, and smart routing
// ============================================

const axios = require('axios');

// ── Provider Configurations ───────────────────
const PROVIDERS = {
  groq: {
    name: 'Groq',
    model: 'llama-3.1-8b-instant',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    format: 'openai',
  },
  gemini: {
    name: 'Gemini',
    model: 'gemini-2.0-flash',
    keyEnv: 'GEMINI_API_KEY',
    format: 'gemini',
  },
  openrouter: {
    name: 'OpenRouter',
    model: 'openai/gpt-3.5-turbo',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  cohere: {
    name: 'Cohere',
    model: 'command-r',
    url: 'https://api.cohere.ai/v1/chat',
    keyEnv: 'COHERE_API_KEY',
    format: 'cohere',
  },
  mistral: {
    name: 'Mistral',
    model: 'mistral-small-latest',
    url: 'https://api.mistral.ai/v1/chat/completions',
    keyEnv: 'MISTRAL_API_KEY',
    format: 'openai',
  },
  together: {
    name: 'Together AI',
    model: 'meta-llama/Llama-3-8b-chat-hf',
    url: 'https://api.together.xyz/v1/chat/completions',
    keyEnv: 'TOGETHER_API_KEY',
    format: 'openai',
  },
  huggingface: {
    name: 'HuggingFace',
    model: 'mistralai/Mistral-7B-Instruct-v0.2',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    keyEnv: 'HF_API_KEY',
    format: 'huggingface',
  },
  pollinations: {
    name: 'Pollinations',
    model: 'openai',
    url: 'https://text.pollinations.ai/openai',
    keyEnv: null, // Free, no key needed
    format: 'openai-poll',
  },
};

// ── Task Type → Provider Priority ─────────────
const TASK_PRIORITIES = {
  chat:      ['groq', 'gemini', 'pollinations', 'openrouter'],
  reasoning: ['gemini', 'openrouter', 'pollinations', 'groq'],
  code:      ['gemini', 'pollinations', 'groq', 'openrouter', 'mistral'],
  summarize: ['gemini', 'openrouter', 'pollinations', 'groq'],
  creative:  ['gemini', 'together', 'pollinations', 'openrouter'],
  research:  ['gemini', 'pollinations', 'openrouter', 'groq'],
};

// ── State ─────────────────────────────────────
const providerHealth = {};
const providerLatencies = {};
const requestCounts = {};

// Initialize state
for (const key of Object.keys(PROVIDERS)) {
  providerHealth[key] = false; // Unknown until health check
  providerLatencies[key] = Infinity;
  requestCounts[key] = 0;
}

// ── Get API Key ───────────────────────────────
function getKey(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider || !provider.keyEnv) return null;
  return process.env[provider.keyEnv] || null;
}

// ── Call Individual Provider ──────────────────
async function callProvider(providerName, messages, systemPrompt = '', maxTokens = 1000) {
  const provider = PROVIDERS[providerName];
  if (!provider) return { success: false, content: null, latency: 0, error: 'Unknown provider' };

  const apiKey = getKey(providerName);
  if (provider.keyEnv && !apiKey) {
    return { success: false, content: null, latency: 0, error: 'No API key' };
  }

  const startTime = Date.now();

  try {
    let content = '';

    switch (provider.format) {
      case 'openai': {
        const msgs = [];
        if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
        msgs.push(...messages);

        const res = await axios.post(provider.url, {
          model: provider.model,
          messages: msgs,
          max_tokens: maxTokens,
          temperature: 0.7,
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
        content = res.data.choices[0].message.content;
        break;
      }

      case 'openai-poll': {
        // Pollinations — free, no API key
        const msgs = [];
        if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
        msgs.push(...messages);

        const res = await axios.post('https://text.pollinations.ai/openai', {
          model: 'openai',
          messages: msgs,
          max_tokens: maxTokens,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        content = res.data.choices[0].message.content;
        break;
      }

      case 'gemini': {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${apiKey}`;

        // Convert messages to Gemini format
        const parts = [];
        if (systemPrompt) {
          parts.push({ text: `System: ${systemPrompt}\n\n` });
        }
        for (const msg of messages) {
          parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n` });
        }

        const res = await axios.post(url, {
          contents: [{ parts }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        content = res.data.candidates[0].content.parts[0].text;
        break;
      }

      case 'cohere': {
        const chatHistory = [];
        let lastUserMsg = '';

        for (const msg of messages) {
          if (msg.role === 'user') {
            lastUserMsg = msg.content;
          } else {
            chatHistory.push({
              role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
              message: msg.content,
            });
          }
        }

        const res = await axios.post(provider.url, {
          model: provider.model,
          message: lastUserMsg,
          chat_history: chatHistory,
          preamble: systemPrompt || undefined,
          max_tokens: maxTokens,
          temperature: 0.7,
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
        content = res.data.text;
        break;
      }

      case 'huggingface': {
        const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

        const res = await axios.post(provider.url, {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: 0.7,
            return_full_text: false,
          },
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        });
        content = Array.isArray(res.data) ? res.data[0].generated_text : res.data.generated_text;
        break;
      }

      default:
        return { success: false, content: null, latency: 0, error: 'Unknown format' };
    }

    const latency = Date.now() - startTime;
    requestCounts[providerName] = (requestCounts[providerName] || 0) + 1;
    providerHealth[providerName] = true;
    providerLatencies[providerName] = latency;

    return { success: true, content, latency, error: null };

  } catch (err) {
    const latency = Date.now() - startTime;
    providerHealth[providerName] = false;

    const errorMsg = err.response?.data?.error?.message
      || err.response?.data?.message
      || err.message
      || 'Unknown error';

    return { success: false, content: null, latency, error: errorMsg };
  }
}

// ── Health Check ──────────────────────────────
async function healthCheck() {
  console.log('🧠 Running AI provider health checks...');

  const checks = Object.keys(PROVIDERS).map(async (name) => {
    const provider = PROVIDERS[name];
    const apiKey = getKey(name);

    // Skip providers without keys (except pollinations)
    if (provider.keyEnv && !apiKey) {
      providerHealth[name] = false;
      providerLatencies[name] = Infinity;
      return;
    }

    const result = await callProvider(name, [{ role: 'user', content: 'Hi' }], '', 10);
    providerHealth[name] = result.success;
    providerLatencies[name] = result.success ? result.latency : Infinity;

    const status = result.success ? `✅ ${result.latency}ms` : `❌ ${result.error}`;
    console.log(`  ${provider.name}: ${status}`);
  });

  await Promise.allSettled(checks);

  const healthy = Object.entries(providerHealth).filter(([, v]) => v).map(([k]) => k);
  console.log(`🧠 Healthy providers: ${healthy.length}/${Object.keys(PROVIDERS).length}`);
}

// ── Start Periodic Health Checks ──────────────
let healthInterval = null;

function startHealthChecks() {
  // Run immediately
  healthCheck();

  // Then every 3 minutes
  healthInterval = setInterval(healthCheck, 3 * 60 * 1000);
}

function stopHealthChecks() {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
  }
}

// ── Get Best Provider for Task Type ───────────
function getBestProvider(taskType = 'chat') {
  const priorities = TASK_PRIORITIES[taskType] || TASK_PRIORITIES.chat;

  // Return first healthy provider in priority list
  for (const name of priorities) {
    if (providerHealth[name]) {
      return name;
    }
  }

  // If none healthy in priority list, try any healthy provider
  for (const [name, healthy] of Object.entries(providerHealth)) {
    if (healthy) return name;
  }

  // Last resort: pollinations (always free, no key needed)
  return 'pollinations';
}

// ── Smart Call (with auto-fallback) ───────────
async function smartCall(messages, systemPrompt = '', taskType = 'chat') {
  const priorities = TASK_PRIORITIES[taskType] || TASK_PRIORITIES.chat;
  const tried = [];

  // Determine token limits based on task type
  const maxTokens = (taskType === 'code' || taskType === 'project_build') ? 8000 : 1500;

  // Try providers in priority order
  for (let attempt = 0; attempt < priorities.length; attempt++) {
    // Pick next provider to try
    let providerName = null;

    for (const name of priorities) {
      if (!tried.includes(name) && (providerHealth[name] || attempt > 0)) {
        providerName = name;
        break;
      }
    }

    // If no provider found in priority list, try any untried provider
    if (!providerName) {
      for (const name of Object.keys(PROVIDERS)) {
        if (!tried.includes(name)) {
          providerName = name;
          break;
        }
      }
    }

    if (!providerName) break; // No more providers to try

    tried.push(providerName);
    const result = await callProvider(providerName, messages, systemPrompt, maxTokens);

    if (result.success) {
      return {
        success: true,
        content: result.content,
        providerUsed: PROVIDERS[providerName].name,
        latency: result.latency,
      };
    }

    console.log(`⚠️ ${PROVIDERS[providerName].name} failed, trying next...`);
  }

  // ABSOLUTE LAST RESORT: always try Pollinations directly
  if (!tried.includes('pollinations')) {
    const result = await callProvider('pollinations', messages, systemPrompt, maxTokens);
    if (result.success) {
      return { success: true, content: result.content, providerUsed: 'Pollinations', latency: result.latency };
    }
  }

  return {
    success: false,
    content: "baddy all my brains are down right now 😵 try again in a sec",
    providerUsed: 'none',
    latency: 0,
  };
}

// ── Get Provider Stats ────────────────────────
function getProviderStats() {
  return {
    providerHealth: { ...providerHealth },
    providerLatencies: { ...providerLatencies },
    requestCounts: { ...requestCounts },
    providers: Object.entries(PROVIDERS).map(([key, p]) => ({
      id: key,
      name: p.name,
      model: p.model,
      healthy: providerHealth[key],
      latency: providerLatencies[key],
      requests: requestCounts[key] || 0,
      hasKey: p.keyEnv ? !!getKey(key) : true,
    })),
  };
}

// ── Export ─────────────────────────────────────
module.exports = {
  smartCall,
  callProvider,
  getBestProvider,
  healthCheck,
  startHealthChecks,
  stopHealthChecks,
  getProviderStats,
  PROVIDERS,
};
