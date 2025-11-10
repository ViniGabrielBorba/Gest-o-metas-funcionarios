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
  FaPrint,
  FaSearch,
  FaChartLine
} from 'react-icons/fa';

const VendaComercial = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenda, setEditingVenda] = useState(null);
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    observacao: ''
  });
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [busca, setBusca] = useState('');

  useEffect(() => {
    fetchVendas();
  }, [mes, ano]);

  const fetchVendas = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/vendas-comerciais?mes=${mes}&ano=${ano}`);
      const data = response.data;
      const vendasArray = Array.isArray(data) 
        ? data 
        : (data?.data && Array.isArray(data.data) 
            ? data.data 
            : []);
      setVendas(vendasArray);
    } catch (error) {
      console.error('Erro ao buscar vendas comerciais:', error);
      setVendas([]);
      toast.error('Erro ao carregar vendas comerciais');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (venda = null) => {
    if (venda) {
      setEditingVenda(venda);
      setFormData({
        data: new Date(venda.data).toISOString().split('T')[0],
        valor: venda.valor.toString(),
        observacao: venda.observacao || ''
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
      if (!formData.valor || parseFloat(formData.valor) <= 0) {
        toast.warning('Por favor, informe um valor válido para a venda.');
        return;
      }

      if (editingVenda) {
        await api.put(`/vendas-comerciais/${editingVenda._id}`, formData);
        toast.success('Venda comercial atualizada com sucesso!');
      } else {
        await api.post('/vendas-comerciais', formData);
        toast.success('Venda comercial registrada com sucesso!');
      }
      handleCloseModal();
      fetchVendas();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar venda comercial');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda comercial?')) {
      try {
        await api.delete(`/vendas-comerciais/${id}`);
        fetchVendas();
        toast.success('Venda comercial excluída com sucesso!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir venda comercial');
      }
    }
  };

  const handleImprimir = () => {
    const vendasFiltradas = vendas.filter(v => {
      if (!busca) return true;
      const valorStr = v.valor.toString();
      const obsStr = (v.observacao || '').toLowerCase();
      return valorStr.includes(busca) || obsStr.includes(busca.toLowerCase());
    });

    if (vendasFiltradas.length === 0) {
      toast.warning('Não há dados para imprimir');
      return;
    }

    const total = vendasFiltradas.reduce((sum, v) => sum + (v.valor || 0), 0);
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesNome = `${meses[mes - 1]} de ${ano}`;

    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório de Vendas Comerciais - ${mesNome}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 28px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            table th, table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            table th {
              background: #f3f4f6;
              font-weight: bold;
              color: #1f2937;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
              color: #059669;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Vendas Comerciais</h1>
            <p><strong>Período:</strong> ${mesNome}</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th style="text-align: right;">Valor (R$)</th>
                <th>Observação</th>
              </tr>
            </thead>
            <tbody>
              ${vendasFiltradas.map(v => `
                <tr>
                  <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                  <td style="text-align: right;">R$ ${(v.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td>${v.observacao || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td class="total">Total:</td>
                <td class="total" style="text-align: right;">R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    janelaImpressao.print();
  };

  const vendasFiltradas = vendas.filter(v => {
    if (!busca) return true;
    const valorStr = v.valor.toString();
    const obsStr = (v.observacao || '').toLowerCase();
    return valorStr.includes(busca) || obsStr.includes(busca.toLowerCase());
  });

  const totalMes = vendasFiltradas.reduce((sum, v) => sum + (v.valor || 0), 0);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              💼 Vendas Comerciais
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
              Vendas que não são feitas pelos vendedores individuais
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Nova Venda
          </button>
        </div>

        {/* Resumo do Mês */}
        <div className={`card mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Resumo do Mês</h2>
              <p className="text-blue-100 text-sm">
                {new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm mb-1">Total de Vendas</p>
              <p className="text-3xl font-bold">{vendasFiltradas.length}</p>
              <p className="text-blue-100 text-sm mt-2">Valor Total</p>
              <p className="text-4xl font-bold">R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por valor ou observação..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className={`input-field pl-10 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : ''}`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mês
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2024, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ano
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
                className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleImprimir}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <FaPrint /> Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Vendas */}
        {loading ? (
          <div className="text-center py-12">
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Carregando...</p>
          </div>
        ) : vendasFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <FaDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Nenhuma venda comercial registrada neste período
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary mt-4"
            >
              Registrar Primeira Venda
            </button>
          </div>
        ) : (
          <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-left">Observação</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendasFiltradas.map((venda) => (
                    <tr key={venda._id} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(venda.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold text-green-600 ${darkMode ? 'text-green-400' : ''}`}>
                        R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {venda.observacao || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleOpenModal(venda)}
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                            title="Editar"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(venda._id)}
                            className="text-red-600 hover:text-red-800 font-semibold"
                            title="Excluir"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <td className={`px-4 py-3 font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Total:</td>
                    <td className={`px-4 py-3 text-right font-bold text-green-600 ${darkMode ? 'text-green-400' : ''}`}>
                      R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td colSpan="2"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Modal de Venda */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {editingVenda ? 'Editar Venda Comercial' : 'Nova Venda Comercial'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      value={formData.data}
                      onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Observação (opcional)
                    </label>
                    <textarea
                      value={formData.observacao}
                      onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
                      rows="3"
                      placeholder="Ex: Cliente X, produto Y..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className={`flex-1 py-2 px-4 rounded-lg font-semibold ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingVenda ? 'Atualizar' : 'Registrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendaComercial;

