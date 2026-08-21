export const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function fetchWithAuth(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  });
  if (res.status === 401) {
    // Optionally trigger a logout or redirect here if desired
    console.error('Unauthorized request');
  }
  return res.json();
}

export async function fetchStats() {
  return fetchWithAuth(`${API_BASE}/stats`);
}

export async function fetchLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/logs?${query}`);
}

export async function fetchAlerts(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/alerts?${query}`);
}

export async function fetchAlert(id) {
  return fetchWithAuth(`${API_BASE}/alerts/${id}`);
}

export async function fetchTimeline(hours = 24) {
  return fetchWithAuth(`${API_BASE}/stats/timeline?hours=${hours}`);
}

export async function fetchMonitorStatus() {
  return fetchWithAuth(`${API_BASE}/health`);
}

export async function fetchSources() {
  return fetchWithAuth(`${API_BASE}/monitor/sources`);
}

export async function startMonitor() {
  return fetchWithAuth(`${API_BASE}/monitor/start`, { method: 'POST' });
}

export async function stopMonitor() {
  return fetchWithAuth(`${API_BASE}/monitor/stop`, { method: 'POST' });
}

export async function resolveAlert(id, note = '') {
  return fetchWithAuth(`${API_BASE}/alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolutionNote: note })
  });
}

export async function fetchRelatedLogs(params = {}) {
  const query = new URLSearchParams(params).toString();
  return fetchWithAuth(`${API_BASE}/investigation/logs/related?${query}`);
}

export async function fetchIpInvestigation(ip) {
  return fetchWithAuth(`${API_BASE}/investigation/ip/${ip}`);
}

export async function fetchRules() {
  return fetchWithAuth(`${API_BASE}/rules`);
}

export async function updateRule(id, data) {
  return fetchWithAuth(`${API_BASE}/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function fetchSettings() {
  return fetchWithAuth(`${API_BASE}/settings`);
}

export async function updateSettings(data) {
  return fetchWithAuth(`${API_BASE}/settings`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}
