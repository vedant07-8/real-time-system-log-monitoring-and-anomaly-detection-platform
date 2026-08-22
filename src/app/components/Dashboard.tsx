import { useState } from 'react';
import {
  ComposedChart, Area, Line, BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Sparkles, Users, DollarSign, Activity, TrendingUp,
  AlertTriangle, Award, ArrowUpRight, ArrowDownRight,
  FileText, CheckCircle, Clock
} from 'lucide-react';

/* ── Data ──────────────────────────────────────────────────── */

const payrollData = [
  { month: 'Jan', actual: 4.8, budget: 5.0 },
  { month: 'Feb', actual: 4.9, budget: 5.0 },
  { month: 'Mar', actual: 5.1, budget: 5.2 },
  { month: 'Apr', actual: 5.0, budget: 5.2 },
  { month: 'May', actual: 5.3, budget: 5.4 },
  { month: 'Jun', actual: 5.2, budget: 5.4 },
  { month: 'Jul', actual: 5.4, budget: 5.5 },
  { month: 'Aug', actual: 5.6, budget: 5.6 },
  { month: 'Sep', actual: 5.5, budget: 5.7 },
  { month: 'Oct', actual: 5.8, budget: 5.8 },
  { month: 'Nov', actual: 5.7, budget: 5.9 },
  { month: 'Dec', actual: 6.2, budget: 6.0 },
];

const deptPieData = [
  { name: 'Engineering',  value: 32, color: '#3B82F6' },
  { name: 'Sales',        value: 22, color: '#10B981' },
  { name: 'Marketing',    value: 16, color: '#F59E0B' },
  { name: 'Product',      value: 14, color: '#8B5CF6' },
  { name: 'Design',       value: 10, color: '#06B6D4' },
  { name: 'Analytics',    value: 6,  color: '#EF4444' },
];

const deptPerf = [
  { dept: 'Engineering', performance: 88, attrition: 12 },
  { dept: 'Product',     performance: 85, attrition: 9  },
  { dept: 'Design',      performance: 91, attrition: 7  },
  { dept: 'Analytics',   performance: 96, attrition: 5  },
  { dept: 'Marketing',   performance: 83, attrition: 14 },
  { dept: 'Sales',       performance: 87, attrition: 18 },
];

const aiRecs = [
  {
    title: 'Reduce contractor spend in Engineering',
    priority: 'High',
    desc: 'Identified 8 contract roles with overlap in core competencies. Consolidation recommended.',
    savings: '$840K/yr',
    risk: 'Low',
  },
  {
    title: 'Sales team restructuring opportunity',
    priority: 'Medium',
    desc: 'Under-performing SDR tier shows 24% overlap. Realignment could boost quota attainment.',
    savings: '$520K/yr',
    risk: 'Medium',
  },
  {
    title: 'Automate manual QA workflows',
    priority: 'High',
    desc: 'Test automation coverage at 42%. Raising to 80% saves 3 FTE equivalents.',
    savings: '$380K/yr',
    risk: 'Low',
  },
];

const reports = [
  { icon: FileText,    title: 'Q4 2024 Workforce Analysis',     date: 'Dec 31, 2024', pages: 42, status: 'Ready',     color: '#3B82F6' },
  { icon: DollarSign,  title: 'Annual Cost Optimization Report', date: 'Jan 5, 2025',  pages: 58, status: 'Ready',     color: '#10B981' },
  { icon: Award,       title: 'Executive Summary Q4 2024',      date: 'Jan 3, 2025',  pages: 12, status: 'Ready',     color: '#8B5CF6' },
  { icon: AlertTriangle, title: 'Sales Team Retention Risk',    date: 'Jan 8, 2025',  pages: 26, status: 'In Review', color: '#F59E0B' },
];

/* ── KPI Cards ─────────────────────────────────────────────── */

const kpiCards = [
  {
    title: 'Total Employees',   value: '1,312', change: '+64 vs last quarter', up: true,
    icon: Users,        accent: '#3B82F6', glow: 'kpi-glow-primary',
  },
  {
    title: 'Annual Payroll Cost', value: '$62.4M', change: '+1.96% vs budget', up: false,
    icon: DollarSign,   accent: '#F59E0B', glow: 'kpi-glow-warning',
  },
  {
    title: 'Workforce Health Score', value: '84.2', change: '+2.8% this quarter', up: true,
    icon: Activity,     accent: '#10B981', glow: 'kpi-glow-success',
  },
  {
    title: 'Productivity Index', value: '91.7%', change: '+2.5pt this month', up: true,
    icon: TrendingUp,   accent: '#8B5CF6', glow: 'kpi-glow-purple',
  },
  {
    title: 'Attrition Risk',   value: '14.3%',  change: '-1.2% vs last month', up: false,
    icon: AlertTriangle, accent: '#EF4444', glow: 'kpi-glow-danger',
  },
  {
    title: 'Avg Performance Score', value: '82.4', change: '+3.1 pts', up: true,
    icon: Award,        accent: '#06B6D4', glow: 'kpi-glow-cyan',
  },
];

