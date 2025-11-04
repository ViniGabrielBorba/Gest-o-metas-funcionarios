import axios from 'axios';
import { getAuthHeaders, removeAuthToken } from './auth';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    config.headers = getAuthHeaders();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Só redireciona para login se não estiver já na página de login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      removeAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

