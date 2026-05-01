import React, { useState, useEffect } from 'react';

export default function GuardianPage() {
  const [projects, setProjects] = useState([]);
  const [storage, setStorage] = useState(0);
  const [backups, setBackups] = useState([]);
  const [viewingProject, setViewingProject] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);

  useEffect(() => { loadProjects(); loadStorage(); }, []);

  async function loadProjects() {
    const res = await window.guardian?.getProjects();
    if (res?.success) setProjects(res.projects || []);
  }

  async function loadStorage() {
    const res = await window.guardian?.getStorage();
    if (res?.success) setStorage(res.sizeMb || 0);
  }

  async function addProject() {
    // Open real folder picker dialog
    const folderResult = await window.luna?.openFolderDialog();
    if (!folderResult?.success || !folderResult.path) return;

    const folderPath = folderResult.path;
    const name = folderPath.split('\\').pop() || folderPath.split('/').pop() || 'project';

    const res = await window.guardian?.addProject({ name, folderPath });
    if (res?.success) {
      loadProjects();
      loadStorage();
    }
  }

  async function manualBackup(proj) {
    await window.guardian?.manualBackup({ projectName: proj.project_name, folderPath: proj.folder_path });
    loadProjects();
    loadStorage();
  }

  async function viewBackups(proj) {
    setViewingProject(proj);
    const res = await window.guardian?.getBackups({ projectName: proj.project_name });
    if (res?.success) setBackups(res.backups || []);
  }

  async function restoreBackup(backupId) {
    const res = await window.guardian?.restore({ backupId });
    setShowConfirm(null);
    if (res?.success) {
      setRestoreResult({ path: res.restoredTo || viewingProject?.folder_path, project: viewingProject?.project_name });
    }
  }

  async function openRestoredFolder() {
    if (restoreResult?.path) {
      await window.luna?.openFolder({ path: restoreResult.path });
    }
    setRestoreResult(null);
    setViewingProject(null);
  }

  async function removeProject(name) {
    await window.guardian?.removeProject({ name });
    loadProjects();
  }

  function getStatus(lastBackup) {
    if (!lastBackup) return { color: 'bg-gray-500', label: 'never' };
    const diff = (Date.now() - new Date(lastBackup).getTime()) / 3600000;
    if (diff < 1) return { color: 'bg-green-500', label: `${Math.round(diff * 60)}m ago` };
    if (diff < 3) return { color: 'bg-yellow-500', label: `${Math.round(diff)}h ago` };
    return { color: 'bg-red-500', label: `${Math.round(diff)}h ago` };
  }

  function timeAgo(ts) {
    if (!ts) return 'never';
    const diff = (Date.now() - new Date(ts).getTime()) / 60000;
    if (diff < 1) return 'just now';
    if (diff < 60) return `${Math.round(diff)}m ago`;
    if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
    return `${Math.round(diff / 1440)}d ago`;
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-luna-text-primary">PROJECT GUARDIAN 🛡️</h1>
          <p className="text-xs text-luna-text-muted mt-1">auto-backup your projects with real-time file watching</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-luna-text-muted">Storage Used</p>
          <div className="w-32 h-2 bg-luna-surface rounded-full overflow-hidden mt-1">
            <div className="h-full bg-luna-accent rounded-full" style={{ width: `${Math.min(storage / 10, 100)}%` }} />
          </div>
          <p className="text-[10px] text-luna-accent mt-0.5">{storage.toFixed(1)} MB</p>
        </div>
      </div>

      {/* Notification */}
      {projects.some(p => { const s = getStatus(p.last_backup); return s.color === 'bg-red-500'; }) && (
        <div className="bg-luna-primary/10 border border-luna-primary/30 rounded-luna p-3 mb-4">
          <p className="text-sm text-luna-text-primary">⚠️ some projects need backup! click "Backup Now" to protect them</p>
        </div>
      )}

      {/* Projects */}
      <div className="space-y-3 mb-4">
        {projects.map((proj, i) => {
          const status = getStatus(proj.last_backup);
          return (
            <div key={i} className="bg-luna-surface border border-luna-border rounded-luna p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
                  <h3 className="text-sm font-medium text-luna-text-primary">{proj.project_name}</h3>
                </div>
                <button onClick={() => removeProject(proj.project_name)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
              </div>
              <p className="text-[11px] text-luna-text-muted mb-3 truncate">{proj.folder_path}</p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-luna-text-muted">{proj.backup_count || 0} backups • last: {status.label}</span>
                <div className="flex gap-2">
                  <button onClick={() => viewBackups(proj)} className="px-3 py-1 text-[11px] text-luna-text-muted border border-luna-border rounded-luna-sm hover:border-luna-primary hover:text-luna-text-primary transition-colors">View Backups</button>
                  <button onClick={() => manualBackup(proj)} className="px-3 py-1 text-[11px] text-white bg-luna-primary rounded-luna-sm hover:bg-luna-primary/80 transition-colors">Backup Now</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Project - REAL FOLDER PICKER */}
      <button onClick={addProject} className="w-full border-2 border-dashed border-luna-border rounded-luna p-6 text-center hover:border-luna-primary/50 transition-colors group cursor-pointer">
        <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">📁</span>
        <span className="text-sm text-luna-text-muted group-hover:text-luna-text-primary">+ Add Project (opens folder picker)</span>
      </button>

      {/* Backups Modal */}
      {viewingProject && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={() => setViewingProject(null)}>
          <div className="bg-luna-surface border border-luna-border rounded-luna p-6 w-[500px] max-h-[400px] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-luna-text-primary">Backups — {viewingProject.project_name}</h3>
              <button onClick={() => setViewingProject(null)} className="text-luna-text-muted hover:text-luna-text-primary">✕</button>
            </div>
            {backups.length === 0 ? (
              <p className="text-sm text-luna-text-muted text-center py-4">no backups yet — click "Backup Now" to create one</p>
            ) : (
              <div className="space-y-2">
                {backups.map((b, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-luna-border/30">
                    <div>
                      <p className="text-xs text-luna-text-primary">{timeAgo(b.timestamp)}</p>
                      <p className="text-[10px] text-luna-text-muted">{b.file_count} files • {b.size_mb?.toFixed(1)}MB</p>
                    </div>
                    {showConfirm === b.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => restoreBackup(b.id)} className="px-2 py-1 text-[10px] text-white bg-red-600 rounded">Confirm</button>
                        <button onClick={() => setShowConfirm(null)} className="px-2 py-1 text-[10px] text-luna-text-muted border border-luna-border rounded">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowConfirm(b.id)} className="px-2 py-1 text-[10px] text-luna-accent border border-luna-accent/30 rounded hover:bg-luna-accent/10">Restore</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Restore Result */}
            {restoreResult && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-luna-sm p-3">
                <p className="text-xs text-green-400 mb-1">✅ Restored successfully!</p>
                <p className="text-[10px] text-luna-text-muted truncate mb-2">📁 {restoreResult.path}</p>
                <div className="flex gap-2">
                  <button onClick={openRestoredFolder} className="px-3 py-1 text-[10px] text-white bg-green-600 rounded hover:bg-green-500">Open Folder in Explorer</button>
                  <button onClick={() => { setRestoreResult(null); setViewingProject(null); }} className="px-3 py-1 text-[10px] text-luna-text-muted border border-luna-border rounded">Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
