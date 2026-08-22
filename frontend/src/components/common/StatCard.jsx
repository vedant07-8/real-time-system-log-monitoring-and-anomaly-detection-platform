import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  return (
    <div className="bg-gradient-to-b from-[#1c1c20] to-[#141417] border border-[#27272a] rounded-xl p-4 shadow-xl shadow-black/60 transition-all hover:border-zinc-700 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-zinc-400 font-mono font-medium uppercase tracking-wider">{title}</p>
        {Icon && (
          <div className="p-2 bg-zinc-800/80 rounded-lg border border-zinc-700 text-zinc-200">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-2">
        <p className="text-2xl font-bold text-zinc-50 font-mono tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-zinc-500 mt-1 font-sans">{subtitle}</p>}
      </div>

      {trend && (
        <div className={`mt-2 text-[11px] font-mono ${trend > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  );
}
