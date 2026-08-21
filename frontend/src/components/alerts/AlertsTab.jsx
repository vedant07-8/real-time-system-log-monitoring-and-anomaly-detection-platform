import React, { useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import AlertItem from './AlertItem';
import { animateViewTransition } from '../../utils/animations';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

export default function AlertsTab({ alerts }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateViewTransition(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Active Security Incidents ({alerts.length})
            </h3>
          </div>
          <div className="flex gap-2">
            {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
              <span
                key={sev}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded border"
                style={{
                  backgroundColor: SEVERITY_COLORS[sev] + '15',
                  color: SEVERITY_COLORS[sev],
                  borderColor: SEVERITY_COLORS[sev] + '30',
                }}
              >
                {sev}: {alerts.filter(a => a.severity === sev).length}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
          {alerts.length > 0 ? alerts.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          )) : (
            <div className="text-center py-20 text-slate-500">
              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
              <p className="text-xs font-mono font-medium text-slate-300">No active incidents recorded</p>
              <p className="text-[11px] font-mono text-slate-500 mt-1">All security heuristics reporting nominal status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
