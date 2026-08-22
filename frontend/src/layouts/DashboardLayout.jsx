import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Bell, Activity, Settings, Server, Play, Square, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchMonitorStatus, startMonitor, stopMonitor } from '../lib/api';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardLayout() {
  const { connected } = useWebSocket();
  const { user, logout } = useAuth();
  const [monitorRunning, setMonitorRunning] = useState(false);

  useEffect(() => {
    // Check monitor status
    fetchMonitorStatus().then(data => {
      if (data && data.status === 'healthy') {
        setMonitorRunning(data.monitoring);
      }
    }).catch(console.error);
  }, []);

  const handleToggleMonitor = async () => {
    try {
      if (monitorRunning) {
        await stopMonitor();
        setMonitorRunning(false);
      } else {
        await startMonitor();
        setMonitorRunning(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'logs', label: 'Live Logs', icon: FileText, path: '/logs' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/alerts' },
    { id: 'analytics', label: 'Analytics', icon: Activity, path: '/analytics' },
    { id: 'rules', label: 'Detection Rules', icon: AlertTriangle, path: '/rules', roles: ['ADMIN'] },
    { id: 'system', label: 'System', icon: Server, path: '/system' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', roles: ['ADMIN'] },
  ];

  return (
    <div className="min-h-screen bg-[#0B1220] text-slate-200">
      {/* Header */}
      <header className="bg-[#0F172A]/80 backdrop-blur border-b border-[#26364D] sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-blue-500" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">IT System Log Analyzer</h1>
                <p className="text-xs text-slate-400 font-medium">Real-Time Security Monitoring & Anomaly Detection</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Status Indicators */}
              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">DATABASE</span>
                  <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">WEBSOCKET</span>
                  <div className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">MONITORING</span>
                  <div className={cn("w-2 h-2 rounded-full", monitorRunning ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-slate-500")} />
                </div>
              </div>

              {/* Monitor Toggle - Admin Only */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleToggleMonitor}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border",
                    monitorRunning
                      ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                  )}
                >
                  {monitorRunning ? (
                    <><Square className="w-3.5 h-3.5" /> Stop Monitoring</>
                  ) : (
                    <><Play className="w-3.5 h-3.5" /> Start Monitoring</>
                  )}
                </button>
              )}

              <div className="border-l border-[#26364D] pl-6 flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-bold text-white">{user?.username}</div>
                  <div className="text-[10px] font-bold text-cyan-400 uppercase">{user?.role}</div>
                </div>
                <button 
                  onClick={logout}
                  className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-2 mt-6">
            {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
