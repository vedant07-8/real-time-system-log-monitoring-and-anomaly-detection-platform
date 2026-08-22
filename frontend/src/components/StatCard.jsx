import React from 'react';
import { cn } from '../lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-500',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20 text-red-500',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20 text-green-500',
    yellow: 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20 text-yellow-500',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20 text-purple-500',
    orange: 'from-orange-500/10 to-orange-600/5 border-orange-500/20 text-orange-500',
  };

  return (
    <div className={cn("bg-gradient-to-br border rounded-xl p-5 transition-all hover:border-slate-600/50 hover:shadow-lg hover:shadow-black/20", colorClasses[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-bold text-slate-100 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn("p-2 rounded-lg bg-opacity-20", colorClasses[color].split(' ')[0].replace('/10', '/20'))}>
          <Icon className="w-6 h-6 opacity-80" />
        </div>
      </div>
      {trend && (
        <div className={cn("mt-4 text-xs font-medium", trend > 0 ? 'text-red-400' : 'text-green-400')}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  );
}
