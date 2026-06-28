import React, { useEffect, useState } from 'react';

export default function PluginsPage() {
  const [installed, setInstalled] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInstalled();
  }, []);

  async function loadInstalled() {
    setLoading(true);
    try {
      const res = await window.plugins?.getInstalled();
      if (res?.success) {
        setInstalled(res.plugins || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function reloadPlugins() {
    setLoading(true);
    try {
      await window.plugins?.reload();
      await loadInstalled();
    } finally {
      setLoading(false);
    }
  }

  async function togglePlugin(name, isEnabled) {
    setLoading(true);
    try {
      if (isEnabled) {
        await window.plugins?.unload({ name });
      } else {
        await window.plugins?.enable({ name });
      }
      await loadInstalled();
    } finally {
      setLoading(false);
    }
  }

  async function removePlugin(name) {
    if (!window.confirm(`Are you sure you want to permanently remove "${name}"?`)) return;
    setLoading(true);
    try {
      const res = await window.plugins?.remove({ name });
      if (!res?.success) alert(`Failed to remove: ${res?.error}`);
      await loadInstalled();
    } finally {
      setLoading(false);
    }
  }

  async function importPlugin() {
    try {
      const dialogRes = await window.luna?.openFolderDialog();
      if (dialogRes?.success && dialogRes.path) {
        setLoading(true);
        const res = await window.plugins?.importFolder({ sourcePath: dialogRes.path });
        if (res?.success) {
          await reloadPlugins();
        } else {
          alert(`Import failed: ${res?.error}`);
        }
      }
    } catch (err) {
      alert(`Import error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function createScaffold() {
    const name = `my-plugin-${Math.floor(Math.random() * 10000)}`;
    setLoading(true);
    try {
      const res = await window.plugins?.createScaffold({ name });
      if (res?.success) {
        alert(`Plugin scaffold created at:\n${res.pluginPath}`);
        await reloadPlugins();
      } else {
        alert(`Failed to create plugin: ${res?.error}`);
      }
    } catch (err) {
      alert(`Error creating scaffold: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-black px-8 py-6">
      <h1 className="text-xl font-semibold text-luna-text-primary mb-2">Plugin Store 🔌</h1>
      <p className="text-sm text-luna-text-muted mb-4">import plugin folders from your PC — Luna manages them in your Workspace</p>

      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={importPlugin}
          disabled={loading}
          className="px-4 py-2 bg-luna-primary text-white text-xs rounded-luna hover:bg-luna-primary/80 disabled:opacity-40"
        >
          {loading ? 'Importing...' : 'Import Plugin Folder'}
        </button>
        <button
          onClick={createScaffold}
          disabled={loading}
          className="px-4 py-2 bg-luna-surface text-luna-text-primary text-xs rounded-luna hover:bg-luna-surface/80 border border-luna-border disabled:opacity-40"
        >
          Create Scaffold
        </button>
        <button
          onClick={reloadPlugins}
          disabled={loading}
          className="px-4 py-2 bg-luna-surface text-luna-text-primary text-xs rounded-luna hover:bg-luna-surface/80 border border-luna-border disabled:opacity-40"
        >
          Refresh List
        </button>
      </div>

      <div className="bg-luna-surface border border-luna-border rounded-luna p-4 mb-6">
        <h3 className="text-sm font-medium text-luna-text-primary mb-3">Installed</h3>
        {installed.length === 0 ? (
          <p className="text-xs text-luna-text-muted">No plugins loaded yet. Add plugin folders, then click refresh.</p>
        ) : (
          <div className="space-y-2">
            {installed.map((plugin) => (
              <div key={plugin.name} className="flex items-center justify-between py-2 border-b border-luna-border/30 last:border-0">
                <div>
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium ${plugin.enabled ? 'text-luna-text-primary' : 'text-luna-text-muted line-through'}`}>{plugin.name}</p>
                  {!plugin.enabled && <span className="text-[10px] bg-luna-surface border border-luna-border px-1.5 py-0.5 rounded text-luna-text-muted">Disabled</span>}
                </div>
                  <p className="text-[11px] text-luna-text-muted">{plugin.description || 'No description'} • v{plugin.version || '1.0.0'}</p>
                </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => togglePlugin(plugin.name, plugin.enabled)}
                  className="px-3 py-1 text-[11px] text-luna-text-primary border border-luna-border rounded-luna-sm hover:bg-white/5"
                >
                  {plugin.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => removePlugin(plugin.name)}
                  className="px-3 py-1 text-[11px] text-red-400 border border-red-500/30 rounded-luna-sm hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { name: 'weather-widget', desc: 'Live weather updates on dashboard', icon: '🌤️', status: 'install' },
          { name: 'auto-logger', desc: 'Background conversation logger', icon: '📝', status: 'install' },
          { name: 'spotify-controller', desc: 'Play/pause/skip from Luna', icon: '🎵', status: 'coming soon' },
          { name: 'email-assistant', desc: 'Draft and send emails via Luna', icon: '📧', status: 'coming soon' },
        ].map((plugin, i) => (
          <div key={i} className="bg-luna-surface border border-luna-border rounded-luna p-4 hover:border-luna-primary/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{plugin.icon}</span>
              <h3 className="text-sm font-medium text-luna-text-primary">{plugin.name}</h3>
            </div>
            <p className="text-xs text-luna-text-muted mb-3">{plugin.desc}</p>
            {plugin.status === 'install' ? (
              <button className="text-[10px] bg-luna-primary text-white px-3 py-1 rounded hover:bg-luna-primary/80">Install</button>
            ) : (
              <span className="text-[10px] bg-luna-bg text-luna-text-muted px-2 py-0.5 rounded-full">{plugin.status}</span>
            )}
          </div>
        ))}
      </div>

      {/* How to create a plugin */}
      <div className="bg-luna-surface border border-luna-border rounded-luna p-4">
        <h3 className="text-sm font-medium text-luna-text-primary mb-2">📝 Create Your Own Plugin</h3>
        <div className="text-xs text-luna-text-muted space-y-1">
          <p>1. Create a folder anywhere on your PC</p>
          <p>2. Add a <code className="bg-luna-bg px-1 rounded">plugin.json</code> with name, version, description</p>
          <p>3. Add a <code className="bg-luna-bg px-1 rounded">backend.js</code> and <code className="bg-luna-bg px-1 rounded">ui.jsx</code> with your logic</p>
          <p>4. Click "Import Plugin Folder" above to load it into Luna</p>
        </div>
      </div>
    </div>
  );
}
