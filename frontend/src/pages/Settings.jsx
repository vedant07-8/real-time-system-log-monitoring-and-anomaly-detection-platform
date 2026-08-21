import React, { useState, useEffect } from 'react';
import { Settings2, Save, HardDrive, Shield, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchSettings, updateSettings } from '../lib/api';

export default function Settings() {
  const [channels, setChannels] = useState({
    security: true,
    system: true,
    application: true,
    setup: false,
  });
  
  const [retention, setRetention] = useState('30');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetchSettings();
      if (res.success && res.data) {
        setChannels(res.data.monitoredSources || { security: true, system: true, application: true, setup: false });
        setRetention(res.data.retentionDays?.toString() || '30');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await updateSettings({
        monitoredSources: channels,
        retentionDays: parseInt(retention, 10)
      });
      if (res.success) {
        alert('Settings saved and synchronized with monitoring service.');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-20 text-slate-500"><RefreshCw className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Settings2 className="w-6 h-6 text-cyan-500" />
        <h2 className="text-xl font-bold text-slate-200">System Settings</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Monitoring Configuration */}
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#0B1220] px-6 py-4 border-b border-[#26364D] flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-slate-200">Windows Event Log Channels</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-6">Select which Windows Event Logs to continuously monitor and analyze.</p>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={channels.security} onChange={e => setChannels(c => ({...c, security: e.target.checked}))} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-sm font-medium text-slate-300">Windows Security (Recommended)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={channels.system} onChange={e => setChannels(c => ({...c, system: e.target.checked}))} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-sm font-medium text-slate-300">Windows System</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={channels.application} onChange={e => setChannels(c => ({...c, application: e.target.checked}))} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-sm font-medium text-slate-300">Windows Application</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={channels.setup} onChange={e => setChannels(c => ({...c, setup: e.target.checked}))} className="w-4 h-4 rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-cyan-500/20" />
                <span className="text-sm font-medium text-slate-300">Windows Setup</span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-[#111C2E] border border-[#26364D] rounded-xl overflow-hidden shadow-lg">
          <div className="bg-[#0B1220] px-6 py-4 border-b border-[#26364D] flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-slate-200">Data Retention</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-400 mb-6">Configure how long raw logs and alerts should be stored in MongoDB.</p>
            
            <div className="flex gap-4">
              {['7', '30', '90', '365'].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setRetention(days)}
                  className={cn(
                    "px-6 py-3 rounded-lg border font-medium text-sm transition-all",
                    retention === days
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                      : "bg-[#0B1220] text-slate-400 border-[#26364D] hover:border-slate-500"
                  )}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Save Actions */}
        <div className="flex justify-end pt-4 border-t border-slate-700/50">
           <button 
             type="submit" 
             disabled={isSaving}
             className={cn("flex items-center gap-2 px-6 py-2.5 font-bold rounded-lg transition-colors shadow-lg", isSaving ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]")}
           >
             {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
             {isSaving ? 'Saving...' : 'Save Configuration'}
           </button>
        </div>
      </form>
    </div>
  );
}
