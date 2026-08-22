import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TimelineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 font-mono text-xs">
        No timeline data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
        <XAxis
          dataKey="timestamp"
          stroke="#71717a"
          fontSize={11}
          tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        />
        <YAxis stroke="#71717a" fontSize={11} />
        <Tooltip
          contentStyle={{ backgroundColor: '#0D0D0D', border: '1px solid #262626', borderRadius: '8px' }}
          labelStyle={{ color: '#A1A1AA' }}
          labelFormatter={(v) => new Date(v).toLocaleString()}
        />
        <Line type="monotone" dataKey="total" stroke="#FAFAFA" strokeWidth={2} dot={false} name="Total Logs" />
        <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={2} dot={false} name="Anomalies" />
      </LineChart>
    </ResponsiveContainer>
  );
}
