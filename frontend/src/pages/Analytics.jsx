import React, { useState, useEffect } from 'react';
import { fetchStats, fetchTimeline } from '../lib/api';
import { Activity, BarChart2, PieChart, TrendingUp, Globe, Shield } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '../lib/utils';

const SEVERITY_COLORS = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#eab308', LOW: '#22c55e' };
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, timelineData] = await Promise.all([
          fetchStats(),
          fetchTimeline(24)
        ]);
        setStats(statsData.stats);
        setTimeline(timelineData.timeline || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !stats) {
    return <div className="flex items-center justify-center h-[calc(100vh-140px)] text-slate-500">Loading Analytics...</div>;
  }

  const renderTimeline = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={timeline}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="timestamp" stroke="#64748b" fontSize={11} tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        <YAxis stroke="#64748b" fontSize={11} />
        <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} labelFormatter={(v) => new Date(v).toLocaleString()} />
        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Logs" />
        <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Anomalies" />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderSourceBarChart = () => {
    if (!stats?.source_counts) return null;
    const chartData = Object.entries(stats.source_counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis type="number" stroke="#64748b" fontSize={11} />
          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
          <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} />
          <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="w-6 h-6 text-blue-500" />
        <h2 className="text-xl font-bold text-slate-200">System Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-400" /> 24-Hour Log & Anomaly Trend</h3>
          {renderTimeline()}
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-purple-400" /> Source Distribution</h3>
          {renderSourceBarChart()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-orange-400" /> Top Anomalous IPs</h3>
          <div className="space-y-4 mt-4">
            {stats?.top_anomaly_ips && Object.entries(stats.top_anomaly_ips)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([ip, count], idx) => (
                <div key={ip} className="flex items-center justify-between border-b border-slate-700/50 pb-2 last:border-0">
                  <span className="font-mono text-sm text-slate-300">{ip}</span>
                  <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Severity Distribution</h3>
          {stats?.severity_counts && (
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie data={Object.entries(stats.severity_counts).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {Object.entries(stats.severity_counts).map(([name], index) => <Cell key={index} fill={SEVERITY_COLORS[name] || PIE_COLORS[index]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl p-5 shadow-lg flex flex-col justify-center items-center text-center">
           <Activity className="w-16 h-16 text-blue-500/50 mb-4" />
           <div className="text-4xl font-bold text-white mb-2">{stats?.anomalyRate || 0}%</div>
           <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">Global Anomaly Rate</div>
           <p className="text-xs text-slate-500 mt-4 max-w-[200px]">Percentage of total events flagged as potentially malicious in the last 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
