import React, { useState, useEffect } from 'react';

export default function EvolutionPage() {
  const [history, setHistory] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    const res = await window.evolution?.getHistory();
    if (res?.success) setHistory(res.history || []);
  }

  async function runCycle() {
    setLoading(true);
    try {
      const res = await window.evolution?.runCycle();
      if (res?.success) setAnalysis(res);
      await loadHistory();
    } finally {
      setLoading(false);
    }
  }

  async function approveProposal(id) {
    setActionLoading(id);
    try {
      const res = await window.evolution?.applyProposal({ logId: id });
      if (!res?.success) alert(`Apply failed: ${res?.error}`);
      await loadHistory();
    } finally {
      setActionLoading(null);
    }
  }

  async function rejectProposal(id) {
    if (!confirm('Reject this proposal? It won\'t be applied.')) return;
    setActionLoading(id);
    try {
      await window.evolution?.rejectProposal({ logId: id });
      await loadHistory();
    } finally {
      setActionLoading(null);
    }
  }

  async function rollback(id) {
    if (!confirm('Rollback this change? The file will be restored from backup.')) return;
    setActionLoading(id);
    try {
      await window.evolution?.rollback({ logId: id });
      await loadHistory();
    } finally {
      setActionLoading(null);
    }
  }

  const steps = ['Try', 'Observe', 'Analyse', 'Improve', 'Test', 'Save'];

  const statusColors = {
    proposed: 'text-blue-400',
    applied: 'text-green-400',
    rolled_back: 'text-orange-400',
    rejected: 'text-red-400/60',
    failed: 'text-red-400',
  };

  const statusLabels = {
    proposed: '📋 Proposed',
    applied: '✅ Applied',
    rolled_back: '↩️ Rolled Back',
    rejected: '❌ Rejected',
    failed: '💥 Failed',
  };

  const riskColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-2">Self Evolution 🧬</h1>
      <p className="text-sm text-luna-text-muted mb-6">Luna analyzes her performance and proposes improvements — you approve before anything changes</p>

      {/* 6-Step Cycle */}
      <div className="flex items-center justify-between mb-6 bg-luna-surface border border-luna-border rounded-luna p-4">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-luna-primary/20 border border-luna-primary/40 flex items-center justify-center text-xs font-medium text-luna-primary">{i + 1}</div>
              <span className="text-[10px] text-luna-text-muted">{step}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-luna-border mx-1" />}
          </React.Fragment>
        ))}
      </div>

      <button onClick={runCycle} disabled={loading} className="w-full py-3 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80 disabled:opacity-30 mb-6 transition-all">
        {loading ? 'Analyzing conversations...' : 'Run Evolution Cycle'}
      </button>

      {analysis && (
        <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-6 animate-fade-in">
          <p className="text-sm text-luna-text-primary mb-2 font-medium">{analysis.message}</p>
          {analysis.analysis?.weaknesses.map((w, i) => <p key={i} className="text-xs text-orange-400 mt-1">⚠️ {w}</p>)}
          {analysis.analysis?.strengths.map((s, i) => <p key={i} className="text-xs text-green-400 mt-1">✅ {s}</p>)}
        </div>
      )}

      <h2 className="text-sm font-medium text-luna-text-primary mb-3">Evolution Log</h2>
      <div className="space-y-2">
        {history.map(e => (
          <div key={e.id} className="bg-luna-surface border border-luna-border rounded-luna p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-luna-text-primary">{e.description}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-[10px] font-medium ${statusColors[e.status] || 'text-luna-text-muted'}`}>
                    {statusLabels[e.status] || e.status}
                  </span>
                  {e.file_changed && (
                    <span className="text-[10px] text-luna-text-muted bg-luna-bg px-1.5 py-0.5 rounded">
                      📄 {e.file_changed}
                    </span>
                  )}
                  {e.risk_score && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${riskColors[e.risk_score] || 'text-luna-text-muted border-luna-border'}`}>
                      Risk: {e.risk_score}
                    </span>
                  )}
                  <span className="text-[9px] text-luna-text-muted">
                    {e.timestamp ? new Date(e.timestamp).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Approve/Reject for proposals */}
                {e.status === 'proposed' && e.proposed_code && (
                  <>
                    <button
                      onClick={() => approveProposal(e.id)}
                      disabled={actionLoading === e.id}
                      className="px-3 py-1.5 text-[11px] font-medium bg-green-500/10 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-30"
                    >
                      {actionLoading === e.id ? '...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => rejectProposal(e.id)}
                      disabled={actionLoading === e.id}
                      className="px-3 py-1.5 text-[11px] font-medium text-red-400/70 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all disabled:opacity-30"
                    >
                      Reject
                    </button>
                  </>
                )}

                {/* Rollback for applied changes */}
                {e.status === 'applied' && (
                  <button
                    onClick={() => rollback(e.id)}
                    disabled={actionLoading === e.id}
                    className="px-3 py-1.5 text-[11px] text-luna-text-muted border border-luna-border rounded-lg hover:border-orange-400 hover:text-orange-400 transition-all disabled:opacity-30"
                  >
                    {actionLoading === e.id ? '...' : '↩️ Rollback'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {history.length === 0 && <p className="text-sm text-luna-text-muted text-center py-6 italic">no evolution history yet — run a cycle to start</p>}
      </div>
    </div>
  );
}
