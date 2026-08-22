import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

/* ── Types ── */

interface Message {
  role: 'user' | 'ai';
  content: string;
  isRestricted?: boolean;
}

/* ── AI Responses ── */

const aiResponses = [
  "Based on my analysis of your workforce data, I've identified 3 high-priority optimization opportunities that could save **$3.6M annually**. The Engineering department shows the highest redundancy overlap at 34%, while Sales has the highest attrition risk at 18%.",
  "Looking at the performance trends, **Priya Sharma** and **Sofia Rossi** are top promotion candidates — both showing sustained 90%+ productivity for 6 consecutive months. I'd recommend fast-tracking their career development plans.",
  "Your current payroll is tracking **3.3% over budget** YTD. The primary drivers are contractor spend in Engineering (+$420K) and benefits cost escalation (+$180K). Running the Balanced Optimization scenario could close this gap by Q3.",
];

const isGreeting = (message: string): boolean => {
  const msg = message.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const greetingWords = ['hi', 'hello', 'hey', 'howdy', 'yo', 'greetings', 'sup', 'there', 'good', 'morning', 'afternoon', 'evening'];
  const words = msg.split(/\s+/);
  return words.length <= 4 && words.every(w => greetingWords.includes(w) || w === 'copilot' || w === 'ai' || w === 'assistant' || w === '');
};

const isWorkforceRelated = (message: string): boolean => {
  if (isGreeting(message)) return true;
  
  const msg = message.toLowerCase();
  
  // List of workforce, HR, organizational, and budget keywords
  const keywords = [
    'workforce', 'employee', 'staff', 'salary', 'payroll', 'hiring', 'attrition', 
    'performance', 'team', 'manager', 'optimization', 'retention', 'recruit', 
    'contractor', 'job', 'career', 'promote', 'promotion', 'talent', 'skills', 
    'sales', 'engineering', 'headcount', 'department', 'hr', 'human resources', 
    'cost', 'spend', 'budget', 'saving', 'simulator', 'schedule', 'audit', 
    'access', 'permission', 'role', 'redundancy', 'bonus', 'benefit', 'hire', 
    'fire', 'terminate', 'onboard', 'candidate', 'cv', 'resume', 'skill',
    'developer', 'designer', 'work', 'productive', 'productivity', 'burnout',
    'compensation', 'wage', 'org', 'structure', 'restructur', 'tenure', 'retire',
    'pension', 'training', 'onboarding', 'recruiting', 'vacation', 'leave', 'holiday',
    'absent', 'absence', 'overtime', 'fte', 'full-time', 'part-time', 'temp',
    'workplace', 'remote', 'hybrid', 'office', 'culture', 'diversity', 'equity', 'inclusion',
    'dei', 'satisfaction', 'morale', 'survey', 'exit', 'interview'
  ];

  // Also match quick prompts exactly
  const quickPrompts = [
    'who are promotion candidates?',
    'show me attrition risks',
    'which teams are declining?',
    'create a cost reduction plan'
  ];

  if (quickPrompts.includes(msg.trim().toLowerCase())) return true;
  
  return keywords.some(keyword => msg.includes(keyword));
};

