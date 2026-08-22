import { useState, useEffect } from 'react';
import Sidebar     from './components/Sidebar';
import TopHeader   from './components/TopHeader';
import Dashboard   from './components/Dashboard';
import Analytics   from './components/Analytics';
import Optimization from './components/Optimization';
import Simulator   from './components/Simulator';
import AICopilot   from './components/AICopilot';
import Forecasting from './components/Forecasting';
import Reports     from './components/Reports';
import Settings    from './components/Settings';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="w-full h-screen flex overflow-hidden bg-[#0F172A] text-[#F1F5F9]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader activeView={activeView} />

        <div className="flex-1 overflow-hidden flex">
          {activeView === 'dashboard'    && <Dashboard />}
          {activeView === 'analytics'    && <Analytics />}
          {activeView === 'optimization' && <Optimization />}
          {activeView === 'simulator'    && <Simulator />}
          {activeView === 'copilot'      && <AICopilot />}
          {activeView === 'forecasting'  && <Forecasting />}
          {activeView === 'reports'      && <Reports />}
          {activeView === 'settings'     && <Settings />}
        </div>
      </div>
    </div>
  );
}