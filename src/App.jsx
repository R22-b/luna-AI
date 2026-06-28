import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import WakeWordEngine from './components/WakeWordEngine';

// Lazy load all pages
const ChatPage = lazy(() => import('./pages/ChatPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const StudentPage = lazy(() => import('./pages/StudentPage'));
const GuardianPage = lazy(() => import('./pages/GuardianPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const EvolutionPage = lazy(() => import('./pages/EvolutionPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SecurityPage = lazy(() => import('./pages/SecurityPage'));
const PluginsPage = lazy(() => import('./pages/PluginsPage'));
const SetupWizard = lazy(() => import('./pages/SetupWizard'));

function StartupScreen() {
  const [dots, setDots] = useState('');
  useEffect(() => {
    const i = setInterval(() => setDots(p => p.length >= 3 ? '' : p + '.'), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-luna-surface border-2 border-luna-primary flex items-center justify-center animate-glow">
          <span className="text-3xl font-bold text-luna-primary">L</span>
        </div>
        <div className="absolute -inset-3 rounded-full border border-luna-primary/20 animate-pulse" />
        <div className="absolute -inset-6 rounded-full border border-luna-primary/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
      <h1 className="text-2xl font-semibold text-luna-text-primary mb-2">Luna AI</h1>
      <p className="text-luna-text-muted text-sm mb-8">v2.0 — Built by Ravikiran</p>
      <div className="flex items-center gap-2 text-luna-text-muted text-sm">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" />
          <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <span>Luna is starting{dots}</span>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="flex gap-1">
        <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-luna-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <StartupScreen />;

  return (
    <Router>
      <div className="flex flex-col h-screen bg-black overflow-hidden">
        <WakeWordEngine />
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
          <main className="flex-1 overflow-hidden">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/student" element={<StudentPage />} />
                <Route path="/guardian" element={<GuardianPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/evolution" element={<EvolutionPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/plugins" element={<PluginsPage />} />
                <Route path="/setup" element={<SetupWizard />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}
