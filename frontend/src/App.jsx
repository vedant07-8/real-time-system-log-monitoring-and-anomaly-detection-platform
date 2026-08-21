import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

const API_BASE = '/api';
const WS_URL = `ws://${window.location.host}/ws/logs`;

// Severity colors
const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};

const LEVEL_COLORS = {
  ERROR: '#ef4444',
  WARNING: '#eab308',
  INFO: '#3b82f6',
  CRITICAL: '#dc2626',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

// ==================== API Calls ====================
async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

async function fetchLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/logs?${query}`);
  return res.json();
}

async function fetchAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/alerts?${query}`);
  return res.json();
}

async function fetchTimeline(hours = 24) {
  const res = await fetch(`${API_BASE}/stats/timeline?hours=${hours}`);
  return res.json();
}

async function generateSampleData(count = 100) {
  const res = await fetch(`${API_BASE}/generate/sample?count=${count}`, { method: 'POST' });
  return res.json();
}

async function generateBurst(type = 'brute_force', count = 20) {
  const res = await fetch(`${API_BASE}/generate/burst?burst_type=${type}&count=${count}`, { method: 'POST' });
  return res.json();
}

async function startGenerator() {
  const res = await fetch(`${API_BASE}/generator/start`, { method: 'POST' });
  return res.json();
}

async function stopGenerator() {
  const res = await fetch(`${API_BASE}/generator/stop`, { method: 'POST' });
  return res.json();
}

// ==================== Components ====================

function StatCard({ title, value, subtitle, icon, color = 'blue', trend }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5 transition-all hover:scale-[1.02]`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-4xl opacity-50">{icon}</div>
      </div>
      {trend && (
        <div className={`mt-2 text-xs ${trend > 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last hour
        </div>
      )}
    </div>
  );
}

