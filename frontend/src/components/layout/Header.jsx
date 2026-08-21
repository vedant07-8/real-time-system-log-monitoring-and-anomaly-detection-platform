import React from 'react';
import { ShieldAlert, LayoutDashboard, Terminal, AlertTriangle, Radio, Search, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function Header({
  wsConnected,
  activeTab,
  setActiveTab,
  criticalCount = 0,
}) {
  const isHealthy = criticalCount === 0;

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-slate-100">IT System Log Analyzer</h1>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">SIH1408</span>
              </div>
              <p className="text-[11px] text-slate-400">Real-Time Anomaly Detection Platform</p>
            </div>
          </div>

          {/* System Status Readouts */}
          <div className="flex items-center gap-3 text-xs">
            {/* System Health */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-md text-slate-300">
              {isHealthy ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-medium text-slate-300">System Healthy</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[11px] font-medium text-red-400">{criticalCount} Critical Threats</span>
                </>
              )}
            </div>

            {/* WebSocket Stream Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-md">
              <Radio className={`w-3.5 h-3.5 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              <span className="text-[11px] font-mono text-slate-300">{wsConnected ? 'LIVE STREAM' : 'OFFLINE'}</span>
            </div>

            {/* Quick Search Shortcut Hint */}
            <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-slate-800/50 border border-slate-700/60 rounded text-slate-400 text-[11px] font-mono">
              <Search className="w-3 h-3 text-slate-500" />
              <span>Ctrl+K</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mt-2.5 border-t border-slate-800/60 pt-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'logs', label: 'Live Log Console', icon: Terminal },
            { id: 'alerts', label: 'Alert Center', icon: AlertTriangle },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
