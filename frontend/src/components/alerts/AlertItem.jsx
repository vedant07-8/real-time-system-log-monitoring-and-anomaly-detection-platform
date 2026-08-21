import React from 'react';
import { AlertOctagon, AlertTriangle, Info, Globe, User, Clock } from 'lucide-react';

export default function AlertItem({ alert }) {
  const severityConfig = {
    CRITICAL: {
      border: 'border-l-red-500 bg-red-950/20 border-[#262626]',
      badge: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: AlertOctagon,
    },
    HIGH: {
      border: 'border-l-orange-500 bg-orange-950/15 border-[#262626]',
      badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      icon: AlertTriangle,
    },
    MEDIUM: {
      border: 'border-l-amber-500 bg-amber-950/15 border-[#262626]',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
    },
    LOW: {
      border: 'border-l-zinc-600 bg-zinc-900/40 border-[#262626]',
      badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      icon: Info,
    },
  };

  const config = severityConfig[alert.severity] || severityConfig.LOW;
  const SeverityIcon = config.icon;

  return (
    <div className={`border border-l-4 ${config.border} rounded-r-md p-3 mb-2 transition-all hover:border-zinc-700`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${config.badge}`}>
              <SeverityIcon className="w-3 h-3" />
              <span>{alert.severity}</span>
            </span>
            <span className="text-xs font-mono font-medium text-zinc-300">{alert.anomaly_type}</span>
          </div>
          <p className="text-xs text-zinc-200 mt-1.5 leading-relaxed">{alert.description}</p>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono text-zinc-500 flex-wrap">
            {alert.source_ip && (
              <span className="inline-flex items-center gap-1">
                <Globe className="w-3 h-3 text-zinc-400" />
                <span>{alert.source_ip}</span>
              </span>
            )}
            {alert.user && (
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-400" />
                <span>{alert.user}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span>{new Date(alert.timestamp).toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
