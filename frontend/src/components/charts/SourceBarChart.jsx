import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SourceBarChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500 font-mono text-xs">No source data</div>;
  }

  const chartData = Object.entries(data)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
        <YAxis stroke="#71717a" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #262626', borderRadius: '8px' }}
        />
        <Bar dataKey="value" fill="#E4E4E7" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
