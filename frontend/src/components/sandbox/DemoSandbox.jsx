import React, { useState } from 'react';
import { Sliders, Play, Square, Database, Flame, ShieldAlert, ChevronUp, X } from 'lucide-react';

export default function DemoSandbox({
  generatorRunning,
  onToggleGenerator,
  onGenerateSample,
  onGenerateBurst,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Closed Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg shadow-xl text-slate-300 text-xs font-mono transition-all"
        >
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Demo Sandbox</span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded border border-slate-700">Controls</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-500 ml-1" />
        </button>
      )}

      {/* Open Panel */}
      {isOpen && (
        <div className="w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-100">Simulation Sandbox</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4 text-xs font-mono">
            {/* Live Generator Toggle */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Stream Generator</label>
              <button
                onClick={onToggleGenerator}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                  generatorRunning
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                }`}
              >
                {generatorRunning ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    <span>Stop Background Generator</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Background Generator</span>
                  </>
                )}
              </button>
            </div>

            {/* Bulk Data Ingestion */}
            <div className="space-y-1.5 border-t border-slate-800 pt-3">
              <label className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Bulk Ingestion</label>
              <button
                onClick={onGenerateSample}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 rounded-lg font-medium transition-all"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Generate 200 Logs Batch</span>
              </button>
            </div>

            {/* Attack Scenario Bursts */}
            <div className="space-y-1.5 border-t border-slate-800 pt-3">
              <label className="text-slate-400 font-medium block text-[11px] uppercase tracking-wider">Inject Attack Bursts</label>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => onGenerateBurst('brute_force')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-all"
                >
                  <Flame className="w-3.5 h-3.5 text-red-400" />
                  <span>Brute Force Attack (SSH)</span>
                </button>
                <button
                  onClick={() => onGenerateBurst('port_scan')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                  <span>Port Scan Activity</span>
                </button>
                <button
                  onClick={() => onGenerateBurst('privilege')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-left transition-all"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Privilege Escalation (Sudo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
