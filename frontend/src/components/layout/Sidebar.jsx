import React from 'react';
import { ShieldAlert, LayoutDashboard, Terminal, AlertTriangle, Activity, PanelLeftClose, PanelLeftOpen, Radio } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  wsConnected,
  criticalCount = 0,
}) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'logs', label: 'Live Logs', icon: Terminal },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: criticalCount > 0 ? criticalCount : null },
    { id: 'analysis', label: 'Anomaly Analysis', icon: Activity },
  ];

  return (
    <aside
      className={`bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between transition-all duration-300 ease-in-out z-30 shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-blue-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-xs font-semibold text-slate-100 tracking-tight leading-none">LOG MONITOR</h1>
                <span className="text-[10px] font-mono text-slate-500">SIH1408 Console</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-900 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2.5 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800/90 text-blue-400 border border-slate-700/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
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
        </nav>
      </div>

      {/* Bottom WebSocket Live Status */}
      <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/80">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2 px-2 py-1.5 bg-slate-900/80 border border-slate-800 rounded-md'}`}>
          <Radio className={`w-3.5 h-3.5 shrink-0 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
          {!collapsed && (
            <div className="truncate">
              <p className="text-[10px] font-mono text-slate-300 font-medium leading-none">
                {wsConnected ? 'STREAM ACTIVE' : 'DISCONNECTED'}
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
