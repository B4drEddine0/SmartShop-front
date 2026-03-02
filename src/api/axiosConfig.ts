import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  // In dev, use relative /api so requests go through the Vite proxy (same-origin).
  // This avoids cross-origin SameSite cookie restrictions when the backend is on a different domain.
  // In production (Vercel), call the backend directly.
  baseURL: import.meta.env.DEV
    ? '/api'
    : 'https://smartshop-vfqs.onrender.com/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        // Clear persisted auth so the guard doesn't restore a stale session
        localStorage.removeItem('smartshop-auth');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