const getAIResponse = (userMsg: string): { content: string; isRestricted: boolean } => {
  if (isGreeting(userMsg)) {
    return {
      content: "Hello! How can I assist you with your workforce optimization, performance analysis, or restructuring plans today?",
      isRestricted: false
    };
  }

  if (!isWorkforceRelated(userMsg)) {
    return {
      content: "⚠️ **Restricted Query:** I am configured to only answer questions related to workforce management, employee performance, retention, organization structures, and departmental budgets. Please ask a workforce-related question.",
      isRestricted: true
    };
  }

  const msg = userMsg.toLowerCase();
  
  if (msg.includes('promotion') || msg.includes('candidate') || msg.includes('promote')) {
    return {
      content: "Looking at the performance trends, **Priya Sharma** (Engineering) and **Sofia Rossi** (Sales) are top promotion candidates — both showing sustained 90%+ productivity for 6 consecutive months. I'd recommend fast-tracking their career development plans.",
      isRestricted: false
    };
  }
  
  if (msg.includes('attrition') || msg.includes('risk') || msg.includes('burnout')) {
    return {
      content: "I've detected a high attrition/burnout risk for **David Kim** (burnout probability at 78%) and the Sales department (overall risk at 18%). Immediate intervention is recommended to prevent replacement costs.",
      isRestricted: false
    };
  }
  
  if (msg.includes('cost') || msg.includes('saving') || msg.includes('reduction') || msg.includes('budget') || msg.includes('spend')) {
    return {
      content: "Your current payroll is tracking **3.3% over budget** YTD. The primary drivers are contractor spend in Engineering (+$420K) and benefits cost escalation (+$180K). Running the Balanced Optimization scenario could save **$3.6M annually**.",
      isRestricted: false
    };
  }
  
  if (msg.includes('skills') || msg.includes('overlap') || msg.includes('teams') || msg.includes('department') || msg.includes('declining')) {
    return {
      content: "Based on my analysis, the Engineering department shows the highest redundancy/skill overlap at 34%, while Sales has the highest attrition risk at 18%. Running a skill consolidation program in Engineering could save up to **$840K/yr**.",
      isRestricted: false
    };
  }

  // Fallback random workforce answer
  const randomAnswers = [
    "Based on my analysis of your workforce data, I've identified 3 high-priority optimization opportunities that could save **$3.6M annually**. The Engineering department shows the highest redundancy overlap at 34%, while Sales has the highest attrition risk at 18%.",
    "Your current span of control averages 4.2. Benchmarks suggest adjusting this to 6-7 could flatten layers and increase structural efficiency by 15% across all operational departments.",
    "Headcount is forecasted to increase by 8.4% by Q4. I recommend running a workforce planning model to align this hiring trend with current talent capacity."
  ];
  return {
    content: randomAnswers[Math.floor(Math.random() * randomAnswers.length)],
    isRestricted: false
  };
};

/* ── Recommendations ── */

const recommendations = [
  {
    category: 'Cost',     categoryAccent: '#3B82F6',
    risk: 'Low',          riskAccent: '#10B981',
    title: 'Reduce Engineering Contractor Spend',
    confidence: 94,       confidenceAccent: '#10B981',
    why: 'Analysis of 18 contractor roles reveals 34% skill overlap with FTE employees. Consolidation aligns with Q2 headcount plan.',
    impact: '$840K/yr saved',
    riskFactors: ['Requires 30-day transition period', 'Knowledge transfer risk for 3 roles'],
  },
  {
    category: 'Structure', categoryAccent: '#8B5CF6',
    risk: 'Medium',        riskAccent: '#F59E0B',
    title: 'Flatten Sales Management Hierarchy',
    confidence: 78,        confidenceAccent: '#F59E0B',
    why: 'Sales org has 4.2 average span of control vs industry benchmark of 7–8. Two management layers can be merged without performance degradation.',
    impact: '+12% quota attainment',
    riskFactors: ['Change management complexity', 'Potential flight risk for 2 mid-managers', 'Q3 timing sensitivity'],
  },
  {
    category: 'Retention', categoryAccent: '#EF4444',
    risk: 'High',           riskAccent: '#EF4444',
    title: 'Immediate Intervention: David Kim',
    confidence: 91,         confidenceAccent: '#10B981',
    why: 'Burnout probability at 78%. Workload 40% above team average. Decline in performance score over past 6 weeks detected.',
    impact: 'Prevent $180K replacement cost',
    riskFactors: ['Flight risk at 65% — requires immediate manager action', 'Critical production systems knowledge'],
  },
];

