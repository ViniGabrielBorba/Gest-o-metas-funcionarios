import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import {
  FaUsers,
  FaBullseye,
  FaTrophy,
  FaChartLine,
  FaBirthdayCake,
  FaStar
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
  LineChart,
  Line
} from 'recharts';

const Dashboard = ({ setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen">
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-red-600">Erro ao carregar dados</div>
        </div>
      </div>
    );
  }

  const { resumo, vendasMes, topVendedoresMes, vendasDiarias, aniversariantes } = dashboardData;

  // Gráfico de vendas do mês (comparativo com meta)
  const chartDataMes = vendasMes.map(v => ({
    name: v.nome,
    vendas: v.valor,
    meta: v.metaIndividual
  }));

  // Gráfico de Top Vendedores do Mês (ranking)
  const chartDataTopMes = topVendedoresMes.map(v => ({
    name: v.nome,
    vendas: v.valor
  }));

  // Gráfico de vendas diárias
  const chartDataDiarias = vendasDiarias.map(v => ({
    dia: v.dia,
    total: v.total,
    quantidade: v.quantidade
  }));

  return (
    <div className="min-h-screen">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com filtros */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral do desempenho da loja</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="input-field"
              style={{ minWidth: '200px', width: 'auto' }}
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
              className="input-field"
              style={{ minWidth: '100px', width: 'auto' }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm mb-1">Total de Funcionários</p>
                <p className="text-3xl font-bold">{resumo.totalFuncionarios}</p>
              </div>
              <FaUsers className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Meta do Mês</p>
                <p className="text-3xl font-bold">
                  R$ {resumo.metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FaBullseye className="text-4xl opacity-80" />
            </div>
          </div>

          <div className={`card text-white ${
            resumo.metaBatida 
              ? 'bg-gradient-to-br from-green-500 to-green-600' 
              : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm mb-1">Vendas da Loja</p>
                <p className="text-3xl font-bold">
                  R$ {resumo.totalVendidoLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm mt-1">
                  {resumo.percentualAtingido.toFixed(1)}% da meta
                  {resumo.metaBatida ? ' ✅' : ` ⚠️`}
                </p>
                {resumo.metaBatida && (
                  <p className="text-xs mt-1 font-semibold">
                    Meta batida! Excedente: R$ {resumo.excedenteMeta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                )}
              </div>
              <FaChartLine className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-600 to-amber-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">Destaque do Mês</p>
                <p className="text-xl font-bold truncate">{resumo.melhorVendedorMes.nome}</p>
                <p className="text-sm mt-1">
                  R$ {resumo.melhorVendedorMes.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <FaTrophy className="text-4xl opacity-80" />
            </div>
          </div>
        </div>

        {/* Status da Meta da Loja */}
        {resumo.metaMes > 0 && (
          <div className={`card mb-8 ${
            resumo.metaBatida 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300' 
              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FaBullseye className={resumo.metaBatida ? 'text-green-600' : 'text-orange-600'} />
                  Status da Meta da Loja
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(2000, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              {resumo.metaBatida && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                  🎯 META BATIDA!
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">Meta Mensal</p>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {resumo.metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">Total Vendido</p>
                <p className={`text-2xl font-bold ${
                  resumo.metaBatida ? 'text-green-600' : 'text-orange-600'
                }`}>
                  R$ {resumo.totalVendidoLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600 mb-1">
                  {resumo.metaBatida ? 'Excedente' : 'Faltando'}
                </p>
                <p className={`text-2xl font-bold ${
                  resumo.metaBatida ? 'text-green-600' : 'text-red-600'
                }`}>
                  {resumo.metaBatida ? '+' : '-'}
                  R$ {(resumo.metaBatida ? resumo.excedenteMeta : resumo.faltandoParaMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 font-medium">Progresso</span>
                <span className={`font-bold ${
                  resumo.metaBatida ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {resumo.percentualAtingido.toFixed(1)}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    resumo.metaBatida ? 'bg-green-500' : 'bg-orange-500'
                  }`}
                  style={{
                    width: `${Math.min(100, resumo.percentualAtingido)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Aniversariantes */}
        {aniversariantes.length > 0 && (
          <div className="card mb-8 bg-gradient-to-r from-pink-100 to-red-100 border-2 border-pink-300">
            <div className="flex items-center gap-3 mb-4">
              <FaBirthdayCake className="text-3xl text-pink-600" />
              <h2 className="text-2xl font-bold text-gray-800">Aniversariantes do Mês</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {aniversariantes.map(aniv => (
                <div
                  key={aniv.id}
                  className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2"
                >
                  <FaBirthdayCake className="text-yellow-500" />
                  <span className="font-semibold">{aniv.nome}</span>
                  <span className="text-gray-600">- Dia {aniv.dia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Vendas do Mês (comparativo com meta) */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas do Mês vs Meta Individual</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="vendas" fill="#ef4444" name="Vendas" />
                <Bar dataKey="meta" fill="#f97316" name="Meta Individual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Top Vendedores do Mês (ranking) */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top Vendedores do Mês</h2>
            {chartDataTopMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataTopMes} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Bar dataKey="vendas" fill="#eab308" name="Vendas do Mês" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>Nenhuma venda registrada este mês</p>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Vendas Diárias */}
        {chartDataDiarias.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Vendas Diárias do Mês</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dia" 
                  label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  labelFormatter={(dia) => `Dia ${dia}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Total de Vendas (R$)"
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

