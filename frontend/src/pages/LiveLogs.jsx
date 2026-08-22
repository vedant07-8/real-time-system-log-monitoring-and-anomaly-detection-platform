import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, Play, Pause, RefreshCw, Download, TerminalSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import LogEntry from '../components/LogEntry';
import LogDetailsDrawer from '../components/LogDetailsDrawer';
import IPInvestigationDrawer from '../components/IPInvestigationDrawer';
import { fetchLogs, fetchSources } from '../lib/api';
import { cn } from '../lib/utils';
import { useWebSocket } from '../contexts/WebSocketContext';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function LiveLogs() {
  const [logs, setLogs] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [pausedLogsQueue, setPausedLogsQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [limit, setLimit] = useState(50);
  const [availableSources, setAvailableSources] = useState([]);
  
  // Filters
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);
  
  const [filters, setFilters] = useState({
    anomaly_only: false,
    source: '',
    level: '',
    user: '',
  });

  const { lastMessage, connected, connecting } = useWebSocket();
  const maxLogsInView = 1000;

  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedIp, setSelectedIp] = useState(null);

  // Track unique IDs to prevent duplicates in live stream
  const logIdsRef = useRef(new Set());

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchLogs({ 
        page, 
        limit, 
        search: debouncedSearch,
        ...filters 
      });
      setLogs(data.logs || []);
      setTotalPages(Math.ceil((data.total || 0) / limit) || 1);
      setTotalLogs(data.total || 0);
      
      // Reset unique tracker on full reload
      logIdsRef.current = new Set((data.logs || []).map(l => l.id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, debouncedSearch, filters]);

  // If not on page 1, we can't be "live" appending to the top
  useEffect(() => {
    if (page > 1) {
      setIsLive(false);
    }
  }, [page]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  useEffect(() => {
    fetchSources().then(res => {
      if (res && res.success && Array.isArray(res.sources)) {
        setAvailableSources(res.sources);
      }
    }).catch(console.error);
  }, []);

  // Handle incoming websocket messages
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'log') return;
    
    const log = lastMessage.data;
    if (!log || typeof log.id !== 'string' || typeof log.message !== 'string') return;
    
    // Check if duplicate
    if (logIdsRef.current.has(log.id)) return;

    // Apply filters locally for the live stream
    if (filters.anomaly_only && !log.is_anomaly) return;
    if (filters.level && log.level !== filters.level) return;
    if (filters.source && log.source !== filters.source) return;
    if (filters.user && log.user !== filters.user) return;
    if (debouncedSearch && !log.message.toLowerCase().includes(debouncedSearch.toLowerCase())) return;

    // Only process if on page 1
    if (page === 1) {
      if (isLive) {
        setLogs(prev => {
          const newLogs = [log, ...prev].slice(0, maxLogsInView);
          logIdsRef.current.add(log.id);
          // Keep set size reasonable
          if (logIdsRef.current.size > maxLogsInView * 2) {
             const iterator = logIdsRef.current.values();
             for (let i = 0; i < maxLogsInView; i++) {
               logIdsRef.current.delete(iterator.next().value);
             }
          }
          return newLogs;
        });
        setTotalLogs(prev => prev + 1);
      } else {
        setPausedLogsQueue(prev => {
          const newQueue = [log, ...prev].slice(0, maxLogsInView);
          return newQueue;
        });
      }
    }
  }, [lastMessage, filters, debouncedSearch, isLive, page]);

  const handleResume = () => {
    setLogs(prev => {
      const merged = [...pausedLogsQueue, ...prev].slice(0, maxLogsInView);
      merged.forEach(l => logIdsRef.current.add(l.id));
      return merged;
    });
    setTotalLogs(prev => prev + pausedLogsQueue.length);
    setPausedLogsQueue([]);
    setIsLive(true);
    setPage(1); // Force page 1 when resuming live
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    
    const headers = ['Timestamp', 'Level', 'Source', 'User', 'IP', 'Message', 'Is Anomaly', 'Anomaly Type', 'Severity', 'Threat Score'];
    const rows = logs.map(l => [
      new Date(l.timestamp).toISOString(),
      l.level,
      l.source || '',
      l.user || '',
      l.source_ip || '',
      `"${(l.message || '').replace(/"/g, '""')}"`,
      l.is_anomaly ? 'Yes' : 'No',
      l.anomaly_type || '',
      l.severity || '',
      l.threatScore || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `logs_export_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-[#0F172A] border border-[#26364D] rounded-xl overflow-hidden shadow-xl">
      {/* Toolbar */}
      <div className="bg-[#111C2E] border-b border-[#26364D] p-4 flex flex-wrap items-center justify-between gap-4">
        
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs... (auto-debounced)"
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); setPage(1); }}
              className="w-full bg-[#0B1220] border border-[#26364D] text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filters.level}
              onChange={e => { setFilters(f => ({ ...f, level: e.target.value })); setPage(1); }}
              className="bg-[#0B1220] border border-[#26364D] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARNING">WARNING</option>
              <option value="ERROR">ERROR</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          <select
            value={filters.source}
            onChange={e => { setFilters(f => ({ ...f, source: e.target.value })); setPage(1); }}
            className="bg-[#0B1220] border border-[#26364D] text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="">All Sources</option>
            {availableSources.length > 0 ? (
              availableSources.map(s => <option key={s} value={s}>{s}</option>)
            ) : (
              <>
                <option value="Windows Security">Windows Security</option>
                <option value="Windows System">Windows System</option>
                <option value="Windows Application">Windows Application</option>
                <option value="Linux Syslog">Linux Syslog</option>
              </>
            )}
          </select>

          <button
            onClick={() => { setFilters(f => ({ ...f, anomaly_only: !f.anomaly_only })); setPage(1); }}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg transition-all border",
              filters.anomaly_only
                ? "bg-red-500/10 text-red-400 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]"
                : "bg-[#0B1220] text-slate-400 border-[#26364D] hover:text-slate-300"
            )}
          >
            ⚠ Anomalies Only
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-lg bg-[#0B1220] border border-[#26364D] text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Export to CSV"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={loadLogs}
            className="p-2 rounded-lg bg-[#0B1220] border border-[#26364D] text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Refresh logs"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>

          {isLive ? (
            <button
              onClick={() => setIsLive(false)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-medium hover:bg-cyan-500/20 transition-all"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause Stream
            </button>
          ) : (
            <button
              onClick={handleResume}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/30 rounded-lg text-sm font-medium hover:bg-orange-500/20 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              Resume Stream {pausedLogsQueue.length > 0 && `(${pausedLogsQueue.length} new)`}
            </button>
          )}
        </div>
      </div>

      {/* Main Logs Area */}
      <div className="flex-1 overflow-y-auto bg-[#0B1220]">
        {!isLive && pausedLogsQueue.length > 0 && page === 1 && (
          <div 
            onClick={handleResume}
            className="sticky top-0 z-10 bg-orange-500/10 text-orange-400 text-xs font-bold text-center py-2 border-b border-orange-500/30 cursor-pointer hover:bg-orange-500/20 backdrop-blur"
          >
            {pausedLogsQueue.length} new events occurred while paused. Click to resume and view.
          </div>
        )}

        {isLoading && logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-4" />
            <p>Loading logs...</p>
          </div>
        ) : logs.length > 0 ? (
          <div className="pb-8">
            {logs.map((log) => (
              <LogEntry key={log.id} log={log} onClick={setSelectedLog} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <TerminalSquare className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium text-slate-400">No logs received yet</p>
            <p className="text-sm mt-1">Waiting for live events. Try adjusting your filters if needed.</p>
          </div>
        )}
      </div>
      
      {/* Footer / Pagination */}
      <div className="bg-[#111C2E] border-t border-[#26364D] p-2 px-4 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={cn("w-2 h-2 rounded-full", connected ? "bg-green-500 animate-pulse" : "bg-red-500")} />
            {connected ? (isLive ? 'LIVE' : 'PAUSED') : connecting ? 'CONNECTING' : 'DISCONNECTED'}
          </div>
          <div className="hidden sm:block border-l border-slate-700 pl-4">
            Total Results: {totalLogs.toLocaleString()}
          </div>
          <div className="hidden sm:block border-l border-slate-700 pl-4">
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              className="bg-transparent text-slate-400 focus:outline-none cursor-pointer"
            >
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || isLoading}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <LogDetailsDrawer 
        isOpen={!!selectedLog} 
        log={selectedLog} 
        onClose={() => setSelectedLog(null)} 
        onIpClick={(ip) => {
          setSelectedIp(ip);
          setSelectedLog(null);
        }}
      />
      
      <IPInvestigationDrawer 
        isOpen={!!selectedIp} 
        ip={selectedIp} 
        onClose={() => setSelectedIp(null)}
        onLogClick={(ip) => {
          setFilters(f => ({ ...f, sourceIp: ip }));
          setSearchInput(ip);
          setPage(1);
          setSelectedIp(null);
        }}
      />
    </div>
  );
}
