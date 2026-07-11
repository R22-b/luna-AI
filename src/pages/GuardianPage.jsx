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
    <div className="h-full overflow-y-auto bg-black px-8 py-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-luna-text-primary">PROJECT GUARDIAN 🛡️</h1>
          <p className="text-xs text-luna-text-muted mt-1">auto-backup your projects with real-time file watching</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-luna-border rounded-luna p-8 mt-4">
        <span className="text-5xl block mb-4">⏳</span>
        <h2 className="text-xl font-semibold text-luna-text-primary mb-2">Upcoming Feature</h2>
        <p className="text-sm text-luna-text-muted text-center max-w-md">
          Project Guardian is getting a major upgrade. Automated backups, real-time file watching, and one-click restores are coming in the next update!
        </p>
      </div>
    </div>
  );
}
