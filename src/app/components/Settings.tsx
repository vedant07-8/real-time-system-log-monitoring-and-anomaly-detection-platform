import { useState } from 'react';
import { CheckCircle, XCircle, Shield, Users, Activity, Lock, Globe, Eye } from 'lucide-react';

/* ── Tab Content Data ── */

const roles = [
  { name: 'Super Admin', color: '#EF4444', desc: 'Full system access — all modules, all data', users: 2 },
  { name: 'Executive',   color: '#8B5CF6', desc: 'Read all + approve recommendations',          users: 8 },
  { name: 'HR Manager',  color: '#3B82F6', desc: 'Manage employees, run reports, AI copilot',   users: 14 },
  { name: 'Analyst',     color: '#10B981', desc: 'Analytics, forecasting, read-only employees',  users: 22 },
  { name: 'Viewer',      color: '#94A3B8', desc: 'Read-only access to dashboard and reports',    users: 45 },
];

const jwtSettings = [
  { label: 'Token Expiry',    val: '15 minutes'   },
  { label: 'Refresh Token',   val: '7 days'        },
  { label: 'Algorithm',       val: 'RS256'         },
  { label: 'MFA Enabled',     val: 'Yes'           },
];

const modules = ['Dashboard', 'Employee Analytics', 'Optimization', 'Simulator', 'AI Copilot', 'Forecasting', 'Reports'];
const roleTypes = ['Super Admin', 'Executive', 'HR Manager', 'Analyst', 'Viewer'];
const rbacMatrix: Record<string, boolean[]> = {
  'Dashboard':          [true,  true,  true,  true,  true  ],
  'Employee Analytics': [true,  true,  true,  true,  false ],
  'Optimization':       [true,  true,  false, true,  false ],
  'Simulator':          [true,  true,  false, false, false ],
  'AI Copilot':         [true,  true,  true,  false, false ],
  'Forecasting':        [true,  true,  false, true,  false ],
  'Reports':            [true,  true,  true,  true,  true  ],
};

const auditLogs = [
  { user: 'Admin User', action: 'Exported Q4 Workforce Report', resource: 'Reports Center', ip: '192.168.1.10', time: '2 min ago',  color: '#3B82F6', initials: 'AU' },
  { user: 'Sarah Chen', action: 'Ran Cost Reduction Simulation', resource: 'Simulator',     ip: '10.0.0.42',    time: '14 min ago', color: '#10B981', initials: 'SC' },
  { user: 'Admin User', action: 'Updated RBAC permissions',      resource: 'Settings',      ip: '192.168.1.10', time: '1 hr ago',   color: '#3B82F6', initials: 'AU' },
  { user: 'Priya Sharma', action: 'Accessed Employee Profile',   resource: 'Analytics',     ip: '10.0.0.58',    time: '2 hr ago',   color: '#8B5CF6', initials: 'PS' },
  { user: 'David Kim',  action: 'Failed login attempt (×3)',     resource: 'Auth',          ip: '203.0.113.5',  time: '4 hr ago',   color: '#EF4444', initials: 'DK' },
];

const secFeatures = [
  { icon: Shield,   title: 'Two-Factor Auth',       desc: 'TOTP / SMS verification on every login',      enabled: true,  color: '#10B981' },
  { icon: Activity, title: 'Session Management',    desc: 'Auto-expire idle sessions after 30 minutes',  enabled: true,  color: '#3B82F6' },
  { icon: Globe,    title: 'IP Allowlisting',       desc: 'Restrict access to corporate IP ranges only', enabled: false, color: '#F59E0B' },
  { icon: Lock,     title: 'Data Encryption',       desc: 'AES-256 encryption at rest and in transit',   enabled: true,  color: '#10B981' },
  { icon: Users,    title: 'Single Sign-On (SSO)',  desc: 'SAML 2.0 / OIDC integration enabled',        enabled: true,  color: '#8B5CF6' },
  { icon: Eye,      title: 'Vulnerability Scanning', desc: 'Automated weekly dependency audit',          enabled: false, color: '#F59E0B' },
];

