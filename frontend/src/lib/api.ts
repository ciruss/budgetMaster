export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as any,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      throw new Error('Unauthorized');
    }
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  
  return response.json();
};

export const api = {
  me: () => fetchApi('/me'),
  login: async (data: any) => {
    const res = await fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    if (res && res.token) {
      localStorage.setItem('token', res.token);
    }
    return res;
  },
  signup: (data: any) => fetchApi('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  
  getSummary: (ym: string) => fetchApi(`/summary/${ym}`),
  getNetWorth: (from: string, to: string) => fetchApi(`/networth?from=${from}&to=${to}`),
  
  getTransactions: (month: string) => fetchApi(`/transactions?month=${month}`),
  createTransaction: (data: any) => fetchApi('/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: number, data: any) => fetchApi(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: number) => fetchApi(`/transactions/${id}`, { method: 'DELETE' }),

  getCategories: () => fetchApi('/categories'),
  createCategory: (data: any) => fetchApi('/categories', { method: 'POST', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => fetchApi(`/categories/${id}`, { method: 'DELETE' }),
  
  getAssets: () => fetchApi('/assets'),
  createAsset: (data: any) => fetchApi('/assets', { method: 'POST', body: JSON.stringify(data) }),
  deleteAsset: (id: number) => fetchApi(`/assets/${id}`, { method: 'DELETE' }),
  getAssetSnapshots: (id: number) => fetchApi(`/assets/${id}/snapshots`),
  createAssetSnapshot: (id: number, data: any) => fetchApi(`/assets/${id}/snapshots`, { method: 'POST', body: JSON.stringify(data) }),

  getBudget: (ym: string) => fetchApi(`/budgets/${ym}`),
  upsertBudget: (ym: string, limit: number) => fetchApi(`/budgets/${ym}`, { method: 'PUT', body: JSON.stringify({ spendingLimit: limit }) }),
};
