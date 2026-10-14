import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 20000
});

api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem('narang-user');
  if (savedUser) {
    try {
      const { token } = JSON.parse(savedUser);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      localStorage.removeItem('narang-user');
    }
  }
  return config;
});

export default api;
