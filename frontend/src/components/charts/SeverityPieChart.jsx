import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#525252',
};

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#525252', '#71717a', '#a1a1aa'];

export default function SeverityPieChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">No alert data</div>;
  }

  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={70}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={SEVERITY_COLORS[entry.name] || PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #262626', borderRadius: '8px' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', color: '#A1A1AA' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
