import React from 'react';
import { AlertCircle, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AlertItem({ alert, onClick }) {
  const severityConfig = {
    CRITICAL: {
      color: 'border-red-500 bg-red-500/10 text-red-400',
      icon: ShieldAlert,
      glow: 'shadow-[inset_4px_0_0_#ef4444,0_0_15px_rgba(239,68,68,0.15)]'
    },
    HIGH: {
      color: 'border-orange-500 bg-orange-500/10 text-orange-400',
      icon: AlertCircle,
      glow: 'shadow-[inset_4px_0_0_#f97316]'
    },
    MEDIUM: {
      color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
      icon: AlertTriangle,
      glow: 'shadow-[inset_4px_0_0_#eab308]'
    },
    LOW: {
      color: 'border-green-500 bg-green-500/10 text-green-400',
      icon: Info,
      glow: 'shadow-[inset_4px_0_0_#22c55e]'
    },
  };

  const config = severityConfig[alert.severity] || severityConfig.LOW;
  const Icon = config.icon;

  return (
    <div 
      onClick={() => onClick && onClick(alert)}
      className={cn(
        "rounded-r-lg p-3 mb-2 transition-all cursor-pointer border border-transparent hover:border-slate-600/50",
        config.color,
        config.glow
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-black/20">
              {alert.severity}
            </span>
            <span className="text-xs text-slate-300 font-medium">{alert.anomaly_type}</span>
          </div>
          <p className="text-sm text-slate-300 mt-2">{alert.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-slate-500 font-mono">
            {alert.source_ip && <span>IP: {alert.source_ip}</span>}
            {alert.user && <span>USR: {alert.user}</span>}
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
        </div>
        <div className="ml-4 text-center">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Score</div>
          <div className={cn(
            "text-lg font-bold font-mono",
            alert.threatScore === undefined ? "text-slate-500" :
            alert.threatScore >= 90 ? "text-red-500" :
            alert.threatScore >= 75 ? "text-orange-500" :
            alert.threatScore >= 50 ? "text-yellow-500" : "text-green-500"
          )}>
            {alert.threatScore !== undefined ? alert.threatScore : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
}
