const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/logs?${query}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/alerts?${query}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchTimeline(hours = 24) {
  const res = await fetch(`${API_BASE}/stats/timeline?hours=${hours}`);
  if (!res.ok) throw new Error('Failed to fetch timeline');
  return res.json();
}

export async function generateSampleData(count = 100) {
  const res = await fetch(`${API_BASE}/generate/sample?count=${count}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate sample data');
  return res.json();
}

export async function generateBurst(type = 'brute_force', count = 20) {
  const res = await fetch(`${API_BASE}/generate/burst?burst_type=${type}&count=${count}`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate burst');
  return res.json();
}

export async function startGenerator() {
  const res = await fetch(`${API_BASE}/generator/start`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start generator');
  return res.json();
}

export async function stopGenerator() {
  const res = await fetch(`${API_BASE}/generator/stop`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to stop generator');
  return res.json();
}
