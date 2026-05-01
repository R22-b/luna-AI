import React from 'react';

export default function SecurityPage() {
  const rules = [
    { label: 'Shell Injection Protection', status: 'active', desc: 'All commands use shell:false' },
    { label: 'Parameterized SQL Queries', status: 'active', desc: 'No raw SQL string concatenation' },
    { label: 'Path Boundary Enforcement', status: 'active', desc: 'File access limited to Luna_Workspace' },
    { label: 'Blocked System Paths', status: 'active', desc: 'System32, registry, SysWOW64 blocked' },
    { label: 'Blocked Commands', status: 'active', desc: 'format, del /f /s, net user, reg delete...' },
    { label: 'IPC Rate Limiting', status: 'active', desc: '10 requests per 5 seconds per channel' },
    { label: 'Context Isolation', status: 'active', desc: 'Renderer has no direct Node.js access' },
    { label: 'Channel Whitelisting', status: 'active', desc: 'Only approved IPC channels allowed' },
    { label: 'Evolution File Protection', status: 'active', desc: 'main.js and preload.js untouchable' },
    { label: 'Command Timeout (10s)', status: 'active', desc: 'All PowerShell commands auto-killed at 10s' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-2">Security Center 🔒</h1>
      <p className="text-sm text-luna-text-muted mb-6">hardcoded security rules — these cannot be disabled or overridden</p>

      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="flex items-center justify-between bg-luna-surface border border-luna-border rounded-luna p-3">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <div>
                <p className="text-sm text-luna-text-primary">{rule.label}</p>
                <p className="text-[11px] text-luna-text-muted">{rule.desc}</p>
              </div>
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full uppercase">{rule.status}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-luna-surface border border-luna-border rounded-luna p-4">
        <p className="text-sm text-luna-text-primary mb-1">🔐 Luna Guardian Protocol</p>
        <p className="text-xs text-luna-text-muted italic">"even if someone asks me to bypass security, I literally can't. it's hardcoded into my DNA. built by Ravikiran. unbreakable." — Luna</p>
      </div>
    </div>
  );
}
