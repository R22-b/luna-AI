import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [goals, setGoals] = useState([]);
  const [sysInfo, setSysInfo] = useState(null);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState(null);
  const [brainStats, setBrainStats] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    loadGoals();
    loadSystemInfo();
    loadWeatherAndNews();
    loadBrainStats();
    return () => clearInterval(timer);
  }, []);

  async function loadBrainStats() {
    try {
      const res = await window.luna?.invoke('luna:getStats');
      if (res?.success) setBrainStats(res.stats);
    } catch {}
  }

  async function loadGoals() {
    const res = await window.luna?.getGoals();
    if (res?.success) setGoals(res.goals || []);
  }

  async function loadSystemInfo() {
    try {
      const res = await window.luna?.getSystemInfo();
      if (res?.success) setSysInfo(res);
    } catch {}
  }

  async function loadWeatherAndNews() {
    try {
      const weatherRes = await window.luna?.getWeather();
      if (weatherRes?.success) setWeather(weatherRes);
      
      const newsRes = await window.luna?.getNews();
      if (newsRes?.success) setNews(newsRes.articles);
    } catch {}
  }

  function getGreeting() {
    const h = time.getHours();
    if (h < 12) return 'good morning baddy ☀️';
    if (h < 17) return 'afternoon baddy 🌤️';
    if (h < 21) return 'good evening baddy 🌙';
    return 'still up? 🌙';
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-luna-text-primary">{getGreeting()}</h1>
        <div className="flex items-baseline gap-3 mt-1">
          <span className="text-3xl font-bold text-[#e2e2f0]">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-sm text-luna-text-muted">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* System Status Card (works without API keys!) */}
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
          <h3 className="text-xs text-luna-text-muted uppercase mb-3">💻 System Status</h3>
          {sysInfo ? (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-luna-text-primary mb-1"><span>RAM</span><span>{sysInfo.ram?.percentage || 0}%</span></div>
                <div className="h-1.5 bg-luna-bg rounded-full overflow-hidden">
                  <div className="h-full bg-luna-primary rounded-full" style={{ width: `${sysInfo.ram?.percentage || 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-luna-text-primary mb-1"><span>Disk</span><span>{sysInfo.disk?.percentage || 0}%</span></div>
                <div className="h-1.5 bg-luna-bg rounded-full overflow-hidden">
                  <div className="h-full bg-luna-accent rounded-full" style={{ width: `${sysInfo.disk?.percentage || 0}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-luna-text-muted">Loading...</p>
          )}
        </div>

        {/* AI Brains Swatch Card */}
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs text-luna-text-muted uppercase">🧠 AI Brains (108 Models)</h3>
            <span className="text-[10px] text-luna-primary">{brainStats?.providers?.filter(p => p.healthy)?.length || 0} Online</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1" style={{ maxHeight: '100px' }}>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
              {brainStats?.providers ? brainStats.providers.map((p) => {
                let colorClass = 'bg-red-500/80 shadow-[0_0_5px_rgba(239,68,68,0.5)]'; // Offline
                if (!p.hasKey && p.id !== 'pollinations') colorClass = 'bg-yellow-500/80 shadow-[0_0_5px_rgba(234,179,8,0.5)]'; // No Key
                else if (p.healthy) colorClass = 'bg-green-500/80 shadow-[0_0_5px_rgba(34,197,94,0.5)]'; // Online

                return (
                  <div 
                    key={p.id} 
                    title={`${p.name}\nStatus: ${p.healthy ? 'Online' : (!p.hasKey ? 'Missing API Key' : 'Offline')}\nRequests: ${p.requests}`}
                    className={`w-full aspect-square rounded-sm cursor-help transition-all hover:scale-110 ${colorClass}`} 
                  />
                );
              }) : (
                <div className="text-[10px] text-luna-text-muted col-span-full">Loading swatches...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weather & News */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
          <h3 className="text-xs text-luna-text-muted uppercase mb-2">🌤️ Weather</h3>
          {weather ? (
            <div>
              <p className="text-2xl text-luna-text-primary font-bold">{Math.round(weather.temp)}°C</p>
              <p className="text-sm text-luna-text-muted capitalize">{weather.condition} in Bengaluru</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-luna-text-muted mb-2">add your OpenWeatherMap key to see live weather</p>
              <a href="https://openweathermap.org/appid" target="_blank" className="text-xs text-luna-primary hover:underline">get free key → openweathermap.org</a>
              <p className="text-[10px] text-luna-text-muted mt-1">paste it as OPENWEATHER_KEY in .env file</p>
            </div>
          )}
        </div>
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
          <h3 className="text-xs text-luna-text-muted uppercase mb-2">📰 News</h3>
          {news ? (
            <div className="space-y-2">
              {news.map((item, i) => (
                <div key={i} className="text-xs">
                  <a href={item.url} target="_blank" className="text-luna-text-primary hover:text-luna-primary hover:underline block truncate">{item.title}</a>
                  <span className="text-[10px] text-luna-text-muted">{item.source?.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-xs text-luna-text-muted mb-2">add your NewsAPI key to see headlines</p>
              <a href="https://newsapi.org/register" target="_blank" className="text-xs text-luna-primary hover:underline">get free key → newsapi.org</a>
              <p className="text-[10px] text-luna-text-muted mt-1">paste it as NEWS_API_KEY in .env file</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs text-luna-text-muted uppercase">🎯 Active Goals</h3>
          <button onClick={() => navigate('/goals')} className="text-[10px] text-luna-primary hover:underline">manage →</button>
        </div>
        {goals.length === 0 ? (
          <p className="text-xs text-luna-text-muted">no goals yet — <span className="text-luna-primary cursor-pointer hover:underline" onClick={() => navigate('/goals')}>add one</span></p>
        ) : (
          <div className="space-y-2">
            {goals.slice(0, 3).map((g, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-luna-text-primary">{g.title}</span>
                  <span className="text-luna-text-muted">{g.progress || 0}%</span>
                </div>
                <div className="h-1.5 bg-luna-bg rounded-full overflow-hidden">
                  <div className="h-full bg-luna-primary rounded-full transition-all" style={{ width: `${g.progress || 0}%` }} />
                </div>
              </div>
            ))}
            {goals.length > 3 && <p className="text-[10px] text-luna-text-muted">+{goals.length - 3} more</p>}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: '💬', label: 'Chat with Luna', path: '/chat' },
          { icon: '🎯', label: 'New Goal', path: '/goals' },
          { icon: '🛡️', label: 'Project Guardian', path: '/guardian' },
          { icon: '📚', label: 'Study Mode', path: '/student' },
        ].map(action => (
          <button key={action.label} onClick={() => navigate(action.path)}
            className="bg-luna-surface border border-luna-border rounded-luna p-4 text-center hover:border-luna-primary/30 hover:bg-luna-surface-active transition-all group">
            <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{action.icon}</span>
            <span className="text-[11px] text-luna-text-muted group-hover:text-luna-text-primary">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