function AlertItem({ alert, onResolve }) {
  const severityClass = {
    CRITICAL: 'border-red-500 bg-red-500/10 glow-red',
    HIGH: 'border-orange-500 bg-orange-500/10',
    MEDIUM: 'border-yellow-500 bg-yellow-500/10',
    LOW: 'border-green-500 bg-green-500/10',
  };

  return (
    <div className={`border-l-4 ${severityClass[alert.severity]} rounded-r-lg p-3 mb-2 transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
              alert.severity === 'CRITICAL' ? 'bg-red-500 text-white animate-pulse-alert' :
              alert.severity === 'HIGH' ? 'bg-orange-500 text-white' :
              alert.severity === 'MEDIUM' ? 'bg-yellow-500 text-black' :
              'bg-green-500 text-white'
            }`}>
              {alert.severity}
            </span>
            <span className="text-xs text-slate-400">{alert.anomaly_type}</span>
          </div>
          <p className="text-sm text-slate-300 mt-1">{alert.description}</p>
          <div className="flex gap-4 mt-1 text-xs text-slate-500">
            {alert.source_ip && <span>IP: {alert.source_ip}</span>}
            {alert.user && <span>User: {alert.user}</span>}
            <span>{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LogEntry({ log }) {
  const levelColor = {
    ERROR: 'text-red-400 bg-red-500/10',
    WARNING: 'text-yellow-400 bg-yellow-500/10',
    INFO: 'text-blue-400 bg-blue-500/10',
    CRITICAL: 'text-red-500 bg-red-500/20',
  };

  return (
    <div className={`log-entry font-mono text-xs border-b border-slate-700/50 px-4 py-2 transition-colors ${
      log.is_anomaly ? 'bg-red-500/5 border-l-2 border-l-red-500' : ''
    }`}>
      <div className="flex items-start gap-3">
        <span className="text-slate-500 w-40 shrink-0">
          {new Date(log.timestamp).toLocaleString()}
        </span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold w-16 text-center shrink-0 ${levelColor[log.level] || 'text-slate-400'}`}>
          {log.level}
        </span>
        <span className="text-purple-400 w-20 shrink-0">{log.source}</span>
        <span className="text-slate-300 flex-1 break-all">{log.message}</span>
        {log.is_anomaly && (
          <span className="text-red-400 text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded shrink-0">
            ⚠ {log.anomaly_type}
          </span>
        )}
      </div>
      {log.source_ip && (
        <div className="text-slate-500 ml-[208px] mt-0.5">
          IP: {log.source_ip} {log.user && `| User: ${log.user}`}
        </div>
      )}
    </div>
  );
}

function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        No timeline data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="timestamp"
          stroke="#64748b"
          fontSize={11}
          tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
          labelStyle={{ color: '#94a3b8' }}
          labelFormatter={(v) => new Date(v).toLocaleString()}
        />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Logs" />
        <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Anomalies" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SeverityPieChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No alert data</div>;
  }

  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={SEVERITY_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SourceBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-500">No source data</div>;
  }

  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ==================== Main App ====================

function App() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logFilter, setLogFilter] = useState({ anomaly_only: false, source: '', level: '', search: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [realtimeLogs, setRealtimeLogs] = useState([]);
  const wsRef = useRef(null);
  const realtimeRef = useRef(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const [statsData, logsData, alertsData, timelineData] = await Promise.all([
        fetchStats(),
        fetchLogs({ limit: 50, ...logFilter }),
        fetchAlerts({ limit: 20 }),
        fetchTimeline(24),
      ]);
      setStats(statsData);
      setLogs(logsData.logs || []);
      setAlerts(alertsData.alerts || []);
      setTimeline(timelineData.timeline || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [logFilter]);

  // WebSocket connection
  useEffect(() => {
    const connectWS = () => {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'log') {
              setRealtimeLogs(prev => [msg.data, ...prev].slice(0, 100));
              // Refresh stats periodically
              if (Math.random() < 0.1) {
                fetchStats().then(setStats);
              }
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          // Reconnect after 3 seconds
          setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };

        // Ping every 30 seconds
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);

        return () => clearInterval(pingInterval);
      } catch (e) {
        setTimeout(connectWS, 3000);
      }
    };

    connectWS();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Initial data fetch and refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Handle filter changes
  useEffect(() => {
    fetchData();
  }, [logFilter]);

  const handleGenerateSample = async () => {
    setIsLoading(true);
    await generateSampleData(200);
    await fetchData();
  };

  const handleGenerateBurst = async (type) => {
    await generateBurst(type, 15);
    await fetchData();
  };

  const handleToggleGenerator = async () => {
    if (generatorRunning) {
      await stopGenerator();
      setGeneratorRunning(false);
    } else {
      await startGenerator();
      setGeneratorRunning(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🛡️</div>
              <div>
                <h1 className="text-lg font-bold text-white">IT System Log Analyzer</h1>
                <p className="text-xs text-slate-400">SIH1408 | Real-time Anomaly Detection & Monitoring</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* WebSocket Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-400">{wsConnected ? 'Live' : 'Disconnected'}</span>
              </div>

              {/* Generator Toggle */}
              <button
                onClick={handleToggleGenerator}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  generatorRunning
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                }`}
              >
                {generatorRunning ? '⏹ Stop Generator' : '▶ Start Generator'}
              </button>

              {/* Generate Buttons */}
              <button
                onClick={handleGenerateSample}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
              >
                📊 Generate 200 Logs
              </button>

              <div className="relative group">
                <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all">
                  ⚡ Anomaly Burst ▾
                </button>
                <div className="absolute right-0 top-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[160px]">
                  <button onClick={() => handleGenerateBurst('brute_force')} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 first:rounded-t-lg">
                    🔐 Brute Force
                  </button>
                  <button onClick={() => handleGenerateBurst('port_scan')} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700">
                    🔍 Port Scan
                  </button>
                  <button onClick={() => handleGenerateBurst('privilege')} className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-700 last:rounded-b-lg">
                    👑 Privilege Escalation
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-3">
            {[
              { id: 'dashboard', label: '📊 Dashboard', },
              { id: 'logs', label: '📋 Live Logs', },
              { id: 'alerts', label: '🚨 Alerts', },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard
                title="Total Logs"
                value={stats?.total_logs?.toLocaleString() || '0'}
                subtitle={`${stats?.recent_logs || 0} in last hour`}
                icon="📄"
                color="blue"
              />
              <StatCard
                title="Anomalies Detected"
                value={stats?.total_anomalies?.toLocaleString() || '0'}
                subtitle={`${stats?.recent_anomalies || 0} in last hour`}
                icon="⚠️"
                color="red"
              />
              <StatCard
                title="Anomaly Rate"
                value={`${stats?.anomaly_rate || 0}%`}
                subtitle="of total logs"
                icon="📈"
                color="yellow"
              />
              <StatCard
                title="Active Alerts"
                value={stats?.recent_alerts || 0}
                subtitle="in last hour"
                icon="🚨"
                color="purple"
              />
              <StatCard
                title="Critical Alerts"
                value={stats?.severity_counts?.CRITICAL || 0}
                subtitle="requires attention"
                icon="🔴"
                color="red"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timeline Chart */}
              <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Log Activity Timeline (24h)</h3>
                <TimelineChart data={timeline} />
              </div>

              {/* Severity Distribution */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">🎯 Alert Severity Distribution</h3>
                <SeverityPieChart data={stats?.severity_counts} />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Source Distribution */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">📊 Logs by Source</h3>
                <SourceBarChart data={stats?.source_counts} />
              </div>

              {/* Top Anomaly IPs */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">🌐 Top Anomalous IPs</h3>
                <div className="space-y-2">
                  {stats?.top_anomaly_ips && Object.entries(stats.top_anomaly_ips)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([ip, count], idx) => (
                      <div key={ip} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
                        <span className="font-mono text-sm text-slate-300 flex-1">{ip}</span>
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-red-500 rounded-full h-2 transition-all"
                            style={{ width: `${Math.min(100, (count / (stats.top_anomaly_ips[Object.keys(stats.top_anomaly_ips)[0]] || 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-red-400 font-mono">{count}</span>
                      </div>
                    ))}
                  {(!stats?.top_anomaly_ips || Object.keys(stats.top_anomaly_ips).length === 0) && (
                    <p className="text-slate-500 text-sm text-center py-4">No anomalous IPs detected yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4">🚨 Recent Alerts</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {alerts.length > 0 ? alerts.slice(0, 10).map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                )) : (
                  <p className="text-slate-500 text-sm text-center py-8">No alerts detected yet. Click "Generate 200 Logs" to create sample data.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Anomalies Only:</label>
                  <button
                    onClick={() => setLogFilter(f => ({ ...f, anomaly_only: !f.anomaly_only }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      logFilter.anomaly_only
                        ? 'bg-red-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {logFilter.anomaly_only ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Source:</label>
                  <select
                    value={logFilter.source}
                    onChange={(e) => setLogFilter(f => ({ ...f, source: e.target.value }))}
                    className="bg-slate-700 text-slate-300 text-xs rounded px-2 py-1 border border-slate-600"
                  >
                    <option value="">All</option>
                    <option value="sshd">sshd</option>
                    <option value="sudo">sudo</option>
                    <option value="apache">apache</option>
                    <option value="kernel">kernel</option>
                    <option value="systemd">systemd</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Level:</label>
                  <select
                    value={logFilter.level}
                    onChange={(e) => setLogFilter(f => ({ ...f, level: e.target.value }))}
                    className="bg-slate-700 text-slate-300 text-xs rounded px-2 py-1 border border-slate-600"
                  >
                    <option value="">All</option>
                    <option value="INFO">INFO</option>
                    <option value="WARNING">WARNING</option>
                    <option value="ERROR">ERROR</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  <label className="text-xs text-slate-400">Search:</label>
                  <input
                    type="text"
                    value={logFilter.search}
                    onChange={(e) => setLogFilter(f => ({ ...f, search: e.target.value }))}
                    placeholder="Search logs..."
                    className="bg-slate-700 text-slate-300 text-xs rounded px-3 py-1 border border-slate-600 flex-1 max-w-xs"
                  />
                </div>

                <button
                  onClick={fetchData}
                  className="px-3 py-1 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Live Logs */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  📋 {logs.length} logs {logFilter.anomaly_only ? '(anomalies only)' : ''}
                </span>
                <span className="text-xs text-slate-500">
                  Showing latest {logs.length} entries
                </span>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {logs.length > 0 ? logs.map(log => (
                  <LogEntry key={log.id} log={log} />
                )) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">📭 No logs found</p>
                    <p className="text-sm mt-2">Click "Generate 200 Logs" to create sample data</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-300">🚨 All Alerts ({alerts.length})</h3>
                <div className="flex gap-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(sev => (
                    <span
                      key={sev}
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: SEVERITY_COLORS[sev] + '30', color: SEVERITY_COLORS[sev] }}
                    >
                      {sev}: {alerts.filter(a => a.severity === sev).length}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {alerts.length > 0 ? alerts.map(alert => (
                  <AlertItem key={alert.id} alert={alert} />
                )) : (
                  <div className="text-center py-12 text-slate-500">
                    <p className="text-lg">✅ No alerts</p>
                    <p className="text-sm mt-2">System is running normally</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-8 py-4 text-center text-xs text-slate-500">
        SIH1408 - IT System Log Analyzer | Built for Smart India Hackathon 2024
      </footer>
    </div>
  );
}

export default App;
