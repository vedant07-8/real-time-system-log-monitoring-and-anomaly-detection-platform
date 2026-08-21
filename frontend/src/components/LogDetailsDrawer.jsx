import React from 'react';
import { X, ShieldAlert, FileText, Server, Clock, Activity, Network } from 'lucide-react';

export default function LogDetailsDrawer({ log, isOpen, onClose, onIpClick }) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-cyan-400" />
          Log Details
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Header Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="text-sm font-mono text-slate-400">
              {new Date(log.timestamp).toLocaleString()}
            </div>
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                log.level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                log.level === 'ERROR' ? 'bg-orange-500/20 text-orange-400' :
                log.level === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {log.level}
              </span>
              {log.is_anomaly && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-500/20 text-purple-400">
                  ANOMALY
                </span>
              )}
            </div>
          </div>
          <p className="text-slate-200 font-medium break-words">{log.message}</p>
        </div>

        {/* Threat Intel (if anomaly) */}
        {log.is_anomaly && (
          <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-4">
            <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Threat Intelligence
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-slate-500 text-xs mb-1">Anomaly Type</div>
                <div className="text-slate-300 font-medium">{log.anomaly_type}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Severity</div>
                <div className="text-slate-300 font-medium">{log.severity}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs mb-1">Threat Score</div>
                <div className="text-slate-300 font-medium">
                  <span className={`px-2 py-1 rounded ${log.threatScore > 80 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {log.threatScore || 'N/A'} / 100
                  </span>
                </div>
              </div>
            </div>
            {log.detectionReasons && log.detectionReasons.length > 0 && (
              <div>
                <div className="text-slate-500 text-xs mb-1">Detection Reasons</div>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {log.detectionReasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Core Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs flex items-center gap-1 mb-1">
              <Network className="w-3 h-3" /> Source IP
            </div>
            {log.source_ip ? (
              <button 
                onClick={() => onIpClick && onIpClick(log.source_ip)}
                className="text-cyan-400 hover:underline font-mono text-sm"
              >
                {log.source_ip}
              </button>
            ) : (
              <span className="text-slate-400 text-sm italic">Unknown</span>
            )}
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs flex items-center gap-1 mb-1">
              <Server className="w-3 h-3" /> Hostname
            </div>
            <span className="text-slate-300 text-sm font-mono">{log.hostname || 'Unknown'}</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3" /> Process
            </div>
            <span className="text-slate-300 text-sm font-mono">{log.process || 'N/A'}</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
            <div className="text-slate-500 text-xs flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3" /> User
            </div>
            <span className="text-slate-300 text-sm font-mono">{log.user || 'System'}</span>
          </div>
        </div>

        {/* Extended Metadata (Raw JSON) */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div>
            <h3 className="text-slate-400 text-sm font-bold mb-2">Extended Metadata</h3>
            <div className="bg-[#0B1220] rounded-lg p-4 border border-slate-700 overflow-x-auto">
              <pre className="text-xs text-slate-300 font-mono">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
