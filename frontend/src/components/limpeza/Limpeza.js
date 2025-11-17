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
  FaBroom,
  FaCalendar,
  FaUsers,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const Limpeza = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [limpezas, setLimpezas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLimpeza, setEditingLimpeza] = useState(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [busca, setBusca] = useState('');
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    funcionarios: [],
    observacoes: ''
  });

  useEffect(() => {
    fetchLimpezas();
    fetchFuncionarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLimpezas = async () => {
    try {
      let url = '/limpeza';
      const params = [];
      
      if (filtroDataInicio) {
        params.push(`dataInicio=${filtroDataInicio}`);
      }
      if (filtroDataFim) {
        params.push(`dataFim=${filtroDataFim}`);
      }
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const response = await api.get(url);
      setLimpezas(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar limpezas:', error);
      toast.error('Erro ao carregar limpezas');
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  useEffect(() => {
    if (filtroDataInicio || filtroDataFim) {
      fetchLimpezas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroDataInicio, filtroDataFim]);

  const handleOpenModal = (limpeza = null) => {
    if (limpeza) {
      setEditingLimpeza(limpeza);
      const dataFormatada = new Date(limpeza.data).toISOString().split('T')[0];
      setFormData({
        data: dataFormatada,
        funcionarios: limpeza.funcionarios.map(f => f._id || f),
        observacoes: limpeza.observacoes || ''
      });
    } else {
      setEditingLimpeza(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        funcionarios: [],
        observacoes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLimpeza(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.funcionarios.length === 0) {
      toast.error('Selecione pelo menos um funcionário');
      return;
    }

    try {
      if (editingLimpeza) {
        await api.put(`/limpeza/${editingLimpeza._id}`, formData);
        toast.success('Limpeza atualizada com sucesso!');
      } else {
        await api.post('/limpeza', formData);
        toast.success('Limpeza criada com sucesso!');
      }
      handleCloseModal();
      fetchLimpezas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar limpeza');
    }
  };

  const handleDelete = async (limpeza) => {
    if (!window.confirm('Tem certeza que deseja excluir esta limpeza?')) {
      return;
    }

    try {
      await api.delete(`/limpeza/${limpeza._id}`);
      toast.success('Limpeza excluída com sucesso!');
      fetchLimpezas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir limpeza');
    }
  };

  const handleToggleFuncionario = (funcionarioId) => {
    setFormData(prev => {
      const funcionarios = [...prev.funcionarios];
      const index = funcionarios.indexOf(funcionarioId);
      
      if (index > -1) {
        funcionarios.splice(index, 1);
      } else {
        funcionarios.push(funcionarioId);
      }
      
      return { ...prev, funcionarios };
    });
  };

  const getNomeCompleto = (funcionario) => {
    if (funcionario.sobrenome && funcionario.sobrenome.trim() !== '') {
      return `${funcionario.nome} ${funcionario.sobrenome}`;
    }
    return funcionario.nome || '';
  };

  const handlePrint = (limpeza) => {
    const printWindow = window.open('', '_blank');
    const dataFormatada = new Date(limpeza.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const funcionariosList = limpeza.funcionarios.map((func, index) => {
      const nomeCompleto = getNomeCompleto(func);
      return `<tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${nomeCompleto}</td>
      </tr>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lista de Limpeza - ${dataFormatada}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #169486;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #169486;
              margin: 0;
              font-size: 24px;
            }
            .info {
              margin-bottom: 20px;
            }
            .info p {
              margin: 5px 0;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #169486;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: bold;
            }
            td {
              padding: 8px;
            }
            .observacoes {
              margin-top: 30px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .observacoes h3 {
              margin-top: 0;
              color: #169486;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧹 Lista de Limpeza</h1>
          </div>
          <div class="info">
            <p><strong>Data:</strong> ${dataFormatada}</p>
            <p><strong>Total de Funcionários:</strong> ${limpeza.funcionarios.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">#</th>
                <th>Funcionário</th>
              </tr>
            </thead>
            <tbody>
              ${funcionariosList}
            </tbody>
          </table>
          ${limpeza.observacoes ? `
            <div class="observacoes">
              <h3>Observações:</h3>
              <p>${limpeza.observacoes}</p>
            </div>
          ` : ''}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const limpezasFiltradas = limpezas.filter(limpeza => {
    if (!busca) return true;
    const buscaLower = busca.toLowerCase();
    return limpeza.funcionarios.some(func => {
      const nomeCompleto = getNomeCompleto(func).toLowerCase();
      return nomeCompleto.includes(buscaLower);
    }) || (limpeza.observacoes && limpeza.observacoes.toLowerCase().includes(buscaLower));
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
              <FaBroom className="text-4xl" style={{ color: '#169486' }} />
              <h1 className="text-3xl font-bold">Limpeza</h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <FaPlus /> Nova Limpeza
            </button>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gerencie a lista de funcionários responsáveis pela limpeza do ambiente
          </p>
        </div>

        {/* Filtros */}
        <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaSearch className="inline mr-2" /> Buscar
              </label>
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por funcionário ou observação..."
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="min-w-[150px]">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaCalendar className="inline mr-2" /> Data Início
              </label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <div className="min-w-[150px]">
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaCalendar className="inline mr-2" /> Data Fim
              </label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <button
              onClick={() => {
                setFiltroDataInicio('');
                setFiltroDataFim('');
                setBusca('');
                fetchLimpezas();
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaFilter className="inline mr-2" /> Limpar
            </button>
          </div>
        </div>

        {/* Lista de Limpezas */}
        {limpezasFiltradas.length === 0 ? (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
            <FaBroom className="text-6xl mx-auto mb-4" style={{ color: '#169486', opacity: 0.5 }} />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhuma limpeza cadastrada ainda
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Criar primeira limpeza
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {limpezasFiltradas.map((limpeza) => {
              const dataFormatada = new Date(limpeza.data).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              });

              return (
                <div
                  key={limpeza._id}
                  className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaCalendar className="text-teal-600" />
                        <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                          {dataFormatada}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          darkMode ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'
                        }`}>
                          <FaUsers className="inline mr-1" />
                          {limpeza.funcionarios.length} funcionário(s)
                        </span>
                      </div>
                      {limpeza.observacoes && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                          {limpeza.observacoes}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(limpeza)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="Imprimir"
                      >
                        <FaPrint />
                      </button>
                      <button
                        onClick={() => handleOpenModal(limpeza)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(limpeza)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Funcionários:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {limpeza.funcionarios.map((func, index) => (
                        <span
                          key={func._id || index}
                          className={`px-3 py-1 rounded-full text-sm ${
                            darkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {getNomeCompleto(func)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Criar/Editar */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-2xl rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingLimpeza ? 'Editar Limpeza' : 'Nova Limpeza'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Funcionários <span className="text-red-500">*</span>
                  </label>
                  <div className={`max-h-60 overflow-y-auto border rounded-lg p-4 ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                  }`}>
                    {funcionarios.length === 0 ? (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Nenhum funcionário cadastrado
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {funcionarios.map((func) => {
                          const nomeCompleto = getNomeCompleto(func);
                          const isSelected = formData.funcionarios.includes(func._id);
                          return (
                            <label
                              key={func._id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                isSelected
                                  ? darkMode ? 'bg-teal-900' : 'bg-teal-100'
                                  : darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleFuncionario(func._id)}
                                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                              />
                              <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                                {nomeCompleto}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {formData.funcionarios.length > 0 && (
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formData.funcionarios.length} funcionário(s) selecionado(s)
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows="3"
                    placeholder="Observações adicionais (opcional)"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="flex gap-3 justify-end">
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
                    {editingLimpeza ? 'Atualizar' : 'Criar'}
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

export default Limpeza;

