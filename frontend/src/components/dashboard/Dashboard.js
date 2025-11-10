import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useDarkMode } from '../../contexts/DarkModeContext';
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
  FaBell,
  FaArrowUp,
  FaArrowDown,
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
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart,
  Brush,
  ReferenceLine
} from 'recharts';
import { notifyMetaBatida, notifyTarefasPendentes } from '../../utils/notifications';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = ({ setIsAuthenticated }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [compararPeriodo, setCompararPeriodo] = useState(false);
  const [mesComparacao, setMesComparacao] = useState(new Date().getMonth());
  const [anoComparacao, setAnoComparacao] = useState(new Date().getFullYear());
  const [dadosComparacao, setDadosComparacao] = useState(null);
  const [dadosMesAnterior, setDadosMesAnterior] = useState(null);
  const [layoutWidgets, setLayoutWidgets] = useState(() => {
    const saved = localStorage.getItem('dashboardLayout');
    return saved ? JSON.parse(saved) : null;
  });
  const [buscaFuncionario, setBuscaFuncionario] = useState('');
  const [eventosAgenda, setEventosAgenda] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [alertasJaNotificados, setAlertasJaNotificados] = useState(false);
  const { darkMode } = useDarkMode();
  const toast = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchEventosAgenda();
    fetchAlertas();
    fetchDadosMesAnterior(); // Comparação automática com mês anterior
    // Resetar flag quando mudar o mês/ano para mostrar notificações novamente
    setAlertasJaNotificados(false);
  }, [selectedMonth, selectedYear]);

  // Mostrar notificações apenas uma vez quando o Dashboard carrega
  useEffect(() => {
    if (alertas.length > 0 && !alertasJaNotificados) {
      alertas.forEach(alerta => {
        if (alerta.tipo === 'sucesso') {
          toast.success(alerta.mensagem, alerta.titulo);
        } else if (alerta.tipo === 'alerta') {
          toast.warning(alerta.mensagem, alerta.titulo);
        } else if (alerta.tipo === 'warning') {
          toast.warning(alerta.mensagem, alerta.titulo);
        } else if (alerta.tipo === 'info') {
          toast.info(alerta.mensagem, alerta.titulo);
        }
      });
      setAlertasJaNotificados(true);
    }
  }, [alertas, alertasJaNotificados, toast]);

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

  // Buscar dados do mês anterior automaticamente
  const fetchDadosMesAnterior = async () => {
    try {
      let mesAnterior = selectedMonth - 1;
      let anoAnterior = selectedYear;
      
      if (mesAnterior < 1) {
        mesAnterior = 12;
        anoAnterior = selectedYear - 1;
      }

      const response = await api.get('/dashboard', {
        params: { mes: mesAnterior, ano: anoAnterior }
      });
      setDadosMesAnterior(response.data);
    } catch (error) {
      console.error('Erro ao buscar dados do mês anterior:', error);
      setDadosMesAnterior(null);
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

  const fetchAlertas = async () => {
    try {
      const response = await api.get('/dashboard/alertas', {
        params: { mes: selectedMonth, ano: selectedYear }
      });
      const alertasRecebidos = response.data.alertas || [];
      setAlertas(alertasRecebidos);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
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

  // Calcular previsão de vendas usando métodos estatísticos (média móvel e regressão linear)
  const calcularPrevisao = () => {
    if (!dashboardData || !dashboardData.vendasDiarias || dashboardData.vendasDiarias.length === 0) {
      return null;
    }

    // IMPORTANTE: Usar o mês/ano selecionado, não o mês/ano atual
    // Se o usuário estiver visualizando um mês diferente do atual, precisamos calcular corretamente
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();
    
    // Se estiver visualizando o mês atual, usar o dia de hoje
    // Se estiver visualizando um mês passado, usar o último dia do mês
    // Se estiver visualizando um mês futuro, retornar null (não há dados)
    let diaAtual;
    if (selectedMonth === mesAtual && selectedYear === anoAtual) {
      // Mês atual: usar dia de hoje
      diaAtual = hoje.getDate();
    } else if (selectedYear < anoAtual || (selectedYear === anoAtual && selectedMonth < mesAtual)) {
      // Mês passado: usar último dia do mês
      diaAtual = new Date(selectedYear, selectedMonth, 0).getDate();
    } else {
      // Mês futuro: não há dados para previsão
      return null;
    }
    
    const diasNoMes = new Date(selectedYear, selectedMonth, 0).getDate();
    const diasRestantes = diasNoMes - diaAtual;

    if (diasRestantes <= 0) {
      return null; // Mês já terminou
    }

    // Ordenar vendas por dia
    const vendasOrdenadas = [...dashboardData.vendasDiarias].sort((a, b) => a.dia - b.dia);
    const totalAteAgora = vendasOrdenadas.reduce((sum, v) => sum + v.total, 0);
    
    console.log('=== CÁLCULO DE PREVISÃO ===');
    console.log('Mês/Ano selecionado:', selectedMonth, selectedYear);
    console.log('Mês/Ano atual:', mesAtual, anoAtual);
    console.log('Dia atual calculado:', diaAtual);
    console.log('Dias no mês:', diasNoMes);
    console.log('Dias restantes:', diasRestantes);
    console.log('Total até agora:', totalAteAgora);
    console.log('Número de dias com vendas:', vendasOrdenadas.length);
    
    // Método 1: Média Simples (CORRIGIDO: dividir pelo número de dias que já passaram, não pelo número de dias com vendas)
    // Se dividirmos apenas pelos dias com vendas, a média fica inflada quando há dias sem vendas
    const mediaSimples = totalAteAgora / diaAtual; // Média diária baseada nos dias que já passaram
    console.log('Média simples (total / dias passados):', mediaSimples);
    const previsaoSimples = totalAteAgora + (mediaSimples * diasRestantes);

    // Método 2: Média Móvel (últimos 7 dias, se houver)
    let mediaMovel = mediaSimples;
    if (vendasOrdenadas.length >= 7) {
      const ultimos7Dias = vendasOrdenadas.slice(-7);
      const somaUltimos7 = ultimos7Dias.reduce((sum, v) => sum + v.total, 0);
      mediaMovel = somaUltimos7 / 7;
    }
    const previsaoMediaMovel = totalAteAgora + (mediaMovel * diasRestantes);

    // Método 3: Regressão Linear Simples (tendência)
    let tendencia = 0;
    let previsaoRegressao = previsaoSimples;
    if (vendasOrdenadas.length >= 3) {
      // Calcular tendência usando regressão linear simples
      // IMPORTANTE: Usar os dias reais do mês, não índices
      const n = vendasOrdenadas.length;
      let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;
      
      vendasOrdenadas.forEach((venda) => {
        const x = venda.dia; // Usar o dia real do mês, não o índice
        const y = venda.total;
        somaX += x;
        somaY += y;
        somaXY += x * y;
        somaX2 += x * x;
      });

      // Fórmula da regressão linear: y = a + b*x
      const b = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
      const a = (somaY - b * somaX) / n;
      
      tendencia = b; // Inclinação da reta
      
      // Projetar para os próximos dias usando o último dia com venda como referência
      let projecaoRegressao = 0;
      const ultimoDiaComVenda = Math.max(...vendasOrdenadas.map(v => v.dia));
      
      for (let i = 1; i <= diasRestantes; i++) {
        const diaProjecao = ultimoDiaComVenda + i;
        const valorProjecao = a + b * diaProjecao;
        projecaoRegressao += Math.max(0, valorProjecao); // Não permitir valores negativos
      }
      previsaoRegressao = totalAteAgora + projecaoRegressao;
    }

    // Método 4: Média ponderada (últimos dias têm mais peso)
    let mediaPonderada = mediaSimples;
    if (vendasOrdenadas.length >= 3) {
      const pesos = vendasOrdenadas.map((_, index) => index + 1); // Peso aumenta com o tempo
      const somaPonderada = vendasOrdenadas.reduce((sum, v, index) => sum + (v.total * pesos[index]), 0);
      const somaPesos = pesos.reduce((sum, p) => sum + p, 0);
      mediaPonderada = somaPonderada / somaPesos;
    }
    const previsaoPonderada = totalAteAgora + (mediaPonderada * diasRestantes);

    // Combinar métodos: média ponderada dos resultados (50% regressão, 30% média móvel, 20% simples)
    let previsaoFinal = previsaoSimples;
    if (vendasOrdenadas.length >= 7) {
      previsaoFinal = (
        previsaoRegressao * 0.4 +
        previsaoMediaMovel * 0.3 +
        previsaoPonderada * 0.2 +
        previsaoSimples * 0.1
      );
    } else if (vendasOrdenadas.length >= 3) {
      previsaoFinal = (
        previsaoRegressao * 0.5 +
        previsaoPonderada * 0.3 +
        previsaoSimples * 0.2
      );
    }

    // Calcular confiança baseada em quantidade de dados e consistência
    let confianca = 50;
    if (vendasOrdenadas.length >= 15) confianca = 85;
    else if (vendasOrdenadas.length >= 10) confianca = 75;
    else if (vendasOrdenadas.length >= 7) confianca = 65;
    else if (vendasOrdenadas.length >= 3) confianca = 55;

    // Ajustar confiança baseado na variabilidade dos dados
    if (vendasOrdenadas.length >= 3) {
      const valores = vendasOrdenadas.map(v => v.total);
      const media = valores.reduce((sum, v) => sum + v, 0) / valores.length;
      const variacao = valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length;
      const desvioPadrao = Math.sqrt(variacao);
      const coeficienteVariacao = media > 0 ? (desvioPadrao / media) : 1;
      
      // Menor variabilidade = maior confiança
      if (coeficienteVariacao < 0.2) confianca += 10;
      else if (coeficienteVariacao > 0.5) confianca -= 10;
    }

    // Calcular média diária correta (total até agora dividido pelos dias que já passaram)
    const mediaDiariaCorreta = totalAteAgora / diaAtual;
    
    console.log('Média diária correta:', mediaDiariaCorreta);
    console.log('Previsão final:', previsaoFinal);
    console.log('Percentual da meta:', dashboardData.resumo.metaMes > 0 
      ? (previsaoFinal / dashboardData.resumo.metaMes) * 100 
      : 0);

    return {
      totalAteAgora,
      mediaDiaria: mediaDiariaCorreta, // Usar média correta baseada nos dias que já passaram
      diasRestantes,
      previsaoTotal: previsaoFinal,
      previsaoSimples,
      previsaoMediaMovel,
      previsaoRegressao,
      previsaoPonderada,
      tendencia,
      confianca: Math.min(95, Math.max(30, confianca)),
      percentualPrevisao: dashboardData.resumo.metaMes > 0 
        ? (previsaoFinal / dashboardData.resumo.metaMes) * 100 
        : 0,
      diasPassados: diaAtual, // Adicionar informação útil para debug
      diasNoMes // Adicionar informação útil para debug
    };
  };

  const previsao = calcularPrevisao();

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
      }`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors`}>
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
      }`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className={`text-xl ${darkMode ? 'text-red-400' : 'text-red-600'} transition-colors`}>
            Erro ao carregar dados
          </div>
        </div>
      </div>
    );
  }

  const { resumo, vendasMes, topVendedoresMes, vendasDiarias, aniversariantes } = dashboardData;

  console.log('=== DADOS DO DASHBOARD ===');
  console.log('Vendas diárias recebidas:', vendasDiarias);
  console.log('Total de dias com vendas:', vendasDiarias?.length || 0);
  console.log('Total de vendas diárias:', vendasDiarias?.reduce((sum, v) => sum + (v.total || 0), 0) || 0);

  // Gráfico de vendas do mês (comparativo com meta)
  const chartDataMes = vendasMes.map(v => ({
    name: v.nomeCompleto || v.nome,
    vendas: v.valor,
    meta: v.metaIndividual
  }));

  // Gráfico de Top Vendedores do Mês (ranking)
  const chartDataTopMes = topVendedoresMes.map(v => ({
    name: v.nomeCompleto || v.nome,
    vendas: v.valor
  }));

  // Gráfico de vendas diárias
  const chartDataDiarias = (vendasDiarias || []).map(v => ({
    dia: v.dia,
    total: v.total || 0,
    quantidade: v.quantidade || 0
  }));
  
  console.log('Dados do gráfico de vendas diárias:', chartDataDiarias);

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

  // Filtrar funcionários por busca (buscar em nome e sobrenome)
  const funcionariosFiltrados = buscaFuncionario
    ? vendasMes.filter(v => {
        const nomeCompleto = (v.nomeCompleto || v.nome || '').toLowerCase();
        const nome = (v.nome || '').toLowerCase();
        const sobrenome = (v.sobrenome || '').toLowerCase();
        const busca = buscaFuncionario.toLowerCase();
        return nomeCompleto.includes(busca) || nome.includes(busca) || sobrenome.includes(busca);
      })
    : vendasMes;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'
    }`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com filtros */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-2 transition-colors`}>
              Dashboard
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors`}>
              Visão geral do desempenho da loja
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
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
              className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
              style={{ minWidth: '100px', width: 'auto' }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              onClick={() => setCompararPeriodo(!compararPeriodo)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                compararPeriodo 
                  ? 'bg-blue-500 text-white' 
                  : darkMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <FaFilter /> Comparar Período
            </button>
          </div>
        </div>

        {/* Filtros de Comparação */}
        {compararPeriodo && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50'} rounded-xl shadow-lg p-6 mb-6 transition-colors`}>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2 transition-colors`}>
              <FaFilter /> Comparar com Outro Período
            </h3>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                  Mês
                </label>
                <select
                  value={mesComparacao}
                  onChange={(e) => setMesComparacao(parseInt(e.target.value))}
                  className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2000, m - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1 transition-colors`}>
                  Ano
                </label>
                <select
                  value={anoComparacao}
                  onChange={(e) => setAnoComparacao(parseInt(e.target.value))}
                  className={`input-field ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''}`}
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
              className={`input-field pl-10 w-full md:w-96 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''}`}
            />
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
              : resumo.statusMeta === 'no_prazo'
              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
              : resumo.statusMeta === 'no_ritmo'
              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
              : 'bg-gradient-to-br from-red-500 to-red-600'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-opacity-90 text-sm mb-1">Vendas da Loja</p>
                <p className="text-3xl font-bold">
                  R$ {resumo.totalVendidoLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm mt-1">
                  {resumo.percentualAtingido.toFixed(1)}% da meta
                  {resumo.metaBatida ? ' ✅' : 
                   resumo.statusMeta === 'no_prazo' ? ' 📈' :
                   resumo.statusMeta === 'no_ritmo' ? ' ➡️' : ' ⚠️'}
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

          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Vendas Comerciais</p>
                <p className="text-3xl font-bold">
                  R$ {(resumo?.totalVendasComerciais || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm mt-1">
                  {resumo?.totalVendasComerciais > 0 ? 'Total do mês' : 'Nenhuma venda registrada'}
                </p>
                {resumo?.totalVendasComerciais > 0 && (
                  <p className="text-xs mt-1 font-semibold">
                    Vendas do mês atual
                  </p>
                )}
              </div>
              <FaDollarSign className="text-4xl opacity-80" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-amber-600 to-amber-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm mb-1">Destaque do Mês</p>
                <p className="text-xl font-bold truncate">
                  {resumo.melhorVendedorMes.nomeCompleto || resumo.melhorVendedorMes.nome}
                </p>
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
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : ''} rounded-xl shadow-lg p-6 mb-8 ${
            resumo.metaBatida 
              ? darkMode
                ? 'border-2 border-green-600'
                : 'bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300'
              : resumo.statusMeta === 'no_prazo'
              ? darkMode
                ? 'border-2 border-blue-600'
                : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300'
              : resumo.statusMeta === 'no_ritmo'
              ? darkMode
                ? 'border-2 border-yellow-600'
                : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300'
              : darkMode
                ? 'border-2 border-red-600'
                : 'bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300'
          } transition-colors`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center gap-2 transition-colors`}>
                  <FaBullseye className={
                    resumo.metaBatida ? 'text-green-600' :
                    resumo.statusMeta === 'no_prazo' ? 'text-blue-600' :
                    resumo.statusMeta === 'no_ritmo' ? 'text-yellow-600' :
                    'text-red-600'
                  } />
                  Status da Meta da Loja
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 transition-colors`}>
                  {new Date(2000, selectedMonth - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              {resumo.metaBatida && (
                <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-lg">
                  🎯 META BATIDA!
                </div>
              )}
              {!resumo.metaBatida && resumo.statusMeta === 'no_prazo' && (
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                  No Prazo
                </div>
              )}
              {!resumo.metaBatida && resumo.statusMeta === 'no_ritmo' && (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                  No Ritmo
                </div>
              )}
              {!resumo.metaBatida && resumo.statusMeta === 'abaixo' && (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                  Abaixo da Meta
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Meta Mensal
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  R$ {resumo.metaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Total Vendido
                </p>
                <p className={`text-2xl font-bold ${
                  resumo.metaBatida ? 'text-green-600' :
                  resumo.statusMeta === 'no_prazo' ? 'text-blue-600' :
                  resumo.statusMeta === 'no_ritmo' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  R$ {resumo.totalVendidoLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg shadow transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
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
              <div className="flex justify-between items-center text-sm">
                <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium transition-colors`}>
                  Progresso
                </span>
                <div className="flex flex-col items-end">
                  <span className={`font-bold ${
                    resumo.metaBatida ? 'text-green-600' :
                    resumo.statusMeta === 'no_prazo' ? 'text-blue-600' :
                    resumo.statusMeta === 'no_ritmo' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {resumo.percentualAtingido.toFixed(1)}%
                  </span>
                  {resumo.percentualEsperado && resumo.diasDecorridos && (
                    <span className="text-xs text-gray-500 mt-0.5">
                      Esperado: {resumo.percentualEsperado.toFixed(1)}% ({resumo.diasDecorridos}/{resumo.diasNoMes} dias)
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    resumo.metaBatida ? 'bg-green-500' :
                    resumo.statusMeta === 'no_prazo' ? 'bg-blue-500' :
                    resumo.statusMeta === 'no_ritmo' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min(100, resumo.percentualAtingido)}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Alertas e Notificações */}
        {alertas.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FaBell className="text-3xl text-yellow-600" />
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  Alertas e Notificações ({alertas.length})
                </h2>
              </div>
            </div>
            <div className="space-y-3">
              {alertas.map((alerta, idx) => (
                <div
                  key={idx}
                  className={`${
                    alerta.tipo === 'sucesso' 
                      ? darkMode ? 'bg-green-900 border-green-700' : 'bg-green-50 border-green-300'
                      : alerta.tipo === 'alerta'
                      ? darkMode ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-300'
                      : alerta.tipo === 'warning'
                      ? darkMode ? 'bg-orange-900 border-orange-700' : 'bg-orange-50 border-orange-300'
                      : darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-300'
                  } border-l-4 p-4 rounded-lg shadow-sm transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{alerta.icone}</span>
                    <div className="flex-1">
                      <h3 className={`font-bold mb-1 ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      } transition-colors`}>
                        {alerta.titulo}
                      </h3>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      } transition-colors`}>
                        {alerta.mensagem}
                      </p>
                      {alerta.funcionarios && alerta.funcionarios.length > 0 && (
                        <div className="mt-2">
                          <p className={`text-xs font-semibold mb-1 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          } transition-colors`}>
                            Funcionários:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {alerta.funcionarios.map((nome, i) => (
                              <span
                                key={i}
                                className={`px-2 py-1 rounded text-xs ${
                                  darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-700'
                                } transition-colors`}
                              >
                                {nome}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {alerta.valor && alerta.meta && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          } transition-colors`}>
                            Vendido: R$ {alerta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          } transition-colors`}>
                            Meta: R$ {alerta.meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aniversariantes */}
        {aniversariantes.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-pink-100 to-red-100 border-2 border-pink-300'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <div className="flex items-center gap-3 mb-4">
              <FaBirthdayCake className="text-3xl text-pink-600" />
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                Aniversariantes do Mês
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {aniversariantes.map(aniv => (
                <div
                  key={aniv.id}
                  className={`${darkMode ? 'bg-gray-700' : 'bg-white'} px-4 py-2 rounded-lg shadow-md flex items-center gap-2 transition-colors`}
                >
                  <FaBirthdayCake className="text-yellow-500" />
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                    {aniv.nome}
                  </span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>- Dia {aniv.dia}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eventos da Agenda */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Eventos de Hoje */}
          {getEventosHoje().length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300'} rounded-xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaCalendar className="text-3xl text-blue-600" />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                    Eventos de Hoje
                  </h2>
                </div>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {getEventosHoje().length}
                </span>
              </div>
              <div className="space-y-2">
                {getEventosHoje().map(evento => (
                  <div
                    key={evento._id}
                    className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all`}
                    style={{ borderLeftColor: getCorTipo(evento.tipo) }}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                        {evento.titulo}
                      </h3>
                      <span className={`w-2 h-2 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                    </div>
                    {evento.descricao && (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>
                        {evento.descricao}
                      </p>
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
              <div className={`mt-4 pt-4 ${darkMode ? 'border-gray-600' : 'border-blue-200'} border-t`}>
                <Link
                  to="/agenda"
                  className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-sm font-semibold flex items-center gap-2 transition-colors`}
                >
                  Ver todos os eventos →
                </Link>
              </div>
            </div>
          )}

          {/* Próximos Eventos */}
          {getProximosEventos().length > 0 && (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300'} rounded-xl shadow-lg p-6 transition-colors`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaBell className="text-3xl text-purple-600" />
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                    Próximos Eventos
                  </h2>
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
                      className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-3 rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all`}
                      style={{ borderLeftColor: getCorTipo(evento.tipo) }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                          {evento.titulo}
                        </h3>
                        <span className={`w-2 h-2 rounded-full ${getCorPrioridade(evento.prioridade)}`}></span>
                      </div>
                      {evento.descricao && (
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>
                          {evento.descricao}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded" style={{
                            backgroundColor: getCorTipo(evento.tipo) + '20',
                            color: getCorTipo(evento.tipo)
                          }}>
                            {evento.tipo}
                          </span>
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
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
              <div className={`mt-4 pt-4 ${darkMode ? 'border-gray-600' : 'border-purple-200'} border-t`}>
                <Link
                  to="/agenda"
                  className={`${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-800'} text-sm font-semibold flex items-center gap-2 transition-colors`}
                >
                  Ver todos os eventos →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Previsão de Vendas */}
        {previsao && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2 transition-colors`}>
              <FaChartLine /> Previsão de Vendas para o Final do Mês
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Total até Agora
                </p>
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  R$ {previsao.totalAteAgora.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Média Diária
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {previsao.mediaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Previsão Total
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  R$ {previsao.previsaoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  % da Meta (Previsão)
                </p>
                <p className={`text-2xl font-bold ${
                  previsao.percentualPrevisao >= 100 ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {previsao.percentualPrevisao.toFixed(1)}%
                </p>
              </div>
              {previsao.confianca && (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors md:col-span-4`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 transition-colors`}>
                    Confiança da Previsão: {previsao.confianca.toFixed(0)}%
                  </p>
                  <div className={`w-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        previsao.confianca >= 75 ? 'bg-green-500' : 
                        previsao.confianca >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${previsao.confianca}%` }}
                    ></div>
                  </div>
                  {previsao.tendencia && (
                    <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors`}>
                      Tendência: {previsao.tendencia > 0 ? '📈 Crescimento' : previsao.tendencia < 0 ? '📉 Declínio' : '➡️ Estável'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
                  R$ {dadosMesAnterior.resumo.totalVendidoGeral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 
                      dadosMesAnterior.resumo.totalVendidoLoja?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Vendas - Mês Atual
                </p>
                <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} transition-colors`}>
                  R$ {dashboardData.resumo.totalVendidoGeral?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || 
                      dashboardData.resumo.totalVendidoLoja?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                </p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-white'} p-4 rounded-lg transition-colors`}>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1 transition-colors`}>
                  Variação
                </p>
                {(() => {
                  const vendasAnterior = dadosMesAnterior.resumo.totalVendidoGeral || dadosMesAnterior.resumo.totalVendidoLoja || 0;
                  const vendasAtual = dashboardData.resumo.totalVendidoGeral || dashboardData.resumo.totalVendidoLoja || 0;
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
                  const metaAnterior = dadosMesAnterior.resumo.metaMes || 0;
                  const metaAtual = dashboardData.resumo.metaMes || 0;
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
                  vendas: dadosMesAnterior.resumo.totalVendidoGeral || dadosMesAnterior.resumo.totalVendidoLoja || 0,
                  meta: dadosMesAnterior.resumo.metaMes || 0
                },
                {
                  periodo: 'Mês Atual',
                  vendas: dashboardData.resumo.totalVendidoGeral || dashboardData.resumo.totalVendidoLoja || 0,
                  meta: dashboardData.resumo.metaMes || 0
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

        {/* Gráfico Comparativo */}
        {compararPeriodo && chartDataComparativo.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Comparativo entre Períodos
            </h2>
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
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Vendas do Mês vs Meta Individual
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataMes} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis 
                  dataKey="name" 
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
                <Brush dataKey="name" height={30} stroke={darkMode ? '#4b5563' : '#8884d8'} />
                <Bar dataKey="vendas" fill="#ef4444" name="Vendas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="meta" fill="#f97316" name="Meta Individual" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Top Vendedores do Mês (ranking) */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 transition-colors`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Top Vendedores do Mês
            </h2>
            {chartDataTopMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartDataTopMes} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                  <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                  <YAxis dataKey="name" type="category" width={100} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
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
                  <Bar dataKey="vendas" fill="#eab308" name="Vendas do Mês" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={`flex items-center justify-center h-[300px] ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`}>
                <p>Nenhuma venda registrada este mês</p>
              </div>
            )}
          </div>
        </div>

        {/* Ranking Completo de Funcionários */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center gap-2 transition-colors`}>
            <FaTrophy /> Ranking Completo de Funcionários
          </h2>
          {funcionariosFiltrados.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`px-4 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Posição
                    </th>
                    <th className={`px-4 py-2 text-left ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nome
                    </th>
                    <th className={`px-4 py-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Vendas (R$)
                    </th>
                    <th className={`px-4 py-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meta (R$)
                    </th>
                    <th className={`px-4 py-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      % da Meta
                    </th>
                    <th className={`px-4 py-2 text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </th>
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
                        <tr key={func.funcionarioId} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                          <td className="px-4 py-2">
                            <span className={`font-bold ${
                              index === 0 ? 'text-yellow-500' : 
                              index === 1 ? 'text-gray-400' : 
                              index === 2 ? 'text-orange-600' : 
                              darkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className={`px-4 py-2 font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            {func.nomeCompleto || func.nome}
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-green-600">
                            R$ {func.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`px-4 py-2 text-right ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors`}>
              <p>Nenhum funcionário encontrado</p>
            </div>
          )}
        </div>

        {/* Gráfico de Vendas Diárias */}
        {chartDataDiarias.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-lg p-6 mb-8 transition-colors`}>
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4 transition-colors`}>
              Vendas Diárias do Mês
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataDiarias} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#4b5563' : '#e5e7eb'} />
                <XAxis 
                  dataKey="dia" 
                  label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5 }}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fill: darkMode ? '#9ca3af' : '#6b7280' }}
                />
                <YAxis 
                  label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                />
                <Tooltip 
                  formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  labelFormatter={(dia) => `Dia ${dia}`}
                  contentStyle={{
                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px'
                  }}
                  cursor={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Legend />
                <Brush 
                  dataKey="dia" 
                  height={30} 
                  stroke={darkMode ? '#4b5563' : '#8884d8'}
                  fill={darkMode ? '#374151' : '#f3f4f6'}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Total de Vendas (R$)"
                  dot={{ r: 5, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                  animationDuration={300}
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

