import axios from 'axios';

// Create configured Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('campus_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('campus_auth_token');
        localStorage.removeItem('campus_auth_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Items Endpoints
export const itemService = {
  getAll: (params) => api.get('/items', { params }),
  getById: (id) => api.get(`/items/${id}`),
  create: (itemData) => api.post('/items', itemData),
  update: (id, itemData) => api.put(`/items/${id}`, itemData),
  delete: (id) => api.delete(`/items/${id}`),
  getMatches: (id) => api.get(`/items/${id}/matches`),
};

// Claims Endpoints
export const claimService = {
  create: (claimData) => api.post('/claims', claimData),
  getMyClaims: () => api.get('/claims/my-claims'),
  getAdminClaims: (params) => api.get('/claims/admin/all', { params }),
  reviewClaim: (id, data) => api.put(`/claims/${id}/review`, data),
};

// Users Endpoints
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAdminUsers: (params) => api.get('/users/admin/all', { params }),
  createAdminUser: (data) => api.post('/users/admin', data),
  updateAdminUser: (id, data) => api.put(`/users/admin/${id}`, data),
  deleteAdminUser: (id) => api.delete(`/users/admin/${id}`),
};

// Dashboard Endpoints
export const dashboardService = {
  getUserStats: () => api.get('/dashboard/user'),
  getAdminStats: () => api.get('/dashboard/admin'),
};

export default api;
