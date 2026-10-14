import axios from 'axios';

function getApiBaseUrl() {
  const configuredUrl = String(import.meta.env.VITE_API_URL || '').trim();
  if (!configuredUrl) {
    return 'http://localhost:5000/api';
  }

  const normalizedUrl = configuredUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api') ? normalizedUrl : `${normalizedUrl}/api`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
