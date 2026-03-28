import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
  withCredentials: true, // sends httpOnly cookies
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Cookie expired or invalid — reload to trigger auth check
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