export default function AICopilot() {
  const [messages, setMessages]   = useState<Message[]>([
    { role: 'ai', content: "Hello! I'm your **Workforce AI Copilot**. I can help you analyze performance, predict risks, recommend optimizations, and create restructuring plans. What would you like to explore today?" },
  ]);
  const [input,    setInput]      = useState('');
  const [typing,   setTyping]     = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const res = getAIResponse(msg);
      setMessages((prev) => [...prev, { role: 'ai', content: res.content, isRestricted: res.isRestricted }]);
    }, 1400);
  };

  const renderText = (text: string) =>
    text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#F1F5F9">$1</strong>');

  return (
    <div className="flex-1 flex gap-5 p-6 overflow-hidden animate-slide-in">

      {/* ── Left: Chat ── */}
      <div className="flex-1 nexus-card flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-[#334155] flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center neural-glow"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
          >
            <Sparkles size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-white">Workforce AI Copilot</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[11px] text-[#64748B]">Online · GPT-4 Workforce Model</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-4 py-3 text-[13px] leading-relaxed animate-fade-in"
                style={{
                  background: msg.role === 'user' 
                    ? '#3B82F6' 
                    : msg.isRestricted 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : 'rgba(255,255,255,0.05)',
                  border: msg.role === 'user' 
                    ? 'none' 
                    : msg.isRestricted 
                      ? '1px solid rgba(239, 68, 68, 0.3)' 
                      : '1px solid #334155',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  color: msg.isRestricted ? '#F87171' : '#F1F5F9',
                }}
                dangerouslySetInnerHTML={{ __html: renderText(msg.content) }}
              />
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 flex items-center gap-1.5"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #334155', borderRadius: '16px 16px 16px 4px' }}
              >
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts (only shown initially) */}
        {messages.length === 1 && (
          <div className="px-5 pb-3 grid grid-cols-2 gap-2">
            {[
              'Who are promotion candidates?',
              'Show me attrition risks',
              'Which teams are declining?',
              'Create a cost reduction plan',
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-[12px] px-3 py-2 rounded-xl text-[#94A3B8] transition-all"
                style={{ background: '#0F172A', border: '1px solid #334155' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3B82F6'; (e.currentTarget as HTMLElement).style.color = '#3B82F6'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#334155'; (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-[#334155] flex gap-3 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything about your workforce..."
            className="flex-1 px-4 py-2.5 rounded-[10px] text-[13px] outline-none"
            style={{ background: '#0F172A', border: '1px solid #334155', color: '#F1F5F9' }}
          />
          <button
            onClick={() => sendMessage()}
            className="w-10 h-10 rounded-[10px] flex items-center justify-center"
            style={{ background: '#3B82F6' }}
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
      </div>

      {/* ── Right: Recommendation Cards ── */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
        {recommendations.map((rec) => (
          <div key={rec.title} className="nexus-card p-5">
            {/* Top Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex gap-2">
                <span className="badge" style={{ background: `${rec.categoryAccent}20`, border: `1px solid ${rec.categoryAccent}40`, color: rec.categoryAccent }}>
                  {rec.category}
                </span>
                <span className="badge" style={{ background: `${rec.riskAccent}20`, border: `1px solid ${rec.riskAccent}40`, color: rec.riskAccent }}>
                  {rec.risk} Risk
                </span>
              </div>
              <span className="text-[22px] font-bold" style={{ color: rec.confidenceAccent }}>{rec.confidence}%</span>
            </div>

            <p className="text-[14px] font-bold text-white mb-2">{rec.title}</p>

            {/* Confidence Bar */}
            <div className="progress-bar mb-4">
              <div className="progress-fill" style={{ width: `${rec.confidence}%`, background: rec.confidenceAccent }} />
            </div>

            {/* Why This */}
            <div className="p-3 rounded-xl mb-3" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles size={12} style={{ color: '#3B82F6' }} />
                <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ color: '#3B82F6' }}>Why this recommendation</span>
              </div>
              <p className="text-[12px] text-[#94A3B8] leading-relaxed">{rec.why}</p>
            </div>

            {/* Impact + Buttons */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] font-bold" style={{ color: '#10B981' }}>{rec.impact}</span>
              <div className="flex gap-2">
                <button className="btn-outline text-[11px] px-3 py-1.5">Dismiss</button>
                <button className="btn-primary text-[11px] px-3 py-1.5">Apply</button>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="space-y-1.5">
              {rec.riskFactors.map((rf) => (
                <div key={rf} className="flex items-start gap-2">
                  <AlertCircle size={12} style={{ color: rec.riskAccent, flexShrink: 0, marginTop: 2 }} />
                  <span className="text-[11px] text-[#64748B]">{rf}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
