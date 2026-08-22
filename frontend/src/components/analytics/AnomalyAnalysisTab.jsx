import React, { useEffect, useRef } from 'react';
import { Activity, ShieldAlert, Globe } from 'lucide-react';
import { animateViewTransition } from '../../utils/animations';

export default function AnomalyAnalysisTab({ stats }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateViewTransition(containerRef.current);
    }
  }, []);

  const anomalyTypes = stats?.anomaly_type_counts ? Object.entries(stats.anomaly_type_counts) : [];
  const totalAnomalies = stats?.total_anomalies || 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#141417] border border-[#27272a] rounded-xl p-5 shadow-xl shadow-black/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Anomaly Threat Intelligence</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Automated rule classification & origin ranking from ingested log telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-black px-3 py-2 rounded-lg border border-[#27272a]">
            <span className="text-zinc-500 block text-[10px]">TOTAL ANOMALIES</span>
            <span className="text-base font-bold text-red-400">{totalAnomalies}</span>
          </div>
          <div className="bg-black px-3 py-2 rounded-lg border border-[#27272a]">
            <span className="text-zinc-500 block text-[10px]">ANOMALY RATE</span>
            <span className="text-base font-bold text-amber-400">{stats?.anomaly_rate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Anomaly Type Distribution + Top Threat IPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anomaly Rule Distribution Matrix */}
        <div className="bg-[#141417] border border-[#27272a] rounded-xl p-5 shadow-xl shadow-black/50">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">Anomaly Rule Match Distribution</h4>
          </div>

          <div className="space-y-3">
            {anomalyTypes.length > 0 ? (
              anomalyTypes.map(([type, count]) => {
                const percentage = totalAnomalies > 0 ? Math.round((count / totalAnomalies) * 100) : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-zinc-300 font-medium">{type}</span>
                      <span className="text-zinc-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-zinc-800">
                      <div
                        className="bg-amber-500 rounded-full h-2 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-500 py-8 text-center font-mono">No rule-matched anomalies recorded yet</p>
            )}
          </div>
        </div>

        {/* Top Threat IP Breakdown */}
        <div className="bg-[#141417] border border-[#27272a] rounded-xl p-5 shadow-xl shadow-black/50">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">Anomalous IP Origin Ranking</h4>
          </div>

          <div className="space-y-2.5">
            {stats?.top_anomaly_ips && Object.keys(stats.top_anomaly_ips).length > 0 ? (
              Object.entries(stats.top_anomaly_ips)
                .sort((a, b) => b[1] - a[1])
                .map(([ip, count], idx) => (
                  <div key={ip} className="flex items-center justify-between p-2.5 bg-black border border-[#27272a] rounded-lg text-xs font-mono">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 w-4 text-center">{idx + 1}.</span>
                      <span className="text-zinc-200 font-medium">{ip}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-500/15 text-red-400 border border-red-500/30 rounded text-[11px] font-bold">
                        {count} anomalies
                      </span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-xs text-zinc-500 py-8 text-center font-mono">No anomalous IPs recorded yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
