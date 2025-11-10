import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaDollarSign, 
  FaCalendar, 
  FaChartLine,
  FaFilter
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const VendasComerciais = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenda, setEditingVenda] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [resumo, setResumo] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    observacao: ''
  });

  useEffect(() => {
    fetchVendas();
  }, [selectedMonth, selectedYear]);

  const fetchVendas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vendas-comerciais/agrupadas?mes=${selectedMonth}&ano=${selectedYear}`);
      setVendas(response.data.vendasAgrupadas || []);
      setResumo(response.data.resumo || null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro ao buscar vendas comerciais:', error);
      toast.error('Erro ao carregar vendas comerciais');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (venda = null) => {
    if (venda) {
      // Editar venda específica
      const vendaData = venda.vendas[0]; // Pegar primeira venda do dia
      setEditingVenda(venda);
      setFormData({
        data: new Date(venda.data).toISOString().split('T')[0],
        valor: vendaData?.valor || '',
        observacao: vendaData?.observacao || ''
      });
    } else {
      setEditingVenda(null);
      setFormData({
        data: new Date().toISOString().split('T')[0],
        valor: '',
        observacao: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVenda(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVenda) {
        // Atualizar venda existente
        const vendaId = editingVenda.vendas[0]?.id;
        if (vendaId) {
          await api.put(`/vendas-comerciais/${vendaId}`, {
            data: formData.data,
            valor: parseFloat(formData.valor),
            observacao: formData.observacao
          });
          toast.success('Venda comercial atualizada com sucesso!');
        }
      } else {
        // Criar nova venda
        await api.post('/vendas-comerciais', {
          data: formData.data,
          valor: parseFloat(formData.valor),
          observacao: formData.observacao
        });
        toast.success('Venda comercial registrada com sucesso!');
      }
      handleCloseModal();
      fetchVendas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar venda comercial');
    }
  };

  const handleDelete = async (venda) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda comercial?')) {
      try {
        const vendaId = venda.vendas[0]?.id;
        if (vendaId) {
          await api.delete(`/vendas-comerciais/${vendaId}`);
          toast.success('Venda comercial excluída com sucesso!');
          fetchVendas();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir venda comercial');
      }
    }
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarMesAno = (mes, ano) => {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${meses[mes - 1]} de ${ano}`;
  };

  // Preparar dados para gráfico
  const chartData = vendas
    .map(v => ({
      dia: new Date(v.data).getUTCDate(),
      total: v.total,
      quantidade: v.quantidade
    }))
    .sort((a, b) => a.dia - b.dia);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Vendas Comerciais
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Gerencie as vendas comerciais diárias da loja
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Nova Venda
          </button>
        </div>

        {/* Filtros */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FaFilter className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
              <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filtrar por:
              </span>
            </div>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de Resumo */}
        {resumo && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total do Mês</p>
                  <p className="text-3xl font-bold">
                    R$ {resumo.totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <FaDollarSign className="text-4xl opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Dias com Vendas</p>
                  <p className="text-3xl font-bold">{resumo.totalDias}</p>
                </div>
                <FaCalendar className="text-4xl opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Média Diária</p>
                  <p className="text-3xl font-bold">
                    R$ {resumo.mediaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <FaChartLine className="text-4xl opacity-80" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Total de Vendas</p>
                  <p className="text-3xl font-bold">{resumo.totalVendas}</p>
                </div>
                <FaDollarSign className="text-4xl opacity-80" />
              </div>
            </div>
          </div>
        )}

        {/* Gráfico */}
        {chartData.length > 0 && (
          <div className={`card mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <FaChartLine /> Vendas Diárias - {formatarMesAno(selectedMonth, selectedYear)}
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Total (R$)"
                  dot={{ fill: '#3b82f6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Lista de Vendas */}
        <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Vendas Registradas - {formatarMesAno(selectedMonth, selectedYear)}
          </h2>
          
          {vendas.length === 0 ? (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaDollarSign className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma venda comercial registrada neste período</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data
                    </th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Valor Total
                    </th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Quantidade
                    </th>
                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Observação
                    </th>
                    <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda, index) => (
                    <tr 
                      key={index}
                      className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatarData(venda.data)}
                      </td>
                      <td className={`py-3 px-4 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        R$ {venda.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {venda.quantidade} {venda.quantidade === 1 ? 'venda' : 'vendas'}
                      </td>
                      <td className={`py-3 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {venda.vendas[0]?.observacao || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(venda)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'text-blue-400 hover:bg-gray-700' 
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(venda)}
                            className={`p-2 rounded-lg transition-colors ${
                              darkMode 
                                ? 'text-red-400 hover:bg-gray-700' 
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Adicionar/Editar Venda */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {editingVenda ? 'Editar Venda Comercial' : 'Nova Venda Comercial'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observação (opcional)
                </label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                  rows="3"
                  placeholder="Observações sobre a venda..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingVenda ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendasComerciais;

