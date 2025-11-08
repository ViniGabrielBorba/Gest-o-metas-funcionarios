import axios from 'axios';
import { getAuthHeaders, removeAuthToken } from './auth';

// URL do backend - usar variável de ambiente ou tentar detectar automaticamente
const getApiUrl = () => {
  // Se a variável de ambiente estiver configurada, usar ela
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Se estiver em produção (Vercel), tentar usar a URL do Render
  // Por padrão, assumir que o backend está no Render
  if (process.env.NODE_ENV === 'production') {
    // URL padrão do Render (substitua pela sua URL real)
    return 'https://gest-o-metas-funcionarios-3.onrender.com/api';
  }
  
  // Em desenvolvimento, usar proxy local
  return '/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  timeout: 30000, // 30 segundos
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

