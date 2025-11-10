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
    // Tratar erros de autenticação
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/login-dono')) {
        removeAuthToken();
        localStorage.removeItem('userType');
        // Redirecionar para a página de login apropriada
        if (window.location.pathname.includes('/dashboard-dono')) {
          window.location.href = '/login-dono';
        } else {
          window.location.href = '/login';
        }
      }
    } else if (error.response?.status === 403) {
      // Acesso negado - tipo de usuário incorreto
      const errorMessage = error.response?.data?.message || 'Acesso negado';
      console.error('Erro 403 - Acesso negado:', errorMessage);
      
      // Se estiver tentando acessar área do dono mas o token é de gerente
      if (window.location.pathname.includes('/dashboard-dono')) {
        console.warn('Token não é do tipo dono. Redirecionando para login do dono...');
        removeAuthToken();
        localStorage.removeItem('userType');
        // Não redirecionar automaticamente, apenas mostrar erro
        // O componente pode tratar isso
      }
    }
    return Promise.reject(error);
  }
);

export default api;

