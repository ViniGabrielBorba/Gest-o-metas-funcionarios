import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { FaChartLine, FaEnvelope, FaLock, FaArrowLeft, FaCheck } from 'react-icons/fa';

const RecuperarSenha = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const tipo = searchParams.get('tipo') || 'gerente'; // 'gerente' ou 'dono'
  
  const [email, setEmail] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [etapa, setEtapa] = useState(token ? 'redefinir' : 'solicitar'); // 'solicitar', 'enviado', 'redefinir', 'sucesso'

  const handleSolicitarRecuperacao = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setMensagem('');

    try {
      const endpoint = tipo === 'dono' ? '/dono/recuperar-senha' : '/auth/recuperar-senha';
      await api.post(endpoint, { email: email.trim().toLowerCase() });
      setEtapa('enviado');
      setMensagem('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error) {
      console.error('Erro ao solicitar recuperação:', error);
      setErro(error.response?.data?.message || 'Erro ao enviar email de recuperação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (novaSenha.length < 8) {
      setErro('A senha deve ter no mínimo 8 caracteres');
      setLoading(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      setLoading(false);
      return;
    }

    try {
      const endpoint = tipo === 'dono' ? '/dono/reset-senha' : '/auth/reset-senha';
      await api.post(endpoint, { token, senha: novaSenha });
      setEtapa('sucesso');
      setMensagem('Senha redefinida com sucesso!');
    } catch (error) {
      console.error('Erro ao redefinir senha:', error);
      setErro(error.response?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  const loginUrl = tipo === 'dono' ? '/login-dono' : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(to bottom right, #169486, #14b8a6, #06b6d4)' }}>
      <div className="max-w-md w-full animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#169486' }}>
              {etapa === 'sucesso' ? (
                <FaCheck className="text-white text-2xl" />
              ) : (
                <FaChartLine className="text-white text-2xl" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">FlowGest</h1>
            <p className="text-gray-600">
              {etapa === 'solicitar' && 'Recuperar Senha'}
              {etapa === 'enviado' && 'Email Enviado'}
              {etapa === 'redefinir' && 'Nova Senha'}
              {etapa === 'sucesso' && 'Senha Redefinida'}
            </p>
            {tipo === 'dono' && (
              <span className="inline-block mt-2 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-semibold rounded-full">
                Área do Dono
              </span>
            )}
          </div>

          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {mensagem}
            </div>
          )}

          {/* Etapa: Solicitar recuperação */}
          {etapa === 'solicitar' && (
            <form onSubmit={handleSolicitarRecuperacao} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Digite seu email cadastrado. Enviaremos um link para você redefinir sua senha.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline mr-2 text-teal-600" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="seu@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: '#169486' }}
              >
                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </button>
            </form>
          )}

          {/* Etapa: Email enviado */}
          {etapa === 'enviado' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <FaEnvelope className="text-green-600 text-2xl" />
                </div>
                <p className="text-gray-600">
                  Enviamos um email para <strong>{email}</strong> com instruções para redefinir sua senha.
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Verifique também sua caixa de spam.
                </p>
              </div>
              
              <button
                onClick={() => {
                  setEtapa('solicitar');
                  setMensagem('');
                }}
                className="text-teal-600 hover:underline text-sm"
              >
                Não recebeu? Tentar novamente
              </button>
            </div>
          )}

          {/* Etapa: Redefinir senha */}
          {etapa === 'redefinir' && (
            <form onSubmit={handleRedefinirSenha} className="space-y-4">
              <p className="text-gray-600 text-sm mb-4">
                Digite sua nova senha abaixo.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLock className="inline mr-2 text-teal-600" />
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="••••••••"
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo de 8 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaLock className="inline mr-2 text-teal-600" />
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  placeholder="••••••••"
                />
                {novaSenha && confirmarSenha && novaSenha === confirmarSenha && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <FaCheck /> Senhas coincidem
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 text-white font-semibold rounded-lg transition-all disabled:opacity-50"
                style={{ backgroundColor: '#169486' }}
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </button>
            </form>
          )}

          {/* Etapa: Sucesso */}
          {etapa === 'sucesso' && (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <FaCheck className="text-green-600 text-2xl" />
                </div>
                <p className="text-gray-600">
                  Sua senha foi redefinida com sucesso! Agora você pode fazer login com sua nova senha.
                </p>
              </div>
              
              <Link
                to={loginUrl}
                className="inline-block w-full py-3 px-4 text-white font-semibold rounded-lg text-center transition-all"
                style={{ backgroundColor: '#169486' }}
              >
                Ir para Login
              </Link>
            </div>
          )}

          {/* Link para voltar ao login */}
          {(etapa === 'solicitar' || etapa === 'enviado') && (
            <div className="mt-6 text-center">
              <Link 
                to={loginUrl} 
                className="text-gray-600 hover:text-teal-600 text-sm flex items-center justify-center gap-2"
              >
                <FaArrowLeft /> Voltar ao login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;

