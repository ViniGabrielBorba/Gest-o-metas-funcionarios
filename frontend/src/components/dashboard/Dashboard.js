import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import {
  FaUsers,
  FaBullseye,
  FaTrophy,
  FaChartLine,
  FaBirthdayCake,
  FaStar,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaBell
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
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';
import { notifyMetaBatida, notifyTarefasPendentes } from '../../utils/notifications';

const Dashboard = ({ setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [compararPeriodo, setCompararPeriodo] = useState(false);
  const [mesComparacao, setMesComparacao] = useState(new Date().getMonth());
  const [anoComparacao, setAnoComparacao] = useState(new Date().getFullYear());
  const [dadosComparacao, setDadosComparacao] = useState(null);
  const [buscaFuncionario, setBuscaFuncionario] = useState('');
  const [eventosAgenda, setEventosAgenda] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchEventosAgenda();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (compararPeriodo) {
      fetchDadosComparacao();
    }
  }, [compararPeriodo, mesComparacao, anoComparacao]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      setDashboardData(response.data);
      
      // Verificar se meta foi batida e enviar notificação
      if (response.data.resumo.metaBatida && response.data.resumo.excedenteMeta > 0) {
        notifyMetaBatida(
          new Date(2000, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long' }),
          response.data.resumo.excedenteMeta
        );
      }
      
      // Verificar tarefas pendentes (funcionários sem vendas no mês)
      const funcionariosSemVendas = response.data.vendasMes.filter(v => v.valor === 0).length;
      if (funcionariosSemVendas > 0) {
        notifyTarefasPendentes(funcionariosSemVendas);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDadosComparacao = async () => {
    try {
      const response = await api.get('/dashboard', {
        params: { mes: mesComparacao, ano: anoComparacao }
      });
      setDadosComparacao(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados de comparação:', error);
    }
  };

  const fetchEventosAgenda = async () => {
    try {
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const anoAtual = hoje.getFullYear();
      
      const response = await api.get(`/agenda/eventos?mes=${mesAtual}&ano=${anoAtual}`);
      setEventosAgenda(response.data.eventos || []);
    } catch (error) {
      console.error('Erro ao buscar eventos da agenda:', error);
    }
  };

  // Obter eventos de hoje
  const getEventosHoje = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return eventosAgenda.filter(evento => {
      const dataEvento = new Date(evento.data);
      dataEvento.setHours(0, 0, 0, 0);
      return dataEvento.getTime() === hoje.getTime() && !evento.concluido;
    }).slice(0, 5); // Máximo 5 eventos
  };

  // Obter próximos eventos (próximos 7 dias)
  const getProximosEventos = () => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const proximos7Dias = new Date(hoje);
    proximos7Dias.setDate(proximos7Dias.getDate() + 7);
    
    return eventosAgenda.filter(evento => {
      const dataEvento = new Date(evento.data);
      dataEvento.setHours(0, 0, 0, 0);
      return dataEvento > hoje && 
             dataEvento <= proximos7Dias && 
             !evento.concluido;
    }).sort((a, b) => new Date(a.data) - new Date(b.data)).slice(0, 5); // Máximo 5 eventos
  };

  const getCorPrioridade = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCorTipo = (tipo) => {
    switch (tipo) {
      case 'tarefa': return '#169486';
      case 'compromisso': return '#3b82f6';
      case 'reuniao': return '#8b5cf6';
      case 'lembrete': return '#f59e0b';
      case 'meta': return '#ef4444';
      default: return '#169486';
    }
  };

  // Calcular previsão de vendas baseada na média diária
  const calcularPrevisao = () => {
    if (!dashboardData || !dashboardData.vendasDiarias || dashboardData.vendasDiarias.length === 0) {
      return null;
    }

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
    const diasRestantes = diasNoMes - diaAtual;

    // Calcular média diária até agora
    const totalAteAgora = dashboardData.vendasDiarias.reduce((sum, v) => sum + v.total, 0);
    const mediaDiaria = totalAteAgora / dashboardData.vendasDiarias.length;

    // Previsão = total atual + (média diária * dias restantes)
    const previsaoTotal = totalAteAgora + (mediaDiaria * diasRestantes);

    return {
      totalAteAgora,
      mediaDiaria,
      diasRestantes,
      previsaoTotal,
      percentualPrevisao: dashboardData.resumo.metaMes > 0 
        ? (previsaoTotal / dashboardData.resumo.metaMes) * 100 
        : 0
    };
  };

  const previsao = calcularPrevisao();

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

  // Gráfico comparativo entre períodos
  const chartDataComparativo = compararPeriodo && dadosComparacao ? [
    {
      periodo: `${new Date(2000, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'short' })}/${selectedYear}`,
      vendas: dashboardData.resumo.totalVendidoLoja,
      meta: dashboardData.resumo.metaMes
    },
    {
      periodo: `${new Date(2000, mesComparacao - 1).toLocaleDateString('pt-BR', { month: 'short' })}/${anoComparacao}`,
      vendas: dadosComparacao.resumo.totalVendidoLoja,
      meta: dadosComparacao.resumo.metaMes
    }
  ] : [];

  // Filtrar funcionários por busca
  const funcionariosFiltrados = buscaFuncionario
    ? vendasMes.filter(v => v.nome.toLowerCase().includes(buscaFuncionario.toLowerCase()))
    : vendasMes;

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
            <button
              onClick={() => setCompararPeriodo(!compararPeriodo)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                compararPeriodo 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaFilter /> Comparar Período
            </button>
          </div>
        </div>

        {/* Filtros de Comparação */}
        {compararPeriodo && (
          <div className="card mb-6 bg-blue-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaFilter /> Comparar com Outro Período
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <select
                  value={mesComparacao}
                  onChange={(e) => setMesComparacao(parseInt(e.target.value))}
                  className="input-field"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <select
                  value={anoComparacao}
                  onChange={(e) => setAnoComparacao(parseInt(e.target.value))}
                  className="input-field"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Busca de Funcionários */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar funcionário por nome..."
              value={buscaFuncionario}
              onChange={(e) => setBuscaFuncionario(e.target.value)}
              className="input-field pl-10 w-full md:w-96"
            />
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

        {/* Eventos da Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Eventos de Hoje */}
          {getEventosHoje().length > 0 && (
            <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-3xl text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Eventos de Hoje</h2>
                </div>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {getEventosHoje().length}
                </span>
              </div>
              <div className="space-y-2">
                {getEventosHoje().map(evento => (
                  <div
                    key={evento._id}
                    className="bg-white p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: getCorTipo(evento.tipo) }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800">{evento.titulo}</h3>
                      <span className={`w-2 h-2 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                    </div>
                    {evento.descricao && (
                      <p className="text-sm text-gray-600 mb-2">{evento.descricao}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="px-2 py-1 rounded" style={{
                        backgroundColor: getCorTipo(evento.tipo) + '20',
                        color: getCorTipo(evento.tipo)
                      }}>
                        {evento.tipo}
                      </span>
                      {evento.notificacao.ativo && (
                        <span className="text-blue-600 flex items-center gap-1">
                          <FaBell /> Lembrete ativo
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <Link
                  to="/agenda"
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center gap-2"
                >
                  Ver todos os eventos →
                </Link>
              </div>
            </div>
          )}

          {/* Próximos Eventos */}
          {getProximosEventos().length > 0 && (
            <div className="card bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaBell className="text-3xl text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Próximos Eventos</h2>
                </div>
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {getProximosEventos().length}
                </span>
              </div>
              <div className="space-y-2">
                {getProximosEventos().map(evento => {
                  const dataEvento = new Date(evento.data);
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const diasRestantes = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div
                      key={evento._id}
                      className="bg-white p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow"
                      style={{ borderLeftColor: getCorTipo(evento.tipo) }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-gray-800">{evento.titulo}</h3>
                        <span className={`w-2 h-2 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                      </div>
                      {evento.descricao && (
                        <p className="text-sm text-gray-600 mb-2">{evento.descricao}</p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded" style={{
                            backgroundColor: getCorTipo(evento.tipo) + '20',
                            color: getCorTipo(evento.tipo)
                          }}>
                            {evento.tipo}
                          </span>
                          <span className="text-gray-500">
                            {dataEvento.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <span className={`font-semibold ${
                          diasRestantes <= 2 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {diasRestantes === 1 ? 'Amanhã' : `Em ${diasRestantes} dias`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-purple-200">
                <Link
                  to="/agenda"
                  className="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center gap-2"
                >
                  Ver todos os eventos →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Previsão de Vendas */}
        {previsao && (
          <div className="card mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine /> Previsão de Vendas para o Final do Mês
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total até Agora</p>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {previsao.totalAteAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Média Diária</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {previsao.mediaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Previsão Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {previsao.previsaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">% da Meta (Previsão)</p>
                <p className={`text-2xl font-bold ${
                  previsao.percentualPrevisao >= 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {previsao.percentualPrevisao.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico Comparativo */}
        {compararPeriodo && chartDataComparativo.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Comparativo entre Períodos</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartDataComparativo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="vendas" fill="#10b981" name="Vendas" />
                <Bar dataKey="meta" fill="#ef4444" name="Meta" />
              </ComposedChart>
            </ResponsiveContainer>
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

        {/* Ranking Completo de Funcionários */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTrophy /> Ranking Completo de Funcionários
          </h2>
          {funcionariosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Posição</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-right">Vendas (R$)</th>
                    <th className="px-4 py-2 text-right">Meta (R$)</th>
                    <th className="px-4 py-2 text-right">% da Meta</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {funcionariosFiltrados
                    .sort((a, b) => b.valor - a.valor)
                    .map((func, index) => {
                      const percentual = func.metaIndividual > 0 
                        ? (func.valor / func.metaIndividual) * 100 
                        : 0;
                      const metaBatida = func.valor >= func.metaIndividual;
                      
                      return (
                        <tr key={func.funcionarioId} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <span className={`font-bold ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              index === 2 ? 'text-orange-600' : 
                              'text-gray-600'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-semibold">{func.nome}</td>
                          <td className="px-4 py-2 text-right font-bold text-green-600">
                            R$ {func.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            R$ {func.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-semibold ${
                              metaBatida ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {percentual.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {metaBatida ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                                ✅ Meta Batida
                              </span>
                            ) : (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-semibold">
                                ⚠️ Em Andamento
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum funcionário encontrado</p>
            </div>
          )}
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

