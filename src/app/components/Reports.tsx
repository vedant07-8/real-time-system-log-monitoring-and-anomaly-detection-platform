import { useState } from 'react';
import { FileText, DollarSign, Award, AlertTriangle, Download, X, FileSpreadsheet } from 'lucide-react';

/* ── Report Data ── */

const reports = [
  {
    id: 1, icon: FileText,      color: '#3B82F6',
    title: 'Q4 2024 Workforce Analysis',
    date: 'Dec 31, 2024', pages: 42, size: '4.2 MB',
    category: 'Workforce', status: 'Ready',
    desc: 'Comprehensive Q4 workforce performance review covering all 8 departments, 1,312 employees, KPI benchmarking, and year-over-year trend analysis.',
    format: 'PDF',
  },
  {
    id: 2, icon: DollarSign,    color: '#10B981',
    title: 'Annual Cost Optimization Report',
    date: 'Jan 5, 2025', pages: 58, size: '6.8 MB',
    category: 'Cost', status: 'Ready',
    desc: 'Full-year cost analysis with $7.6M savings opportunity breakdown, scenario modeling, and executive action recommendations.',
    format: 'PDF',
  },
  {
    id: 3, icon: Award,         color: '#8B5CF6',
    title: 'Executive Summary Q4 2024',
    date: 'Jan 3, 2025', pages: 12, size: '1.4 MB',
    category: 'Executive', status: 'Ready',
    desc: 'Board-level summary of workforce health, key risks, strategic initiatives, and 2025 headcount plan.',
    format: 'PDF',
  },
  {
    id: 4, icon: AlertTriangle, color: '#F59E0B',
    title: 'Sales Team Retention Risk',
    date: 'Jan 8, 2025', pages: 26, size: '2.9 MB',
    category: 'Workforce', status: 'In Review',
    desc: 'Deep-dive into Sales attrition drivers, individual flight risk assessments, and retention strategy recommendations.',
    format: 'PDF',
  },
  {
    id: 5, icon: FileText,      color: '#06B6D4',
    title: 'IT Contractor Audit Report',
    date: 'Jan 10, 2025', pages: 18, size: '2.1 MB',
    category: 'Cost', status: 'Ready',
    desc: 'Audit of all IT contractor engagements, billing accuracy review, and overlap analysis with FTE headcount.',
    format: 'XLSX',
  },
  {
    id: 6, icon: FileText,      color: '#94A3B8',
    title: 'Skill Gap Assessment 2025',
    date: 'Jan 12, 2025', pages: 34, size: '3.6 MB',
    category: 'Workforce', status: 'Draft',
    desc: 'Organization-wide skills inventory, gap analysis versus 2025 strategic plan, and learning pathway recommendations.',
    format: 'PDF',
  },
];

const summaryCards = [
  { label: 'Workforce Reports', count: 3, accent: '#3B82F6' },
  { label: 'Cost Reports',      count: 2, accent: '#10B981' },
  { label: 'Executive Reports', count: 1, accent: '#8B5CF6' },
];

function statusBadge(s: string) {
  if (s === 'Ready')    return <span className="badge badge-success">{s}</span>;
  if (s === 'In Review') return <span className="badge badge-warning">{s}</span>;
  return                       <span className="badge badge-muted">{s}</span>;
}

export default function Reports() {
  const [selected, setSelected] = useState<typeof reports[0] | null>(null);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-slide-in">

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {summaryCards.map((sc) => (
          <div key={sc.label} className="nexus-card p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${sc.accent}20` }}
            >
              <FileText size={20} style={{ color: sc.accent }} />
            </div>
            <div>
              <p className="text-[28px] font-bold text-white">{sc.count}</p>
              <p className="text-[12px] text-[#94A3B8]">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Report List + Preview */}
      <div className="flex gap-5">

        {/* Report List */}
        <div className="nexus-card flex-1 overflow-hidden min-w-0">
          {reports.map((r) => {
            const Icon = r.icon;
            const isActive = selected?.id === r.id;
            return (
              <div
                key={r.id}
                onClick={() => setSelected(isActive ? null : r)}
                className="flex items-center gap-4 px-5 py-4 border-b border-[#1E293B] cursor-pointer transition-all"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.06)' : 'transparent',
                  borderLeft: isActive ? `3px solid ${r.color}` : '3px solid transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${r.color}20` }}
                >
                  <Icon size={18} style={{ color: r.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white mb-0.5">{r.title}</p>
                  <p className="text-[11px] text-[#64748B]">{r.date} · {r.pages}p · {r.size}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge badge-primary">{r.category}</span>
                  {statusBadge(r.status)}
                </div>

                {/* Export Buttons */}
                <div className="flex gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button className="btn-outline text-[11px] px-2 py-1">PDF</button>
                  <button className="btn-outline text-[11px] px-2 py-1">XLS</button>
                  <button className="btn-outline text-[11px] px-2 py-1">CSV</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Drawer */}
        {selected && (
          <div className="nexus-card p-5 animate-slide-in flex-shrink-0" style={{ width: 340 }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="badge badge-primary mb-2 inline-block">{selected.category}</span>
                <h2 className="text-white leading-tight">{selected.title}</h2>
                <p className="text-[11px] text-[#64748B] mt-1">{selected.date}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-[#64748B] hover:text-white transition-colors ml-3">
                <X size={16} />
              </button>
            </div>

            <p className="text-[12px] text-[#94A3B8] mb-4 leading-relaxed">{selected.desc}</p>

            {/* Metadata 2×2 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'Pages',  val: `${selected.pages}p` },
                { label: 'Size',   val: selected.size },
                { label: 'Status', val: selected.status },
                { label: 'Format', val: selected.format },
              ].map((m) => (
                <div key={m.label} className="p-3 rounded-xl" style={{ background: '#0F172A' }}>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-[0.05em] mb-0.5">{m.label}</p>
                  <p className="text-[13px] font-semibold text-white">{m.val}</p>
                </div>
              ))}
            </div>

            {/* Document Skeleton */}
            <div className="rounded-xl overflow-hidden mb-5" style={{ background: '#0F172A', border: '1px solid #334155' }}>
              <div className="p-4 space-y-2">
                {[80, 60, 90, 50, 70, 40].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: '#334155' }} />
                ))}
                <div className="h-24 rounded-xl mt-4" style={{ background: `${selected.color}20`, border: `1px solid ${selected.color}30` }} />
                {[65, 85, 55].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full" style={{ width: `${w}%`, background: '#334155' }} />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Download size={13} /> Download PDF
              </button>
              <button className="btn-outline flex items-center gap-2">
                <FileSpreadsheet size={13} /> Excel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
