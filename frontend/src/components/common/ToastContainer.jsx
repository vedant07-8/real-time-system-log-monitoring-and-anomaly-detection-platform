import React, { useEffect, useRef } from 'react';
import { AlertOctagon, X } from 'lucide-react';
import { animateToastSlideIn } from '../../utils/animations';

export default function ToastContainer({ toast, onClose }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (toast && containerRef.current) {
      animateToastSlideIn(containerRef.current);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full pointer-events-auto">
      <div
        ref={containerRef}
        className="bg-slate-900 border-l-4 border-l-red-500 border border-slate-800 rounded-lg p-3.5 shadow-2xl flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-2.5">
          <div className="p-1 bg-red-500/20 text-red-400 rounded shrink-0 mt-0.5">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-400">CRITICAL ANOMALY DETECTED</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-snug">{toast.message}</p>
            {toast.source_ip && (
              <span className="text-[10px] font-mono text-slate-500 mt-1 block">Origin IP: {toast.source_ip}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
