import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { FaPlus, FaEdit, FaTrash, FaBullseye, FaChartBar, FaDollarSign, FaCalendar, FaPrint, FaFilter } from 'react-icons/fa';
import { notifyMetaBatida } from '../../utils/notifications';
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

const Metas = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [vendasDiarias, setVendasDiarias] = useState([]);
  const [resumoVendas, setResumoVendas] = useState(null);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [topFuncionarios, setTopFuncionarios] = useState([]);
  const [chartDataMensal, setChartDataMensal] = useState(null);
  const [showParabens, setShowParabens] = useState(false);
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    valor: ''
  });
  const [vendaData, setVendaData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    observacao: ''
  });
  const [showEditVendaModal, setShowEditVendaModal] = useState(false);
  const [vendaEditando, setVendaEditando] = useState(null);
  const [vendaEditData, setVendaEditData] = useState({
    data: '',
    valor: '',
    observacao: ''
  });

  useEffect(() => {
    fetchMetas();
  }, []);

  // Verificar se precisa mostrar animação de parabéns
  useEffect(() => {
    const temMetaBatida = metas.some(m => (m.totalVendido || 0) >= m.valor && m.valor > 0);
    if (temMetaBatida) {
      setShowParabens(true);
      // Esconder animação após 5 segundos
      const timer = setTimeout(() => {
        setShowParabens(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [metas]);

  const fetchMetas = async () => {
    try {
      const response = await api.get('/metas');
      setMetas(response.data);
      
      // Verificar se alguma meta foi batida após atualizar
      const metasBatidas = response.data.filter(m => (m.totalVendido || 0) >= m.valor && m.valor > 0);
      if (metasBatidas.length > 0) {
        setShowParabens(true);
        setTimeout(() => setShowParabens(false), 5000);
        
        // Enviar notificação para cada meta batida
        metasBatidas.forEach(meta => {
          const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          const mesNome = meses[meta.mes - 1];
          const excedente = (meta.totalVendido || 0) - meta.valor;
          notifyMetaBatida(mesNome, excedente);
        });
      }
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (meta = null) => {
    if (meta) {
      setEditingMeta(meta);
      setFormData({
        mes: meta.mes,
        ano: meta.ano,
        valor: meta.valor
      });
    } else {
      setEditingMeta(null);
      setFormData({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        valor: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMeta(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/metas', {
        mes: parseInt(formData.mes),
        ano: parseInt(formData.ano),
        valor: parseFloat(formData.valor)
      });
      handleCloseModal();
      fetchMetas();
      
      // Mostrar notificação de sucesso
      const mensagem = editingMeta 
        ? 'Meta atualizada com sucesso!' 
        : 'Nova meta criada com sucesso!';
      toast.success(mensagem);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar meta');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta meta?')) {
      try {
        await api.delete(`/metas/${id}`);
        fetchMetas();
        toast.success('Meta excluída com sucesso!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir meta');
      }
    }
  };

  const handleOpenVendaModal = (meta) => {
    setSelectedMeta(meta);
    setShowVendaModal(true);
    setVendaData({
      data: new Date().toISOString().split('T')[0],
      valor: '',
      observacao: ''
    });
  };

  const handleSubmitVenda = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/metas/${selectedMeta._id}/vendas-diarias`, vendaData);
      setShowVendaModal(false);
      fetchMetas();
      toast.success('Venda da loja registrada com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar venda');
    }
  };

  const handleEditarVendaFuncionario = (venda, dataDia) => {
    setVendaEditando({
      ...venda,
      tipo: 'funcionario',
      dataDia: dataDia
    });
    const dataFormatada = new Date(dataDia).toISOString().split('T')[0];
    setVendaEditData({
      data: dataFormatada,
      valor: venda.valor.toString(),
      observacao: venda.observacao || ''
    });
    setShowEditVendaModal(true);
  };

  const handleEditarVendaLoja = (venda, dataDia) => {
    setVendaEditando({
      ...venda,
      tipo: 'loja',
      dataDia: dataDia
    });
    const dataFormatada = new Date(dataDia).toISOString().split('T')[0];
    setVendaEditData({
      data: dataFormatada,
      valor: venda.valor.toString(),
      observacao: venda.observacao || ''
    });
    setShowEditVendaModal(true);
  };

  const handleSubmitEditarVenda = async (e) => {
    e.preventDefault();
    try {
      if (!vendaEditData.valor || parseFloat(vendaEditData.valor) <= 0) {
        toast.warning('Por favor, informe um valor válido para a venda.');
        return;
      }

      if (vendaEditando.tipo === 'funcionario') {
        // Editar venda de funcionário
        await api.put(
          `/funcionarios/${vendaEditando.funcionarioId}/vendas-diarias/${vendaEditando.vendaId}`,
          vendaEditData
        );
      } else {
        // Editar venda da loja
        await api.put(
          `/metas/${selectedMeta._id}/vendas-diarias/${vendaEditando.vendaId}`,
          vendaEditData
        );
      }
      
      setShowEditVendaModal(false);
      setVendaEditando(null);
      
      // Recarregar histórico
      if (selectedMeta) {
        await handleVerHistorico(selectedMeta);
      }
      
      // Recarregar metas
      fetchMetas();
      
      toast.success('Venda atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao editar venda:', error);
      toast.error(error.response?.data?.message || 'Erro ao editar venda');
    }
  };

  const handleVerHistorico = async (meta) => {
    setSelectedMeta(meta);
    setLoadingHistorico(true);
    setShowHistoricoModal(true); // Abrir modal imediatamente para mostrar loading
    
    try {
      console.log('Buscando histórico para meta:', meta._id);
      
      // Buscar histórico de vendas da meta
      const response = await api.get(`/metas/${meta._id}/vendas-diarias`);
      console.log('Resposta recebida:', response.data);
      
      // Buscar dados do dashboard para funcionários destacados
      const dashboardResponse = await api.get(`/dashboard?mes=${meta.mes}&ano=${meta.ano}`);
      console.log('Dashboard recebido:', dashboardResponse.data);
      
      // Verificar se a resposta tem o formato esperado
      if (response.data && response.data.vendasAgrupadas) {
        setVendasDiarias(response.data.vendasAgrupadas);
        setResumoVendas(response.data.resumo || null);
      } else if (Array.isArray(response.data)) {
        // Fallback: se vier array direto (formato antigo)
        setVendasDiarias(response.data);
        setResumoVendas(null);
      } else {
        // Se não tiver dados, inicializar vazio
        setVendasDiarias([]);
        setResumoVendas(null);
      }
      
      // Preparar dados para gráfico mensal
      if (response.data && response.data.vendasAgrupadas) {
        const vendasPorDia = response.data.vendasAgrupadas.map(dia => ({
          dia: new Date(dia.data).getUTCDate(),
          total: dia.total
        })).sort((a, b) => a.dia - b.dia);
        
        setChartDataMensal(vendasPorDia);
      } else {
        setChartDataMensal(null);
      }
      
      // Salvar top funcionários do mês
      if (dashboardResponse.data && dashboardResponse.data.topVendedoresMes) {
        setTopFuncionarios(dashboardResponse.data.topVendedoresMes);
      } else {
        setTopFuncionarios([]);
      }
    } catch (error) {
      console.error('Erro completo ao carregar histórico:', error);
      console.error('Resposta do erro:', error.response);
      
      // Mesmo com erro, mostrar o modal mas com dados vazios
      setVendasDiarias([]);
      setResumoVendas(null);
      setChartDataMensal(null);
      setTopFuncionarios([]);
      
      // Não mostrar alerta se for erro 500 ou 404 - apenas logar no console
      // O modal já está aberto e mostrará "Nenhuma venda registrada"
      if (error.response?.status !== 500 && error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || 'Erro ao carregar histórico';
        console.warn('Aviso ao carregar histórico:', errorMessage);
      }
    } finally {
      setLoadingHistorico(false);
    }
  };
  
  const handleImprimir = () => {
    window.print();
  };
  
  // Função auxiliar para formatar mês/ano
  const formatarMesAno = (mes, ano) => {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${meses[mes - 1]} de ${ano}`;
  };
  
  // Função auxiliar para formatar nome do mês
  const formatarNomeMes = (mes) => {
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return meses[mes - 1];
  };

  const getTotalVendido = (meta) => {
    return meta.totalVendido || 0;
  };

  const getStatusMeta = (meta) => {
    const totalVendido = getTotalVendido(meta);
    const percentual = meta.valor > 0 ? (totalVendido / meta.valor) * 100 : 0;
    const faltando = Math.max(0, meta.valor - totalVendido);
    const excedente = Math.max(0, totalVendido - meta.valor);
    const batida = totalVendido >= meta.valor;

    return { totalVendido, percentual, faltando, excedente, batida };
  };

  // Verificar se alguma meta foi batida para mostrar animação
  const temMetaBatida = metas.some(m => (m.totalVendido || 0) >= m.valor && m.valor > 0);

  // Preparar dados para gráfico de meses anteriores (ordenado por ano e mês)
  const metasOrdenadas = [...metas]
    .sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano; // Ano mais recente primeiro
      return b.mes - a.mes; // Mês mais recente primeiro
    })
    .slice(0, 12); // Últimos 12 meses

  const chartData = metasOrdenadas
    .reverse() // Reverter para mostrar do mais antigo ao mais recente
    .map(m => ({
      mesAno: `${formatarNomeMes(m.mes).substring(0, 3)}/${m.ano.toString().substring(2)}`,
      mes: formatarNomeMes(m.mes),
      ano: m.ano,
      meta: m.valor,
      vendido: m.totalVendido || 0,
      batida: (m.totalVendido || 0) >= m.valor
    }));

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
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Metas Mensais</h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Defina e acompanhe as metas da loja</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Nova Meta
          </button>
        </div>

        {/* Gráfico de Metas dos Últimos Meses */}
        {chartData.length > 0 && (
          <div className={`card mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <FaChartBar /> Evolução das Metas - Últimos Meses
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="mesAno" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => {
                    const valor = typeof value === 'number' ? value : 0;
                    return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                  }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      const data = payload[0].payload;
                      return `${data.mes} de ${data.ano}`;
                    }
                    return label;
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="meta" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Meta (R$)"
                  dot={{ fill: '#ef4444', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="vendido" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Total Vendido (R$)"
                  dot={{ fill: '#10b981', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Animação de Parabéns quando meta é batida */}
        {showParabens && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              animation: 'fadeIn 0.3s ease-in'
            }}
            onClick={() => setShowParabens(false)}
          >
            <div 
              className="bg-gradient-to-r from-green-400 via-green-500 to-blue-500 rounded-2xl p-12 shadow-2xl max-w-md mx-4"
              style={{
                animation: 'scaleIn 0.5s ease-out, bounce 2s infinite',
                transform: 'scale(1)',
                border: '4px solid #fbbf24',
                boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)'
              }}
            >
              <div className="text-center text-white">
                <div 
                  className="text-8xl mb-6"
                  style={{
                    animation: 'bounce 1s infinite, rotate 2s infinite',
                    display: 'inline-block'
                  }}
                >
                  🎉
                </div>
                <h2 
                  className="text-5xl font-bold mb-4"
                  style={{
                    animation: 'pulse 1.5s infinite',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  PARABÉNS!
                </h2>
                <p className="text-3xl mb-4 font-semibold">Meta Batida! 🏆</p>
                <p className="text-xl opacity-90 mb-6">Você está no caminho certo!</p>
                <p className="text-sm opacity-75">Continue assim! 👏</p>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes scaleIn {
            0% {
              transform: scale(0.3);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            25% {
              transform: rotate(-10deg);
            }
            75% {
              transform: rotate(10deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }
          
          /* Estilos para impressão */
          @media print {
            body * {
              visibility: hidden;
            }
            #relatorio-mensal, #relatorio-mensal * {
              visibility: visible;
            }
            #relatorio-mensal {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 100%;
              margin: 0;
              padding: 20px;
              box-shadow: none;
              border: none;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print\\:block {
              display: block !important;
            }
            .print\\:mb-6 {
              margin-bottom: 1.5rem !important;
            }
            .print\\:p-4 {
              padding: 1rem !important;
            }
            .print\\:border-2 {
              border-width: 2px !important;
            }
            .print\\:border-gray-300 {
              border-color: #d1d5db !important;
            }
            .print\\:font-bold {
              font-weight: bold !important;
            }
            .print\\:h-64 {
              height: 16rem !important;
            }
          }
        `}</style>

        {/* Lista de Metas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metas.map(meta => {
            const status = getStatusMeta(meta);
            return (
              <div key={meta._id} className={`card ${
                status.batida ? 'border-2 border-green-400 bg-green-50' : ''
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {formatarMesAno(meta.mes, meta.ano)}
                    </h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      R$ {meta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <FaBullseye className="text-3xl text-orange-500" />
                </div>

                {/* Status da Meta */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Vendido:</span>
                    <span className={`font-bold text-lg ${
                      status.batida ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      R$ {status.totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Progresso:</span>
                    <span className={`text-sm font-semibold ${
                      status.batida ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {status.percentual.toFixed(1)}%
                      {status.batida ? ' ✅' : ' ⚠️'}
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.batida ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(100, status.percentual)}%` }}
                    />
                  </div>
                  {status.batida ? (
                    <div className="text-xs text-green-600 font-semibold bg-green-100 px-2 py-1 rounded">
                      🎯 Meta batida! Excedente: R$ {status.excedente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  ) : (
                    <div className="text-xs text-red-600 font-semibold bg-red-100 px-2 py-1 rounded">
                      ⚠️ Faltam: R$ {status.faltando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenVendaModal(meta)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2"
                    >
                      <FaDollarSign /> Venda Diária
                    </button>
                    <button
                      onClick={() => handleVerHistorico(meta)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                    >
                      📊 Histórico
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(meta)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(meta._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {metas.length === 0 && (
          <div className="text-center py-12">
            <FaBullseye className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nenhuma meta cadastrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary mt-4"
            >
              Cadastrar Primeira Meta
            </button>
          </div>
        )}

        {/* Modal de Meta */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingMeta ? 'Editar Meta' : 'Nova Meta Mensal'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mês
                    </label>
                    <select
                      value={formData.mes}
                      onChange={(e) => setFormData({ ...formData, mes: parseInt(e.target.value) })}
                      className="input-field w-full"
                      style={{ minWidth: '100%' }}
                      required
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                          {formatarNomeMes(m)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ano
                    </label>
                    <select
                      value={formData.ano}
                      onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                      className="input-field w-full"
                      required
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Meta (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingMeta ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Venda Diária da Loja */}
        {showVendaModal && selectedMeta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Registrar Venda Diária da Loja
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {formatarMesAno(selectedMeta.mes, selectedMeta.ano)}
                </p>
                <form onSubmit={handleSubmitVenda} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      value={vendaData.data}
                      onChange={(e) => setVendaData({ ...vendaData, data: e.target.value })}
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O total do mês será calculado automaticamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={vendaData.valor}
                      onChange={(e) => setVendaData({ ...vendaData, valor: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observação (opcional)
                    </label>
                    <textarea
                      value={vendaData.observacao}
                      onChange={(e) => setVendaData({ ...vendaData, observacao: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Ex: Vendas gerais da loja, promoção especial..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVendaModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Salvar Venda
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Histórico de Vendas Diárias da Loja */}
        {showHistoricoModal && selectedMeta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none" id="relatorio-mensal">
              <div className="p-6 print:p-4">
                <div className="flex justify-between items-center mb-4 print:hidden">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Relatório Mensal - {formatarMesAno(selectedMeta.mes, selectedMeta.ano)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatarMesAno(selectedMeta.mes, selectedMeta.ano)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleImprimir}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaPrint /> Imprimir
                    </button>
                    <button
                      onClick={() => setShowHistoricoModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                {/* Cabeçalho para impressão */}
                <div className="hidden print:block mb-4 border-b-2 pb-4">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Relatório Mensal - {formatarMesAno(selectedMeta.mes, selectedMeta.ano)}
                  </h1>
                  <p className="text-gray-600">
                    Gerado em {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Meta Mensal:</span>
                      <span className="font-bold text-gray-800 ml-2">
                        R$ {selectedMeta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Vendido:</span>
                      <span className={`font-bold ml-2 ${
                        getStatusMeta(selectedMeta).batida ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        R$ {getTotalVendido(selectedMeta).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Progresso:</span>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getStatusMeta(selectedMeta).batida ? 'bg-green-500' : 'bg-orange-500'
                          }`}
                          style={{
                            width: `${Math.min(100, getStatusMeta(selectedMeta).percentual)}%`
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold mt-1 block ${
                        getStatusMeta(selectedMeta).batida ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getStatusMeta(selectedMeta).percentual.toFixed(1)}% da meta
                        {getStatusMeta(selectedMeta).batida ? ' ✅' : ' ⚠️'}
                        {getStatusMeta(selectedMeta).batida 
                          ? ` (Excedente: R$ ${getStatusMeta(selectedMeta).excedente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
                          : ` (Faltam: R$ ${getStatusMeta(selectedMeta).faltando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {loadingHistorico ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Carregando histórico...</p>
                  </div>
                ) : vendasDiarias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma venda registrada este mês</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Gráfico Mensal de Vendas Diárias */}
                    {chartDataMensal && chartDataMensal.length > 0 && (
                      <div className="card mb-4 print:mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <FaChartBar /> Gráfico de Vendas Diárias - {formatarMesAno(selectedMeta.mes, selectedMeta.ano)}
                        </h3>
                        <ResponsiveContainer width="100%" height={250} className="print:h-64">
                          <LineChart data={chartDataMensal}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="dia" 
                              label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                              label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                            />
                            <Tooltip 
                              formatter={(value) => {
                                const valor = typeof value === 'number' ? value : 0;
                                return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                              }}
                              labelFormatter={(label) => `Dia ${label}`}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="total" 
                              stroke="#10b981" 
                              strokeWidth={3}
                              name="Total Vendido (R$)"
                              dot={{ fill: '#10b981', r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    
                    {/* Funcionários Destacados do Mês */}
                    {topFuncionarios && topFuncionarios.length > 0 && (
                      <div className="card mb-4 print:mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          🏆 Funcionários Destaques do Mês
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {topFuncionarios.map((func, index) => (
                            <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-l-4 border-yellow-400">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-yellow-600">#{index + 1}</span>
                                    <span className="font-bold text-gray-800">{func.nome}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">Total de vendas</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">
                                    R$ {func.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Resumo das vendas */}
                    {resumoVendas && (
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg print:border-2 print:border-gray-300">
                        <h3 className="font-semibold text-gray-800 mb-2 text-lg">Resumo do Mês:</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Vendas Funcionários:</span>
                            <span className="font-bold text-blue-600 ml-2 block">
                              R$ {resumoVendas.totalVendasFuncionarios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vendas Loja:</span>
                            <span className="font-bold text-purple-600 ml-2 block">
                              R$ {resumoVendas.totalVendasLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Total Geral:</span>
                            <span className="font-bold text-green-600 ml-2 block text-lg">
                              R$ {resumoVendas.totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <h3 className="font-semibold text-gray-700 mb-2 text-lg print:font-bold">Vendas por Dia:</h3>
                    <div className="space-y-4">
                      {vendasDiarias.map((dia, index) => (
                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-gray-800">
                              {new Date(dia.data).toLocaleDateString('pt-BR', { 
                                weekday: 'long', 
                                day: '2-digit', 
                                month: 'long', 
                                year: 'numeric' 
                              })}
                            </h4>
                            <span className="font-bold text-green-600 text-lg">
                              Total do Dia: R$ {dia.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Vendas dos Funcionários */}
                          {dia.vendasFuncionarios.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-semibold text-blue-600 mb-2">Vendas dos Funcionários:</h5>
                              <div className="space-y-1">
                                {dia.vendasFuncionarios.map((venda, vIndex) => (
                                  <div key={vIndex} className="bg-white p-2 rounded border-l-4 border-blue-400">
                                    <div className="flex justify-between items-center">
                                      <div className="flex-1">
                                        <span className="font-semibold text-gray-700">{venda.funcionarioNome}</span>
                                        {venda.observacao && (
                                          <span className="text-xs text-gray-500 ml-2">- {venda.observacao}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-blue-600">
                                          R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                          onClick={() => handleEditarVendaFuncionario(venda, dia.data)}
                                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                          title="Editar venda"
                                        >
                                          <FaEdit />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vendas Diretas da Loja */}
                          {dia.vendasLoja.length > 0 && (
                            <div>
                              <h5 className="text-sm font-semibold text-purple-600 mb-2">Vendas Diretas da Loja:</h5>
                              <div className="space-y-1">
                                {dia.vendasLoja.map((venda, vIndex) => (
                                  <div key={vIndex} className="bg-white p-2 rounded border-l-4 border-purple-400">
                                    <div className="flex justify-between items-center">
                                      <div className="flex-1">
                                        <span className="font-semibold text-gray-700">Venda Direta</span>
                                        {venda.observacao && (
                                          <span className="text-xs text-gray-500 ml-2">- {venda.observacao}</span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-600">
                                          R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                          onClick={() => handleEditarVendaLoja(venda, dia.data)}
                                          className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                                          title="Editar venda"
                                        >
                                          <FaEdit />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Editar Venda */}
        {showEditVendaModal && vendaEditando && selectedMeta && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Editar Venda - {vendaEditando.tipo === 'funcionario' ? vendaEditando.funcionarioNome : 'Loja'}
                </h2>
                <form onSubmit={handleSubmitEditarVenda} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      value={vendaEditData.data}
                      onChange={(e) => setVendaEditData({ ...vendaEditData, data: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={vendaEditData.valor}
                      onChange={(e) => setVendaEditData({ ...vendaEditData, valor: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observação (opcional)
                    </label>
                    <textarea
                      value={vendaEditData.observacao}
                      onChange={(e) => setVendaEditData({ ...vendaEditData, observacao: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Ex: Cliente X, produto Y..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditVendaModal(false);
                        setVendaEditando(null);
                      }}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Salvar Alterações
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

export default Metas;

