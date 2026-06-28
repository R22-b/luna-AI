import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/student', icon: '📚', label: 'Student' },
  { path: '/guardian', icon: '🛡️', label: 'Guardian' },
  { path: '/goals', icon: '🎯', label: 'Goals' },
  { path: '/evolution', icon: '🧬', label: 'Evolution' },
  { path: '/security', icon: '🔒', label: 'Security' },
  { path: '/plugins', icon: '🔌', label: 'Plugins' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const w = collapsed ? 'w-20' : 'w-64';

  return (
    <div className={`${w} h-full bg-[#030307]/80 backdrop-blur-3xl border-r border-luna-border/30 flex flex-col shrink-0 transition-all duration-300 relative z-20`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="w-10 h-10 rounded-2xl bg-luna-surface border border-luna-primary/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(124,58,237,0.1)]">
          <span className="text-xl font-black text-luna-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]">L</span>
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-black text-luna-text-primary tracking-widest italic">LUNA AI</span>
            <span className="text-[9px] text-luna-primary/70 font-bold uppercase tracking-tighter">v2.0 Production</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button 
              key={item.path} 
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 relative group ${
                active 
                ? 'bg-luna-primary/10 text-luna-primary border border-luna-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.05)]' 
                : 'text-luna-text-muted hover:text-luna-text-primary hover:bg-white/[0.03] border border-transparent'
              }`}
            >
              <span className={`text-lg ${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{item.icon}</span>
              {!collapsed && <span className={`text-[13px] font-bold ${active ? 'text-luna-text-primary' : ''}`}>{item.label}</span>}
              
              {active && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-luna-primary shadow-[0_0_8px_rgba(124,58,237,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button onClick={onToggle}
          className="w-full flex items-center justify-center py-2 text-[10px] font-black uppercase tracking-widest text-luna-text-muted hover:text-luna-primary hover:bg-luna-primary/5 rounded-xl border border-transparent hover:border-luna-primary/10 transition-all">
          {collapsed ? '→' : '← Collapse System'}
        </button>
      </div>

      {/* Status */}
      <div className="p-4 mt-2">
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <div className="relative">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
             <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
               <span className="text-[10px] font-bold text-luna-text-primary">System Online</span>
               <span className="text-[8px] text-luna-text-muted uppercase font-black">All brains active</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
