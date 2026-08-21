import React, { useEffect, useRef, useState } from 'react';
import { Search, RefreshCw, Terminal, SlidersHorizontal, Pause, Play, Radio } from 'lucide-react';
import LogEntryItem from './LogEntryItem';
import { animateViewTransition } from '../../utils/animations';

export default function LogsTab({ logs, logFilter, setLogFilter, onRefresh, wsConnected }) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      animateViewTransition(containerRef.current);
    }
  }, []);

  const displayedLogs = isPaused ? logs : logs;

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Controls / Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {/* Stream Pause / Resume Toggle */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded border font-semibold transition-all ${
                isPaused
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isPaused ? 'RESUME STREAM' : 'PAUSE STREAM'}</span>
            </button>

            {/* Anomalies Only Switch */}
            <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <label className="text-slate-400">Anomalies Only:</label>
              <button
                onClick={() => setLogFilter(f => ({ ...f, anomaly_only: !f.anomaly_only }))}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all ${
                  logFilter.anomaly_only
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {logFilter.anomaly_only ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Source Selector */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400">Source:</label>
              <select
                value={logFilter.source}
                onChange={(e) => setLogFilter(f => ({ ...f, source: e.target.value }))}
                className="bg-slate-950 text-slate-300 text-xs rounded px-2.5 py-1 border border-slate-800"
              >
                <option value="">All Sources</option>
                <option value="sshd">sshd</option>
                <option value="sudo">sudo</option>
                <option value="apache">apache</option>
                <option value="kernel">kernel</option>
                <option value="systemd">systemd</option>
              </select>
            </div>

            {/* Level Selector */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400">Level:</label>
              <select
                value={logFilter.level}
                onChange={(e) => setLogFilter(f => ({ ...f, level: e.target.value }))}
                className="bg-slate-950 text-slate-300 text-xs rounded px-2.5 py-1 border border-slate-800"
              >
                <option value="">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>
          </div>

          {/* Search Box & Refresh */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px] justify-end">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={logFilter.search}
                onChange={(e) => setLogFilter(f => ({ ...f, search: e.target.value }))}
                placeholder="Search logs or IP..."
                className="w-full bg-slate-950 text-slate-300 text-xs rounded pl-8 pr-3 py-1 border border-slate-800 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-all shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* SIEM Terminal Stream Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-slate-200">Terminal Log Console</span>
            <div className="flex items-center gap-1.5 ml-2 border-l border-slate-800 pl-3">
              <Radio className={`w-3 h-3 ${wsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              <span className="text-[11px] text-slate-400">{wsConnected ? 'LIVE FEED' : 'OFFLINE'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            {isPaused && <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">STREAM PAUSED</span>}
            <span>Displaying {displayedLogs.length} events</span>
          </div>
        </div>

        {/* Log Stream Rows */}
        <div className="max-h-[620px] overflow-y-auto font-mono text-xs divide-y divide-slate-800/40">
          {displayedLogs.length > 0 ? (
            displayedLogs.map((log) => (
              <LogEntryItem key={log.id} log={log} />
            ))
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs font-mono">No logs match your filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
