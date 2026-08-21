import React from 'react';
import { ShieldAlert, LayoutDashboard, Terminal, AlertTriangle, Activity, PanelLeft, ShieldCheck, Radio } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  wsConnected,
  criticalCount = 0,
}) {
  const navSections = [
    {
      title: 'PLATFORM',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'logs', label: 'Live Logs', icon: Terminal },
      ],
    },
    {
      title: 'MONITORING',
      items: [
        { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: criticalCount > 0 ? criticalCount : null },
        { id: 'analysis', label: 'Anomaly Analysis', icon: Activity },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#000000] border-r border-[#27272a] flex flex-col justify-between transition-all duration-300 ease-in-out z-30 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-[#27272a]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-zinc-800/90 border border-zinc-700 rounded-md text-zinc-100 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-xs font-bold text-zinc-100 tracking-tight leading-none">LOG MONITOR</h1>
                <span className="text-[10px] font-mono text-zinc-500">SIH1408 Console</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-zinc-400 hover:text-zinc-100 rounded hover:bg-zinc-900 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Categorized Navigation */}
        <div className="p-2 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <span className="px-2.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 block">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-md font-semibold'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-100' : 'text-zinc-400'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Profile & Status Card */}
      <div className="p-2 border-t border-[#27272a] bg-[#000000]">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2.5 py-2 bg-[#141417] border border-[#27272a] rounded-lg shadow-md shadow-black/40'}`}>
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="p-1 bg-zinc-800 rounded border border-zinc-700 text-zinc-300 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-medium text-zinc-200 leading-none">SOC Admin</p>
                <span className="text-[10px] font-mono text-zinc-500">Security Analyst</span>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1 shrink-0">
              <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
