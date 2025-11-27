import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { setAuthToken } from '../../utils/auth';
import { FaChartLine, FaSignInAlt } from 'react-icons/fa';

const Login = ({ setIsAuthenticated, setUserType }) => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validar campos antes de enviar
    if (!formData.email || !formData.senha) {
      setError('Por favor, preencha todos os campos');
      setLoading(false);
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, insira um email válido');
      setLoading(false);
      return;
    }

    console.log('=== TENTANDO LOGIN ===');
    console.log('Email:', formData.email);
    console.log('Senha preenchida:', formData.senha ? 'Sim' : 'Não');
    console.log('URL da API:', process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

    try {
      const response = await api.post('/auth/login', {
        email: formData.email.trim(),
        senha: formData.senha
      });
      
      console.log('Resposta do servidor:', response.data);
      
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        localStorage.setItem('userType', 'gerente');
        if (setUserType) setUserType('gerente');
        setIsAuthenticated(true);
        console.log('Login bem-sucedido! Redirecionando...');
        window.location.href = '/dashboard';
      } else {
        console.error('Resposta sem token:', response.data);
        setError('Resposta inválida do servidor. Tente novamente.');
      }
    } catch (err) {
      console.error('=== ERRO NO LOGIN ===');
      console.error('Erro completo:', err);
      console.error('Detalhes do erro:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
        request: err.request
      });
      
      if (err.response) {
        // Servidor respondeu com erro
        const status = err.response.status;
        const errorData = err.response.data;
        
        console.error('Status do erro:', status);
        console.error('Dados do erro:', errorData);
        
        if (status === 401) {
          setError(errorData?.message || 'Email ou senha incorretos. Verifique suas credenciais.');
        } else if (status === 403) {
          setError(errorData?.message || 'Acesso negado. Sua conta pode estar bloqueada temporariamente.');
        } else if (status === 400) {
          // Mostrar mensagem de erro mais clara
          let errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
          
          if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (errorData?.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            // Pegar a primeira mensagem de erro
            errorMessage = errorData.errors[0].message || errorData.errors[0];
          }
          
          setError(errorMessage);
        } else if (status === 429) {
          setError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
        } else if (status === 500) {
          setError('Erro interno do servidor. Tente novamente mais tarde ou entre em contato com o suporte.');
        } else {
          setError(errorData?.message || `Erro ${status}: ${err.response.statusText || 'Erro desconhecido'}`);
        }
      } else if (err.request) {
        // Requisição foi feita mas não houve resposta
        console.error('Não houve resposta do servidor:', err.request);
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando e sua conexão com a internet.');
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        setError('Erro de rede. Verifique sua conexão com a internet e se o servidor está online.');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Tempo de conexão esgotado. O servidor pode estar lento ou offline.');
      } else {
        // Erro ao configurar a requisição
        console.error('Erro ao configurar requisição:', err);
        setError('Erro ao fazer login: ' + (err.message || 'Erro desconhecido'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(to bottom right, #169486, #14b8a6, #06b6d4)' }}>
      <div className="max-w-md w-full animate-fade-in">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#169486' }}>
              <FaChartLine className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FlowGest</h1>
            <p className="text-gray-600">Entre com suas credenciais</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              to="/recuperar-senha?tipo=gerente" 
              className="text-sm hover:underline" 
              style={{ color: '#169486' }}
            >
              Esqueci minha senha
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/cadastro" className="font-semibold hover:underline" style={{ color: '#169486' }}>
                Cadastre-se
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <Link to="/login-dono" className="hover:underline">
                Sou dono da loja
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

