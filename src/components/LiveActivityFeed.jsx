import React from 'react';

export default function LiveActivityFeed({ activities }) {
  if (!activities || activities.length === 0) return null;

  return (
    <div className="flex flex-col gap-1 px-4 py-2 mb-2 animate-fade-in">
      {activities.map((activity, i) => (
        <div
          key={i}
          className="flex items-center gap-2 text-[12px] text-luna-text-muted animate-slide-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <span>{activity.icon || '⚡'}</span>
          <span className="italic">{activity.message}</span>
        </div>
      ))}
    </div>
  );
}
