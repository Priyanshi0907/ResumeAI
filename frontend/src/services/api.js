import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resumeai-97zr.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resumeai_token') || localStorage.getItem('resumeai_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  adminLogin: (data) => api.post('/auth/admin-login', data),
};

export const analyzerApi = {
  analyze: (formData) =>
    api.post('/analyzer/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAiTips: (resumeText) => api.post('/analyzer/ai-tips', { resume_text: resumeText }),
};

export const matcherApi = {
  match: (data) => api.post('/matcher/match', data),
  tailor: (data) => api.post('/matcher/tailor', data),
  coverLetter: (data) => api.post('/matcher/cover-letter', data),
  exportPdf: (data) =>
    api.post('/matcher/export-pdf', data, {
      responseType: 'blob',
    }),
};

export const feedbackApi = {
  getAll: () => api.get('/feedback'),
  create: (data) => api.post('/feedback', data),
  update: (id, data) => api.put(`/feedback/${id}`, data),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const adminApi = {
  getMetrics: () => api.get('/admin/metrics'),
  getUsers: (search = '') => api.get(`/admin/users?search=${encodeURIComponent(search)}`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPdfs: () => api.get('/admin/pdfs'),
  exportCsvUrl: `${API_BASE_URL}/admin/export-csv`,
};

export const resourcesApi = {
  getCourses: () => api.get('/resources/courses'),
  getVideos: () => api.get('/resources/videos'),
  getInsights: () => api.get('/resources/insights'),
};

export default api;
