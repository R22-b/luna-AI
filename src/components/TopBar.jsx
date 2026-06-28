import React, { useState, useEffect } from 'react';

export default function TopBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [wakeStatus, setWakeStatus] = useState('disabled'); // 'active', 'disabled', 'error'

  useEffect(() => {
    const handleStatus = (e) => setWakeStatus(e.detail);
    window.addEventListener('wakeWordStatus', handleStatus);
    return () => window.removeEventListener('wakeWordStatus', handleStatus);
  }, []);

  const handleMinimize = () => window.windowControls?.minimize();
  const handleMaximize = () => {
    window.windowControls?.maximize();
    setIsMaximized(!isMaximized);
  };
  const handleClose = () => window.windowControls?.close();

  return (
    <div className="drag-region flex items-center justify-between h-9 bg-black border-b border-luna-border px-4 select-none shrink-0">
      {/* Left — App Title */}
      <div className="flex items-center gap-2 no-drag">
        <div className="w-3 h-3 rounded-full bg-luna-primary" />
        <span className="text-xs font-semibold text-luna-text-primary tracking-wide">
          LUNA AI
        </span>
        <span className="text-[10px] text-luna-text-muted bg-luna-surface px-1.5 py-0.5 rounded">
          2.0
        </span>
        
        {/* Wake Word Status Indicator */}
        <div 
          className="flex items-center gap-1.5 ml-2 bg-luna-surface border border-luna-border px-2 py-0.5 rounded"
          title={wakeStatus === 'active' ? 'Wake Word: Listening' : 'Wake Word: Disabled/Error'}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${wakeStatus === 'active' ? 'bg-green-500 shadow-[0_0_5px_#22c55e] animate-pulse' : wakeStatus === 'error' ? 'bg-red-500' : 'bg-gray-600'}`} />
          <span className="text-[9px] uppercase tracking-wider text-luna-text-muted">Wake</span>
        </div>
      </div>

      {/* Center — Luna message */}
      <div className="text-[11px] text-luna-text-muted italic hidden md:block">
        built by ravikiran 🌙
      </div>

      {/* Right — Actions + Window Controls */}
      <div className="flex items-center gap-0.5 no-drag">
        {/* Talk Mode Button */}
        <button
          onClick={() => { window.location.hash = '#/chat'; setTimeout(() => document.querySelector('[data-talkmode]')?.click(), 200); }}
          className="flex items-center gap-1 px-2 h-7 rounded bg-luna-accent/10 border border-luna-accent/30 hover:bg-luna-accent/20 transition-colors mr-2"
          title="Talk Mode"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1e8fa0" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1v0a3 3 0 0 1 3 3v8a3 3 0 0 1-6 0V4a3 3 0 0 1 3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          </svg>
          <span className="text-[10px] text-luna-accent">Talk</span>
        </button>
        {/* Minimize */}
        <button
          onClick={handleMinimize}
          className="w-10 h-9 flex items-center justify-center hover:bg-white/5 transition-colors"
          title="Minimize"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none">
            <rect width="10" height="1" fill="#c4c4d4" />
          </svg>
        </button>

        {/* Maximize / Restore */}
        <button
          onClick={handleMaximize}
          className="w-10 h-9 flex items-center justify-center hover:bg-white/5 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="2" y="0" width="8" height="8" rx="1" stroke="#c4c4d4" strokeWidth="1" fill="none" />
              <rect x="0" y="2" width="8" height="8" rx="1" stroke="#c4c4d4" strokeWidth="1" fill="#000" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="0.5" y="0.5" width="9" height="9" rx="1" stroke="#c4c4d4" strokeWidth="1" />
            </svg>
          )}
        </button>

        {/* Close (minimize to tray) */}
        <button
          onClick={handleClose}
          className="w-10 h-9 flex items-center justify-center hover:bg-red-600/80 transition-colors group"
          title="Close to tray"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="#c4c4d4" strokeWidth="1.2" className="group-hover:stroke-white" />
          </svg>
        </button>
      </div>
    </div>
  );
}
