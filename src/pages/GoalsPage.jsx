import React, { useState, useEffect } from 'react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => { loadGoals(); }, []);

  async function loadGoals() {
    const res = await window.luna?.getAllGoals();
    if (res?.success) setGoals(res.goals || []);
  }

  async function addGoal() {
    if (!form.title.trim()) return;
    await window.luna?.addGoal(form);
    setForm({ title: '', description: '', deadline: '' }); setShowAdd(false); loadGoals();
  }

  async function updateProgress(id, progress) {
    await window.luna?.updateGoal({ id, progress });
    loadGoals();
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-luna-text-primary">Goals 🎯</h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80">+ New Goal</button>
      </div>

      {showAdd && (
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-4 animate-fade-in">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Goal title..." className="w-full bg-luna-bg border border-luna-border rounded-luna-sm px-3 py-2 text-sm text-luna-text-primary mb-2 outline-none focus:border-luna-primary/50" />
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="w-full bg-luna-bg border border-luna-border rounded-luna-sm px-3 py-2 text-sm text-luna-text-primary mb-2 outline-none focus:border-luna-primary/50" />
          <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full bg-luna-bg border border-luna-border rounded-luna-sm px-3 py-2 text-sm text-luna-text-primary mb-3 outline-none focus:border-luna-primary/50" />
          <div className="flex gap-2">
            <button onClick={addGoal} className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna">Add Goal</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-luna-border text-luna-text-muted text-xs rounded-luna">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {goals.map(g => {
          const overdue = g.deadline && new Date(g.deadline) < new Date() && g.status === 'active';
          const daysLeft = g.deadline ? Math.ceil((new Date(g.deadline) - Date.now()) / 86400000) : null;
          return (
            <div key={g.id} className="bg-luna-surface border border-luna-border rounded-luna p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${g.status === 'completed' ? 'text-green-400 line-through' : overdue ? 'text-red-400' : 'text-luna-text-primary'}`}>{g.title}</span>
                <span className="text-xs text-luna-text-muted">{g.progress}%</span>
              </div>
              {g.description && <p className="text-xs text-luna-text-muted mb-2">{g.description}</p>}
              <div className="w-full h-1.5 bg-luna-bg rounded-full mb-2 overflow-hidden">
                <div className={`h-full rounded-full transition-all ${g.status === 'completed' ? 'bg-green-500' : overdue ? 'bg-red-500' : 'bg-luna-primary'}`} style={{ width: `${g.progress}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {daysLeft !== null && <span className={`text-[11px] ${overdue ? 'text-red-400' : daysLeft < 3 ? 'text-orange-400' : 'text-luna-text-muted'}`}>{overdue ? 'Overdue!' : `${daysLeft}d left`}</span>}
                </div>
                {g.status === 'active' && (
                  <input type="range" min="0" max="100" value={g.progress} onChange={e => updateProgress(g.id, parseInt(e.target.value))}
                    className="w-24 h-1 accent-luna-primary cursor-pointer" />
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <p className="text-sm text-luna-text-muted text-center py-8 italic">no goals yet — add one to start tracking 🎯</p>}
      </div>
    </div>
  );
}
