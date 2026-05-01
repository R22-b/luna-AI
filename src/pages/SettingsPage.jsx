import React, { useState, useEffect } from 'react';

const PROVIDERS = [
  { key: 'GROQ_API_KEY', name: 'Groq', desc: 'Fastest inference', link: 'https://console.groq.com/keys', free: true },
  { key: 'GEMINI_API_KEY', name: 'Gemini', desc: 'Best reasoning', link: 'https://aistudio.google.com/apikey', free: true },
  { key: 'OPENROUTER_API_KEY', name: 'OpenRouter', desc: 'Multi-model access', link: 'https://openrouter.ai/keys', free: true },
  { key: 'COHERE_API_KEY', name: 'Cohere', desc: 'Best summarization', link: 'https://dashboard.cohere.com/api-keys', free: true },
  { key: 'MISTRAL_API_KEY', name: 'Mistral', desc: 'Best for code', link: 'https://console.mistral.ai/api-keys', free: true },
  { key: 'TOGETHER_API_KEY', name: 'Together AI', desc: 'Creative tasks', link: 'https://api.together.xyz/settings/api-keys', free: true },
  { key: 'HF_API_KEY', name: 'HuggingFace', desc: 'Specialized models', link: 'https://huggingface.co/settings/tokens', free: true },
  { key: 'SERPER_API_KEY', name: 'Serper', desc: 'Web search', link: 'https://serper.dev/api-keys', free: true },
  { key: 'BRAVE_SEARCH_KEY', name: 'Brave Search', desc: 'Backup search', link: 'https://brave.com/search/api/', free: true },
  { key: 'OPENWEATHER_KEY', name: 'OpenWeather', desc: 'Weather data', link: 'https://openweathermap.org/appid', free: true },
  { key: 'NEWS_API_KEY', name: 'NewsAPI', desc: 'News headlines', link: 'https://newsapi.org/register', free: true },
];

export default function SettingsPage() {
  const [profile, setProfile] = useState({});
  const [nick, setNick] = useState('');
  const [apiKeys, setApiKeys] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [keyInput, setKeyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  useEffect(() => { loadProfile(); loadApiKeys(); }, []);

  async function loadProfile() {
    const res = await window.luna?.getProfile();
    if (res?.success) { setProfile(res.profile || {}); setNick(res.profile?.nickname || 'baddy'); }
  }

  async function loadApiKeys() {
    const res = await window.luna?.getApiKeys();
    if (res?.success) setApiKeys(res.keys || {});
  }

  async function saveNickname() {
    await window.luna?.setProfile({ key: 'nickname', value: nick });
    loadProfile();
    setSaved('nickname');
    setTimeout(() => setSaved(null), 2000);
  }

  async function saveKey(keyName) {
    if (!keyInput.trim()) return;
    setSaving(true);
    const res = await window.luna?.saveApiKey({ keyName, keyValue: keyInput.trim() });
    setSaving(false);
    if (res?.success) {
      setSaved(keyName);
      setEditingKey(null);
      setKeyInput('');
      loadApiKeys();
      setTimeout(() => setSaved(null), 2000);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-6">Settings ⚙️</h1>

      {/* User Profile */}
      <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-4">
        <h2 className="text-sm font-medium text-luna-text-primary mb-3">User Profile</h2>
        <div className="flex gap-2 items-center">
          <div className="w-12 h-12 rounded-full bg-luna-primary/20 border border-luna-primary flex items-center justify-center">
            <span className="text-xl">{nick.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <div className="flex gap-2 items-center">
              <input value={nick} onChange={e => setNick(e.target.value)} placeholder="your nickname"
                className="flex-1 bg-luna-bg border border-luna-border rounded-luna-sm px-3 py-2 text-sm text-luna-text-primary outline-none focus:border-luna-primary/50" />
              {saved === 'nickname' && <span className="text-[10px] text-green-400">✅ saved!</span>}
              <button onClick={saveNickname} className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna-sm hover:bg-luna-primary/80">Save</button>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys — ALL providers with input fields */}
      <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-luna-text-primary">🔑 API Keys</h2>
          <span className="text-[10px] text-green-400">🟢 Pollinations = always free, no key needed</span>
        </div>
        <p className="text-[11px] text-luna-text-muted mb-4">paste your API keys below — Luna saves them to .env and uses them instantly. all keys are FREE!</p>

        <div className="space-y-2">
          {PROVIDERS.map(p => {
            const hasKey = apiKeys[p.key + '_exists'];
            const isEditing = editingKey === p.key;
            const justSaved = saved === p.key;

            return (
              <div key={p.key} className="flex items-center gap-3 py-2 border-b border-luna-border/30 last:border-0">
                <div className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-500' : 'bg-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-luna-text-primary font-medium">{p.name}</span>
                    <span className="text-[10px] text-luna-text-muted">— {p.desc}</span>
                  </div>
                  {hasKey && !isEditing && <p className="text-[10px] text-green-400/60">{apiKeys[p.key]}</p>}
                </div>

                {isEditing ? (
                  <div className="flex gap-1">
                    <input value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder="paste key..."
                      className="w-48 bg-luna-bg border border-luna-primary/50 rounded px-2 py-1 text-[11px] text-luna-text-primary outline-none" autoFocus />
                    <button onClick={() => saveKey(p.key)} disabled={saving}
                      className="px-2 py-1 text-[10px] bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50">{saving ? '...' : 'Save'}</button>
                    <button onClick={() => { setEditingKey(null); setKeyInput(''); }}
                      className="px-2 py-1 text-[10px] text-luna-text-muted border border-luna-border rounded">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {justSaved && <span className="text-[10px] text-green-400">✅ saved!</span>}
                    <button onClick={() => { setEditingKey(p.key); setKeyInput(''); }}
                      className="px-2 py-1 text-[10px] text-luna-primary border border-luna-primary/30 rounded hover:bg-luna-primary/10">{hasKey ? 'Update' : 'Add Key'}</button>
                    <button onClick={() => window.luna?.pcControl({ command: 'openUrl', args: { url: p.link } })}
                      className="text-[10px] text-luna-accent hover:underline">get free →</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* About */}
      <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
        <h2 className="text-sm font-medium text-luna-text-primary mb-2">About Luna AI</h2>
        <div className="space-y-1 text-xs text-luna-text-muted">
          <p>Version: 2.0</p>
          <p>Built by: Ravikiran • Bengaluru • 2026</p>
          <p>Architecture: Electron + React + SQLite</p>
          <p>"one person. one vision. infinite potential." 🌙</p>
        </div>
      </div>
    </div>
  );
}
