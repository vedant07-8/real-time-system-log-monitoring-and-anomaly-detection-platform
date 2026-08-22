import React, { useState, useEffect } from 'react';
import { Server, Activity, Database, Radio, HardDrive, Cpu, Clock, Terminal } from 'lucide-react';
import { fetchMonitorStatus, startMonitor, stopMonitor } from '../lib/api';
import { cn } from '../lib/utils';
import { useWebSocket } from '../contexts/WebSocketContext';

export default function System() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingMonitor, setIsTogglingMonitor] = useState(false);
  const { connected, connecting } = useWebSocket();

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const data = await fetchMonitorStatus();
        setHealth(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !health) {
    return <div className="flex items-center justify-center h-[calc(100vh-140px)] text-slate-500">Loading System Info...</div>;
  }

  const handleToggleMonitor = async () => {
    setIsTogglingMonitor(true);
    try {
      if (health?.monitoring) {
        await stopMonitor();
      } else {
        await startMonitor();
      }
      // Reload health immediately
      const data = await fetchMonitorStatus();
      setHealth(data);
    } catch (e) {
      console.error(e);
      alert('Failed to toggle monitor state');
    } finally {
      setIsTogglingMonitor(false);
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Server className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-slate-200">System Health & Monitoring</h2>
      </div>

      {/* Core Services Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 text-slate-300">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">Log Monitor</h3>
            </div>
            <button
              onClick={handleToggleMonitor}
              disabled={isTogglingMonitor}
              className={cn("px-3 py-1 text-xs font-bold rounded", health?.monitoring ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30")}
            >
              {health?.monitoring ? 'STOP' : 'START'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", health?.monitoring ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
            <span className="text-xl font-bold text-white">{health?.monitoring ? 'RUNNING' : 'STOPPED'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {health?.monitoredSources?.includes('API Ingestion') ? 'Manual API Ingestion Mode' : `${health?.platform} Event Collector`}
          </p>
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3 text-slate-300">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">MongoDB</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", health?.database === 'connected' ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
            <span className="text-xl font-bold text-white uppercase">{health?.database || 'UNKNOWN'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Database Connection State</p>
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3 text-slate-300">
            <Radio className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">WebSocket API</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", connected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-red-500 shadow-[0_0_8px_#ef4444]")} />
            <span className="text-xl font-bold text-white uppercase">{connected ? 'CONNECTED' : connecting ? 'CONNECTING' : 'DISCONNECTED'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Real-time Event Stream</p>
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <div className="flex items-center gap-3 mb-3 text-slate-300">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">System Uptime</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white uppercase font-mono">{formatUptime(health?.uptime_seconds)}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Backend Process Runtime</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Host Machine Metrics */}
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Server className="w-4 h-4 text-purple-400" /> Host Machine Details
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>OS Platform</span>
                <span className="font-bold text-slate-200 capitalize">{health?.os?.platform || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Hostname</span>
                <span className="font-bold text-slate-200 font-mono">{health?.os?.hostname || 'Unknown'}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>CPU Cores</span>
                <span className="font-bold text-slate-200">{health?.os?.cpu_cores || 0} vCPUs</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-400 flex items-center gap-2"><HardDrive className="w-4 h-4" /> RAM Usage</span>
                <span className="text-sm font-bold text-slate-200">{health?.os?.memory_usage_percent || 0}%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-500", (health?.os?.memory_usage_percent || 0) > 80 ? "bg-red-500" : "bg-blue-500")}
                  style={{ width: `${health?.os?.memory_usage_percent || 0}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-slate-500 font-mono">
                <span>Used: {((health?.os?.total_memory_mb || 0) - (health?.os?.free_memory_mb || 0))} MB</span>
                <span>Total: {health?.os?.total_memory_mb || 0} MB</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-700/50">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Load Average (1m, 5m, 15m)</span>
                <span className="font-bold text-slate-200 font-mono">
                  {health?.os?.load_avg ? health.os.load_avg.map(v => v.toFixed(2)).join(', ') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Node Process Metrics */}
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-6 shadow-lg flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2 uppercase tracking-wide">
            <Terminal className="w-4 h-4 text-orange-400" /> Monitored Sources
          </h3>
          
          <div className="flex-1 space-y-4 bg-[#0B1220] border border-[#26364D] p-4 rounded-lg overflow-y-auto">
             {health?.monitoredSources && health.monitoredSources.length > 0 ? (
               <ul className="space-y-3">
                 {health.monitoredSources.map((source, idx) => (
                   <li key={idx} className="flex items-center gap-3 text-sm text-slate-300">
                     <span className="text-green-500">✓</span> {source}
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="text-slate-500 text-sm text-center py-4">No sources currently monitored. (Is the collector stopped?)</div>
             )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700/50 grid grid-cols-4 gap-4">
             <div>
               <div className="text-[10px] uppercase font-bold text-slate-500">Backend RAM</div>
               <div className="text-lg font-mono font-bold text-slate-200">{health?.process?.rss_mb || 0} MB</div>
             </div>
             <div>
               <div className="text-[10px] uppercase font-bold text-slate-500">V8 Heap</div>
               <div className="text-lg font-mono font-bold text-slate-200">{health?.process?.heap_used_mb || 0} MB</div>
             </div>
             <div>
               <div className="text-[10px] uppercase font-bold text-slate-500">Events/Sec</div>
               <div className="text-lg font-mono font-bold text-blue-400">{health?.eventsPerSecond?.toFixed(1) || 0}</div>
             </div>
             <div>
               <div className="text-[10px] uppercase font-bold text-slate-500">Avg Latency</div>
               <div className="text-lg font-mono font-bold text-orange-400">{health?.averageLatencyMs?.toFixed(1) || 0} ms</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
