import React from 'react';
import { cn } from '../lib/utils';
import { AlertOctagon, Info, AlertTriangle, XCircle } from 'lucide-react';

export default function LogEntry({ log, onClick }) {
  const levelConfig = {
    ERROR: { color: 'text-red-400 bg-red-500/10 border-red-500/30', icon: XCircle },
    WARNING: { color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', icon: AlertTriangle },
    INFO: { color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', icon: Info },
    CRITICAL: { color: 'text-red-500 bg-red-500/20 border-red-500/50', icon: AlertOctagon },
  };

  const config = levelConfig[log.level] || levelConfig.INFO;
  const Icon = config.icon;

  return (
    <div 
      onClick={() => onClick && onClick(log)}
      className={cn(
        "font-mono text-xs border-b border-slate-700/50 px-4 py-2.5 transition-colors cursor-pointer hover:bg-slate-800/80",
        log.is_anomaly ? "bg-red-500/5 border-l-2 border-l-red-500" : "border-l-2 border-l-transparent"
      )}
    >
      <div className="flex items-start gap-4">
        <span className="text-slate-500 w-44 shrink-0">
          {new Date(log.timestamp).toLocaleString()}
        </span>
        <span className={cn("flex items-center justify-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-bold w-24 shrink-0", config.color)}>
          <Icon className="w-3 h-3" />
          {log.level}
        </span>
        <span className="text-purple-400 w-28 shrink-0 truncate" title={log.source}>{log.source}</span>
        {log.hostname && (
          <span className="text-slate-500 w-28 shrink-0 truncate" title={log.hostname}>{log.hostname}</span>
        )}
        
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-slate-300 break-words">{log.message}</span>
          
          {(log.source_ip || log.user || log.is_anomaly) && (
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {log.source_ip && (
                <span className="text-slate-500 text-[10px]">
                  IP: <span className="text-slate-400">{log.source_ip}</span>
                </span>
              )}
              {log.user && (
                <span className="text-slate-500 text-[10px]">
                  USR: <span className="text-slate-400">{log.user}</span>
                </span>
              )}
              {log.is_anomaly && (
                <span className="text-red-400 text-[10px] bg-red-500/20 px-2 py-0.5 rounded font-bold">
                  ⚠ {log.anomaly_type}
                </span>
              )}
              {log.threatScore !== undefined && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded font-bold border",
                  log.threatScore >= 90 ? "text-red-400 border-red-400/30 bg-red-500/10" :
                  log.threatScore >= 75 ? "text-orange-400 border-orange-400/30 bg-orange-500/10" :
                  log.threatScore >= 50 ? "text-yellow-400 border-yellow-400/30 bg-yellow-500/10" :
                  "text-green-400 border-green-400/30 bg-green-500/10"
                )}>
                  SCORE: {log.threatScore}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
