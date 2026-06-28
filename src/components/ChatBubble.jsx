import React from 'react';

export default function ChatBubble({ role, content, timestamp, providerUsed, emotion, badges }) {
  const isLuna = role === 'luna';
  const time = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div className={`flex flex-col ${isLuna ? 'items-start' : 'items-end'} animate-fade-in`}>
      {/* Role badges (Luna only) */}
      {isLuna && badges && badges.length > 0 && (
        <div className="flex gap-1.5 mb-1 ml-1">
          {badges.map((badge, i) => (
            <span key={i} className="flex items-center gap-1 text-[9px] font-black tracking-tighter uppercase text-luna-text-muted bg-white/[0.02] px-1.5 py-0.5 rounded-full border border-white/5">
              <span className={`w-1.5 h-1.5 rounded-full ${
                badge === 'ARCHITECT' ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.8)]' :
                badge === 'BUILDER' ? 'bg-purple-400 shadow-[0_0_5px_rgba(192,132,252,0.8)]' :
                badge === 'VERIFIER' ? 'bg-green-400 shadow-[0_0_5px_rgba(74,222,128,0.8)]' :
                badge === 'RESEARCHER' ? 'bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.8)]' :
                badge === 'AUTONOMOUS' ? 'bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]' :
                'bg-gray-400'
              }`} />
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 ${
          isLuna
            ? 'bg-white/[0.03] border border-luna-border rounded-[0_10px_10px_10px]'
            : 'bg-[#0c0c1e] border border-[#1e1e36] rounded-[10px_10px_0_10px]'
        }`}
      >
        <p className={`text-[13px] leading-relaxed whitespace-pre-wrap ${
          isLuna ? 'italic text-luna-text-primary' : 'text-[#e2e2f0]'
        }`}>
          {content}
        </p>
      </div>

      {/* Meta info (Luna only) */}
      {isLuna && (
        <div className="flex items-center gap-2 mt-1 ml-1">
          {providerUsed && (
            <span className="flex items-center gap-1 text-[10px] text-luna-text-muted bg-luna-surface px-1.5 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-green-400" />
              {providerUsed}
            </span>
          )}
          {emotion && emotion !== 'neutral' && (
            <span className="text-[10px] text-luna-text-muted">
              {emotion === 'hyped' ? '🔥' : emotion === 'stressed' ? '😰' : emotion === 'sad' ? '😔' : emotion === 'focused' ? '🎯' : emotion === 'lazy' ? '😴' : ''}
              {emotion}
            </span>
          )}
          {time && <span className="text-[10px] text-luna-text-muted">{time}</span>}
        </div>
      )}

      {/* Timestamp for user */}
      {!isLuna && time && (
        <span className="text-[10px] text-luna-text-muted mt-1 mr-1">{time}</span>
      )}
    </div>
  );
}
