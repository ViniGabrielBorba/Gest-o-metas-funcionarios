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
  FaDownload
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
  ComposedChart
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
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchAlertas();
    fetchMetricas();
    fetchPrevisoes();
    fetchAgenda();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
      const response = await api.get('/dono/dashboard/evolucao', {
        params: { tipo, ano: selectedYear }
      });
      setDadosEvolucao(response.data);
      setShowEvolucao(true);
    } catch (error) {
      toast.error('Erro ao buscar dados de evolução');
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

  // Dados para gráfico de lojas
  const dadosGraficoLojas = lojasFiltradas.map(loja => ({
    nome: loja.nomeLoja,
    vendido: loja.totalGeral,
    meta: loja.metaMes
  }));

  // Dados para gráfico de pizza (distribuição de vendas)
  const dadosPizza = lojasFiltradas.map(loja => ({
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
        {/* Filtros e Busca */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Loja</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nome da loja ou gerente..."
                  value={buscaLoja}
                  onChange={(e) => setBuscaLoja(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="input-field"
              >
                <option value="">Todos</option>
                <option value="batida">Meta Batida</option>
                <option value="andamento">Em Andamento</option>
                <option value="abaixo">Abaixo da Meta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar</label>
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="input-field"
              >
                <option value="desempenho">Desempenho</option>
                <option value="vendas">Vendas</option>
                <option value="nome">Nome</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={() => fetchEvolucao(tipoEvolucao)}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <FaChartLine /> Evolução
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="btn-secondary p-2"
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
            </div>
          </div>
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

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="card mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
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

        {/* Métricas Avançadas */}
        {metricas && metricas.metricas && (
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Métricas Avançadas</h3>
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
          <div className="card mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Previsão de Vendas</h3>
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de Lojas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">Detalhes das Lojas ({lojasFiltradas.length})</h3>
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
              <div key={loja.gerenteId} className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchDetalhesLoja(loja.gerenteId)}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-800">{loja.nomeLoja}</h4>
                  <div className="flex items-center gap-2">
                    {loja.metaBatida ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        Meta Batida
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        loja.percentualAtingido >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {loja.percentualAtingido >= 70 ? 'Em andamento' : 'Abaixo da meta'}
                      </span>
                    )}
                    <FaEye className="text-gray-400 hover:text-gray-600" title="Ver detalhes" />
                  </div>
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

      {/* Modal Detalhes Loja */}
      {showModalLoja && detalhesLoja && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{detalhesLoja.gerente.nomeLoja}</h2>
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
                      <p className="text-sm text-gray-600">Total Vendido: R$ {detalhesLoja.meta.totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
              {detalhesLoja.vendasDiariasLoja && detalhesLoja.vendasDiariasLoja.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Vendas Diárias da Loja</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={detalhesLoja.vendasDiariasLoja.map(v => ({
                      data: new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                      valor: v.valor
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="data" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Line type="monotone" dataKey="valor" stroke="#169486" strokeWidth={2} />
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
    </div>
  );
};

export default DashboardDono;

