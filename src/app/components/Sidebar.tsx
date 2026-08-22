import { useState } from 'react';
import {
  LayoutDashboard, Bot, Users, BarChart3, TrendingUp,
  DollarSign, FileText, Settings, Menu, X,
  Layers, Target
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard',    icon: LayoutDashboard, label: 'Dashboard'         },
  { id: 'analytics',    icon: Users,           label: 'Employee Analytics' },
  { id: 'optimization', icon: Layers,          label: 'Optimization'       },
  { id: 'simulator',    icon: DollarSign,      label: 'Cost Simulator'     },
  { id: 'copilot',      icon: Bot,             label: 'AI Copilot'         },
  { id: 'forecasting',  icon: TrendingUp,      label: 'Forecasting'        },
  { id: 'reports',      icon: FileText,        label: 'Reports'            },
  { id: 'settings',     icon: Settings,        label: 'Settings'           },
];

const accentColors: Record<string, string> = {
  dashboard:    '#3B82F6',
  analytics:    '#10B981',
  optimization: '#8B5CF6',
  simulator:    '#F59E0B',
  copilot:      '#06B6D4',
  forecasting:  '#EF4444',
  reports:      '#3B82F6',
  settings:     '#94A3B8',
};

export default function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        width: collapsed ? 68 : 240,
        transition: 'width 0.25s ease',
        minWidth: collapsed ? 68 : 240,
      }}
      className="h-screen bg-[#0F172A] border-r border-[#1E293B] flex flex-col relative z-20 overflow-hidden"
    >
      {/* Logo Row */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[#1E293B]" style={{ minHeight: 68 }}>
        {/* Gradient Icon */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-xl text-white font-bold text-base"
          style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          }}
        >
          N
        </div>

        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[15px] text-white leading-tight">WorkAI</p>
            <p className="text-[11px] text-[#64748B] leading-tight">NEXUS Platform</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex-shrink-0 text-[#64748B] hover:text-white transition-colors rounded-lg p-1"
        >
          {collapsed ? <Menu size={18} /> : <X size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const accent = accentColors[item.id];

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative group"
              style={{
                background: isActive ? `${accent}18` : 'transparent',
                color: isActive ? accent : '#64748B',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(51,65,85,0.4)';
                  (e.currentTarget as HTMLElement).style.color = '#F1F5F9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#64748B';
                }
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: accent }}
                />
              )}

              <Icon size={18} className="flex-shrink-0" />

              {!collapsed && (
                <>
                  <span className="text-[13px] font-medium flex-1 text-left whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: accent }}
                    />
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t border-[#1E293B] p-3">
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-full text-white font-semibold text-[13px]"
            style={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
            }}
          >
            AU
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-white truncate">Admin User</p>
              <p className="text-[11px] text-[#64748B] truncate">Executive</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
