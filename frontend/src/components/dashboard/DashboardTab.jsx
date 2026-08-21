import React, { useEffect, useRef } from 'react';
import { FileText, ShieldAlert, TrendingUp, Bell, AlertOctagon, Activity, PieChart, BarChart3, Globe } from 'lucide-react';
import StatCard from '../common/StatCard';
import AlertItem from '../alerts/AlertItem';
import TimelineChart from '../charts/TimelineChart';
import SeverityPieChart from '../charts/SeverityPieChart';
import SourceBarChart from '../charts/SourceBarChart';
import { animateViewTransition } from '../../utils/animations';

export default function DashboardTab({ stats, timeline, alerts }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateViewTransition(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Ingested"
          value={stats?.total_logs?.toLocaleString() || '0'}
          subtitle={`${stats?.recent_logs || 0} in last hour`}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Anomalies Flagged"
          value={stats?.total_anomalies?.toLocaleString() || '0'}
          subtitle={`${stats?.recent_anomalies || 0} in last hour`}
          icon={ShieldAlert}
          color="red"
        />
        <StatCard
          title="Anomaly Rate"
          value={`${stats?.anomaly_rate || 0}%`}
          subtitle="of total traffic"
          icon={TrendingUp}
          color="yellow"
        />
        <StatCard
          title="Active Alerts"
          value={stats?.recent_alerts || 0}
          subtitle="in last hour"
          icon={Bell}
          color="purple"
        />
        <StatCard
          title="Critical Threats"
          value={stats?.severity_counts?.CRITICAL || 0}
          subtitle="requires action"
          icon={AlertOctagon}
          color="red"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">Log Traffic Timeline (24h)</h3>
          </div>
          <TimelineChart data={timeline} />
        </div>

        {/* Severity Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">Severity Breakdown</h3>
          </div>
          <SeverityPieChart data={stats?.severity_counts} />
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">Logs by Source Service</h3>
          </div>
          <SourceBarChart data={stats?.source_counts} />
        </div>

        {/* Top Anomaly IPs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-red-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">Top Anomalous IP Origins</h3>
          </div>
          <div className="space-y-2.5">
            {stats?.top_anomaly_ips && Object.keys(stats.top_anomaly_ips).length > 0 ? (
              Object.entries(stats.top_anomaly_ips)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([ip, count], idx) => (
                  <div key={ip} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500 w-4">{idx + 1}.</span>
                    <span className="font-mono text-xs text-slate-300 flex-1">{ip}</span>
                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div
                        className="bg-red-500 rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(100, (count / (stats.top_anomaly_ips[Object.keys(stats.top_anomaly_ips)[0]] || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-red-400 font-mono font-semibold">{count}</span>
                  </div>
                ))
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">No anomalous IPs detected yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">Recent Incident Feed</h3>
          </div>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
          {alerts.length > 0 ? alerts.slice(0, 10).map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          )) : (
            <p className="text-slate-500 text-xs text-center py-8">No active incidents recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
