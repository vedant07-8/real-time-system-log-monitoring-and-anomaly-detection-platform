import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import DashboardTab from './components/dashboard/DashboardTab';
import LogsTab from './components/logs/LogsTab';
import AlertsTab from './components/alerts/AlertsTab';
import AnomalyAnalysisTab from './components/analytics/AnomalyAnalysisTab';
import DemoSandbox from './components/sandbox/DemoSandbox';
import ToastContainer from './components/common/ToastContainer';
import {
  fetchStats,
  fetchLogs,
  fetchAlerts,
  fetchTimeline,
  generateSampleData,
  generateBurst,
  startGenerator,
  stopGenerator,
} from './services/api';

const WS_URL = `ws://${window.location.host}/ws/logs`;

function App() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [generatorRunning, setGeneratorRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'logs' | 'alerts' | 'analysis'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logFilter, setLogFilter] = useState({ anomaly_only: false, source: '', level: '', search: '' });
  const [toast, setToast] = useState(null);
  const wsRef = useRef(null);

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
              const newLog = msg.data;
              setLogs(prev => [newLog, ...prev.slice(0, 49)]);

              if (newLog.alerts && newLog.alerts.length > 0) {
                const crit = newLog.alerts.find(a => a.severity === 'CRITICAL');
                if (crit) {
                  setToast({
                    message: crit.description,
                    source_ip: crit.source_ip,
                  });
                }
              }

              if (Math.random() < 0.15) {
                fetchStats().then(setStats).catch(() => {});
              }
            }
          } catch (e) {}
        };

        ws.onclose = () => {
          setWsConnected(false);
          setTimeout(connectWS, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };

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

  // Initial fetch and polling refresh
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Refetch on filter change
  useEffect(() => {
    fetchData();
  }, [logFilter, fetchData]);

  const handleGenerateSample = async () => {
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

  const criticalCount = stats?.severity_counts?.CRITICAL || 0;

  return (
    <div className="flex h-screen w-screen bg-[#000000] text-zinc-100 font-sans antialiased overflow-hidden selection:bg-zinc-700/50 selection:text-zinc-100">
      {/* Shadcn Dashboard-2 Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        wsConnected={wsConnected}
        criticalCount={criticalCount}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopBar
          activeTab={activeTab}
          criticalCount={criticalCount}
        />

        {/* View Routing Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#000000]">
          <div className="max-w-[1600px] mx-auto">
            {activeTab === 'overview' && (
              <DashboardTab
                stats={stats}
                timeline={timeline}
                alerts={alerts}
              />
            )}

            {activeTab === 'logs' && (
              <LogsTab
                logs={logs}
                logFilter={logFilter}
                setLogFilter={setLogFilter}
                onRefresh={fetchData}
                wsConnected={wsConnected}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsTab
                alerts={alerts}
              />
            )}

            {activeTab === 'analysis' && (
              <AnomalyAnalysisTab
                stats={stats}
              />
            )}
          </div>
        </main>
      </div>

      {/* Real-time Toast Notifications */}
      <ToastContainer
        toast={toast}
        onClose={() => setToast(null)}
      />

      {/* Demo Sandbox Drawer Controls */}
      <DemoSandbox
        generatorRunning={generatorRunning}
        onToggleGenerator={handleToggleGenerator}
        onGenerateSample={handleGenerateSample}
        onGenerateBurst={handleGenerateBurst}
      />
    </div>
  );
}

export default App;
