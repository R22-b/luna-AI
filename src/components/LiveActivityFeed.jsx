import React from 'react';

export default function LiveActivityFeed({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-4 py-2 mb-2 animate-fade-in border-l-2 border-luna-primary/30 ml-2">
      {activities.map((activity, i) => (
        <div
          key={i}
          className="flex items-center gap-3 text-[11px] text-luna-text-muted animate-slide-up"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <span className="text-[9px] opacity-50 font-mono shrink-0">
            {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString() : ''}
          </span>
          <span className="shrink-0">{activity.icon || '⚡'}</span>
          <span className="italic truncate">{activity.message}</span>
        </div>
      ))}
    </div>
  );
}
