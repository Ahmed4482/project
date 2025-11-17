const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

export const authAPI = {
  signup: (email: string, password: string, full_name: string) =>
    apiCall('/api/auth/signup', {
      method: 'POST',
      body: { email, password, full_name },
    }),

  login: (email: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: () => apiCall('/api/auth/me'),
};

export const profileAPI = {
  getMe: () => apiCall('/api/profiles/me'),

  updateMe: (data: any) =>
    apiCall('/api/profiles/me', {
      method: 'PUT',
      body: data,
    }),
};

export const planAPI = {
  getAll: () => apiCall('/api/plans'),
  getById: (id: string) => apiCall(`/api/plans/${id}`),
};

export const classAPI = {
  getAll: () => apiCall('/api/classes'),
  getById: (id: string) => apiCall(`/api/classes/${id}`),
  create: (data: any) =>
    apiCall('/api/classes', {
      method: 'POST',
      body: data,
    }),
};

export const bookingAPI = {
  getAll: () => apiCall('/api/bookings'),

  create: (data: any) =>
    apiCall('/api/bookings', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiCall(`/api/bookings/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiCall(`/api/bookings/${id}`, {
      method: 'DELETE',
    }),
};

export const chatAPI = {
  getMessages: () => apiCall('/api/chat'),

  sendMessage: (message: string) =>
    apiCall('/api/chat/message', {
      method: 'POST',
      body: { message },
    }),
};

export const statsAPI = {
  getMe: () => apiCall('/api/stats'),

  updateMe: (data: any) =>
    apiCall('/api/stats', {
      method: 'PUT',
      body: data,
    }),
};