import { Bell, RefreshCw } from 'lucide-react';

const pageTitles: Record<string, string> = {
  dashboard:    'Executive Dashboard',
  analytics:    'Employee Analytics',
  optimization: 'Workforce Optimization Engine',
  simulator:    'Cost Reduction Simulator',
  copilot:      'AI Copilot',
  forecasting:  'Workforce Forecasting',
  reports:      'Reports Center',
  settings:     'Settings & Security',
};

interface TopHeaderProps {
  activeView: string;
}

export default function TopHeader({ activeView }: TopHeaderProps) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-between px-6 bg-[#0F172A] border-b border-[#1E293B]"
      style={{ height: 68 }}
    >
      {/* Page Title */}
      <h1 className="text-[18px] font-bold text-white">
        {pageTitles[activeView] ?? 'Dashboard'}
      </h1>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Live badge */}
        <div className="badge badge-success flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          Live Data
        </div>

        {/* Refresh */}
        <button
          className="btn-outline flex items-center gap-2"
          title="Refresh"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button className="btn-outline p-2 relative">
            <Bell size={16} />
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
              style={{ background: '#EF4444' }}
            >
              3
            </span>
          </button>
        </div>

        {/* User Avatar */}
        <div
          className="flex items-center justify-center rounded-full text-white font-semibold text-[13px] cursor-pointer"
          style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
          }}
        >
          AU
        </div>
      </div>
    </div>
  );
}
