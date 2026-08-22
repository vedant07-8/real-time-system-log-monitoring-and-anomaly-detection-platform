import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, CheckCircle, Search, X, Activity, Server, Clock, AlertTriangle } from 'lucide-react';
import AlertItem from '../components/AlertItem';
import { fetchAlerts, fetchAlert, resolveAlert, fetchRelatedLogs } from '../lib/api';
import { cn } from '../lib/utils';
import LogEntry from '../components/LogEntry';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [filters, setFilters] = useState({
    status: 'ACTIVE',
    severity: ''
  });
  const [relatedLogs, setRelatedLogs] = useState([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    if (selectedAlert) {
      setIsLoadingRelated(true);
      fetchRelatedLogs({ 
        sourceIp: selectedAlert.source_ip, 
        user: selectedAlert.user, 
        timestamp: selectedAlert.timestamp 
      })
      .then(res => setRelatedLogs(res.data || []))
      .catch(console.error)
      .finally(() => setIsLoadingRelated(false));
    } else {
      setRelatedLogs([]);
    }
  }, [selectedAlert]);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAlerts({ limit: 100, ...filters });
      setAlerts(data.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 15000);
    return () => clearInterval(interval);
  }, [loadAlerts]);

  const handleResolve = async (id, note) => {
    try {
      await resolveAlert(id, note);
      setSelectedAlert(null);
      loadAlerts(); // Refresh list
    } catch (e) {
      console.error(e);
      alert('Failed to resolve alert');
    }
  };

  const handleSelectAlert = async (alertSummary) => {
    try {
      const res = await fetchAlert(alertSummary.id);
      if (res.success) {
        setSelectedAlert(res.data);
      } else {
        setSelectedAlert(alertSummary); // fallback
      }
    } catch (e) {
      console.error(e);
      setSelectedAlert(alertSummary); // fallback
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Alerts List */}
      <div className={cn("flex flex-col bg-[#0F172A] border border-[#26364D] rounded-xl overflow-hidden shadow-xl transition-all", selectedAlert ? "w-1/3" : "w-full")}>
        <div className="bg-[#111C2E] border-b border-[#26364D] p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              Alerts
            </h2>
            <div className="flex items-center gap-2">
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="bg-[#0B1220] border border-[#26364D] text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select
                value={filters.severity}
                onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
                className="bg-[#0B1220] border border-[#26364D] text-slate-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-[#0B1220]">
          {isLoading && alerts.length === 0 ? (
            <div className="text-center text-slate-500 py-12">Loading alerts...</div>
          ) : alerts.length > 0 ? (
            <div className="space-y-1">
              {alerts.map(alert => (
                <div key={alert.id} className={cn("rounded-lg border-2 transition-all", selectedAlert?.id === alert.id ? "border-blue-500/50 scale-[1.01] bg-blue-500/5" : "border-transparent")}>
                  <AlertItem alert={alert} onClick={handleSelectAlert} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <CheckCircle className="w-12 h-12 mb-4 text-green-500/50" />
              <p className="text-lg font-medium text-slate-300">All Clear</p>
              <p className="text-sm mt-1">No alerts match your current filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Investigation Drawer / Panel */}
      {selectedAlert && (
        <div className="flex-1 flex flex-col bg-[#0F172A] border border-[#26364D] rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-right-8 duration-200">
          <div className="bg-[#111C2E] border-b border-[#26364D] p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Investigation View</h2>
            <button onClick={() => setSelectedAlert(null)} className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B1220]">
            {/* Header section */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-bold uppercase",
                      selectedAlert.severity === 'CRITICAL' ? 'bg-red-500 text-white' :
                      selectedAlert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                      selectedAlert.severity === 'MEDIUM' ? 'bg-yellow-500 text-black' :
                      'bg-green-500 text-white'
                    )}>
                      {selectedAlert.severity}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-bold uppercase border",
                      selectedAlert.status === 'ACTIVE' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'
                    )}>
                      {selectedAlert.status}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">{selectedAlert.anomaly_type}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedAlert.title || selectedAlert.anomaly_type}</h3>
                  <p className="text-slate-400 mt-2 text-sm max-w-2xl">{selectedAlert.description}</p>
                </div>

                <div className="text-center bg-[#111C2E] border border-[#26364D] rounded-xl p-4 min-w-[120px]">
                  <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Threat Score</div>
                  <div className={cn(
                    "text-4xl font-bold font-mono",
                    selectedAlert.threatScore === undefined ? "text-slate-500" :
                    selectedAlert.threatScore >= 90 ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                    selectedAlert.threatScore >= 75 ? "text-orange-500 drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" :
                    selectedAlert.threatScore >= 50 ? "text-yellow-500" : "text-green-500"
                  )}>
                    {selectedAlert.threatScore !== undefined ? selectedAlert.threatScore : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-[#26364D]" />

            {/* Quick Context */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#26364D]">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Source IP</div>
                <div className="font-mono text-sm text-blue-400">{selectedAlert.source_ip || 'N/A'}</div>
              </div>
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#26364D]">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">User</div>
                <div className="font-mono text-sm text-purple-400">{selectedAlert.user || 'N/A'}</div>
              </div>
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#26364D]">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Detected At</div>
                <div className="text-sm text-slate-300">{new Date(selectedAlert.timestamp).toLocaleString()}</div>
              </div>
              <div className="bg-[#111C2E] p-3 rounded-lg border border-[#26364D]">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Related Logs</div>
                <div className="text-sm text-slate-300">
                  {isLoadingRelated ? 'Loading...' : `${relatedLogs.length} events`}
                </div>
              </div>
            </div>

            {/* Related Logs Timeline */}
            {relatedLogs.length > 0 && (
              <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Activity Timeline
                </h4>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {relatedLogs.map(log => (
                    <LogEntry key={log._id} log={{...log, id: log._id, is_anomaly: log.isAnomaly, anomaly_type: log.anomalyType}} />
                  ))}
                </div>
              </div>
            )}

            {/* Detection Reasons */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Why was this detected?
              </h4>
              <ul className="space-y-2">
                {selectedAlert.detectionReasons && selectedAlert.detectionReasons.length > 0 ? (
                  selectedAlert.detectionReasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-500 mt-0.5">✓</span> {r}
                    </li>
                  ))
                ) : (
                  <li className="text-slate-500 text-sm italic">Anomaly rules triggered automatically.</li>
                )}
              </ul>
            </div>

            {/* Actions */}
            {selectedAlert.status === 'ACTIVE' && (
              <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Resolution</h4>
                <div className="flex gap-4">
                  <input type="text" id="res-note" placeholder="Resolution note..." className="flex-1 bg-[#0B1220] border border-[#26364D] text-sm text-slate-200 rounded-lg px-4 py-2 focus:border-blue-500 focus:outline-none" />
                  <button 
                    onClick={() => {
                      const note = document.getElementById('res-note').value;
                      handleResolve(selectedAlert.id, note);
                    }}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    <CheckCircle className="w-4 h-4" /> Resolve Alert
                  </button>
                </div>
              </div>
            )}
            
            {selectedAlert.status === 'RESOLVED' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5">
                <div className="flex items-center gap-2 text-green-400 font-bold mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Resolved
                </div>
                <p className="text-sm text-slate-300">This alert has been resolved.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
