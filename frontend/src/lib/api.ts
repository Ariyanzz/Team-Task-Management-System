import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const { data } = await apiClient.post('/auth/register', { name, email, password });
    return data;
  },
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    return data;
  },
  getMe: async () => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },
};

// ─── Tasks ───────────────────────────────────────────────────────────────────
export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate: string;
  assignedTo?: string;
  tags?: string[];
}

export const tasksApi = {
  getAll: async (filters: TaskFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.append(k, String(v));
    });
    const { data } = await apiClient.get(`/tasks?${params}`);
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await apiClient.get(`/tasks/${id}`);
    return data;
  },
  create: async (payload: TaskPayload) => {
    const { data } = await apiClient.post('/tasks', payload);
    return data;
  },
  update: async (id: string, payload: Partial<TaskPayload>) => {
    const { data } = await apiClient.put(`/tasks/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    const { data } = await apiClient.delete(`/tasks/${id}`);
    return data;
  },
  getStats: async () => {
    const { data } = await apiClient.get('/tasks/stats');
    return data;
  },
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: async () => {
    const { data } = await apiClient.get('/users');
    return data;
  },
  updateProfile: async (name: string) => {
    const { data } = await apiClient.put('/users/profile', { name });
    return data;
  },
};
