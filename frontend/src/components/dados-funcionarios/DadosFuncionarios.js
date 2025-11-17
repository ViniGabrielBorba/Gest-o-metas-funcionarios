import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPrint,
  FaUser,
  FaSearch,
  FaIdCard,
  FaEnvelope,
  FaCreditCard
} from 'react-icons/fa';

const DadosFuncionarios = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    cpf: '',
    dataNascimento: '',
    sexo: 'Masculino',
    email: '',
    chavePix: ''
  });

  useEffect(() => {
    fetchFuncionarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      const data = response.data;
      const funcionariosArray = Array.isArray(data) 
        ? data 
        : (data?.data && Array.isArray(data.data) 
            ? data.data 
            : (data?.funcionarios && Array.isArray(data.funcionarios) 
                ? data.funcionarios 
                : []));
      setFuncionarios(funcionariosArray);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  const getNomeCompleto = (funcionario) => {
    if (funcionario.sobrenome && funcionario.sobrenome.trim() !== '') {
      return `${funcionario.nome} ${funcionario.sobrenome}`;
    }
    return funcionario.nome || '';
  };

  const formatarCPF = (cpf) => {
    if (!cpf) return '';
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
      return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
  };

  const handleOpenModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome || '',
        sobrenome: funcionario.sobrenome || '',
        cpf: funcionario.cpf || '',
        dataNascimento: funcionario.dataNascimento 
          ? new Date(funcionario.dataNascimento).toISOString().split('T')[0]
          : '',
        sexo: funcionario.sexo || 'Masculino',
        email: funcionario.email || '',
        chavePix: funcionario.chavePix || ''
      });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome: '',
        sobrenome: '',
        cpf: '',
        dataNascimento: '',
        sexo: 'Masculino',
        email: '',
        chavePix: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFuncionario(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    try {
      if (editingFuncionario) {
        await api.put(`/funcionarios/${editingFuncionario._id}`, formData);
        toast.success('Dados do funcionário atualizados com sucesso!');
      } else {
        toast.error('Use a seção Funcionários para criar novos funcionários');
        return;
      }
      handleCloseModal();
      fetchFuncionarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar dados');
    }
  };

  const handleDelete = async (funcionario) => {
    if (!window.confirm(`Tem certeza que deseja excluir os dados de ${getNomeCompleto(funcionario)}?`)) {
      return;
    }

    try {
      await api.delete(`/funcionarios/${funcionario._id}`);
      toast.success('Funcionário excluído com sucesso!');
      fetchFuncionarios();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir funcionário');
    }
  };

  const handlePrint = (funcionario) => {
    const printWindow = window.open('', '_blank');
    const dataNascimentoFormatada = funcionario.dataNascimento
      ? new Date(funcionario.dataNascimento).toLocaleDateString('pt-BR')
      : 'Não informado';
    const cpfFormatado = funcionario.cpf ? formatarCPF(funcionario.cpf) : 'Não informado';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Dados do Funcionário - ${getNomeCompleto(funcionario)}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              margin: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #169486;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #169486;
              margin: 0;
              font-size: 28px;
            }
            .info-section {
              margin-bottom: 25px;
            }
            .info-section h2 {
              color: #169486;
              font-size: 18px;
              margin-bottom: 15px;
              border-bottom: 2px solid #169486;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              margin-bottom: 12px;
              padding: 8px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .info-label {
              font-weight: bold;
              min-width: 180px;
              color: #333;
            }
            .info-value {
              color: #666;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📋 Dados do Funcionário</h1>
          </div>
          <div class="info-section">
            <h2>Informações Pessoais</h2>
            <div class="info-row">
              <span class="info-label">Nome:</span>
              <span class="info-value">${funcionario.nome || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Sobrenome:</span>
              <span class="info-value">${funcionario.sobrenome || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">CPF:</span>
              <span class="info-value">${cpfFormatado}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Nascimento:</span>
              <span class="info-value">${dataNascimentoFormatada}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Sexo:</span>
              <span class="info-value">${funcionario.sexo || 'Não informado'}</span>
            </div>
          </div>
          <div class="info-section">
            <h2>Informações de Contato</h2>
            <div class="info-row">
              <span class="info-label">Email:</span>
              <span class="info-value">${funcionario.email || 'Não informado'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Chave PIX:</span>
              <span class="info-value">${funcionario.chavePix || 'Não informado'}</span>
            </div>
          </div>
          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            Documento gerado em ${new Date().toLocaleString('pt-BR')}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const funcionariosFiltrados = funcionarios.filter(func => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    const nomeCompleto = getNomeCompleto(func).toLowerCase();
    const cpf = (func.cpf || '').toLowerCase();
    const email = (func.email || '').toLowerCase();
    return nomeCompleto.includes(buscaLower) || 
           cpf.includes(buscaLower) || 
           email.includes(buscaLower);
  });

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className={`mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaIdCard className="text-4xl" style={{ color: '#169486' }} />
              <h1 className="text-3xl font-bold">Dados Funcionários</h1>
            </div>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gerencie os dados pessoais dos funcionários (CPF, data de nascimento, email, chave PIX)
          </p>
        </div>

        {/* Busca */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <FaSearch className="inline mr-2" /> Buscar
          </label>
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF ou email..."
            className={`w-full px-4 py-2 rounded-lg border ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
        </div>

        {/* Lista de Funcionários */}
        {funcionariosFiltrados.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
            <FaUser className="text-6xl mx-auto mb-4" style={{ color: '#169486', opacity: 0.5 }} />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {busca ? 'Nenhum funcionário encontrado' : 'Nenhum funcionário cadastrado'}
            </p>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {!busca && 'Cadastre funcionários na seção "Funcionários" primeiro'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {funcionariosFiltrados.map((funcionario) => (
              <div
                key={funcionario._id}
                className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all hover:shadow-lg`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getNomeCompleto(funcionario)}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {funcionario.funcao || 'Sem função'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePrint(funcionario)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Imprimir"
                    >
                      <FaPrint />
                    </button>
                    <button
                      onClick={() => handleOpenModal(funcionario)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(funcionario)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {funcionario.cpf && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaIdCard className="text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>CPF:</strong> {formatarCPF(funcionario.cpf)}
                      </span>
                    </div>
                  )}
                  {funcionario.dataNascimento && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser className="text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Nascimento:</strong> {new Date(funcionario.dataNascimento).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {funcionario.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaEnvelope className="text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>Email:</strong> {funcionario.email}
                      </span>
                    </div>
                  )}
                  {funcionario.chavePix && (
                    <div className="flex items-center gap-2 text-sm">
                      <FaCreditCard className="text-gray-400" />
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                        <strong>PIX:</strong> {funcionario.chavePix}
                      </span>
                    </div>
                  )}
                  {!funcionario.cpf && !funcionario.dataNascimento && !funcionario.email && !funcionario.chavePix && (
                    <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Nenhum dado adicional cadastrado
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Editar Dados do Funcionário
                </h2>
                <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {editingFuncionario && getNomeCompleto(editingFuncionario)}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      required
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sobrenome
                    </label>
                    <input
                      type="text"
                      value={formData.sobrenome}
                      onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      CPF
                    </label>
                    <input
                      type="text"
                      value={formData.cpf}
                      onChange={(e) => {
                        const valor = e.target.value.replace(/\D/g, '');
                        if (valor.length <= 11) {
                          setFormData({ ...formData, cpf: valor });
                        }
                      }}
                      placeholder="000.000.000-00"
                      maxLength="14"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data de Nascimento
                    </label>
                    <input
                      type="date"
                      value={formData.dataNascimento}
                      onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sexo
                    </label>
                    <select
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Chave PIX
                    </label>
                    <input
                      type="text"
                      value={formData.chavePix}
                      onChange={(e) => setFormData({ ...formData, chavePix: e.target.value })}
                      placeholder="CPF, Email, Telefone ou Chave Aleatória"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DadosFuncionarios;

