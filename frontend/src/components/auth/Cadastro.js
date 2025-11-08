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
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    // Limpar erro do campo específico quando o usuário começar a digitar
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Preparar dados (remover campos vazios opcionais)
      const dataToSend = {
        ...formData,
        cnpj: (formData.cnpj && formData.cnpj.trim()) || undefined,
        telefone: (formData.telefone && formData.telefone.trim()) || undefined
      };

      console.log('Enviando dados:', dataToSend);

      const response = await api.post('/auth/cadastro', dataToSend);
      
      if (response.data && response.data.token) {
        setAuthToken(response.data.token);
        setIsAuthenticated(true);
        window.location.href = '/dashboard';
      } else {
        setError('Resposta inválida do servidor');
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      console.error('Resposta do servidor:', err.response?.data);
      
      if (err.response) {
        // Servidor respondeu com erro
        const errorData = err.response.data;
        
        // Se houver erros de validação por campo
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorsByField = {};
          const generalErrors = [];
          
          errorData.errors.forEach(error => {
            if (error.field) {
              errorsByField[error.field] = error.message;
            } else {
              generalErrors.push(error.message);
            }
          });
          
          setFieldErrors(errorsByField);
          
          if (generalErrors.length > 0) {
            setError(generalErrors.join(', '));
          } else if (Object.keys(errorsByField).length > 0) {
            // Mostrar primeiro erro como mensagem geral também
            const firstError = errorData.errors[0];
            setError(`Erro de validação: ${firstError.message}`);
          }
        } else {
          setError(errorData?.message || `Erro ${err.response.status}: ${err.response.statusText}`);
        }
      } else if (err.request) {
        // Requisição foi feita mas não houve resposta
        console.error('Não houve resposta do servidor:', err.request);
        setError('Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está online.');
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('Erro de rede. Verifique sua conexão com a internet.');
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Tempo de conexão esgotado. O servidor pode estar lento ou offline.');
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
                className={`input-field ${fieldErrors.nome ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.nome && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.nome}</p>
              )}
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
                className={`input-field ${fieldErrors.email ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
              )}
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
                className={`input-field ${fieldErrors.senha ? 'border-red-500' : ''}`}
                required
                minLength={8}
                placeholder="Ex: MinhaSenha123!@#"
              />
              {fieldErrors.senha ? (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.senha}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  A senha deve conter: mínimo 8 caracteres, 1 letra maiúscula, 1 número e 1 caractere especial (@$!%*?&)
                </p>
              )}
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
                className={`input-field ${fieldErrors.nomeLoja ? 'border-red-500' : ''}`}
                required
              />
              {fieldErrors.nomeLoja && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.nomeLoja}</p>
              )}
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
                className={`input-field ${fieldErrors.cnpj ? 'border-red-500' : ''}`}
                placeholder="00.000.000/0000-00"
              />
              {fieldErrors.cnpj && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.cnpj}</p>
              )}
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
                className={`input-field ${fieldErrors.telefone ? 'border-red-500' : ''}`}
                placeholder="(11) 98765-4321 ou 11987654321"
              />
              {fieldErrors.telefone && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.telefone}</p>
              )}
              {!fieldErrors.telefone && (
                <p className="text-xs text-gray-500 mt-1">
                  Formato: (11) 98765-4321 ou 11987654321
                </p>
              )}
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





