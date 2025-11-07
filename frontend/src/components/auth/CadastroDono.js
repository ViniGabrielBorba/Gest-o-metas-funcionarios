import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartLine } from 'react-icons/fa';
import api from '../../utils/api';
import { setAuthToken } from '../../utils/auth';
import { useToast } from '../../contexts/ToastContext';

const CadastroDono = ({ setIsAuthenticated }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/dono/cadastro', { nome, email, senha });
      setAuthToken(response.data.token);
      localStorage.setItem('userType', 'dono');
      setIsAuthenticated(true);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/dashboard-dono');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#169486' }}>
            <FaChartLine className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">FlowGest</h1>
          <p className="text-gray-600">Cadastro do Dono</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field"
              placeholder="Seu nome completo"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="input-field"
              placeholder="Digite a senha novamente"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #169486, #14b8a6, #06b6d4)' }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem conta?{' '}
            <Link to="/login-dono" className="font-semibold hover:underline" style={{ color: '#169486' }}>
              Faça login
            </Link>
          </p>
          <p className="text-sm text-gray-500 mt-4">
            <Link to="/cadastro" className="hover:underline">
              Sou gerente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CadastroDono;

