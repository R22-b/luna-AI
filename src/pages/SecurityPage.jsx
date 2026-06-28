import React, { useState, useEffect } from 'react';

export default function SecurityPage() {
  const [logs, setLogs] = useState([]);
  const [whitelist, setWhitelist] = useState([]);
  const [strictMode, setStrictMode] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    loadSecurityData();
  }, []);

  async function loadSecurityData() {
    try {
      const res = await window.security?.getData();
      if (res?.success) {
        setLogs(res.logs || []);
        setWhitelist(res.whitelist || []);
        setStrictMode(res.strictMode || false);
        setBlockedCount(res.blockedCount || 0);
      }
    } catch (err) {
      console.error('Failed to load security data:', err);
    }
  }

  async function toggleStrictMode() {
    try {
      await window.security?.setStrictMode(!strictMode);
      setStrictMode(!strictMode);
    } catch (err) {
      alert('Failed to toggle strict mode');
    }
  }

  async function addWhitelistFolder() {
    try {
      const res = await window.luna?.openFolderDialog();
      if (res?.success && res.path) {
        await window.security?.addWhitelistFolder(res.path);
        loadSecurityData();
      }
    } catch (err) {}
  }

  async function removeWhitelistFolder(folderPath) {
    try {
      await window.security?.removeWhitelistFolder(folderPath);
      loadSecurityData();
    } catch (err) {}
  }

  const rules = [
    { label: 'Shell Injection Protection', status: 'active', desc: 'All commands use shell:false' },
    { label: 'Parameterized SQL Queries', status: 'active', desc: 'No raw SQL string concatenation' },
    { label: 'Path Boundary Enforcement', status: 'active', desc: 'File access limited to Luna_Workspace' },
    { label: 'Blocked System Paths', status: 'active', desc: 'System32, registry, SysWOW64 blocked' },
    { label: 'Blocked Commands', status: 'active', desc: 'format, del /f /s, net user, reg delete...' },
    { label: 'IPC Rate Limiting', status: 'active', desc: '10 requests per 5 seconds per channel' },
    { label: 'Context Isolation', status: 'active', desc: 'Renderer has no direct Node.js access' },
    { label: 'Evolution File Protection', status: 'active', desc: 'main.js and preload.js untouchable' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6 custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-luna-text-primary mb-1">Security Center 🔒</h1>
          <p className="text-sm text-luna-text-muted">Manage Luna's execution boundaries and monitor blocked actions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-luna-text-muted uppercase tracking-wider">Blocked Today</p>
            <p className="text-2xl font-black text-red-400">{blockedCount}</p>
          </div>
          <div className="h-8 w-px bg-luna-border/50"></div>
          <button 
            onClick={toggleStrictMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${strictMode ? 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-luna-surface text-luna-text-muted border-luna-border hover:border-luna-primary/50'}`}
          >
            <div className={`w-2 h-2 rounded-full ${strictMode ? 'bg-red-400 animate-pulse' : 'bg-luna-text-muted'}`}></div>
            STRICT MODE {strictMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Rules */}
        <div>
          <h2 className="text-sm font-medium text-luna-text-primary mb-3 flex items-center gap-2">
            <span className="text-green-400">🛡️</span> Core Protections
          </h2>
          <div className="space-y-2 h-64 overflow-y-auto pr-2 custom-scrollbar">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center justify-between bg-luna-surface border border-luna-border rounded-luna p-3">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                  <div>
                    <p className="text-xs text-luna-text-primary font-medium">{rule.label}</p>
                    <p className="text-[10px] text-luna-text-muted">{rule.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Whitelist Manager */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-luna-text-primary flex items-center gap-2">
              <span className="text-blue-400">📁</span> Safe Folders Whitelist
            </h2>
            <button 
              onClick={addWhitelistFolder}
              className="text-[10px] bg-luna-primary/10 text-luna-primary border border-luna-primary/30 px-2 py-1 rounded hover:bg-luna-primary/20 transition-all"
            >
              + Add Folder
            </button>
          </div>
          <div className="space-y-2 flex-1 bg-luna-surface border border-luna-border rounded-luna p-2 overflow-y-auto custom-scrollbar min-h-[16rem]">
            {whitelist.map((folder, i) => (
              <div key={i} className="flex items-center justify-between bg-black/40 border border-luna-border/50 rounded p-2">
                <span className="text-[11px] text-luna-text-primary font-mono truncate mr-4">{folder}</span>
                <button 
                  onClick={() => removeWhitelistFolder(folder)}
                  className="text-red-400 hover:text-red-300 text-[10px] p-1"
                >
                  ✕
                </button>
              </div>
            ))}
            {whitelist.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-luna-text-muted italic text-center">No safe folders added.<br/>Luna can only access her own workspace.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security Log */}
      <div>
        <h2 className="text-sm font-medium text-luna-text-primary mb-3 flex items-center gap-2">
          <span className="text-orange-400">🚨</span> Live Blocked Action Log
        </h2>
        <div className="bg-luna-surface border border-luna-border rounded-luna p-2 h-48 overflow-y-auto custom-scrollbar">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-2 border-b border-luna-border/30 last:border-0 hover:bg-black/20 transition-colors">
              <span className="text-[10px] text-luna-text-muted font-mono whitespace-nowrap mt-0.5">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-red-400 uppercase tracking-wide">{log.action}</p>
                <p className="text-xs text-luna-text-primary font-mono mt-0.5 truncate">{log.details}</p>
              </div>
              <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold ${
                log.risk_level === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                log.risk_level === 'medium' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {log.risk_level}
              </span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <p className="text-xs text-luna-text-muted italic">No blocked actions recorded today. System secure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