/* ── Tooltip ───────────────────────────────────────────────── */

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="nexus-card p-3 text-xs" style={{ borderRadius: 12, fontSize: 12 }}>
      <p className="font-semibold text-white mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? `$${p.value}M` : p.value}
        </p>
      ))}
    </div>
  );
};

/* ── Component ─────────────────────────────────────────────── */

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neural-grid animate-slide-in">

      {/* AI Executive Summary Banner */}
      <div
        className="mb-6 p-5 rounded-[20px] flex items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
        }}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
            <Sparkles size={18} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.06em] mb-1" style={{ color: '#3B82F6' }}>AI Executive Summary</p>
            <p className="text-[13px] text-[#CBD5E1]">
              Workforce health is <span className="text-[#10B981] font-semibold">Good</span> at 84.2/100.
              Payroll is tracking <span className="text-[#F59E0B] font-semibold">3.3% over budget</span> YTD with a
              <span className="text-[#3B82F6] font-semibold"> $3.6M savings opportunity</span> identified across 3 optimization scenarios.
              Top alert: Sales attrition risk elevated at 18%.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className="badge badge-success">Health: Good</span>
          <span className="badge badge-warning">3 Alerts</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className={`nexus-card nexus-card-hover p-5 relative overflow-hidden ${card.glow}`}>
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${card.accent}20` }}
                >
                  <Icon size={18} style={{ color: card.accent }} />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: card.up ? '#10B981' : '#EF4444' }}>
                  {card.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {card.change}
                </div>
              </div>
              <p className="text-[28px] font-bold text-white leading-none mb-1">{card.value}</p>
              <p className="text-[12px] font-medium text-[#94A3B8]">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Payroll ComposedChart */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Payroll: Actual vs Budget (FY2024, $M)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={payrollData}>
              <defs>
                <linearGradient id="payrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="actual" name="Actual" stroke="#3B82F6" strokeWidth={2} fill="url(#payrollGrad)" />
              <Line type="monotone" dataKey="budget" name="Budget" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 3" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-5 mt-3 justify-center">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><span className="w-4 h-0.5 bg-[#3B82F6] inline-block" />Actual</div>
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]"><span className="w-4 h-0.5 bg-[#F59E0B] inline-block border-dashed border-t-2 border-[#F59E0B]" />Budget</div>
          </div>
        </div>

        {/* Dept Donut */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Workforce by Department</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={deptPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {deptPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1.5 mt-3">
            {deptPieData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-[11px] text-[#94A3B8] truncate">{d.name}: {d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dept Perf + AI Recs */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '3fr 2fr' }}>
        {/* Dept Bar */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Department Performance</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptPerf} layout="vertical" barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" horizontal={false} />
              <XAxis type="number" stroke="#475569" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <YAxis type="category" dataKey="dept" stroke="#475569" tick={{ fontSize: 11 }} width={72} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="performance" name="Performance" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="attrition"   name="Attrition Risk" fill="rgba(239,68,68,0.7)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Recs */}
        <div className="nexus-card p-5 flex flex-col gap-3">
          <h2>AI Recommendations</h2>
          {aiRecs.map((rec) => (
            <div
              key={rec.title}
              className="p-4 rounded-xl border border-[#334155] transition-all hover:bg-[#263045] hover:border-[#475569]"
              style={{ background: '#16213A' }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[13px] font-semibold text-white leading-tight flex-1">{rec.title}</p>
                <span className={`badge flex-shrink-0 ${rec.priority === 'High' ? 'badge-danger' : 'badge-warning'}`}>{rec.priority}</span>
              </div>
              <p className="text-[12px] text-[#94A3B8] mb-2">{rec.desc}</p>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#10B981]">{rec.savings}</span>
                <span className="text-[11px] text-[#64748B]">Risk: {rec.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="grid grid-cols-4 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="nexus-card nexus-card-hover p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${r.color}20` }}>
                <Icon size={18} style={{ color: r.color }} />
              </div>
              <p className="text-[13px] font-semibold text-white mb-1 leading-tight">{r.title}</p>
              <p className="text-[11px] text-[#64748B] mb-2">{r.date} · {r.pages}p</p>
              <span className={`badge ${r.status === 'Ready' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
