import React, { useState, useEffect } from 'react';

export default function GuardianPage() {
  const [projects, setProjects] = useState([]);
  const [storage, setStorage] = useState(0);
  const [backups, setBackups] = useState([]);
  const [viewingProject, setViewingProject] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [restoreResult, setRestoreResult] = useState(null);

  useEffect(() => {
    loadProjects();
    loadStorage();
  }, []);

  async function loadProjects() {
    const res = await window.guardian?.getProjects();
    if (res?.success) setProjects(res.projects || []);
  }

  async function loadStorage() {
    const res = await window.guardian?.getStorage();
    if (res?.success) setStorage(res.sizeMb || 0);
  }

  async function addProject() {
    const folderResult = await window.luna?.openFolderDialog();
    if (!folderResult?.success || !folderResult.path) return;
    const folderPath = folderResult.path;
    const name = folderPath.split(/[\\/]/).pop() || 'project';
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
    <div className="h-full overflow-y-auto bg-black px-8 py-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-luna-text-primary">PROJECT GUARDIAN 🛡️</h1>
          <p className="text-xs text-luna-text-muted mt-1">auto-backup your projects with real-time file watching</p>
        </div>
        <div className="bg-luna-surface border border-luna-border px-4 py-2 rounded-luna flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-luna-text-muted uppercase tracking-wider">Vault Size</p>
            <p className="text-sm font-medium text-luna-text-primary">{storage} MB</p>
          </div>
          <button 
            onClick={addProject}
            className="bg-luna-primary text-white text-xs px-4 py-1.5 rounded-luna-sm hover:bg-luna-primary/80 transition-colors"
          >
            + Add Project
          </button>
        </div>
      </div>

      {!viewingProject ? (
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center border border-dashed border-luna-border rounded-luna">
              <span className="text-3xl mb-3">🛡️</span>
              <p className="text-sm text-luna-text-muted">no projects being watched yet</p>
              <button onClick={addProject} className="mt-4 text-xs text-luna-primary hover:underline">add your first project</button>
            </div>
          ) : (
            projects.map((proj) => {
              const status = getStatus(proj.last_backup);
              return (
                <div key={proj.project_name} className="bg-luna-surface border border-luna-border rounded-luna p-4 flex items-center justify-between hover:border-luna-primary/30 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                    <div>
                      <h3 className="text-sm font-medium text-luna-text-primary">{proj.project_name}</h3>
                      <p className="text-[10px] text-luna-text-muted mt-0.5">{proj.folder_path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <p className="text-[10px] text-luna-text-muted uppercase">Last Backup</p>
                      <p className="text-xs text-luna-text-primary">{status.label}</p>
                    </div>
                    <button 
                      onClick={() => manualBackup(proj)}
                      className="p-2 text-luna-text-muted hover:text-luna-primary transition-colors"
                      title="Manual Backup"
                    >
                      🔄
                    </button>
                    <button 
                      onClick={() => viewBackups(proj)}
                      className="px-3 py-1 bg-luna-bg border border-luna-border text-[11px] text-luna-text-primary rounded hover:border-luna-primary/50 transition-colors"
                    >
                      History
                    </button>
                    <button 
                      onClick={() => removeProject(proj.project_name)}
                      className="p-2 text-luna-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Stop Watching"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-fade-in">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setViewingProject(null)} className="text-luna-text-muted hover:text-luna-text-primary text-sm">← Back</button>
            <h2 className="text-lg font-medium text-luna-text-primary">{viewingProject.project_name}</h2>
          </div>

          {backups.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-sm text-luna-text-muted">no backups found for this project</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {backups.map((b) => (
                <div key={b.id} className="bg-luna-surface border border-luna-border rounded-luna p-4 hover:border-luna-primary/30 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] bg-luna-bg px-2 py-0.5 rounded text-luna-text-muted">#{b.id}</span>
                    <span className="text-[11px] text-luna-text-muted">{timeAgo(b.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-luna-text-primary mb-1">{b.file_count} files • {b.size_mb} MB</p>
                  <p className="text-[10px] text-luna-text-muted truncate mb-4">{b.backup_path}</p>
                  <button 
                    onClick={() => setShowConfirm(b)}
                    className="w-full py-1.5 bg-luna-primary/10 border border-luna-primary/30 text-luna-primary text-[11px] rounded hover:bg-luna-primary hover:text-white transition-all"
                  >
                    Restore This Version
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restore Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-luna-surface border border-luna-border rounded-luna p-6 max-w-md w-full animate-pop-in">
            <h3 className="text-lg font-medium text-luna-text-primary mb-2">Confirm Restore</h3>
            <p className="text-sm text-luna-text-muted mb-6">
              This will overwrite your current project files in <span className="text-luna-text-primary font-mono bg-black/40 px-1 rounded">{viewingProject.folder_path}</span> with the version from <span className="text-luna-text-primary">{timeAgo(showConfirm.timestamp)}</span>. 
              <br/><br/>
              Current files will be deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => restoreBackup(showConfirm.id)}
                className="flex-1 py-2 bg-red-500 text-white text-sm rounded-luna hover:bg-red-600 transition-colors"
              >
                Yes, Restore Now
              </button>
              <button 
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-2 bg-luna-bg border border-luna-border text-luna-text-primary text-sm rounded-luna hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {restoreResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-luna-surface border border-luna-border rounded-luna p-6 max-w-md w-full text-center animate-pop-in">
            <span className="text-4xl block mb-4">✅</span>
            <h3 className="text-lg font-medium text-luna-text-primary mb-2">Restore Complete</h3>
            <p className="text-sm text-luna-text-muted mb-6">
              Successfully restored <span className="text-luna-text-primary">{restoreResult.project}</span>.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={openRestoredFolder}
                className="flex-1 py-2 bg-luna-primary text-white text-sm rounded-luna hover:bg-luna-primary/80"
              >
                Open Folder
              </button>
              <button 
                onClick={() => { setRestoreResult(null); setViewingProject(null); }}
                className="flex-1 py-2 bg-luna-bg border border-luna-border text-luna-text-primary text-sm rounded-luna hover:bg-white/5"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
