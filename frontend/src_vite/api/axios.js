import axios from 'axios';

// Relative '/api' works in both dev (Vite proxy) and prod (Nginx proxy)
const api = axios.create({
  baseURL: '/api'
});

// Attach the JWT (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
