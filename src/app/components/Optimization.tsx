import { useState } from 'react';
import { Sparkles, DollarSign, GitBranch, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

/* ── Data ── */

const scenarios = [
  {
    id: 1, icon: DollarSign, title: 'Workforce Redundancy Analysis',
    accent: '#EF4444', glow: 'kpi-glow-danger',
    metrics: [
      { label: 'Est. Savings',          val: '$2.1M' },
      { label: 'Risk Score',            val: '72/100' },
      { label: 'Productivity Impact',   val: '-3.2%' },
      { label: 'Business Impact',       val: 'Medium' },
    ],
    findings: [
      { label: 'Redundant Roles Identified', val: '18 roles',   delta: '+4 vs last scan' },
      { label: 'Overlap in Engineering',     val: '34%',        delta: 'High overlap' },
      { label: 'Estimated FTE Reduction',    val: '11 FTEs',    delta: 'Recoverable Q2' },
    ],
  },
  {
    id: 2, icon: GitBranch, title: 'Skill Overlap Analysis',
    accent: '#F59E0B', glow: 'kpi-glow-warning',
    metrics: [
      { label: 'Est. Savings',          val: '$1.4M' },
      { label: 'Risk Score',            val: '45/100' },
      { label: 'Productivity Impact',   val: '+1.8%' },
      { label: 'Business Impact',       val: 'Low' },
    ],
    findings: [
      { label: 'Skill Overlap Detected',     val: '6 dept pairs', delta: 'Consolidatable' },
      { label: 'Training Redundancy',        val: '$340K/yr',     delta: 'Eliminatable' },
      { label: 'Cross-Training Potential',   val: '42 employees', delta: '+12% efficiency' },
    ],
  },
  {
    id: 3, icon: DollarSign, title: 'Payroll Optimization',
    accent: '#10B981', glow: 'kpi-glow-success',
    metrics: [
      { label: 'Est. Savings',          val: '$3.1M' },
      { label: 'Risk Score',            val: '28/100' },
      { label: 'Productivity Impact',   val: '+2.5%' },
      { label: 'Business Impact',       val: 'Low' },
    ],
    findings: [
      { label: 'Contractor Overspend',       val: '$1.2M/yr',    delta: 'High priority' },
      { label: 'Benefits Optimization',      val: '$680K/yr',    delta: 'Quick win' },
      { label: 'Bonus Structure Review',     val: '$1.22M/yr',   delta: 'Strategic' },
    ],
  },
  {
    id: 4, icon: Layers, title: 'Team Restructuring',
    accent: '#8B5CF6', glow: 'kpi-glow-purple',
    metrics: [
      { label: 'Est. Savings',          val: '$980K' },
      { label: 'Risk Score',            val: '62/100' },
      { label: 'Productivity Impact',   val: '+4.1%' },
      { label: 'Business Impact',       val: 'High' },
    ],
    findings: [
      { label: 'Teams to Consolidate',       val: '3 teams',     delta: '↓18 managers' },
      { label: 'Span of Control Avg',        val: '4.2 → 7.8',  delta: '+85% efficiency' },
      { label: 'Leadership Layer Reduction', val: '-2 layers',   delta: 'Recommended' },
    ],
  },
];

const overlapData = [
  { dept: 'Engineering', overlap: 68 },
  { dept: 'Marketing',   overlap: 54 },
  { dept: 'Sales',       overlap: 42 },
  { dept: 'Product',     overlap: 38 },
  { dept: 'Design',      overlap: 29 },
  { dept: 'Analytics',   overlap: 18 },
];

const savingsData = [
  { category: 'Workforce Redundancy', savings: 2.1 },
  { category: 'Payroll Optimization', savings: 3.1 },
  { category: 'Skill Overlap',        savings: 1.4 },
  { category: 'Team Restructuring',   savings: 0.98 },
  { category: 'Contractor Review',    savings: 1.2 },
];

function overlapColor(v: number) {
  if (v > 60) return '#EF4444';
  if (v > 40) return '#F59E0B';
  return '#10B981';
}

export default function Optimization() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neural-grid animate-slide-in">

      {/* Banner */}
      <div
        className="mb-6 p-5 rounded-[20px] flex items-start gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(59,130,246,0.08) 100%)',
          border: '1px solid rgba(139,92,246,0.25)',
        }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.2)' }}>
          <Sparkles size={18} style={{ color: '#8B5CF6' }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#8B5CF6' }}>AI Optimization Engine</p>
          <p className="text-[13px] text-[#CBD5E1]">
            Analysis complete across <strong className="text-white">4 optimization scenarios</strong>. Total addressable savings: 
            <strong className="text-[#10B981]"> $7.58M annually</strong>. Payroll Optimization carries lowest risk (28/100).
          </p>
        </div>
      </div>

      {/* Scenario Cards */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isExpanded = expanded === sc.id;
          const isActive   = isExpanded;

          return (
            <div
              key={sc.id}
              className={`nexus-card p-5 cursor-pointer transition-all ${sc.glow}`}
              style={isActive ? { borderColor: sc.accent, boxShadow: `0 0 20px ${sc.accent}25` } : {}}
              onClick={() => setExpanded(isExpanded ? null : sc.id)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${sc.accent}20` }}>
                    <Icon size={17} style={{ color: sc.accent }} />
                  </div>
                  <p className="text-[13px] font-semibold text-white leading-tight">{sc.title}</p>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
              </div>

              {/* 2×2 Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {sc.metrics.map((m) => (
                  <div key={m.label} className="p-3 rounded-xl" style={{ background: '#0F172A' }}>
                    <p className="text-[10px] text-[#64748B] mb-0.5 uppercase tracking-[0.05em]">{m.label}</p>
                    <p className="text-[14px] font-bold" style={{ color: sc.accent }}>{m.val}</p>
                  </div>
                ))}
              </div>

              {/* Expanded Findings */}
              {isExpanded && (
                <div className="border-t border-[#334155] pt-4 space-y-3">
                  {sc.findings.map((f) => (
                    <div key={f.label} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[12px] text-[#94A3B8]">{f.label}</p>
                        <p className="text-[13px] font-semibold text-white">{f.val}</p>
                      </div>
                      <span className="text-[11px] text-[#64748B] text-right flex-shrink-0">{f.delta}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5" style={{ gridTemplateColumns: '3fr 2fr' }}>
        {/* Skill Overlap Bar */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Skill Overlap by Department (%)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={overlapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="dept" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                formatter={(v: any) => [`${v}%`, 'Overlap']}
              />
              <Bar dataKey="overlap" radius={[6, 6, 0, 0]}>
                {overlapData.map((entry, i) => (
                  <Cell key={i} fill={overlapColor(entry.overlap)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings Horizontal */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Savings Breakdown ($M)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={savingsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <YAxis type="category" dataKey="category" stroke="#475569" tick={{ fontSize: 10 }} width={110} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                formatter={(v: any) => [`$${v}M`, 'Savings']}
              />
              <Bar dataKey="savings" fill="#10B981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
