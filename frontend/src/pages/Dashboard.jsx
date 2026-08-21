import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, TrendingUp, Bell, ShieldAlert, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../components/StatCard';
import AlertItem from '../components/AlertItem';
import { fetchStats, fetchAlerts, fetchTimeline } from '../lib/api';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
};
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

function TimelineChart({ data }) {
  if (!data || data.length === 0) return <div className="h-64 flex items-center justify-center text-slate-500">No timeline data</div>;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} labelStyle={{ color: '#94a3b8' }} labelFormatter={(v) => new Date(v).toLocaleString()} />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Logs" />
        <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Anomalies" />
      </LineChart>
    </ResponsiveContainer>
  );
}

function SeverityPieChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <div className="h-48 flex items-center justify-center text-slate-500">No alert data</div>;
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
          {chartData.map((entry, index) => <Cell key={index} fill={SEVERITY_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function SourceBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) return <div className="h-48 flex items-center justify-center text-slate-500">No source data</div>;
  const chartData = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, alertsData, timelineData] = await Promise.all([
          fetchStats(),
          fetchAlerts({ limit: 10, status: 'ACTIVE' }),
          fetchTimeline(24)
        ]);
        setStats(statsData.stats);
        setAlerts(alertsData.alerts || []);
        setTimeline(timelineData.timeline || []);
      } catch (e) {
        console.error(e);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard title="Total Logs" value={stats?.totalLogs?.toLocaleString() || '0'} subtitle={`${stats?.logsLastHour || 0} in last hour`} icon={FileText} color="blue" />
        <StatCard title="Anomalies Detected" value={stats?.totalAnomalies?.toLocaleString() || '0'} subtitle={`${stats?.anomaliesLastHour || 0} in last hour`} icon={AlertTriangle} color="red" />
        <StatCard title="Anomaly Rate" value={`${stats?.anomalyRate || 0}%`} subtitle="of total logs" icon={TrendingUp} color="yellow" />
        <StatCard title="Active Alerts" value={stats?.activeAlerts || 0} subtitle={`${stats?.alertsLastHour || 0} alerts last hour`} icon={Bell} color="purple" />
        <StatCard title="Critical Alerts" value={stats?.criticalActiveAlerts || 0} subtitle="requires attention" icon={ShieldAlert} color="red" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Log Activity Timeline (24h)</h3>
          <TimelineChart data={timeline} />
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><PieChart className="w-4 h-4" /> Alert Severity Distribution</h3>
          <SeverityPieChart data={stats?.severity_counts} />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><BarChart className="w-4 h-4" /> Logs by Source</h3>
          <SourceBarChart data={stats?.source_counts} />
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Globe className="w-4 h-4" /> Top Anomalous IPs</h3>
          <div className="space-y-4">
            {stats?.top_anomaly_ips && Object.entries(stats.top_anomaly_ips)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([ip, count], idx) => (
                <div key={ip} className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 w-4">{idx + 1}.</span>
                  <span className="font-mono text-sm text-slate-300 flex-1">{ip}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-red-500 rounded-full h-1.5 shadow-[0_0_8px_#ef4444]"
                      style={{ width: `${Math.min(100, (count / (stats.top_anomaly_ips[Object.keys(stats.top_anomaly_ips)[0]] || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-red-400 font-mono font-bold">{count}</span>
                </div>
              ))}
            {(!stats?.top_anomaly_ips || Object.keys(stats.top_anomaly_ips).length === 0) && (
              <p className="text-slate-500 text-sm text-center py-4">No anomalous IPs detected yet</p>
            )}
          </div>
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Recent Active Alerts</h3>
          <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
            {alerts.length > 0 ? alerts.map(alert => (
              <AlertItem key={alert.id} alert={alert} />
            )) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <ShieldAlert className="w-8 h-8 mb-2 opacity-50 text-green-500" />
                <p className="text-sm">No active alerts</p>
                <p className="text-xs mt-1">System is running normally.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
