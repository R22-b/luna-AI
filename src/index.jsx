import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

// ── Web Bridge Fallback (For Phone/Chrome Access) ──
// ── Web Bridge Fallback (Harden 2.0: Restored but isolated) ──
if (!window.luna || !window.luna.chat) {
  const createProxy = (namespace) => new Proxy({}, {
    get: (_, method) => async (data) => {
      try {
        const res = await fetch(`http://localhost:3000/api/${namespace}/${method}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data || {})
        });
        return await res.json();
      } catch (err) {
        console.error(`[Web Bridge] Failed to call ${namespace}.${method}`, err);
        return { success: false, error: 'Web Bridge connection failed' };
      }
    }
  });

  window.luna = createProxy('luna');
  window.guardian = createProxy('guardian');
  window.sandbox = createProxy('sandbox');
  window.student = createProxy('student');
  window.plugins = createProxy('plugins');
  window.evolution = createProxy('evolution');
  window.voice = window.voice || { speak: () => {}, stop: () => {}, onStatusChange: () => {} };
  
  console.log('🌐 Web Bridge Active: Fallback for Standalone Browser');
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
