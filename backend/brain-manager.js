// ============================================
// 🌙 LUNA AI — 8-Brain AI Orchestration
// Multi-provider cascade with health checks,
// auto-fallback, and smart routing
// ============================================

const axios = require('axios');
const Store = require('electron-store');
const store = new Store();
const nvidiaCatalog = require('./nvidia-catalog');
const brainSwarm = require('./brain-swarm');

// ── Provider Configurations ───────────────────
const PROVIDERS = {
  groq: {
    name: 'Groq',
    model: 'llama-3.3-70b-versatile',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    format: 'openai',
  },
  gemini: {
    name: 'Gemini (Pro)',
    model: 'gemini-2.5-pro', // Upgraded to Pro for elite 3D coding & complex architecture
    keyEnv: 'GEMINI_API_KEY',
    format: 'gemini',
  },
  openrouter: {
    name: 'OpenRouter (Claude/Premium)',
    model: 'anthropic/claude-3.7-sonnet', // Absolute best for coding & UI design
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  cohere: {
    name: 'Cohere',
    model: 'command-r-plus',
    url: 'https://api.cohere.ai/v1/chat',
    keyEnv: 'COHERE_API_KEY',
    format: 'cohere',
  },
  mistral: {
    name: 'Mistral (Large)',
    model: 'mistral-large-latest',
    url: 'https://api.mistral.ai/v1/chat/completions',
    keyEnv: 'MISTRAL_API_KEY',
    format: 'openai',
  },
  together: {
    name: 'Together AI (Llama 3.3)',
    model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    url: 'https://api.together.xyz/v1/chat/completions',
    keyEnv: 'TOGETHER_API_KEY',
    format: 'openai',
  },
  huggingface: {
    name: 'HuggingFace (Llama 3)',
    model: 'meta-llama/Meta-Llama-3-8B-Instruct',
    url: 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions',
    keyEnv: 'HF_API_KEY',
    format: 'openai',
  },
  huggingface_gemma: {
    name: 'HuggingFace (Gemma 2)',
    model: 'google/gemma-2-9b-it',
    url: 'https://api-inference.huggingface.co/models/google/gemma-2-9b-it/v1/chat/completions',
    keyEnv: 'HF_API_KEY',
    format: 'openai',
  },
  huggingface_mistral: {
    name: 'HuggingFace (Mistral Nemo)',
    model: 'mistralai/Mistral-Nemo-Instruct-2407',
    url: 'https://api-inference.huggingface.co/models/mistralai/Mistral-Nemo-Instruct-2407/v1/chat/completions',
    keyEnv: 'HF_API_KEY',
    format: 'openai',
  },
  pollinations: {
    name: 'Pollinations',
    model: 'openai',
    url: 'https://text.pollinations.ai/openai',
    keyEnv: null,
    format: 'openai-poll',
  },
  deepseek: {
    name: 'DeepSeek (Coder)',
    model: 'deepseek-coder',
    url: 'https://api.deepseek.com/chat/completions',
    keyEnv: 'DEEPSEEK_API_KEY',
    format: 'openai',
  },
  cerebras: {
    name: 'Cerebras (Llama 3.1 70B)',
    model: 'llama3.1-70b', // Fixed broken model name
    url: 'https://api.cerebras.ai/v1/chat/completions',
    keyEnv: 'CEREBRAS_API_KEY',
    format: 'openai',
  },
  openrouter_gemini: {
    name: 'OpenRouter (Gemini Flash Free)',
    model: 'google/gemini-2.5-flash:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_llama: {
    name: 'OpenRouter (Llama Free)',
    model: 'meta-llama/llama-3.1-8b-instruct:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_qwen: {
    name: 'OpenRouter (Qwen Coder Free)',
    model: 'qwen/qwen-2.5-coder-32b-instruct:free', // Incredible free coding model
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  together_small: {
    name: 'Together AI (Llama 3.2)',
    model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
    url: 'https://api.together.xyz/v1/chat/completions',
    keyEnv: 'TOGETHER_API_KEY',
    format: 'openai',
  },
  openrouter_deepseek_r1: {
    name: 'OpenRouter (DeepSeek R1 Free)',
    model: 'deepseek/deepseek-r1:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_mistral: {
    name: 'OpenRouter (Mistral Nemo Free)',
    model: 'mistralai/mistral-nemo:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_phi: {
    name: 'OpenRouter (Microsoft Phi-3 Free)',
    model: 'microsoft/phi-3-mini-128k-instruct:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_llama_70b: {
    name: 'OpenRouter (Llama 3 70B Free)',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  openrouter_liquid: {
    name: 'OpenRouter (Liquid LFM Free)',
    model: 'liquid/lfm-40b:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
  together_qwen: {
    name: 'Together AI (Qwen Coder)',
    model: 'Qwen/Qwen2.5-Coder-32B-Instruct',
    url: 'https://api.together.xyz/v1/chat/completions',
    keyEnv: 'TOGETHER_API_KEY',
    format: 'openai',
  },
  sambanova: {
    name: 'SambaNova (Llama 3.3 70B)',
    model: 'Meta-Llama-3.3-70B-Instruct',
    url: 'https://api.sambanova.ai/v1/chat/completions',
    keyEnv: 'SAMBANOVA_API_KEY',
    format: 'openai',
  },
  nvidia_nim: {
    name: 'NVIDIA NIM (Llama 3.1 70B)',
    model: 'meta/llama-3.1-70b-instruct',
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    keyEnv: 'NVIDIA_API_KEY',
    format: 'openai',
  },
  nvidia_nim_nemotron: {
    name: 'NVIDIA NIM (Nemotron)',
    model: 'nvidia/llama-3.1-nemotron-70b-instruct',
    url: 'https://integrate.api.nvidia.com/v1/chat/completions',
    keyEnv: 'NVIDIA_API_KEY',
    format: 'openai',
  },
  openrouter_gemma3: {
    name: 'OpenRouter (Gemma 3 27B Free)',
    model: 'google/gemma-3-27b-it:free',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    format: 'openai',
  },
};

// Merge NVIDIA models into PROVIDERS
Object.assign(PROVIDERS, nvidiaCatalog.getProviders());

// ── Response Cache (avoids duplicate API calls) ──
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(messages, systemPrompt) {
  const lastMsg = messages[messages.length - 1]?.content || '';
  return `${systemPrompt.slice(0, 50)}::${lastMsg.slice(0, 200)}`;
}

function getCachedResponse(key) {
  const cached = responseCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    console.log('🧠 Cache HIT — skipping API call');
    return cached.response;
  }
  if (cached) responseCache.delete(key); // expired
  return null;
}

function setCachedResponse(key, response) {
  // Keep cache small — max 100 entries (fixed: was duplicate threshold)
  if (responseCache.size > 100) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, { response, timestamp: Date.now() });
}

// ── Task Type → Provider Priority ─────────────
// Routing is now handled by the Brain Swarm architecture (brain-swarm.js)

// ── State ─────────────────────────────────────
const providerHealth = {};
const providerLatencies = {};
const requestCounts = {};
const tokenUsage = {};  // Track tokens per provider

// Initialize state
for (const key of Object.keys(PROVIDERS)) {
  providerHealth[key] = false; // Unknown until health check
  providerLatencies[key] = Infinity;
  requestCounts[key] = 0;
  tokenUsage[key] = { input: 0, output: 0, total: 0 };
}

// ── Get API Key ───────────────────────────────
function getKey(providerName) {
  const provider = PROVIDERS[providerName];
  if (!provider || !provider.keyEnv) return null;
  // Read from electron-store first, fallback to process.env
  return store.get(provider.keyEnv) || process.env[provider.keyEnv] || null;
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
    let lastResponse = null;  // Hoisted for token tracking across all formats

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
        lastResponse = res;
        content = res.data.choices[0].message.content;
        break;
      }

      case 'openai-poll': {
        // Pollinations — free, no API key
        const msgs = [];
        if (systemPrompt) msgs.push({ role: 'system', content: systemPrompt });
        msgs.push(...messages.map(m => ({
          role: m.role,
          content: Array.isArray(m.content) ? (m.content.find(c => c.type === 'text')?.text || '') : m.content
        })));

        const res = await axios.post('https://text.pollinations.ai/openai', {
          model: 'openai',
          messages: msgs,
          max_tokens: maxTokens,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });
        lastResponse = res;
        content = res.data.choices[0].message.content;
        
        // Remove Pollinations text ads
        content = content.replace(/---[\s\n]*\*\*Support Pollinations\.AI:?\*\*[\s\S]*$/i, '')
                         .replace(/🌸 \*\*Ad\*\* 🌸[\s\S]*$/i, '')
                         .trim();
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
          if (Array.isArray(msg.content)) {
            // Multi-modal Vision Support
            for (const item of msg.content) {
              if (item.type === 'text') {
                parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${item.text}\n` });
              } else if (item.type === 'image_url') {
                const b64Data = item.image_url.url.split(',')[1];
                const mimeType = item.image_url.url.split(';')[0].split(':')[1] || 'image/png';
                parts.push({
                  inlineData: {
                    mimeType: mimeType,
                    data: b64Data
                  }
                });
              }
            }
          } else {
            parts.push({ text: `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n` });
          }
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
        lastResponse = res;
        content = res.data.candidates[0].content.parts[0].text;
        break;
      }

      case 'cohere': {
        const chatHistory = [];
        let lastUserMsg = '';

        for (const msg of messages) {
          const textContent = Array.isArray(msg.content) ? (msg.content.find(c => c.type === 'text')?.text || '') : msg.content;
          if (msg.role === 'user') {
            lastUserMsg = textContent;
          } else {
            chatHistory.push({
              role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
              message: textContent,
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
        lastResponse = res;
        content = res.data.text;
        break;
      }

      case 'huggingface': {
        const prompt = messages.map(m => {
          const textContent = Array.isArray(m.content) ? (m.content.find(c => c.type === 'text')?.text || '') : m.content;
          return `${m.role}: ${textContent}`;
        }).join('\n');
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
        lastResponse = res;
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

    // Track token usage from API response (OpenAI-format providers return usage)
    try {
      if (lastResponse && lastResponse.data && lastResponse.data.usage) {
        const u = lastResponse.data.usage;
        if (!tokenUsage[providerName]) tokenUsage[providerName] = { input: 0, output: 0, total: 0 };
        tokenUsage[providerName].input += (u.prompt_tokens || 0);
        tokenUsage[providerName].output += (u.completion_tokens || 0);
        tokenUsage[providerName].total += (u.total_tokens || (u.prompt_tokens || 0) + (u.completion_tokens || 0));
      } else {
        // Estimate tokens for providers that don't return usage (~4 chars per token)
        const estimatedTokens = Math.ceil((content || '').length / 4);
        if (!tokenUsage[providerName]) tokenUsage[providerName] = { input: 0, output: 0, total: 0 };
        tokenUsage[providerName].output += estimatedTokens;
        tokenUsage[providerName].total += estimatedTokens;
      }
    } catch { /* token tracking is best-effort */ }

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
  let nvidiaChecked = false;
  let nvidiaSuccess = false;
  let nvidiaLatency = Infinity;

  const checks = Object.keys(PROVIDERS).map(async (name) => {
    const provider = PROVIDERS[name];
    const apiKey = getKey(name);

    // Skip providers without keys (except pollinations)
    if (provider.keyEnv && !apiKey) {
      providerHealth[name] = false;
      providerLatencies[name] = Infinity;
      return;
    }
    
    // Group NVIDIA checks to save startup time
    if (name.startsWith('nvidia_')) {
      if (nvidiaChecked) {
        providerHealth[name] = nvidiaSuccess;
        providerLatencies[name] = nvidiaLatency;
        return;
      }
      nvidiaChecked = true; // Claim the check
    }

    const result = await callProvider(name, [{ role: 'user', content: 'Hi' }], '', 10);
    
    providerHealth[name] = result.success;
    providerLatencies[name] = result.success ? result.latency : Infinity;
    
    if (name.startsWith('nvidia_')) {
      nvidiaSuccess = result.success;
      nvidiaLatency = providerLatencies[name];
    }

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

  // Then every 5 minutes (re-enabled for v2.1 — providers need periodic re-evaluation)
  healthInterval = setInterval(healthCheck, 5 * 60 * 1000);
}

function stopHealthChecks() {
  if (healthInterval) {
    clearInterval(healthInterval);
    healthInterval = null;
  }
}

// ── Get Best Provider for Task Type ───────────
function getBestProvider(taskType = 'chat') {
  const priorities = brainSwarm.routeToSquad(taskType);

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
  const priorities = brainSwarm.routeToSquad(taskType);
  const tried = [];

  // Check cache first (skip for code/project tasks which should always be fresh)
  if (taskType !== 'code' && taskType !== 'project_build' && taskType !== 'plugin_build') {
    const cacheKey = getCacheKey(messages, systemPrompt);
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
  }

  // Determine token limits based on task type
  let maxTokens = 8000;
  if (taskType === 'code' || taskType === 'project_build') {
    maxTokens = 32000;
  } else if (taskType === 'reasoning') {
    maxTokens = 16000;
  }

  // Optimize context (ensure < 4K tokens) before sending to API
  const optimizedMessages = brainSwarm.pruneContext(messages, Math.min(maxTokens, 4000));

  // Manual Model Override
  const manualModel = store.get('manual_model_override');
  if (manualModel && manualModel !== 'auto' && PROVIDERS[manualModel]) {
    // We attempt to use the manual model if it has a key (or doesn't need one)
    const key = getKey(manualModel);
    if (key || !PROVIDERS[manualModel].keyEnv) {
      const result = await callProvider(manualModel, optimizedMessages, systemPrompt, maxTokens);
      if (result.success) {
        return {
          success: true,
          content: result.content,
          providerUsed: PROVIDERS[manualModel].name,
          latency: result.latency,
        };
      }
      console.log(`⚠️ Manual model ${manualModel} failed, falling back to auto-routing...`);
    }
  }

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
      const response = {
        success: true,
        content: result.content,
        providerUsed: PROVIDERS[providerName].name,
        latency: result.latency,
      };
      // Cache the response for future identical questions
      if (taskType !== 'code' && taskType !== 'project_build' && taskType !== 'plugin_build') {
        const cacheKey = getCacheKey(messages, systemPrompt);
        setCachedResponse(cacheKey, response);
      }
      return response;
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
    tokenUsage: { ...tokenUsage },
    providers: Object.entries(PROVIDERS).map(([key, p]) => ({
      id: key,
      name: p.name,
      model: p.model,
      healthy: providerHealth[key],
      latency: providerLatencies[key],
      requests: requestCounts[key] || 0,
      tokens: tokenUsage[key] || { input: 0, output: 0, total: 0 },
      hasKey: p.keyEnv ? !!getKey(key) : true,
    })),
  };
}

// ── Get Token Usage Summary ───────────────────
function getTokenUsage() {
  let totalTokens = 0;
  for (const key of Object.keys(tokenUsage)) {
    totalTokens += (tokenUsage[key]?.total || 0);
  }
  return {
    perProvider: { ...tokenUsage },
    totalTokensThisSession: totalTokens,
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
  getTokenUsage,
  getKey,
  PROVIDERS,
};
