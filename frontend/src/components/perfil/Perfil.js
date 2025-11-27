import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import api from '../../utils/api';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaStore, 
  FaIdCard,
  FaLock,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaTimes,
  FaCheck
} from 'react-icons/fa';

const Perfil = ({ setIsAuthenticated }) => {
  const { showToast } = useToast();
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [gerente, setGerente] = useState(null);
  
  // Estados para edição
  const [editando, setEditando] = useState({
    dados: false,
    senha: false
  });
  
  // Formulário de dados
  const [formDados, setFormDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    nomeLoja: '',
    cnpj: ''
  });
  
  // Formulário de senha
  const [formSenha, setFormSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });
  
  // Visibilidade das senhas
  const [mostrarSenha, setMostrarSenha] = useState({
    atual: false,
    nova: false,
    confirmar: false
  });

  useEffect(() => {
    fetchPerfil();
  }, []);

  const fetchPerfil = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setGerente(response.data);
      setFormDados({
        nome: response.data.nome || '',
        email: response.data.email || '',
        telefone: response.data.telefone || '',
        nomeLoja: response.data.nomeLoja || '',
        cnpj: response.data.cnpj || ''
      });
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      showToast('Erro ao carregar dados do perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarDados = async () => {
    try {
      setSaving(true);
      
      // Validações
      if (!formDados.nome.trim()) {
        showToast('Nome é obrigatório', 'error');
        return;
      }
      if (!formDados.email.trim()) {
        showToast('Email é obrigatório', 'error');
        return;
      }
      if (!formDados.nomeLoja.trim()) {
        showToast('Nome da loja é obrigatório', 'error');
        return;
      }
      
      const response = await api.put('/auth/perfil', {
        nome: formDados.nome.trim(),
        email: formDados.email.trim().toLowerCase(),
        telefone: formDados.telefone.trim(),
        nomeLoja: formDados.nomeLoja.trim(),
        cnpj: formDados.cnpj.trim()
      });
      
      setGerente(response.data.gerente);
      setEditando({ ...editando, dados: false });
      showToast('Dados atualizados com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showToast(error.response?.data?.message || 'Erro ao atualizar dados', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAlterarSenha = async () => {
    try {
      setSaving(true);
      
      // Validações
      if (!formSenha.senhaAtual) {
        showToast('Senha atual é obrigatória', 'error');
        return;
      }
      if (!formSenha.novaSenha) {
        showToast('Nova senha é obrigatória', 'error');
        return;
      }
      if (formSenha.novaSenha.length < 8) {
        showToast('Nova senha deve ter no mínimo 8 caracteres', 'error');
        return;
      }
      if (formSenha.novaSenha !== formSenha.confirmarSenha) {
        showToast('As senhas não coincidem', 'error');
        return;
      }
      
      await api.put('/auth/alterar-senha', {
        senhaAtual: formSenha.senhaAtual,
        novaSenha: formSenha.novaSenha
      });
      
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
      setEditando({ ...editando, senha: false });
      showToast('Senha alterada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      showToast(error.response?.data?.message || 'Erro ao alterar senha', 'error');
    } finally {
      setSaving(false);
    }
  };

  const cancelarEdicao = (tipo) => {
    if (tipo === 'dados') {
      setFormDados({
        nome: gerente?.nome || '',
        email: gerente?.email || '',
        telefone: gerente?.telefone || '',
        nomeLoja: gerente?.nomeLoja || '',
        cnpj: gerente?.cnpj || ''
      });
    } else if (tipo === 'senha') {
      setFormSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    }
    setEditando({ ...editando, [tipo]: false });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-3`}>
            <FaUser className="text-teal-600" />
            Meu Perfil
          </h1>
          <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gerencie suas informações pessoais e configurações de segurança
          </p>
        </div>

        {/* Card de Informações Pessoais */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <FaIdCard className="text-teal-600" />
              Informações Pessoais
            </h2>
            {!editando.dados ? (
              <button
                onClick={() => setEditando({ ...editando, dados: true })}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FaEdit /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => cancelarEdicao('dados')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaTimes /> Cancelar
                </button>
                <button
                  onClick={handleSalvarDados}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSave />
                  )}
                  Salvar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaUser className="inline mr-2 text-teal-600" />
                Nome
              </label>
              {editando.dados ? (
                <input
                  type="text"
                  value={formDados.nome}
                  onChange={(e) => setFormDados({ ...formDados, nome: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {gerente?.nome || '-'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaEnvelope className="inline mr-2 text-teal-600" />
                Email
              </label>
              {editando.dados ? (
                <input
                  type="email"
                  value={formDados.email}
                  onChange={(e) => setFormDados({ ...formDados, email: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {gerente?.email || '-'}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaPhone className="inline mr-2 text-teal-600" />
                Telefone
              </label>
              {editando.dados ? (
                <input
                  type="tel"
                  value={formDados.telefone}
                  onChange={(e) => setFormDados({ ...formDados, telefone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {gerente?.telefone || 'Não informado'}
                </p>
              )}
            </div>

            {/* Nome da Loja */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaStore className="inline mr-2 text-teal-600" />
                Nome da Loja
              </label>
              {editando.dados ? (
                <input
                  type="text"
                  value={formDados.nomeLoja}
                  onChange={(e) => setFormDados({ ...formDados, nomeLoja: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {gerente?.nomeLoja || '-'}
                </p>
              )}
            </div>

            {/* CNPJ */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaIdCard className="inline mr-2 text-teal-600" />
                CNPJ
              </label>
              {editando.dados ? (
                <input
                  type="text"
                  value={formDados.cnpj}
                  onChange={(e) => setFormDados({ ...formDados, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                      : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                />
              ) : (
                <p className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  {gerente?.cnpj || 'Não informado'}
                </p>
              )}
            </div>
          </div>

          {/* Informações adicionais */}
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">Conta criada em:</span>{' '}
                {gerente?.createdAt 
                  ? new Date(gerente.createdAt).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'
                }
              </div>
              <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                <span className="font-medium">Último login:</span>{' '}
                {gerente?.ultimoLogin 
                  ? new Date(gerente.ultimoLogin).toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Primeiro acesso'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Card de Segurança */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <FaLock className="text-teal-600" />
              Segurança
            </h2>
            {!editando.senha ? (
              <button
                onClick={() => setEditando({ ...editando, senha: true })}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <FaEdit /> Alterar Senha
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => cancelarEdicao('senha')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaTimes /> Cancelar
                </button>
                <button
                  onClick={handleAlterarSenha}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaCheck />
                  )}
                  Confirmar
                </button>
              </div>
            )}
          </div>

          {editando.senha ? (
            <div className="space-y-4 max-w-md">
              {/* Senha Atual */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Senha Atual
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha.atual ? 'text' : 'password'}
                    value={formSenha.senhaAtual}
                    onChange={(e) => setFormSenha({ ...formSenha, senhaAtual: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                        : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha({ ...mostrarSenha, atual: !mostrarSenha.atual })}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {mostrarSenha.atual ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha.nova ? 'text' : 'password'}
                    value={formSenha.novaSenha}
                    onChange={(e) => setFormSenha({ ...formSenha, novaSenha: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                        : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha({ ...mostrarSenha, nova: !mostrarSenha.nova })}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {mostrarSenha.nova ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Mínimo de 8 caracteres
                </p>
              </div>

              {/* Confirmar Nova Senha */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha.confirmar ? 'text' : 'password'}
                    value={formSenha.confirmarSenha}
                    onChange={(e) => setFormSenha({ ...formSenha, confirmarSenha: e.target.value })}
                    className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-500' 
                        : 'bg-white border-gray-300 text-gray-800 focus:border-teal-500'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha({ ...mostrarSenha, confirmar: !mostrarSenha.confirmar })}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {mostrarSenha.confirmar ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formSenha.novaSenha && formSenha.confirmarSenha && formSenha.novaSenha !== formSenha.confirmarSenha && (
                  <p className="text-xs mt-1 text-red-500">As senhas não coincidem</p>
                )}
                {formSenha.novaSenha && formSenha.confirmarSenha && formSenha.novaSenha === formSenha.confirmarSenha && (
                  <p className="text-xs mt-1 text-green-500 flex items-center gap-1">
                    <FaCheck /> Senhas coincidem
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p>Sua senha está protegida. Clique em "Alterar Senha" para modificá-la.</p>
              <p className="text-sm mt-2">
                Recomendamos usar uma senha forte com pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil;

