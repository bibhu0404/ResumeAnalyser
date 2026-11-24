import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentToken = localStorage.getItem('token');
      if (currentToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (fullName, email, password) => {
    const response = await api.post('/auth/register', { fullName, email, password });
    return response.data;
  },
  googleLogin: async (idToken) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const resumeApi = {
  getAll: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },
  uploadFile: async (formData) => {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  createText: async (resumeData) => {
    const response = await api.post('/resumes/text', resumeData);
    return response.data;
  },
  update: async (id, resumeData) => {
    const response = await api.put(`/resumes/${id}`, resumeData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  },
};

export const analysisApi = {
  analyze: async (resumeId, { targetRole, jobDescription } = {}) => {
    const response = await api.post(`/resumes/${resumeId}/analyze`, {
      targetRole,
      jobDescription,
    });
    return response.data;
  },
  getHistory: async (resumeId) => {
    const response = await api.get(`/resumes/${resumeId}/analyses`);
    return response.data;
  },
  getById: async (analysisId) => {
    const response = await api.get(`/analyses/${analysisId}`);
    return response.data;
  },
  getRecent: async () => {
    const response = await api.get('/analyses/recent');
    return response.data;
  },
};

export const dashboardApi = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export default api;
