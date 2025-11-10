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
  FaArrowDown,
  FaSearch,
  FaFilter,
  FaBell,
  FaEnvelope,
  FaCalendar,
  FaTimes,
  FaMoon,
  FaSun,
  FaCog,
  FaPrint,
  FaDownload,
  FaDollarSign
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Brush
} from 'recharts';
import { useToast } from '../../contexts/ToastContext';

const DashboardDono = ({ setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [buscaLoja, setBuscaLoja] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [ordenacao, setOrdenacao] = useState('desempenho');
  const [showModalLoja, setShowModalLoja] = useState(false);
  const [lojaSelecionada, setLojaSelecionada] = useState(null);
  const [detalhesLoja, setDetalhesLoja] = useState(null);
  const [showComparacao, setShowComparacao] = useState(false);
  const [dadosComparacao, setDadosComparacao] = useState(null);
  const [showEvolucao, setShowEvolucao] = useState(false);
  const [dadosEvolucao, setDadosEvolucao] = useState(null);
  const [tipoEvolucao, setTipoEvolucao] = useState('mensal');
  const [alertas, setAlertas] = useState([]);
  const [metricas, setMetricas] = useState(null);
  const [previsoes, setPrevisoes] = useState(null);
  const [agendaEventos, setAgendaEventos] = useState([]);
  const [showMensagemModal, setShowMensagemModal] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [dadosMesAnterior, setDadosMesAnterior] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchAlertas();
    fetchMetricas();
    fetchPrevisoes();
    fetchAgenda();
    fetchDadosMesAnterior(); // Comparação automática com mês anterior
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

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

  const fetchAlertas = async () => {
    try {
      const response = await api.get('/dono/alertas', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setAlertas(response.data.alertas || []);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    }
  };

  const fetchMetricas = async () => {
    try {
      const response = await api.get('/dono/metricas', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setMetricas(response.data);
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
    }
  };

  const fetchPrevisoes = async () => {
    try {
      const response = await api.get('/dono/previsao', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setPrevisoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar previsões:', error);
    }
  };

  const fetchAgenda = async () => {
    try {
      const response = await api.get('/dono/agenda', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setAgendaEventos(response.data.eventos || []);
    } catch (error) {
      console.error('Erro ao buscar agenda:', error);
    }
  };

  // Buscar dados do mês anterior automaticamente
  const fetchDadosMesAnterior = async () => {
    try {
      let mesAnterior = selectedMonth - 1;
      let anoAnterior = selectedYear;
      
      if (mesAnterior < 1) {
        mesAnterior = 12;
        anoAnterior = selectedYear - 1;
      }

      const response = await api.get('/dono/dashboard', {
        params: { mes: mesAnterior, ano: anoAnterior }
      });
      setDadosMesAnterior(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do mês anterior:', error);
      setDadosMesAnterior(null);
    }
  };

  const fetchDetalhesLoja = async (lojaId) => {
    try {
      const response = await api.get(`/dono/lojas/${lojaId}`, {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setDetalhesLoja(response.data);
      setShowModalLoja(true);
    } catch (error) {
      toast.error('Erro ao carregar detalhes da loja');
    }
  };

  const fetchComparacao = async (mes1, ano1, mes2, ano2) => {
    try {
      const response = await api.get('/dono/dashboard/comparacao', {
        params: { mes1, ano1, mes2, ano2 }
      });
      setDadosComparacao(response.data);
      setShowComparacao(true);
    } catch (error) {
      toast.error('Erro ao buscar dados de comparação');
    }
  };

  const fetchEvolucao = async (tipo) => {
    try {
      console.log('Buscando dados de evolução:', { tipo, ano: selectedYear });
      const response = await api.get('/dono/dashboard/evolucao', {
        params: { tipo, ano: selectedYear }
      });
      console.log('Resposta recebida:', response.data);
      
      if (response.data && response.data.evolucao) {
        // Validar e filtrar dados inválidos
        const evolucaoValida = response.data.evolucao
          .map(loja => ({
            ...loja,
            dados: (loja.dados || []).map(d => ({
              ...d,
              vendas: parseFloat(d.vendas) || 0,
              meta: parseFloat(d.meta) || 0,
              periodo: d.periodo || ''
            })).filter(d => d.periodo !== '')
          }))
          .filter(loja => loja.dados && loja.dados.length > 0);
        
        setDadosEvolucao({ evolucao: evolucaoValida });
        setShowEvolucao(true);
      } else {
        console.warn('Resposta sem dados de evolução:', response.data);
        toast.error('Nenhum dado de evolução encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar dados de evolução:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar dados de evolução';
      toast.error(errorMessage);
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

  // Filtrar e ordenar lojas
  const lojasFiltradas = lojas
    .filter(loja => {
      const matchesBusca = buscaLoja === '' || 
        loja.nomeLoja.toLowerCase().includes(buscaLoja.toLowerCase()) ||
        loja.nomeGerente.toLowerCase().includes(buscaLoja.toLowerCase());
      
      const matchesStatus = filtroStatus === '' || 
        (filtroStatus === 'batida' && loja.metaBatida) ||
        (filtroStatus === 'andamento' && !loja.metaBatida && loja.percentualAtingido >= 70) ||
        (filtroStatus === 'abaixo' && loja.percentualAtingido < 70);
      
      return matchesBusca && matchesStatus;
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case 'desempenho':
          return b.percentualAtingido - a.percentualAtingido;
        case 'vendas':
          return b.totalGeral - a.totalGeral;
        case 'nome':
          return a.nomeLoja.localeCompare(b.nomeLoja);
        default:
          return 0;
      }
    });

  // Dados para gráfico de lojas (com separação de vendas comerciais e funcionários)
  const dadosGraficoLojas = lojasFiltradas.map(loja => ({
    nome: loja.nomeLoja,
    vendido: loja.totalGeral,
    vendasFuncionarios: loja.totalVendasFuncionarios || 0,
    vendasComerciais: loja.totalVendasComerciais || 0,
    meta: loja.metaMes
  }));

  // Dados para gráfico de pizza (distribuição de vendas)
  const dadosPizza = lojasFiltradas.map(loja => ({
    name: loja.nomeLoja,
    value: loja.totalGeral
  }));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
    }`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#169486' }}>
                <FaChartLine className="text-white text-xl" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  FlowGest - Área do Dono
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors`}>
                  Visão geral de todas as lojas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros e Busca */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-6 transition-colors`}>
          {/* Primeira linha: Busca, Status, Ordenar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Buscar Loja
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome da loja ou gerente..."
                  value={buscaLoja}
                  onChange={(e) => setBuscaLoja(e.target.value)}
                  className={`input-field w-full pl-10 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              >
                <option value="">Todos</option>
                <option value="batida">Meta Batida</option>
                <option value="andamento">Em Andamento</option>
                <option value="abaixo">Abaixo da Meta</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Ordenar
              </label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              >
                <option value="desempenho">Desempenho</option>
                <option value="vendas">Vendas</option>
                <option value="nome">Nome</option>
              </select>
            </div>
          </div>
          
          {/* Segunda linha: Período (Mês/Ano), Tipo de Evolução e Botão */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Período
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className={`input-field flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString('pt-BR', { month: 'short' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className={`input-field flex-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(ano => (
                    <option key={ano} value={ano}>{ano}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                Tipo de Evolução
              </label>
              <select
                value={tipoEvolucao}
                onChange={(e) => setTipoEvolucao(e.target.value)}
                className={`input-field w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              >
                <option value="mensal">Evolução Mensal</option>
                <option value="trimestral">Evolução Trimestral</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors opacity-0 pointer-events-none`}>
                Ação
              </label>
              <button
                onClick={() => fetchEvolucao(tipoEvolucao)}
                className="btn-secondary w-full flex items-center justify-center gap-2 px-4 py-2.5 font-medium"
              >
                <FaChartLine className="text-lg" /> 
                <span>Evolução</span>
              </button>
            </div>
          </div>
        </div>

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'} rounded-xl shadow-lg p-6 mb-6 border transition-colors`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2 transition-colors`}>
                <FaBell className="text-yellow-600" /> Alertas e Notificações ({alertas.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    alerta.tipo === 'sucesso' ? 'bg-green-100 border-green-300' :
                    alerta.tipo === 'alerta' ? 'bg-yellow-100 border-yellow-300' :
                    'bg-blue-100 border-blue-300'
                  } border`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{alerta.loja}</p>
                      <p className="text-sm text-gray-600">{alerta.mensagem}</p>
                      {alerta.funcionarios && (
                        <p className="text-xs text-gray-500 mt-1">
                          {alerta.funcionarios.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 bg-gradient-to-br from-blue-500 to-cyan-600 text-white transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total de Lojas</p>
                <p className="text-3xl font-bold">{resumo.totalLojas}</p>
              </div>
              <FaStore className="text-4xl opacity-50" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total de Funcionários</p>
                <p className="text-3xl font-bold">{resumo.totalFuncionarios}</p>
              </div>
              <FaUsers className="text-4xl opacity-50" />
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white transition-colors`}>
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

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white transition-colors`}>
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

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 bg-gradient-to-br from-teal-500 to-cyan-600 text-white transition-colors`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm mb-1">Vendas Comerciais</p>
                <p className="text-3xl font-bold">
                  R$ {(resumo.totalVendasComerciais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs mt-1 opacity-90">
                  {resumo.totalVendidoGeral > 0 
                    ? `${((resumo.totalVendasComerciais || 0) / resumo.totalVendidoGeral * 100).toFixed(1)}% do total`
                    : '0% do total'}
                </p>
              </div>
              <FaDollarSign className="text-4xl opacity-50" />
            </div>
          </div>
        </div>

        {/* Comparação Automática com Mês Anterior */}
        {dadosMesAnterior && dashboardData && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2 transition-colors`}>
              <FaChartLine /> Comparação com Mês Anterior
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Vendas - Mês Anterior
                </p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  R$ {dadosMesAnterior.resumo.totalVendidoGeral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Vendas - Mês Atual
                </p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  R$ {dashboardData.resumo.totalVendidoGeral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Variação
                </p>
                {(() => {
                  const vendasAnterior = dadosMesAnterior.resumo.totalVendidoGeral || 0;
                  const vendasAtual = dashboardData.resumo.totalVendidoGeral || 0;
                  const variacao = vendasAnterior > 0 ? ((vendasAtual - vendasAnterior) / vendasAnterior) * 100 : 0;
                  const diferenca = vendasAtual - vendasAnterior;
                  return (
                    <>
                      <p className={`text-xl font-bold ${variacao >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-2`}>
                        {variacao >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                        {Math.abs(variacao).toFixed(1)}%
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {diferenca >= 0 ? '+' : ''}R$ {Math.abs(diferenca).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </>
                  );
                })()}
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Meta - Comparação
                </p>
                {(() => {
                  const metaAnterior = dadosMesAnterior.resumo.totalMetaGeral || 0;
                  const metaAtual = dashboardData.resumo.totalMetaGeral || 0;
                  const variacaoMeta = metaAnterior > 0 ? ((metaAtual - metaAnterior) / metaAnterior) * 100 : 0;
                  return (
                    <p className={`text-xl font-bold ${variacaoMeta >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {variacaoMeta >= 0 ? '+' : ''}{variacaoMeta.toFixed(1)}%
                    </p>
                  );
                })()}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={[
                {
                  periodo: 'Mês Anterior',
                  vendas: dadosMesAnterior.resumo.totalVendidoGeral || 0,
                  meta: dadosMesAnterior.resumo.totalMetaGeral || 0
                },
                {
                  periodo: 'Mês Atual',
                  vendas: dashboardData.resumo.totalVendidoGeral || 0,
                  meta: dashboardData.resumo.totalMetaGeral || 0
                }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis dataKey="periodo" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="vendas" fill="#10b981" name="Vendas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="meta" fill="#ef4444" name="Meta" radius={[8, 8, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de Barras - Lojas */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Vendas por Loja
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dadosGraficoLojas} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis 
                  dataKey="nome" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                />
                <Legend />
                <Brush dataKey="nome" height={30} stroke={darkMode ? '#4b5563' : '#8884d8'} />
                <Bar dataKey="vendasFuncionarios" fill="#10b981" name="Vendas Funcionários" radius={[8, 8, 0, 0]} />
                <Bar dataKey="vendasComerciais" fill="#3b82f6" name="Vendas Comerciais" radius={[8, 8, 0, 0]} />
                <Bar dataKey="meta" fill="#94a3b8" name="Meta" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Pizza - Distribuição */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Distribuição de Vendas
            </h3>
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
                  animationDuration={300}
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendedores Geral */}
        {topVendedoresGeral && topVendedoresGeral.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2 transition-colors`}>
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

        {/* Métricas Avançadas */}
        {metricas && metricas.metricas && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Métricas Avançadas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricas.metricas.map((metrica, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{metrica.loja}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Médio:</span>
                      <span className="font-semibold">
                        R$ {metrica.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendas/Funcionário:</span>
                      <span className="font-semibold">
                        R$ {metrica.vendasPorFuncionario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa Conversão:</span>
                      <span className="font-semibold">
                        {metrica.taxaConversao.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previsões */}
        {previsoes && previsoes.previsoes && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Previsão de Vendas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {previsoes.previsoes.map((previsao, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">{previsao.loja}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendas até hoje:</span>
                      <span className="font-semibold">
                        R$ {previsao.vendasAteHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Projeção total:</span>
                      <span className="font-semibold text-blue-600">
                        R$ {previsao.projecaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Previsão meta:</span>
                      <span className={`font-semibold ${
                        previsao.previsaoMeta >= 100 ? 'text-green-600' :
                        previsao.previsaoMeta >= 70 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {previsao.previsaoMeta.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Confiança: {previsao.percentualConfianca}%</span>
                      <span>{previsao.diasRestantes} dias restantes</span>
                    </div>
                    {previsao.tendencia && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">Tendência:</span>
                          <span className={`text-xs font-semibold ${
                            previsao.tendencia === 'crescimento' ? 'text-green-600' :
                            previsao.tendencia === 'declinio' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {previsao.tendencia === 'crescimento' ? '📈 Crescimento' :
                             previsao.tendencia === 'declinio' ? '📉 Declínio' : '➡️ Estável'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                previsao.percentualConfianca >= 75 ? 'bg-green-500' : 
                                previsao.percentualConfianca >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                              }`}
                              style={{ width: `${previsao.percentualConfianca}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Lojas */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
              Detalhes das Lojas ({lojasFiltradas.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="btn-secondary flex items-center gap-2"
              >
                <FaPrint /> Imprimir
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lojasFiltradas.map((loja) => (
              <div 
                key={loja.gerenteId} 
                className={`${darkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-white'} border rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => fetchDetalhesLoja(loja.gerenteId)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                    {loja.nomeLoja}
                  </h4>
                  <div className="flex items-center gap-2">
                    {loja.metaBatida ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        Meta Batida
                      </span>
                    ) : loja.statusMeta === 'no_prazo' ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        No Prazo
                      </span>
                    ) : loja.statusMeta === 'no_ritmo' ? (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold">
                        No Ritmo
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                        Abaixo da Meta
                      </span>
                    )}
                    <FaEye className="text-gray-400 hover:text-gray-600" title="Ver detalhes" />
                  </div>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>
                  Gerente: {loja.nomeGerente}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Funcionários:</span>
                    <span className="font-semibold">{loja.totalFuncionarios}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Meta:</span>
                    <span className="font-semibold">
                      R$ {loja.metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Vendido:</span>
                    <span className="font-semibold">
                      R$ {loja.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      Funcionários: R$ {(loja.totalVendasFuncionarios || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                      Comerciais: R$ {(loja.totalVendasComerciais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center pt-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'} border-t`}>
                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Atingido:</span>
                    <div className="flex flex-col items-end">
                      <span className={`font-bold ${
                        loja.metaBatida ? 'text-green-600' :
                        loja.statusMeta === 'no_prazo' ? 'text-blue-600' :
                        loja.statusMeta === 'no_ritmo' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {loja.percentualAtingido.toFixed(1)}%
                      </span>
                      {loja.percentualEsperado && loja.diasDecorridos && (
                        <span className="text-xs text-gray-500 mt-0.5">
                          Esperado: {loja.percentualEsperado.toFixed(1)}% ({loja.diasDecorridos}/{loja.diasNoMes} dias)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {loja.topVendedores && loja.topVendedores.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>
                      Top Vendedores:
                    </p>
                    <div className="space-y-1">
                      {loja.topVendedores.slice(0, 3).map((v, idx) => (
                        <div key={idx} className="flex justify-between text-xs">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{v.nome}</span>
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

      {/* Modal Detalhes Loja */}
      {showModalLoja && detalhesLoja && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-colors`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  {detalhesLoja.gerente.nomeLoja}
                </h2>
                <button
                  onClick={() => {
                    setShowModalLoja(false);
                    setDetalhesLoja(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              
              {/* Informações da Loja */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Gerente: {detalhesLoja.gerente.nome}</p>
                  <p className="text-sm text-gray-600">Email: {detalhesLoja.gerente.email}</p>
                  {detalhesLoja.gerente.telefone && (
                    <p className="text-sm text-gray-600">Telefone: {detalhesLoja.gerente.telefone}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funcionários: {detalhesLoja.funcionarios.length}</p>
                  {detalhesLoja.meta && (
                    <>
                      <p className="text-sm text-gray-600">Meta: R$ {detalhesLoja.meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-600 font-semibold">
                        Total Vendido: R$ {(detalhesLoja.totalGeral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Funcionários: R$ {(detalhesLoja.totalVendasFuncionarios || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-gray-500">
                        Comerciais: R$ {(detalhesLoja.totalVendasComerciais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Funcionários */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Funcionários</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-gray-700">Nome</th>
                        <th className="text-left p-2 text-gray-700">Função</th>
                        <th className="text-right p-2 text-gray-700">Meta Individual</th>
                        <th className="text-right p-2 text-gray-700">Vendas Mês</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhesLoja.funcionarios.map((func) => (
                        <tr key={func.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{func.nome}</td>
                          <td className="p-2 text-gray-600">{func.funcao}</td>
                          <td className="p-2 text-right">
                            R$ {func.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2 text-right font-semibold">
                            R$ {func.vendasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gráfico de Vendas Diárias */}
              {((detalhesLoja.vendasDiariasComerciais && detalhesLoja.vendasDiariasComerciais.length > 0) || 
                (detalhesLoja.vendasDiariasFuncionarios && detalhesLoja.vendasDiariasFuncionarios.length > 0)) && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Vendas Diárias</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(() => {
                      // Combinar e agrupar vendas por dia
                      const vendasPorDia = {};
                      
                      // Vendas comerciais
                      if (detalhesLoja.vendasDiariasComerciais) {
                        detalhesLoja.vendasDiariasComerciais.forEach(v => {
                          const dataKey = new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                          if (!vendasPorDia[dataKey]) {
                            vendasPorDia[dataKey] = { data: dataKey, comercial: 0, funcionario: 0 };
                          }
                          vendasPorDia[dataKey].comercial += v.valor || 0;
                        });
                      }
                      
                      // Vendas funcionários
                      if (detalhesLoja.vendasDiariasFuncionarios) {
                        detalhesLoja.vendasDiariasFuncionarios.forEach(v => {
                          const dataKey = new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                          if (!vendasPorDia[dataKey]) {
                            vendasPorDia[dataKey] = { data: dataKey, comercial: 0, funcionario: 0 };
                          }
                          vendasPorDia[dataKey].funcionario += v.valor || 0;
                        });
                      }
                      
                      return Object.values(vendasPorDia).sort((a, b) => 
                        new Date(a.data.split('/').reverse().join('-')) - new Date(b.data.split('/').reverse().join('-'))
                      );
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Legend />
                      <Line type="monotone" dataKey="comercial" stroke="#3b82f6" strokeWidth={2} name="Vendas Comerciais" />
                      <Line type="monotone" dataKey="funcionario" stroke="#10b981" strokeWidth={2} name="Vendas Funcionários" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Feedback dos Funcionários */}
              {detalhesLoja.feedbacks && detalhesLoja.feedbacks.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Feedback dos Funcionários</h3>
                  <div className="space-y-3">
                    {detalhesLoja.feedbacks.map((feedback, idx) => (
                      <div key={idx} className="border rounded-lg p-3">
                        <p className="font-semibold text-gray-800">{feedback.funcionarioNome}</p>
                        <p className="text-sm text-gray-600 mt-1">{feedback.observacao}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico de Metas */}
              {detalhesLoja.historicoMetas && detalhesLoja.historicoMetas.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Histórico de Metas</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2 text-gray-700">Período</th>
                          <th className="text-right p-2 text-gray-700">Meta</th>
                          <th className="text-right p-2 text-gray-700">Vendido</th>
                          <th className="text-right p-2 text-gray-700">% Atingido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalhesLoja.historicoMetas.map((meta, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              {new Date(2000, meta.mes - 1).toLocaleDateString('pt-BR', { month: 'long' })}/{meta.ano}
                            </td>
                            <td className="p-2 text-right">
                              R$ {meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 text-right">
                              R$ {(meta.totalVendido || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-2 text-right font-semibold">
                              {meta.valor > 0 ? ((meta.totalVendido || 0) / meta.valor * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Evolução */}
      {showEvolucao && dadosEvolucao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto transition-colors`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  <FaChartLine className="inline mr-2" />
                  Evolução {tipoEvolucao === 'mensal' ? 'Mensal' : 'Trimestral'} - {selectedYear}
                </h2>
                <button
                  onClick={() => {
                    setShowEvolucao(false);
                    setDadosEvolucao(null);
                  }}
                  className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'} transition-colors`}
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              {dadosEvolucao.evolucao && dadosEvolucao.evolucao.length > 0 ? (
                <div className="space-y-6">
                  {dadosEvolucao.evolucao.map((loja, idx) => (
                    <div key={idx} className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 transition-colors`}>
                      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                        {loja.loja}
                      </h3>
                      {loja.dados && loja.dados.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={loja.dados}>
                              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                              <XAxis 
                                dataKey="periodo" 
                                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                              />
                              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                              <Tooltip 
                                formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                contentStyle={{
                                  backgroundColor: darkMode ? '#374151' : '#ffffff',
                                  border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="vendas" 
                                stroke="#10b981" 
                                fill="#10b981" 
                                fillOpacity={0.6}
                                name="Vendas"
                              />
                              <Area 
                                type="monotone" 
                                dataKey="meta" 
                                stroke="#ef4444" 
                                fill="#ef4444" 
                                fillOpacity={0.3}
                                name="Meta"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                          
                          <div className="mt-4 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={`border-b ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                                  <th className={`text-left p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Período
                                  </th>
                                  <th className={`text-right p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Vendas
                                  </th>
                                  <th className={`text-right p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Meta
                                  </th>
                                  <th className={`text-right p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    % Atingido
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {loja.dados.map((periodo, pIdx) => {
                                  const percentual = periodo.meta > 0 
                                    ? (periodo.vendas / periodo.meta) * 100 
                                    : 0;
                                  return (
                                    <tr 
                                      key={pIdx} 
                                      className={`border-b ${darkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-100'} transition-colors`}
                                    >
                                      <td className={`p-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {periodo.periodo}
                                      </td>
                                      <td className={`p-2 text-right font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        R$ {periodo.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className={`p-2 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        R$ {periodo.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                      </td>
                                      <td className="p-2 text-right">
                                        <span className={`font-semibold ${
                                          percentual >= 100 ? 'text-green-600' :
                                          percentual >= 70 ? 'text-blue-600' :
                                          percentual >= 50 ? 'text-yellow-600' :
                                          'text-red-600'
                                        }`}>
                                          {percentual.toFixed(1)}%
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </>
                      ) : (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`}>
                          Nenhum dado de evolução disponível para esta loja
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`}>
                  <FaChartLine className="text-6xl mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhum dado de evolução disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardDono;

