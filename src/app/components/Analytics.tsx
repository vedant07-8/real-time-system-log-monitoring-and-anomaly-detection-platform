import { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Search, Filter, Download, X } from 'lucide-react';

/* ── Employee Data ────────────────────────────────────────── */

const employees = [
  {
    id: 1, name: 'Marcus Chen',   initials: 'MC', role: 'Senior Engineer',     dept: 'Engineering',
    productivity: 92, performance: 88, skillScore: 91, attritionRisk: 'Low',    status: 'Active',
    radar: [{ m: 'Productivity', v: 92 }, { m: 'Attendance', v: 96 }, { m: 'Performance', v: 88 }, { m: 'Skill', v: 91 }, { m: 'Efficiency', v: 89 }],
    trend: [{ m: 'Jul', v: 80 }, { m: 'Aug', v: 83 }, { m: 'Sep', v: 85 }, { m: 'Oct', v: 87 }, { m: 'Nov', v: 90 }, { m: 'Dec', v: 92 }],
    skills: [{ name: 'Technical', pct: 91 }, { name: 'Leadership', pct: 74 }, { name: 'Communication', pct: 82 }, { name: 'Problem Solving', pct: 88 }, { name: 'Collaboration', pct: 79 }],
    salary: '$142K', tenure: '3.2 yr', location: 'San Francisco',
    gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
  },
  {
    id: 2, name: 'Priya Sharma',  initials: 'PS', role: 'Product Manager',    dept: 'Product',
    productivity: 87, performance: 91, skillScore: 88, attritionRisk: 'Low',    status: 'Active',
    radar: [{ m: 'Productivity', v: 87 }, { m: 'Attendance', v: 98 }, { m: 'Performance', v: 91 }, { m: 'Skill', v: 88 }, { m: 'Efficiency', v: 84 }],
    trend: [{ m: 'Jul', v: 78 }, { m: 'Aug', v: 81 }, { m: 'Sep', v: 84 }, { m: 'Oct', v: 86 }, { m: 'Nov', v: 88 }, { m: 'Dec', v: 91 }],
    skills: [{ name: 'Technical', pct: 72 }, { name: 'Leadership', pct: 90 }, { name: 'Communication', pct: 95 }, { name: 'Problem Solving', pct: 89 }, { name: 'Collaboration', pct: 93 }],
    salary: '$128K', tenure: '2.8 yr', location: 'New York',
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
  },
  {
    id: 3, name: 'Jordan Williams', initials: 'JW', role: 'UX Designer',     dept: 'Design',
    productivity: 78, performance: 76, skillScore: 82, attritionRisk: 'Medium',  status: 'Active',
    radar: [{ m: 'Productivity', v: 78 }, { m: 'Attendance', v: 88 }, { m: 'Performance', v: 76 }, { m: 'Skill', v: 82 }, { m: 'Efficiency', v: 80 }],
    trend: [{ m: 'Jul', v: 82 }, { m: 'Aug', v: 80 }, { m: 'Sep', v: 79 }, { m: 'Oct', v: 77 }, { m: 'Nov', v: 78 }, { m: 'Dec', v: 76 }],
    skills: [{ name: 'Technical', pct: 82 }, { name: 'Leadership', pct: 60 }, { name: 'Communication', pct: 88 }, { name: 'Problem Solving', pct: 75 }, { name: 'Collaboration', pct: 84 }],
    salary: '$98K', tenure: '1.5 yr', location: 'Austin',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
  },
  {
    id: 4, name: 'Sofia Rossi',   initials: 'SR', role: 'Data Analyst',      dept: 'Analytics',
    productivity: 95, performance: 93, skillScore: 96, attritionRisk: 'Low',    status: 'Active',
    radar: [{ m: 'Productivity', v: 95 }, { m: 'Attendance', v: 99 }, { m: 'Performance', v: 93 }, { m: 'Skill', v: 96 }, { m: 'Efficiency', v: 94 }],
    trend: [{ m: 'Jul', v: 88 }, { m: 'Aug', v: 90 }, { m: 'Sep', v: 91 }, { m: 'Oct', v: 93 }, { m: 'Nov', v: 94 }, { m: 'Dec', v: 95 }],
    skills: [{ name: 'Technical', pct: 96 }, { name: 'Leadership', pct: 78 }, { name: 'Communication', pct: 84 }, { name: 'Problem Solving', pct: 95 }, { name: 'Collaboration', pct: 82 }],
    salary: '$118K', tenure: '4.1 yr', location: 'Boston',
    gradient: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
  },
  {
    id: 5, name: 'David Kim',     initials: 'DK', role: 'DevOps Engineer',   dept: 'Engineering',
    productivity: 68, performance: 72, skillScore: 74, attritionRisk: 'High',   status: 'At Risk',
    radar: [{ m: 'Productivity', v: 68 }, { m: 'Attendance', v: 82 }, { m: 'Performance', v: 72 }, { m: 'Skill', v: 74 }, { m: 'Efficiency', v: 66 }],
    trend: [{ m: 'Jul', v: 80 }, { m: 'Aug', v: 76 }, { m: 'Sep', v: 74 }, { m: 'Oct', v: 72 }, { m: 'Nov', v: 70 }, { m: 'Dec', v: 68 }],
    skills: [{ name: 'Technical', pct: 74 }, { name: 'Leadership', pct: 45 }, { name: 'Communication', pct: 62 }, { name: 'Problem Solving', pct: 70 }, { name: 'Collaboration', pct: 58 }],
    salary: '$108K', tenure: '2.1 yr', location: 'Seattle',
    gradient: 'linear-gradient(135deg, #EF4444, #F59E0B)',
  },
  {
    id: 6, name: 'Amara Okoye',   initials: 'AO', role: 'Marketing Manager', dept: 'Marketing',
    productivity: 84, performance: 86, skillScore: 83, attritionRisk: 'Low',   status: 'Active',
    radar: [{ m: 'Productivity', v: 84 }, { m: 'Attendance', v: 94 }, { m: 'Performance', v: 86 }, { m: 'Skill', v: 83 }, { m: 'Efficiency', v: 82 }],
    trend: [{ m: 'Jul', v: 78 }, { m: 'Aug', v: 80 }, { m: 'Sep', v: 82 }, { m: 'Oct', v: 83 }, { m: 'Nov', v: 85 }, { m: 'Dec', v: 86 }],
    skills: [{ name: 'Technical', pct: 68 }, { name: 'Leadership', pct: 80 }, { name: 'Communication', pct: 92 }, { name: 'Problem Solving', pct: 78 }, { name: 'Collaboration', pct: 88 }],
    salary: '$112K', tenure: '3.5 yr', location: 'Chicago',
    gradient: 'linear-gradient(135deg, #F59E0B, #10B981)',
  },
  {
    id: 7, name: 'Lucas Petrov',  initials: 'LP', role: 'Sales Director',    dept: 'Sales',
    productivity: 89, performance: 91, skillScore: 87, attritionRisk: 'Medium', status: 'Active',
    radar: [{ m: 'Productivity', v: 89 }, { m: 'Attendance', v: 92 }, { m: 'Performance', v: 91 }, { m: 'Skill', v: 87 }, { m: 'Efficiency', v: 86 }],
    trend: [{ m: 'Jul', v: 82 }, { m: 'Aug', v: 84 }, { m: 'Sep', v: 86 }, { m: 'Oct', v: 88 }, { m: 'Nov', v: 90 }, { m: 'Dec', v: 91 }],
    skills: [{ name: 'Technical', pct: 65 }, { name: 'Leadership', pct: 88 }, { name: 'Communication', pct: 96 }, { name: 'Problem Solving', pct: 82 }, { name: 'Collaboration', pct: 90 }],
    salary: '$138K', tenure: '5.2 yr', location: 'Miami',
    gradient: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
  },
  {
    id: 8, name: 'Elena Park',    initials: 'EP', role: 'Junior Developer',  dept: 'Engineering',
    productivity: 76, performance: 79, skillScore: 72, attritionRisk: 'Medium', status: 'Active',
    radar: [{ m: 'Productivity', v: 76 }, { m: 'Attendance', v: 90 }, { m: 'Performance', v: 79 }, { m: 'Skill', v: 72 }, { m: 'Efficiency', v: 74 }],
    trend: [{ m: 'Jul', v: 68 }, { m: 'Aug', v: 71 }, { m: 'Sep', v: 73 }, { m: 'Oct', v: 75 }, { m: 'Nov', v: 77 }, { m: 'Dec', v: 79 }],
    skills: [{ name: 'Technical', pct: 72 }, { name: 'Leadership', pct: 48 }, { name: 'Communication', pct: 70 }, { name: 'Problem Solving', pct: 68 }, { name: 'Collaboration', pct: 78 }],
    salary: '$84K', tenure: '0.9 yr', location: 'Denver',
    gradient: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
  },
];

