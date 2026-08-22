import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

/* ── Scenario definitions ── */

const scenarios = [
  { letter: 'A', title: 'Conservative Reduction', desc: 'Minimal headcount changes via attrition and hiring freeze.', color: '#3B82F6', multiplier: 0.55 },
  { letter: 'B', title: 'Balanced Optimization', desc: 'Combines payroll compression, contractor rationalization, and process automation.', color: '#10B981', multiplier: 0.82, recommended: true },
  { letter: 'C', title: 'Structural Redesign',    desc: 'Department consolidation and role reengineering at scale.', color: '#F59E0B', multiplier: 1.05 },
  { letter: 'D', title: 'Aggressive Restructure', desc: 'Bold workforce transformation: AI-led role automation and org flattening.', color: '#EF4444', multiplier: 1.40 },
];

function getRisk(letter: string, riskTolerance: number) {
  const base: Record<string, number> = { A: 12, B: 22, C: 38, D: 62 };
  return Math.min(95, Math.round(base[letter] * (1 + (riskTolerance - 50) / 200)));
}
function getProductivity(letter: string) {
  const vals: Record<string, string> = { A: '+0.8%', B: '+2.4%', C: '+1.2%', D: '-2.1%' };
  return vals[letter];
}
function getFTE(letter: string, target: number) {
  const mults: Record<string, number> = { A: -0.02, B: -0.04, C: -0.08, D: -0.14 };
  return Math.round((target / 2) * mults[letter] * 10);
}

export default function Simulator() {
  const [targetSavings,    setTargetSavings]    = useState(8);
  const [riskTolerance,    setRiskTolerance]    = useState(50);
  const [timeHorizon,      setTimeHorizon]      = useState(12);
  const [deptScope,        setDeptScope]        = useState('All Departments');
  const [running,          setRunning]          = useState(false);
  const [ran,              setRan]              = useState(true);

  const runSim = () => {
    setRunning(true);
    setTimeout(() => { setRunning(false); setRan(true); }, 1200);
  };

  const comparisonData = scenarios.map((sc) => ({
    name: `Scenario ${sc.letter}`,
    savings: +(targetSavings * sc.multiplier).toFixed(1),
    risk: getRisk(sc.letter, riskTolerance),
  }));

  const fteData = scenarios.map((sc) => ({
    name: `Scenario ${sc.letter}`,
    fte: Math.abs(getFTE(sc.letter, targetSavings)),
    productivity: sc.letter === 'D' ? 2.1 : sc.multiplier * 1.5,
  }));

  return (
    <div className="flex-1 overflow-y-auto flex gap-5 p-6 animate-slide-in">

      {/* ── Left Controls ── */}
      <div className="w-64 flex-shrink-0">
        <div className="nexus-card p-5 sticky top-0">
          <h2 className="mb-5">Simulation Controls</h2>

          {/* Target Savings */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-[11px] uppercase tracking-[0.06em] text-[#64748B]">Target Savings</label>
              <span className="text-[14px] font-bold" style={{ color: '#10B981' }}>${targetSavings}M</span>
            </div>
            <input
              type="range" min={1} max={20} value={targetSavings}
              onChange={(e) => setTargetSavings(Number(e.target.value))}
              className="w-full accent-[#10B981]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
              <span>$1M</span><span>$20M</span>
            </div>
          </div>

          {/* Risk Tolerance */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-[11px] uppercase tracking-[0.06em] text-[#64748B]">Max Risk Tolerance</label>
              <span className="text-[14px] font-bold" style={{ color: '#F59E0B' }}>{riskTolerance}%</span>
            </div>
            <input
              type="range" min={10} max={90} value={riskTolerance}
              onChange={(e) => setRiskTolerance(Number(e.target.value))}
              className="w-full accent-[#F59E0B]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
              <span>10%</span><span>90%</span>
            </div>
          </div>

          {/* Time Horizon */}
          <div className="mb-5">
            <div className="flex justify-between mb-2">
              <label className="text-[11px] uppercase tracking-[0.06em] text-[#64748B]">Time Horizon</label>
              <span className="text-[14px] font-bold" style={{ color: '#3B82F6' }}>{timeHorizon} mo</span>
            </div>
            <input
              type="range" min={3} max={36} step={3} value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full accent-[#3B82F6]"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] mt-1">
              <span>3 mo</span><span>36 mo</span>
            </div>
          </div>

          {/* Dept Scope */}
          <div className="mb-5">
            <label className="text-[11px] uppercase tracking-[0.06em] text-[#64748B] block mb-2">Department Scope</label>
            <select
              value={deptScope}
              onChange={(e) => setDeptScope(e.target.value)}
              className="w-full px-3 py-2 rounded-[10px] text-[13px] outline-none"
              style={{ background: '#0F172A', border: '1px solid #334155', color: '#F1F5F9' }}
            >
              {['All Departments', 'Engineering', 'Sales', 'Marketing', 'Product', 'Design'].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={runSim}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={running ? 'animate-spin' : ''} />
            {running ? 'Running...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* ── Right Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Scenario Cards */}
        <div className="grid grid-cols-2 gap-4">
          {scenarios.map((sc) => {
            const savings = +(targetSavings * sc.multiplier).toFixed(1);
            const risk    = getRisk(sc.letter, riskTolerance);
            const fte     = getFTE(sc.letter, targetSavings);

            return (
              <div
                key={sc.letter}
                className="nexus-card p-5 relative overflow-hidden"
                style={sc.recommended ? { border: `2px solid ${sc.color}`, boxShadow: `0 0 20px ${sc.color}20` } : {}}
              >
                {/* Recommended ribbon */}
                {sc.recommended && (
                  <div
                    className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: sc.color }}
                  >AI Recommended</div>
                )}

                {/* Letter badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[15px]"
                    style={{ border: `2px solid ${sc.color}`, color: sc.color }}
                  >
                    {sc.letter}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{sc.title}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{sc.desc}</p>
                  </div>
                </div>

                {/* Metrics 2×2 */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Est. Savings',          val: `$${savings}M`,           color: sc.color },
                    { label: 'Operational Risk',      val: `${risk}%`,               color: risk > 50 ? '#EF4444' : risk > 30 ? '#F59E0B' : '#10B981' },
                    { label: 'Productivity Impact',   val: getProductivity(sc.letter), color: sc.letter === 'D' ? '#EF4444' : '#10B981' },
                    { label: 'Workforce ΔFTE',        val: `${fte} FTEs`,            color: '#94A3B8' },
                  ].map((m) => (
                    <div key={m.label} className="p-3 rounded-xl" style={{ background: '#0F172A' }}>
                      <p className="text-[10px] text-[#64748B] uppercase tracking-[0.05em] mb-0.5">{m.label}</p>
                      <p className="text-[14px] font-bold" style={{ color: m.color }}>{m.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Charts */}
        <div className="grid grid-cols-2 gap-5">
          <div className="nexus-card p-5">
            <h2 className="mb-4">Savings vs Risk by Scenario</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left"  stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left"  dataKey="savings" name="Savings ($M)"  fill="#10B981" radius={[4,4,0,0]} />
                <Bar yAxisId="right" dataKey="risk"    name="Risk (%)"      fill="rgba(239,68,68,0.7)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="nexus-card p-5">
            <h2 className="mb-4">FTE Reduction vs Productivity Loss</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fteData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 11 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fte"          name="FTE Reduction"     fill="#3B82F6" radius={[4,4,0,0]} />
                <Bar dataKey="productivity" name="Productivity Loss%" fill="rgba(245,158,11,0.7)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
