const BASE = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:5000/api';

let accessToken = null;
export function setAccessToken(token) { accessToken = token; }

async function refreshToken() {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.accessToken) accessToken = data.accessToken;
    return accessToken;
  } catch { return null; }
}

async function request(path, { method = 'GET', body, headers = {}, retry } = {}) {
  const opts = { method, headers: { ...headers } };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  if (accessToken) opts.headers['Authorization'] = `Bearer ${accessToken}`;
  opts.credentials = 'include';
  const res = await fetch(`${BASE}${path}`, opts);
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    if (res.status === 401 && !retry) {
      const rt = await refreshToken();
      if (rt) return request(path, { method, body, headers, retry: true });
    }
    const message = isJson && payload && payload.message ? payload.message : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return payload;
}

export const api = {
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
    me: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' })
  },
  workers: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/workers?${q.toString()}`);
    },
    get: (id) => request(`/workers/${id}`),
    create: (data) => request('/workers', { method: 'POST', body: data }),
    update: (id, data) => request(`/workers/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/workers/${id}`, { method: 'DELETE' }),
  }
  , loans: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/loans?${q.toString()}`);
    },
    create: (data) => request('/loans', { method: 'POST', body: data }),
    get: (id) => request(`/loans/${id}`),
    update: (id, data) => request(`/loans/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/loans/${id}`, { method: 'DELETE' })
  }
  , installments: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/installments?${q.toString()}`);
    },
    create: (data) => request('/installments', { method: 'POST', body: data }),
    get: (id) => request(`/installments/${id}`),
    update: (id, data) => request(`/installments/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/installments/${id}`, { method: 'DELETE' })
  }
  , expenses: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/expenses?${q.toString()}`);
    },
    create: (data) => request('/expenses', { method: 'POST', body: data }),
    update: (id, data) => request(`/expenses/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/expenses/${id}`, { method: 'DELETE' })
  }
  , baana: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/baana?${q.toString()}`);
    },
    create: (data) => request('/baana', { method: 'POST', body: data }),
    update: (id, data) => request(`/baana/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/baana/${id}`, { method: 'DELETE' })
  }
  , beam: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, v); });
      return request(`/beam?${q.toString()}`);
    },
    create: (data) => request('/beam', { method: 'POST', body: data }),
    update: (id, data) => request(`/beam/${id}`, { method: 'PUT', body: data }),
    remove: (id) => request(`/beam/${id}`, { method: 'DELETE' })
  },
  // Profile and security endpoints
  updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: data }),
  changePassword: (data) => request('/auth/change-password', { method: 'POST', body: data }),
  enable2FA: () => request('/auth/2fa/enable', { method: 'POST' }),
  verify2FA: (data) => request('/auth/2fa/verify', { method: 'POST', body: data }),
  disable2FA: (data) => request('/auth/2fa/disable', { method: 'POST', body: data })
};

export default api;