function riskBadge(risk: string) {
  if (risk === 'High')   return <span className="badge badge-danger">{risk}</span>;
  if (risk === 'Medium') return <span className="badge badge-warning">{risk}</span>;
  return                        <span className="badge badge-success">{risk}</span>;
}

function statusBadge(status: string) {
  return status === 'Active'
    ? <span className="badge badge-success">{status}</span>
    : <span className="badge badge-danger">{status}</span>;
}

function perfColor(v: number) {
  if (v >= 90) return '#10B981';
  if (v >= 75) return '#F59E0B';
  return '#EF4444';
}

/* ── Component ─────────────────────────────────────────────── */

export default function Analytics() {
  const [search, setSearch]   = useState('');
  const [dept,   setDept]     = useState('All');
  const [risk,   setRisk]     = useState('All');
  const [selected, setSelected] = useState<typeof employees[0] | null>(null);

  const depts = ['All', 'Engineering', 'Product', 'Design', 'Analytics', 'Marketing', 'Sales'];
  const risks = ['All', 'Low', 'Medium', 'High'];

  const filtered = employees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase());
    const matchDept   = dept === 'All' || e.dept === dept;
    const matchRisk   = risk === 'All' || e.attritionRisk === risk;
    return matchSearch && matchDept && matchRisk;
  });

  return (
    <div className="flex-1 flex gap-5 p-6 overflow-hidden animate-slide-in">

      {/* ── Left Panel ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Filter Bar */}
        <div className="nexus-card p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 rounded-[10px] text-[13px] outline-none"
              style={{ background: '#0F172A', border: '1px solid #334155', color: '#F1F5F9' }}
            />
          </div>
          <select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className="px-3 py-2 rounded-[10px] text-[13px] outline-none cursor-pointer"
            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F1F5F9' }}
          >
            {depts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="px-3 py-2 rounded-[10px] text-[13px] outline-none cursor-pointer"
            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F1F5F9' }}
          >
            {risks.map((r) => <option key={r}>{r} Risk</option>)}
          </select>
          <button className="btn-primary flex items-center gap-2">
            <Filter size={13} /> Filter
          </button>
          <button className="btn-outline flex items-center gap-2">
            <Download size={13} /> Export
          </button>
        </div>

        {/* Employee Table */}
        <div className="nexus-card flex-1 overflow-hidden flex flex-col">
          {/* Sticky header */}
          <div
            className="grid text-[11px] font-semibold uppercase tracking-[0.06em] text-[#64748B] px-4 py-3 border-b border-[#334155] flex-shrink-0"
            style={{ gridTemplateColumns: '2fr 1fr 100px 70px 70px 80px 80px 60px' }}
          >
            <span>Employee</span>
            <span>Department</span>
            <span>Productivity</span>
            <span>Perf.</span>
            <span>Skill</span>
            <span>Risk</span>
            <span>Status</span>
            <span></span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.map((emp) => {
              const isActive = selected?.id === emp.id;
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelected(isActive ? null : emp)}
                  className="grid items-center px-4 py-3 cursor-pointer transition-all border-b border-[#1E293B]"
                  style={{
                    gridTemplateColumns: '2fr 1fr 100px 70px 70px 80px 80px 60px',
                    background: isActive ? 'rgba(59,130,246,0.08)' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0"
                      style={{ background: emp.gradient }}
                    >
                      {emp.initials}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">{emp.name}</p>
                      <p className="text-[11px] text-[#64748B]">{emp.role}</p>
                    </div>
                  </div>

                  <span className="text-[12px] text-[#94A3B8]">{emp.dept}</span>

                  {/* Progress */}
                  <div className="flex items-center gap-2">
                    <div className="progress-bar flex-1" style={{ width: 60 }}>
                      <div className="progress-fill" style={{ width: `${emp.productivity}%`, background: perfColor(emp.productivity) }} />
                    </div>
                    <span className="text-[12px]" style={{ color: perfColor(emp.productivity) }}>{emp.productivity}</span>
                  </div>

                  <span className="text-[12px] font-semibold" style={{ color: perfColor(emp.performance) }}>{emp.performance}</span>
                  <span className="text-[12px] text-[#94A3B8]">{emp.skillScore}</span>

                  {riskBadge(emp.attritionRisk)}
                  {statusBadge(emp.status)}

                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(isActive ? null : emp); }}
                    className="text-[11px] text-[#3B82F6] hover:underline"
                  >View</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right Profile Drawer ── */}
      {selected && (
        <div
          className="flex flex-col gap-4 overflow-y-auto animate-slide-in flex-shrink-0"
          style={{ width: 340 }}
        >
          {/* Profile Card */}
          <div className="nexus-card p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: selected.gradient }}
                >
                  {selected.initials}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-white">{selected.name}</p>
                  <p className="text-[12px] text-[#94A3B8]">{selected.role}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-white transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Department', val: selected.dept },
                { label: 'Location',   val: selected.location },
                { label: 'Tenure',     val: selected.tenure },
                { label: 'Salary',     val: selected.salary },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl" style={{ background: '#0F172A' }}>
                  <p className="text-[11px] text-[#64748B] mb-0.5">{item.label}</p>
                  <p className="text-[13px] font-medium text-white">{item.val}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {riskBadge(selected.attritionRisk)}
              {statusBadge(selected.status)}
            </div>
          </div>

          {/* Radar */}
          <div className="nexus-card p-5">
            <h3 className="mb-3">Performance Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={selected.radar}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="m" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Radar dataKey="v" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Trend */}
          <div className="nexus-card p-5">
            <h3 className="mb-3">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={selected.trend}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" stroke="#475569" tick={{ fontSize: 10 }} />
                <YAxis domain={[60, 100]} stroke="#475569" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="#10B981" fill="url(#trendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Matrix */}
          <div className="nexus-card p-5">
            <h3 className="mb-4">Skill Matrix</h3>
            <div className="space-y-3">
              {selected.skills.map((sk) => (
                <div key={sk.name}>
                  <div className="flex justify-between text-[12px] mb-1">
                    <span className="text-[#94A3B8]">{sk.name}</span>
                    <span className="font-semibold text-white">{sk.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${sk.pct}%`,
                        background: `linear-gradient(90deg, #3B82F6, #8B5CF6)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
