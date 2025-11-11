const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    apiCall('/auth/signup', {
      method: 'POST',
      body: { email, password, full_name },
    }),

  login: (email: string, password: string) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  getMe: () => apiCall('/auth/me'),
};

export const profileAPI = {
  getMe: () => apiCall('/profiles/me'),

  updateMe: (data: any) =>
    apiCall('/profiles/me', {
      method: 'PUT',
      body: data,
    }),
};

export const planAPI = {
  getAll: () => apiCall('/plans'),
  getById: (id: string) => apiCall(`/plans/${id}`),
};

export const classAPI = {
  getAll: () => apiCall('/classes'),
  getById: (id: string) => apiCall(`/classes/${id}`),
  create: (data: any) =>
    apiCall('/classes', {
      method: 'POST',
      body: data,
    }),
};

export const bookingAPI = {
  getAll: () => apiCall('/bookings'),

  create: (data: any) =>
    apiCall('/bookings', {
      method: 'POST',
      body: data,
    }),

  update: (id: string, data: any) =>
    apiCall(`/bookings/${id}`, {
      method: 'PUT',
      body: data,
    }),

  delete: (id: string) =>
    apiCall(`/bookings/${id}`, {
      method: 'DELETE',
    }),
};

export const chatAPI = {
  getMessages: () => apiCall('/chat'),

  sendMessage: (message: string) =>
    apiCall('/chat/message', {
      method: 'POST',
      body: { message },
    }),
};

export const statsAPI = {
  getMe: () => apiCall('/stats'),

  updateMe: (data: any) =>
    apiCall('/stats', {
      method: 'PUT',
      body: data,
    }),
};
