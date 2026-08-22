import React, { useState, useEffect } from 'react';
import { X, Network, Shield, AlertTriangle, Clock, Server, User } from 'lucide-react';
import { fetchIpInvestigation } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function IPInvestigationDrawer({ ip, isOpen, onClose, onLogClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && ip) {
      setLoading(true);
      fetchIpInvestigation(ip)
        .then(res => setData(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [ip, isOpen]);

  if (!isOpen || !ip) return null;

  const severityData = data?.severityDistribution ? 
    Object.keys(data.severityDistribution).map(key => ({
      name: key,
      count: data.severityDistribution[key]
    })) : [];

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-400" />
          IP Investigation: {ip}
        </h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="text-slate-500 animate-pulse">Analyzing IP profile...</span>
          </div>
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-sm mb-1">Total Events</div>
                <div className="text-2xl font-bold text-slate-200">{data.totalEvents.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-sm mb-1">Total Anomalies</div>
                <div className="text-2xl font-bold text-purple-400">{data.totalAnomalies.toLocaleString()}</div>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                <div className="text-slate-400 text-sm mb-1">Total Alerts</div>
                <div className="text-2xl font-bold text-orange-400">{data.totalAlerts.toLocaleString()}</div>
              </div>
              <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30 text-center">
                <div className="text-red-400/80 text-sm mb-1">Critical Alerts</div>
                <div className="text-2xl font-bold text-red-400">{data.criticalAlerts.toLocaleString()}</div>
              </div>
            </div>

            {/* Timeline Info */}
            <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <h3 className="text-slate-400 text-sm font-bold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Activity Timeline
              </h3>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <div className="text-slate-500 text-xs">First Seen</div>
                  <div className="text-slate-300 font-mono">{data.firstSeen ? new Date(data.firstSeen).toLocaleString() : 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 text-xs">Last Seen</div>
                  <div className="text-slate-300 font-mono">{data.lastSeen ? new Date(data.lastSeen).toLocaleString() : 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Context Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" /> Associated Users
                </h3>
                {data.users && data.users.length > 0 ? (
                  <ul className="text-sm text-slate-300 space-y-1">
                    {data.users.map(u => <li key={u} className="font-mono">{u}</li>)}
                  </ul>
                ) : (
                  <span className="text-slate-500 text-sm italic">No users associated</span>
                )}
              </div>
              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-bold mb-2 flex items-center gap-2">
                  <Server className="w-4 h-4" /> Activity Sources
                </h3>
                {data.sources && data.sources.length > 0 ? (
                  <ul className="text-sm text-slate-300 space-y-1">
                    {data.sources.map(s => <li key={s} className="font-mono text-xs">{s}</li>)}
                  </ul>
                ) : (
                  <span className="text-slate-500 text-sm italic">No sources</span>
                )}
              </div>
            </div>

            {/* Chart */}
            {severityData.length > 0 && (
              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-slate-400 text-sm font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4" /> Alert Severity Distribution
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={severityData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '4px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => {
                  onClose();
                  onLogClick && onLogClick(ip);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition-colors"
              >
                View All Logs for IP
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-red-400">Failed to load IP profile</div>
        )}
      </div>
    </div>
  );
}
