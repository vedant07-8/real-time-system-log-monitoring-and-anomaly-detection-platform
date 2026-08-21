import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LogEntryItem({ log }) {
  const levelBadge = {
    CRITICAL: 'text-red-400 bg-red-500/15 border-red-500/30',
    ERROR: 'text-red-400 bg-red-500/10 border-red-500/20',
    WARNING: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    INFO: 'text-zinc-300 bg-zinc-800/80 border-zinc-700',
  };

  return (
    <div className={`log-entry font-mono text-xs border-b border-[#262626]/50 px-4 py-2 transition-colors hover:bg-zinc-900/60 ${
      log.is_anomaly ? 'bg-red-950/15 border-l-2 border-l-red-500' : ''
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-zinc-500 w-40 shrink-0 font-mono text-[11px]">
          {new Date(log.timestamp).toLocaleString()}
        </span>
        <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold w-16 text-center shrink-0 ${levelBadge[log.level] || 'text-zinc-400 border-zinc-700'}`}>
          {log.level}
        </span>
        <span className="text-zinc-300 font-medium w-20 shrink-0">{log.source}</span>
        <span className="text-zinc-200 flex-1 break-all">{log.message}</span>
        {log.is_anomaly && (
          <span className="inline-flex items-center gap-1 text-red-400 text-[10px] bg-red-500/15 border border-red-500/30 px-1.5 py-0.5 rounded shrink-0">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>{log.anomaly_type}</span>
          </span>
        )}
      </div>
      {(log.source_ip || log.user) && (
        <div className="text-zinc-500 ml-[208px] mt-0.5 text-[11px]">
          {log.source_ip && <span>IP: {log.source_ip}</span>}
          {log.source_ip && log.user && <span> | </span>}
          {log.user && <span>User: {log.user}</span>}
        </div>
      )}
    </div>
  );
}
