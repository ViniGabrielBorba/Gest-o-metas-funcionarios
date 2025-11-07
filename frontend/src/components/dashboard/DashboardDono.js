import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { removeAuthToken } from '../../utils/auth';
import { useNavigate } from 'react-router-dom';
import {
  FaStore,
  FaUsers,
  FaBullseye,
  FaTrophy,
  FaChartLine,
  FaSignOutAlt,
  FaEye,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useToast } from '../../contexts/ToastContext';

const DashboardDono = ({ setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dono/dashboard', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    navigate('/login-dono');
  };

  const COLORS = ['#169486', '#14b8a6', '#06b6d4', '#0891b2', '#0e7490'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-gray-600">Carregando dados...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl text-red-600">Erro ao carregar dados</div>
        </div>
      </div>
    );
  }

  const { resumo, lojas, topVendedoresGeral } = dashboardData;

  // Dados para gráfico de lojas
  const dadosGraficoLojas = lojas.map(loja => ({
    nome: loja.nomeLoja,
    vendido: loja.totalGeral,
    meta: loja.metaMes
  }));

  // Dados para gráfico de pizza (distribuição de vendas)
  const dadosPizza = lojas.map(loja => ({
    name: loja.nomeLoja,
    value: loja.totalGeral
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#169486' }}>
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">FlowGest - Área do Dono</h1>
                <p className="text-sm text-gray-600">Visão geral de todas as lojas</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt /> Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="input-field"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total de Lojas</p>
                <p className="text-3xl font-bold">{resumo.totalLojas}</p>
              </div>
              <FaStore className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total de Funcionários</p>
                <p className="text-3xl font-bold">{resumo.totalFuncionarios}</p>
              </div>
              <FaUsers className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Meta Total</p>
                <p className="text-3xl font-bold">
                  R$ {resumo.totalMetaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FaBullseye className="text-4xl opacity-50" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Total Vendido</p>
                <p className="text-3xl font-bold">
                  R$ {resumo.totalVendidoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm mt-1">
                  {resumo.percentualGeral.toFixed(1)}% da meta
                </p>
              </div>
              <FaChartLine className="text-4xl opacity-50" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras - Lojas */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Vendas por Loja</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoLojas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="vendido" fill="#169486" name="Vendido" />
                <Bar dataKey="meta" fill="#94a3b8" name="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Distribuição de Vendas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendedores Geral */}
        {topVendedoresGeral && topVendedoresGeral.length > 0 && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaTrophy className="text-yellow-500" /> Top 10 Vendedores (Todas as Lojas)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-gray-700">Posição</th>
                    <th className="text-left p-3 text-gray-700">Nome</th>
                    <th className="text-left p-3 text-gray-700">Loja</th>
                    <th className="text-right p-3 text-gray-700">Vendas</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendedoresGeral.map((vendedor, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-medium">{vendedor.nome}</td>
                      <td className="p-3 text-gray-600">{vendedor.loja}</td>
                      <td className="p-3 text-right font-semibold">
                        R$ {vendedor.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Lista de Lojas */}
        <div className="card">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Detalhes das Lojas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lojas.map((loja) => (
              <div key={loja.gerenteId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-800">{loja.nomeLoja}</h4>
                  {loja.metaBatida ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                      Meta Batida
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                      Em andamento
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">Gerente: {loja.nomeGerente}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Funcionários:</span>
                    <span className="font-semibold">{loja.totalFuncionarios}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meta:</span>
                    <span className="font-semibold">
                      R$ {loja.metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendido:</span>
                    <span className="font-semibold">
                      R$ {loja.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Atingido:</span>
                    <span className={`font-bold ${
                      loja.percentualAtingido >= 100 ? 'text-green-600' :
                      loja.percentualAtingido >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {loja.percentualAtingido.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {loja.topVendedores && loja.topVendedores.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Top Vendedores:</p>
                    <div className="space-y-1">
                      {loja.topVendedores.slice(0, 3).map((v, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className="text-gray-600">{v.nome}</span>
                          <span className="font-semibold">
                            R$ {v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardDono;

