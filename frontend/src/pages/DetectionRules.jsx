import React, { useState, useEffect } from 'react';
import { Shield, Settings2, Power, RefreshCw, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchRules, updateRule } from '../lib/api';

export default function DetectionRules() {
  const [rules, setRules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setIsLoading(true);
    try {
      const res = await fetchRules();
      if (res.success) {
        setRules(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRule = (id) => {
    setRules(rules.map(r => r._id === id ? { ...r, enabled: !r.enabled, _isDirty: true } : r));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dirtyRules = rules.filter(r => r._isDirty);
      for (const rule of dirtyRules) {
        await updateRule(rule._id, { enabled: rule.enabled });
      }
      await loadRules();
    } catch (e) {
      console.error('Failed to save rules', e);
      alert('Failed to save rules');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = rules.some(r => r._isDirty);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-500" />
            Detection Rules Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">Configure heuristic rules and threat scoring models.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={cn(
            "flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors",
            hasChanges 
              ? "bg-cyan-600 hover:bg-cyan-700 text-white shadow-[0_0_15px_rgba(8,145,178,0.3)]" 
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          )}
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20 text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map(rule => (
            <div key={rule._id} className={cn(
              "bg-[#111C2E] border rounded-xl p-5 transition-all relative overflow-hidden",
              rule.enabled ? "border-[#26364D] hover:border-slate-500/50" : "border-slate-800 opacity-60 grayscale-[50%]"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="pr-12">
                  <h3 className="text-base font-bold text-slate-200">{rule.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[2rem]">{rule.description}</p>
                </div>
                <button 
                  onClick={() => toggleRule(rule._id)}
                  className={cn(
                    "absolute top-5 right-5 p-2 rounded-lg transition-all",
                    rule.enabled ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                  )}
                  title={rule.enabled ? "Disable Rule" : "Enable Rule"}
                >
                  <Power className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#0B1220] rounded-lg p-3 border border-[#26364D]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Severity</div>
                  <div className={cn(
                    "text-xs font-bold",
                    rule.severity === 'CRITICAL' ? 'text-red-500' :
                    rule.severity === 'HIGH' ? 'text-orange-500' :
                    rule.severity === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
                  )}>{rule.severity}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Threat Score</div>
                  <div className="text-xs font-mono font-bold text-slate-300">+{rule.score} pts</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Threshold</div>
                  <div className="text-xs text-slate-300">{rule.threshold} events</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Time Window</div>
                  <div className="text-xs text-slate-300">{rule.timeWindowMinutes} min</div>
                </div>
              </div>
              
              {!rule.enabled && (
                <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
