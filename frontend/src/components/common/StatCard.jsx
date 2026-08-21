import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const borderAccents = {
    blue: 'border-l-blue-500',
    red: 'border-l-red-500',
    green: 'border-l-emerald-500',
    yellow: 'border-l-amber-500',
    purple: 'border-l-purple-500',
  };

  const iconColors = {
    blue: 'text-blue-400',
    red: 'text-red-400',
    green: 'text-emerald-400',
    yellow: 'text-amber-400',
    purple: 'text-purple-400',
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 border-l-4 ${borderAccents[color] || borderAccents.blue} rounded-xl p-4 transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] text-slate-400 font-mono font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-100 font-mono mt-1">{value}</p>
          {subtitle && <p className="text-[11px] text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 ${iconColors[color] || 'text-slate-400'}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-2 text-[11px] font-mono ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  );
}
