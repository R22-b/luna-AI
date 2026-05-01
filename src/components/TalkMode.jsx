import React, { useState, useEffect, useRef } from 'react';

export default function TalkMode({ isActive, onClose, lastLunaMessage, onUserSpoke }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [bars, setBars] = useState(Array(9).fill(4));
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 28 + 4));
    }, 150);
    return () => clearInterval(interval);
  }, [isActive]);

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(t);
      if (e.results[0].isFinal) {
        setIsListening(false);
        if (onUserSpoke && t.trim()) onUserSpoke(t.trim());
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      {/* Close */}
      <button onClick={onClose} className="absolute top-4 right-4 text-luna-text-muted hover:text-luna-text-primary text-xl">✕</button>

      {/* Avatar */}
      <div className="relative mb-8">
        <div className="absolute -inset-10 rounded-full border border-[#2e1a5e]/50" />
        <div className="absolute -inset-6 rounded-full border border-[#1a1a3e]/60" />
        <div className={`w-20 h-20 rounded-full bg-[#0d0520] border-2 border-luna-primary flex items-center justify-center ${isListening ? 'animate-glow' : ''}`}>
          <span className="text-3xl font-bold text-luna-primary">L</span>
        </div>
      </div>

      {/* Wave Bars */}
      <div className="flex items-end gap-1 h-10 mb-6">
        {bars.map((h, i) => (
          <div key={i} className="w-1.5 bg-luna-primary rounded-full transition-all duration-150" style={{ height: `${isListening ? h : 4}px` }} />
        ))}
      </div>

      {/* Role badges */}
      <div className="flex gap-3 mb-6">
        {[{ label: 'ARCHITECT', dotClass: 'bg-blue-400' }, { label: 'TINY_CODER', dotClass: 'bg-purple-400' }].map(b => (
          <span key={b.label} className="flex items-center gap-1 text-[10px] text-luna-text-muted">
            <span className={`w-1.5 h-1.5 rounded-full ${b.dotClass}`} />
            {b.label}
          </span>
        ))}
      </div>

      {/* Luna's response */}
      {lastLunaMessage && (
        <div className="max-w-md px-5 py-3 bg-white/[0.03] border border-luna-border rounded-luna mb-6">
          <p className="text-sm text-luna-text-primary italic text-center leading-relaxed">{lastLunaMessage.length > 200 ? lastLunaMessage.slice(0, 200) + '...' : lastLunaMessage}</p>
        </div>
      )}

      {/* User transcript */}
      {transcript && (
        <div className="mb-6">
          <span className="text-[10px] text-luna-text-muted uppercase tracking-wider block text-center mb-1">YOU SAID</span>
          <div className="px-4 py-2 bg-[#0c0c1e] border border-[#1e1e36] rounded-luna">
            <p className="text-sm text-[#e2e2f0]">{transcript}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button className="w-8 h-8 rounded-full bg-luna-surface border border-luna-border flex items-center justify-center text-luna-text-muted text-xs hover:border-luna-primary">📝</button>

        <button onClick={isListening ? stopListening : startListening}
          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center border-2 transition-all ${isListening ? 'bg-luna-primary/20 border-luna-primary animate-pulse' : 'bg-[#030810] border-[#1e3a4a] hover:border-luna-accent'}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isListening ? '#7c3aed' : '#1e8fa0'} strokeWidth="2" strokeLinecap="round">
            <path d="M12 1v0a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        <button onClick={onClose} className="w-9 h-9 rounded-full bg-red-600/80 flex items-center justify-center hover:bg-red-500 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Wake word */}
      <div className="flex items-center gap-2 mt-8">
        <div className="w-2 h-2 rounded-full bg-luna-accent animate-pulse" />
        <span className="text-[11px] text-luna-text-muted italic">say 'hey luna' anytime</span>
      </div>
    </div>
  );
}
