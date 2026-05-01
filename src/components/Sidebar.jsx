import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/chat', icon: '💬', label: 'Chat' },
  { path: '/student', icon: '📚', label: 'Student Mode' },
  { path: '/guardian', icon: '🛡️', label: 'Guardian' },
  { path: '/goals', icon: '🎯', label: 'Goals' },
  { path: '/evolution', icon: '🧬', label: 'Evolution' },
  { path: '/security', icon: '🔒', label: 'Security' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
  { path: '/plugins', icon: '🔌', label: 'Plugins' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const navigate = useNavigate();
  const location = useLocation();
  const w = collapsed ? 'w-16' : 'w-56';

  return (
    <div className={`${w} h-full bg-black border-r border-luna-border flex flex-col shrink-0 transition-all duration-200`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-luna-border/50">
        <div className="w-8 h-8 rounded-full bg-luna-primary/20 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-luna-primary">L</span>
        </div>
        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-luna-text-primary">LUNA AI</span>
            <span className="text-[9px] text-luna-text-muted bg-luna-surface px-1 py-0.5 rounded">2.0</span>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                active ? 'bg-luna-surface-active text-[#a78bfa] border-l-2 border-luna-primary' :
                'text-luna-text-muted hover:text-luna-text-primary hover:bg-white/[0.02] border-l-2 border-transparent'
              }`}>
              <span className="text-base">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button onClick={onToggle}
        className="px-4 py-3 text-xs text-luna-text-muted hover:text-luna-text-primary border-t border-luna-border/50 transition-colors">
        {collapsed ? '→' : '← Collapse'}
      </button>

      {/* Status */}
      <div className="px-4 py-3 border-t border-luna-border/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {!collapsed && <span className="text-[11px] text-luna-text-muted">Luna • Online</span>}
        </div>
      </div>
    </div>
  );
}
