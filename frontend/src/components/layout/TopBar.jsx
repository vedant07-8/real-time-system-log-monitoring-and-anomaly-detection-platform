import React from 'react';
import { Search, CheckCircle2, AlertOctagon, ShieldCheck, User } from 'lucide-react';

const TAB_TITLES = {
  overview: 'Overview & System Metrics',
  logs: 'SIEM Live Log Stream',
  alerts: 'Incident Alert Monitor',
  analysis: 'Anomaly Threat Analysis',
};

export default function TopBar({ activeTab, criticalCount = 0 }) {
  const isHealthy = criticalCount === 0;

  return (
    <header className="h-14 bg-slate-950/80 backdrop-blur border-b border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
      {/* Breadcrumb & Current Title */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-slate-500">Console</span>
        <span className="text-xs text-slate-600">/</span>
        <h2 className="text-xs font-semibold text-slate-200 tracking-tight">{TAB_TITLES[activeTab] || 'Dashboard'}</h2>
      </div>

      {/* Center & Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search trigger */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-400 font-mono">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[11px]">Filter logs...</span>
          <kbd className="ml-2 bg-slate-800 px-1.5 py-0.2 text-[10px] rounded text-slate-400 border border-slate-700">Ctrl+K</kbd>
        </div>

        {/* System Health Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs">
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

        {/* User / Operator Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-mono text-slate-300">SOC Admin</span>
        </div>
      </div>
    </header>
  );
}
