import { TrendingDown, Users, Target, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts';

/* ── KPIs ── */

const kpis = [
  { title: 'Predicted Attrition Rate',    value: '14.3%',   icon: TrendingDown, accent: '#EF4444', glow: 'kpi-glow-danger'   },
  { title: 'Hiring Demand Forecast',      value: '158 roles', icon: Users,       accent: '#3B82F6', glow: 'kpi-glow-primary'  },
  { title: 'Skill Gap Index',             value: '24 / 100', icon: Target,       accent: '#F59E0B', glow: 'kpi-glow-warning'  },
  { title: 'Workforce Growth Projection', value: '+6.8%',   icon: TrendingUp,   accent: '#10B981', glow: 'kpi-glow-success'  },
];

/* ── Chart Data ── */

const attritionData = [
  { month: 'Jul', rate: 12.1 },
  { month: 'Aug', rate: 12.8 },
  { month: 'Sep', rate: 13.4 },
  { month: 'Oct', rate: 14.0 },
  { month: 'Nov', rate: 14.3 },
  { month: 'Dec', rate: 15.1 },
];

const hiringData = [
  { month: 'Jan', roles: 18 },
  { month: 'Feb', roles: 22 },
  { month: 'Mar', roles: 28 },
  { month: 'Apr', roles: 24 },
  { month: 'May', roles: 30 },
  { month: 'Jun', roles: 36 },
];

const headcountData = [
  { month: 'Jan', count: 1240 },
  { month: 'Feb', count: 1255 },
  { month: 'Mar', count: 1270 },
  { month: 'Apr', count: 1282 },
  { month: 'May', count: 1300 },
  { month: 'Jun', count: 1312 },
];

const deptHeatmap = [
  { dept: 'Sales',       risk: 18, pred: 14, color: '#EF4444', width: 18  },
  { dept: 'Engineering', risk: 12, pred: 9,  color: '#F59E0B', width: 12  },
  { dept: 'Marketing',   risk: 14, pred: 11, color: '#F59E0B', width: 14  },
  { dept: 'Product',     risk: 9,  pred: 6,  color: '#10B981', width: 9   },
  { dept: 'Design',      risk: 7,  pred: 5,  color: '#10B981', width: 7   },
  { dept: 'Analytics',   risk: 5,  pred: 3,  color: '#10B981', width: 5   },
  { dept: 'HR',          risk: 11, pred: 8,  color: '#F59E0B', width: 11  },
  { dept: 'Finance',     risk: 8,  pred: 6,  color: '#10B981', width: 8   },
];

const tooltipStyle = { background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 };

export default function Forecasting() {
  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neural-grid animate-slide-in">

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.title} className={`nexus-card nexus-card-hover p-5 ${k.glow}`}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${k.accent}20` }}>
                <Icon size={18} style={{ color: k.accent }} />
              </div>
              <p className="text-[24px] font-bold text-white mb-1">{k.value}</p>
              <p className="text-[12px] text-[#94A3B8]">{k.title}</p>
            </div>
          );
        })}
      </div>

      {/* 2×2 Chart Grid */}
      <div className="grid grid-cols-2 gap-5">

        {/* Attrition Rate */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Predicted Attrition Rate (%)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attritionData}>
              <defs>
                <linearGradient id="attrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#EF4444" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[10, 17]} />
              <ReferenceLine y={13} stroke="#F59E0B" strokeDasharray="4 3" label={{ value: 'Threshold', fill: '#F59E0B', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v}%`, 'Attrition']} />
              <Area type="monotone" dataKey="rate" stroke="#EF4444" fill="url(#attrGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Hiring Demand */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Monthly Hiring Demand (Roles)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hiringData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, 'Roles']} />
              <Bar dataKey="roles" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Headcount Growth */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Total Headcount Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={headcountData}>
              <defs>
                <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
              <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11 }} domain={[1200, 1350]} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [v, 'Employees']} />
              <Area type="monotone" dataKey="count" stroke="#10B981" fill="url(#hcGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Heatmap */}
        <div className="nexus-card p-5">
          <h2 className="mb-4">Department Attrition Heatmap</h2>
          <div className="space-y-3">
            {deptHeatmap.map((d) => (
              <div key={d.dept} className="flex items-center gap-3">
                <span className="text-[12px] text-[#94A3B8] w-24 flex-shrink-0">{d.dept}</span>
                <div className="flex-1 progress-bar">
                  <div className="progress-fill" style={{ width: `${d.risk * 5}%`, background: d.color }} />
                </div>
                <span className="text-[12px] font-semibold flex-shrink-0" style={{ color: d.color, width: 36 }}>{d.risk}%</span>
                <span className="badge flex-shrink-0" style={{ background: `${d.color}15`, border: `1px solid ${d.color}30`, color: d.color, fontSize: 10 }}>
                  ↑{d.pred}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