const TABS = ['Roles', 'RBAC', 'Audit Logs', 'Security'] as const;
type Tab = typeof TABS[number];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('Roles');

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-slide-in">

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6 p-1 rounded-xl w-fit" style={{ background: '#1E293B' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-[10px] text-[13px] font-medium transition-all"
            style={{
              background: activeTab === tab ? '#3B82F6' : 'transparent',
              color: activeTab === tab ? '#fff' : '#94A3B8',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Roles Tab ── */}
      {activeTab === 'Roles' && (
        <div className="flex flex-col gap-5">
          <div className="nexus-card overflow-hidden">
            {roles.map((role, i) => (
              <div
                key={role.name}
                className="flex items-center gap-4 px-5 py-4 border-b border-[#1E293B]"
                style={{ borderLeft: `3px solid ${role.color}` }}
              >
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: role.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white">{role.name}</p>
                  <p className="text-[11px] text-[#64748B]">{role.desc}</p>
                </div>
                <span className="badge badge-muted">{role.users} users</span>
                <button className="btn-outline text-[11px] px-3 py-1.5">Edit</button>
                {i > 0 && <button className="text-[11px] text-[#EF4444] hover:underline px-2">Delete</button>}
              </div>
            ))}
          </div>

          <div className="nexus-card p-5">
            <h2 className="mb-4">JWT Token Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              {jwtSettings.map((s) => (
                <div key={s.label} className="p-4 rounded-xl" style={{ background: '#0F172A' }}>
                  <p className="text-[11px] text-[#64748B] uppercase tracking-[0.05em] mb-1">{s.label}</p>
                  <p className="text-[14px] font-bold text-white">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RBAC Tab ── */}
      {activeTab === 'RBAC' && (
        <div className="nexus-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155] sticky top-0" style={{ background: '#0F172A' }}>
                <th className="text-left text-[11px] uppercase tracking-[0.06em] text-[#64748B] px-5 py-3 font-semibold">Module</th>
                {roleTypes.map((r) => (
                  <th key={r} className="text-center text-[11px] uppercase tracking-[0.06em] text-[#64748B] px-4 py-3 font-semibold">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod} className="border-b border-[#1E293B] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-white">{mod}</td>
                  {rbacMatrix[mod].map((allowed, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {allowed
                        ? <CheckCircle size={18} style={{ color: '#10B981', display: 'inline' }} />
                        : <XCircle    size={18} style={{ color: '#334155', display: 'inline' }} />
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Audit Logs Tab ── */}
      {activeTab === 'Audit Logs' && (
        <div className="nexus-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#334155]">
            <h2>Recent Activity</h2>
            <button className="btn-outline text-[11px] px-3 py-1.5">Export Logs</button>
          </div>
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#1E293B] hover:bg-white/[0.02] transition-colors">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-[12px] flex-shrink-0"
                style={{ background: `${log.color}30`, border: `1px solid ${log.color}50`, color: log.color }}
              >
                {log.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white">{log.user}</p>
                <p className="text-[12px] text-[#94A3B8]">{log.action}</p>
              </div>
              <span className="badge badge-muted">{log.resource}</span>
              <span className="text-[11px] text-[#64748B] font-mono">{log.ip}</span>
              <span className="text-[11px] text-[#64748B] flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Security Tab ── */}
      {activeTab === 'Security' && (
        <div className="grid grid-cols-2 gap-4">
          {secFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="nexus-card nexus-card-hover p-5 flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${feat.color}20` }}
                >
                  <Icon size={18} style={{ color: feat.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-[13px] font-semibold text-white">{feat.title}</p>
                    <span className={`badge flex-shrink-0 ${feat.enabled ? 'badge-success' : 'badge-muted'}`}>
                      {feat.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#64748B]">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
