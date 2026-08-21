import React from 'react';
import { Search, CheckCircle2, AlertOctagon, Bell } from 'lucide-react';

const TAB_TITLES = {
  overview: 'Overview',
  logs: 'Live Log Stream',
  alerts: 'Alert Monitor',
  analysis: 'Anomaly Analysis',
};

export default function TopBar({ activeTab, criticalCount = 0 }) {
  const isHealthy = criticalCount === 0;

  return (
    <header className="h-14 bg-[#000000] border-b border-[#27272a] px-4 flex items-center justify-between sticky top-0 z-20 shrink-0 select-none">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-500">Console</span>
        <span className="text-xs text-zinc-600">/</span>
        <span className="text-xs font-mono text-zinc-500">Dashboard</span>
        <span className="text-xs text-zinc-600">/</span>
        <h2 className="text-xs font-semibold text-zinc-100 tracking-tight">{TAB_TITLES[activeTab] || 'Overview'}</h2>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-3">
        {/* Search / Ctrl+K Input */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#141417] border border-[#27272a] rounded-md text-xs text-zinc-400 font-mono shadow-sm shadow-black/40">
          <Search className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px]">Type to search...</span>
          <kbd className="ml-2 bg-zinc-800 px-1.5 py-0.2 text-[10px] rounded text-zinc-400 border border-zinc-700 font-mono">Ctrl+K</kbd>
        </div>

        {/* Notifications Bell */}
        <button
          className="relative p-1.5 bg-[#141417] border border-[#27272a] rounded-md text-zinc-400 hover:text-zinc-200 transition-colors shadow-sm shadow-black/40"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* System Health Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141417] border border-[#27272a] rounded-md text-xs shadow-sm shadow-black/40">
          {isHealthy ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-medium text-zinc-300">System Healthy</span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] font-medium text-red-400">{criticalCount} Critical Threats</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
