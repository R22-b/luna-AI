import React, { useState, useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import LiveActivityFeed from '../components/LiveActivityFeed';
import TalkMode from '../components/TalkMode';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [threads, setThreads] = useState([]);
  const [currentThreadId, setCurrentThreadId] = useState(1);
  const [nickname, setNickname] = useState('baddy');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [talkMode, setTalkMode] = useState(false);
  const [lastLunaMsg, setLastLunaMsg] = useState('');
  const [providers, setProviders] = useState([]);
  const [selectedModel, setSelectedModel] = useState('auto');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load threads and current history on mount
  useEffect(() => {
    loadThreads();
    loadHistory(currentThreadId);
    loadProfile();
    loadProviders();
  }, [currentThreadId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activities]);

  // Listen for Live Activity Feed from backend
  useEffect(() => {
    const handler = (data) => {
      setActivities(prev => {
        const newActivity = { icon: data?.icon || '⚙️', message: data?.step || 'Processing...', timestamp: data?.timestamp || Date.now() };
        return [...prev, newActivity].slice(-50);
      });
    };
    
    if (window.luna?.on) {
      const removeListener = window.luna.on('luna:activity', handler);
      return removeListener;
    }
  }, []);

  async function loadProfile() {
    try {
      const res = await window.luna.getProfile();
      if (res?.profile?.nickname) setNickname(res.profile.nickname);
    } catch (err) { console.log('Using default nickname'); }
  }

  async function loadProviders() {
    try {
      const pRes = await window.luna.invoke('luna:getProviders');
      if (pRes?.success) setProviders(pRes.providers);
      const mRes = await window.luna.invoke('luna:getManualModel');
      if (mRes?.success) setSelectedModel(mRes.model);
    } catch (err) {}
  }

  async function handleModelChange(e) {
    const val = e.target.value;
    setSelectedModel(val);
    await window.luna.invoke('luna:setManualModel', val);
  }

  async function loadThreads() {
    try {
      const result = await window.luna.getThreads();
      if (result?.success) setThreads(result.threads);
    } catch (err) { console.error('Failed to load threads'); }
  }

  async function createNewChat() {
    try {
      const result = await window.luna.createThread({ title: 'New Conversation' });
      if (result?.success) {
        setCurrentThreadId(result.id);
        loadThreads();
      }
    } catch (err) { console.error('Failed to create thread'); }
  }

  async function loadHistory(tid) {
    try {
      const result = await window.luna.getHistory({ threadId: tid });
      if (result?.success && result.history) {
        setMessages(result.history.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          providerUsed: msg.provider_used,
          emotion: msg.emotion_detected,
        })));
      } else {
        setMessages([]);
      }
    } catch (err) {
      setMessages([]);
      console.log('No history for this thread');
    }
  }

  async function sendMessage(overrideMessage = null) {
    const rawMessage = typeof overrideMessage === 'string' ? overrideMessage : input;
    if (!rawMessage.trim() || isLoading) return;

    const userMsg = rawMessage.trim();
    setInput('');
    setIsLoading(true);

    // Auto-rename thread if it's still named "New Conversation"
    const currentThread = threads.find(t => t.id === currentThreadId);
    if (currentThread && (currentThread.title === 'New Conversation' || currentThread.title === 'Main Chat' && messages.length === 0)) {
      const newTitle = userMsg.length > 25 ? userMsg.substring(0, 25) + '...' : userMsg;
      try {
        await window.luna.renameThread(currentThreadId, newTitle);
        loadThreads();
      } catch (err) { console.error('Rename failed'); }
    }

    // Add user message immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMsg,
      timestamp: new Date().toISOString(),
    }]);

    // Show activity
    setActivities([]);
    setActivities([{ icon: '🧠', message: 'thinking...' }]);

    try {
      const result = await window.luna.chat({ 
        message: userMsg, 
        nickname: nickname,
        threadId: currentThreadId 
      });

      setActivities([]);

      if (result?.success) {
        setLastLunaMsg(result.response);
        setMessages(prev => [...prev, {
          role: 'luna',
          content: result.response,
          timestamp: new Date().toISOString(),
          providerUsed: result.providerUsed,
          emotion: result.emotion,
          badges: result.badges || [],
        }]);
        // Auto-speak in talk mode
        if (talkMode) { try { window.voice?.speak({ text: result.response }); } catch {} }
      } else {
        setMessages(prev => [...prev, {
          role: 'luna',
          content: result?.error || "oops something broke 😅 try again baddy",
          timestamp: new Date().toISOString(),
          providerUsed: 'error',
        }]);
      }
    } catch (err) {
      setActivities([]);
      setMessages(prev => [...prev, {
        role: 'luna',
        content: `baddy my brain hit an error: ${err.message} 😵`,
        timestamp: new Date().toISOString(),
      }]);
    }

    setIsLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  async function deleteThread(e, id) {
    e.stopPropagation();
    if (threads.length <= 1) return; // Don't delete last thread
    try {
      const result = await window.luna.deleteThread(id);
      if (result?.success) {
        if (currentThreadId === id) {
          const nextThread = threads.find(t => t.id !== id);
          setCurrentThreadId(nextThread.id);
        }
        loadThreads();
      }
    } catch (err) { console.error('Delete failed'); }
  }

  return (
    <div className="flex h-full bg-black select-none animate-in fade-in duration-500">
      {/* Thread Sidebar */}
      <div className="w-64 border-r border-luna-border/30 flex flex-col bg-[#050a12]/80 backdrop-blur-xl">
        <div className="p-5">
          <button 
            onClick={createNewChat}
            className="w-full py-3 px-4 rounded-xl bg-luna-primary/10 border border-luna-primary/30 text-luna-primary text-xs font-semibold hover:bg-luna-primary/20 hover:border-luna-primary/50 transition-all flex items-center justify-center gap-2 group shadow-[0_0_15px_rgba(0,186,211,0.1)]"
          >
            <span className="text-lg group-hover:scale-125 transition-transform">+</span> New Conversation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 space-y-2 custom-scrollbar">
          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => setCurrentThreadId(thread.id)}
              className={`w-full text-left p-3.5 rounded-2xl transition-all group relative cursor-pointer border ${
                currentThreadId === thread.id 
                ? 'bg-luna-primary/10 border-luna-primary/40 text-luna-primary shadow-[inset_0_0_10px_rgba(0,186,211,0.05)]' 
                : 'border-transparent text-luna-text-muted hover:bg-white/5 hover:text-luna-text-primary'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`text-[11px] font-bold truncate ${currentThreadId === thread.id ? 'text-luna-primary' : 'text-luna-text-primary'}`}>
                    {thread.title}
                  </div>
                  <div className="text-[9px] opacity-40 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-luna-text-muted/30" />
                    {new Date(thread.updated_at).toLocaleDateString()}
                  </div>
                </div>
                
                {threads.length > 1 && (
                  <button 
                    onClick={(e) => deleteThread(e, thread.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-400 rounded-md transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>

              {currentThreadId === thread.id && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-luna-primary shadow-[0_0_10px_rgba(0,186,211,0.8)]" />
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-luna-border/20 mt-auto">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-luna-surface border border-luna-primary/30 flex items-center justify-center text-[10px] font-bold text-luna-primary shadow-[0_0_10px_rgba(0,186,211,0.2)]">
              {nickname.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-luna-text-primary truncate">{nickname}</div>
              <div className="text-[8px] text-luna-primary uppercase tracking-tighter font-black">Pro Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#02050a]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-8 custom-scrollbar scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center select-none">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-luna-surface border-2 border-luna-primary/20 flex items-center justify-center shadow-[0_0_30px_rgba(0,186,211,0.1)]">
                  <span className="text-3xl font-black text-luna-primary drop-shadow-[0_0_10px_rgba(0,186,211,0.5)]">L</span>
                </div>
                <div className="absolute -inset-2 rounded-full border border-luna-primary/10 animate-ping" />
              </div>
              <h2 className="text-2xl font-black text-luna-text-primary tracking-tight uppercase italic">hey {nickname} 👋</h2>
              <p className="text-sm text-luna-text-muted mt-2 max-w-xs mx-auto leading-relaxed font-medium">Ready for the next mission?</p>
              
              <div className="grid grid-cols-2 gap-3 mt-10 max-w-md w-full px-4">
                {['Build a SaaS', 'Write Python script', 'Research AI News', 'Analyze Code'].map(suggest => (
                  <button 
                    key={suggest}
                    onClick={() => { setInput(suggest); inputRef.current?.focus(); }}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] text-luna-text-muted hover:border-luna-primary/50 hover:text-luna-primary hover:bg-luna-primary/5 transition-all text-left group overflow-hidden relative"
                  >
                    <div className="font-bold text-luna-text-primary group-hover:text-luna-primary transition-colors relative z-10">{suggest}</div>
                    <div className="mt-0.5 opacity-50 relative z-10">Quick launch mission</div>
                    <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition-opacity">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatBubble key={i} {...msg} />
            ))
          )}

          {isLoading && activities.length > 0 && (
            <LiveActivityFeed activities={activities} />
          )}

          {isLoading && activities.length === 0 && (
            <div className="flex items-center gap-1 pl-4">
              <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>

        {/* Swarm Status Bar */}
        <div className="flex items-center gap-3 px-6 py-2 border-t border-luna-border/30 bg-black/40 backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]" />
            <span className="text-[9px] text-luna-text-muted uppercase tracking-tighter font-black">Architect</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.8)]" />
            <span className="text-[9px] text-luna-text-muted uppercase tracking-tighter font-black">Coder</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]" />
            <span className="text-[9px] text-luna-text-muted uppercase tracking-tighter font-black">Researcher</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
             <span className="text-[9px] text-luna-primary font-black uppercase tracking-tighter animate-pulse">Swarm Status: Active</span>
             <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)] animate-pulse" />
          </div>
        </div>
        </div>

        {/* Manual Model Selector */}
        <div className="flex items-center gap-2 px-6 py-2 border-t border-luna-border/20 bg-[#050a12]/80 text-[10px]">
          <span className="text-luna-text-muted font-bold tracking-tight">BRAIN SELECTOR:</span>
          <select 
            value={selectedModel} 
            onChange={handleModelChange}
            className="bg-luna-surface border border-luna-border/50 text-luna-primary font-bold rounded p-1 outline-none focus:border-luna-primary"
          >
            <option value="auto">⚡ Luna Smart Auto-Routing (Best for Task)</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Input Area */}
        <div className="px-6 py-6 border-t border-luna-border/20 bg-[#050a12]/50">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <button 
              data-talkmode="true"
              onClick={() => setTalkMode(true)} 
              className="w-12 h-12 rounded-2xl bg-luna-surface border border-luna-border/50 flex items-center justify-center shrink-0 hover:border-luna-primary/50 transition-all active:scale-95 group shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-luna-primary group-hover:scale-110 transition-transform">
                <path d="M12 1v0a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
              </svg>
            </button>

            <div className="flex-1 relative group">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Luna..."
                rows={1}
                className="w-full bg-luna-surface/30 border border-luna-border/50 rounded-2xl px-5 py-3.5 text-[13px] text-luna-text-primary placeholder:text-luna-text-muted/50 resize-none outline-none focus:border-luna-primary/50 transition-all custom-scrollbar shadow-inner"
                style={{ maxHeight: '200px' }}
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 opacity-20 pointer-events-none text-[10px] font-bold text-luna-text-muted">Enter to send</div>
            </div>

            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="w-12 h-12 rounded-2xl bg-luna-primary flex items-center justify-center shrink-0 hover:shadow-[0_0_25px_rgba(0,186,211,0.5)] disabled:opacity-30 transition-all active:scale-90 shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>

        <TalkMode
          isActive={talkMode}
          onClose={() => setTalkMode(false)}
          lastLunaMessage={lastLunaMsg}
          onUserSpoke={(text) => { sendMessage(text); }}
        />
      </div>
    </div>
  );
}
