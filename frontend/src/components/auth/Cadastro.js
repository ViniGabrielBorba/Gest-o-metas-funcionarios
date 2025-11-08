import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { setAuthToken } from '../../utils/auth';
import { FaChartLine, FaUserPlus } from 'react-icons/fa';

const Cadastro = ({ setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    nomeLoja: '',
    cnpj: '',
    telefone: ''
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

    try {
      const response = await api.post('/auth/cadastro', formData);
      
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        setIsAuthenticated(true);
        window.location.href = '/dashboard';
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      
      if (err.response) {
        // Servidor respondeu com erro
        const errorData = err.response.data;
        
        // Se houver erros de validação, mostrar todos
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => e.message).join(', ');
          setError(`Erro de validação: ${errorMessages}`);
        } else {
          setError(errorData?.message || `Erro ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Requisição foi feita mas não houve resposta
        setError('Não foi possível conectar ao servidor. Verifique se o backend está rodando e se a URL está correta.');
      } else {
        // Erro ao configurar a requisição
        setError('Erro ao fazer cadastro: ' + (err.message || 'Erro desconhecido'));
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
            <p className="text-gray-600">Crie sua conta de gerente</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha (mín. 8 caracteres, 1 maiúscula, 1 número, 1 especial)
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                className="input-field"
                required
                minLength={8}
                placeholder="Ex: MinhaSenha123!@#"
              />
              <p className="text-xs text-gray-500 mt-1">
                A senha deve conter: mínimo 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial (@$!%*?&)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Loja
              </label>
              <input
                type="text"
                name="nomeLoja"
                value={formData.nomeLoja}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ (opcional)
              </label>
              <input
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone (opcional)
              </label>
              <input
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#169486' }}>
                Faça login
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-4">
              <Link to="/cadastro-dono" className="hover:underline">
                Sou dono da loja
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;





